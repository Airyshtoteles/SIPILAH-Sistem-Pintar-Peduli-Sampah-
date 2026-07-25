"""
Repack GLTF/GLB files with external texture URIs into self-contained GLB files.
Embeds all referenced textures as base64 data URIs inside the JSON chunk,
then writes a proper binary GLB with embedded BIN chunk.
"""
import struct, json, os, base64, re

models_dir = 'c:/Users/Hype/Documents/GameHima/assets/models'

# Find the original extracted GLTF directories for texture resolution
extract_base = 'c:/Users/Hype/Documents/GameHima/assets/extracted'

# Models that need repacking (have external texture URIs)
needs_repack = {
    'apple.glb': 'low_poly_apple_core',
    'bottle.glb': 'low_poly_dirty_plastic_bottle_-_game_ready',
    'battery.glb': '9volt_battery_low',
    'box.glb': 'cardboard_box_low_poly',
    'duck.glb': 'rubber_duck_-_free_download',
    'straw.glb': 'fast_food_soda_cup',
    'paper.glb': 'a18eff8fc5334944b386d36c71fdce17',
    'newspaper.glb': 'psx_style_newspaper',
    'carton.glb': 'super_awesome_milk_carton',
    'bread.glb': 'bread_zombie',
    'leaf.glb': 'dry_leaf_.rawscan.',
}

def find_texture_file(texture_uri, extract_dir):
    """Search for texture file in the extracted directory tree."""
    basename = os.path.basename(texture_uri)
    
    # Direct path
    direct = os.path.join(extract_dir, texture_uri)
    if os.path.exists(direct):
        return direct
    
    # Search recursively
    for root, dirs, files in os.walk(extract_dir):
        if basename in files:
            return os.path.join(root, basename)
    
    return None

def get_mime_type(filename):
    ext = os.path.splitext(filename)[1].lower()
    if ext in ('.jpg', '.jpeg'):
        return 'image/jpeg'
    elif ext == '.png':
        return 'image/png'
    elif ext == '.webp':
        return 'image/webp'
    return 'application/octet-stream'

def repack_glb(glb_path, extract_dir):
    """Read a GLB, embed all external texture URIs as data URIs, write back."""
    with open(glb_path, 'rb') as f:
        magic = f.read(4)
        if magic != b'glTF':
            print(f'  Not a GLB file, skipping')
            return False
        
        version = struct.unpack('<I', f.read(4))[0]
        total_length = struct.unpack('<I', f.read(4))[0]
        
        # Read JSON chunk
        json_chunk_len = struct.unpack('<I', f.read(4))[0]
        json_chunk_type = f.read(4)  # Should be 'JSON'
        json_data = f.read(json_chunk_len).decode('utf-8')
        
        # Read BIN chunk if present
        bin_data = b''
        remaining = total_length - 12 - 8 - json_chunk_len
        if remaining > 8:
            bin_chunk_len = struct.unpack('<I', f.read(4))[0]
            bin_chunk_type = f.read(4)  # Should be 'BIN\0'
            bin_data = f.read(bin_chunk_len)
    
    gltf = json.loads(json_data)
    
    # Process images - replace external URIs with data URIs
    if 'images' not in gltf:
        print(f'  No images to embed')
        return False
    
    modified = False
    for i, img in enumerate(gltf['images']):
        if 'uri' not in img:
            continue
        uri = img['uri']
        if uri.startswith('data:'):
            continue  # Already embedded
        
        # Find the texture file
        tex_path = find_texture_file(uri, extract_dir)
        if tex_path is None:
            # Also try in the same dir as the GLB
            glb_dir = os.path.dirname(glb_path)
            tex_path = find_texture_file(uri, glb_dir)
        
        if tex_path is None:
            print(f'  WARNING: Could not find texture: {uri}')
            # Create a tiny 1x1 placeholder
            import io
            try:
                from PIL import Image
                tiny = Image.new('RGBA', (4, 4), (128, 128, 128, 255))
                buf = io.BytesIO()
                tiny.save(buf, format='PNG')
                tex_bytes = buf.getvalue()
                mime = 'image/png'
            except ImportError:
                # Minimal 1x1 PNG
                tex_bytes = (b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01'
                            b'\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00'
                            b'\x00\x00\x0cIDATx\x9cc\xf8\x0f\x00\x00\x01\x01\x00'
                            b'\x05\x18\xd8N\x00\x00\x00\x00IEND\xaeB`\x82')
                mime = 'image/png'
        else:
            with open(tex_path, 'rb') as tf:
                tex_bytes = tf.read()
            mime = get_mime_type(tex_path)
        
        # Convert to data URI
        b64 = base64.b64encode(tex_bytes).decode('ascii')
        data_uri = f'data:{mime};base64,{b64}'
        img['uri'] = data_uri
        modified = True
        print(f'  Embedded texture [{i}]: {uri} ({len(tex_bytes)} bytes)')
    
    if not modified:
        print(f'  No modifications needed')
        return False
    
    # Write back as GLB
    json_str = json.dumps(gltf, separators=(',', ':'))
    # Pad JSON to 4-byte alignment
    while len(json_str) % 4 != 0:
        json_str += ' '
    json_bytes = json_str.encode('utf-8')
    
    # Pad BIN to 4-byte alignment
    while len(bin_data) % 4 != 0:
        bin_data += b'\x00'
    
    # Calculate total length
    total = 12  # Header
    total += 8 + len(json_bytes)  # JSON chunk header + data
    if bin_data:
        total += 8 + len(bin_data)  # BIN chunk header + data
    
    with open(glb_path, 'wb') as f:
        # Header
        f.write(b'glTF')
        f.write(struct.pack('<I', 2))
        f.write(struct.pack('<I', total))
        
        # JSON chunk
        f.write(struct.pack('<I', len(json_bytes)))
        f.write(b'JSON')
        f.write(json_bytes)
        
        # BIN chunk
        if bin_data:
            f.write(struct.pack('<I', len(bin_data)))
            f.write(b'BIN\x00')
            f.write(bin_data)
    
    new_size = os.path.getsize(glb_path)
    print(f'  Repacked: {new_size} bytes')
    return True


# First, find all extracted directories
print("Looking for extracted model directories...")
if not os.path.exists(extract_base):
    # Search in GameHima root for extracted folders
    extract_base_alt = 'c:/Users/Hype/Documents/GameHima'
    print(f"Extracted base not found at {extract_base}, searching in {extract_base_alt}")
    extract_base = extract_base_alt

# List all directories to find texture sources
for glb_name, extract_hint in needs_repack.items():
    glb_path = os.path.join(models_dir, glb_name)
    if not os.path.exists(glb_path):
        print(f'\n{glb_name}: FILE NOT FOUND, skipping')
        continue
    
    print(f'\nProcessing {glb_name}...')
    
    # Try to find the extract directory
    extract_dir = None
    for search_root in [extract_base, models_dir, 'c:/Users/Hype/Documents/GameHima']:
        for root, dirs, files in os.walk(search_root):
            if extract_hint in root or extract_hint in os.path.basename(root):
                extract_dir = root
                break
            # Also check if textures subdir exists
            tex_dir = os.path.join(root, 'textures')
            if os.path.exists(tex_dir):
                # Check if this has matching texture names
                with open(glb_path, 'rb') as f:
                    f.read(12)  # skip header
                    jl = struct.unpack('<I', f.read(4))[0]
                    f.read(4)
                    jd = f.read(min(jl, 5000)).decode('utf-8', 'ignore')
                uris = re.findall(r'"uri"\s*:\s*"textures/([^"]+)"', jd)
                if uris and os.path.exists(os.path.join(tex_dir, uris[0])):
                    extract_dir = root
                    break
        if extract_dir:
            break
    
    if extract_dir:
        print(f'  Found texture source: {extract_dir}')
        repack_glb(glb_path, extract_dir)
    else:
        print(f'  WARNING: Could not find extracted directory for {extract_hint}')
        print(f'  Attempting with placeholder textures...')
        repack_glb(glb_path, models_dir)

print("\n\nDone! Now re-running Base64 generator...")
