"""
Full pipeline: Extract ZIPs -> Find GLTF+textures -> Pack into self-contained GLB -> Generate Base64 JS
"""
import zipfile, struct, json, os, base64, re, shutil, tempfile, io

GAME_DIR = 'c:/Users/Hype/Documents/GameHima'
MODELS_DIR = os.path.join(GAME_DIR, 'assets/models')
OUTPUT_JS = os.path.join(GAME_DIR, 'js/three/gltfData.js')

# Map: final GLB name -> ZIP filename
MODEL_MAP = {
    'banana':      'low-poly_banana-monster.zip',
    'apple':       'low_poly_apple_core.zip',
    'leaf':        'dry_leaf_.rawscan..zip',
    'bread':       'bread_zombie.zip',
    'bottle':      'low_poly_dirty_plastic_bottle_-_game_ready.zip',
    'can':         'soda_can_crushed_trash_low-poly.zip',
    'duck':        'rubber_duck_-_free_download.zip',
    'straw':       'fast_food_soda_cup.zip',
    'battery':     '9volt_battery_low.zip',
    'bulb':        'realistic_light_bulb__low_poly.zip',
    'medicine':    'medicine_bottle.zip',
    'thermometer': 'thermometer.zip',
    'box':         'cardboard_box_low_poly.zip',
    'paper':       'a18eff8fc5334944b386d36c71fdce17.zip',
    'newspaper':   'psx_style_newspaper.zip',
    'carton':      'super_awesome_milk_carton.zip',
}

MAX_SIZE_BYTES = 2_000_000  # Skip models larger than 2MB for Base64 embedding

def get_mime(filename):
    ext = os.path.splitext(filename)[1].lower()
    return {'png': 'image/png', 'jpg': 'image/jpeg', 'jpeg': 'image/jpeg', 'webp': 'image/webp'}.get(ext.lstrip('.'), 'application/octet-stream')

def make_self_contained_glb(zip_path, out_glb_path):
    """Extract ZIP, find GLTF/GLB, embed all textures, output self-contained GLB."""
    tmp_dir = tempfile.mkdtemp(prefix='glb_repack_')
    try:
        # Extract ZIP
        with zipfile.ZipFile(zip_path, 'r') as zf:
            zf.extractall(tmp_dir)
        
        # Find the .gltf or .glb file
        gltf_file = None
        glb_file = None
        for root, dirs, files in os.walk(tmp_dir):
            for f in files:
                if f.lower().endswith('.gltf'):
                    gltf_file = os.path.join(root, f)
                elif f.lower().endswith('.glb'):
                    glb_file = os.path.join(root, f)
        
        if gltf_file:
            return process_gltf(gltf_file, out_glb_path)
        elif glb_file:
            return process_glb(glb_file, out_glb_path)
        else:
            print(f'  ERROR: No .gltf or .glb found in ZIP')
            return False
    finally:
        shutil.rmtree(tmp_dir, ignore_errors=True)

def process_gltf(gltf_path, out_glb_path):
    """Convert a .gltf with external files into a self-contained .glb."""
    gltf_dir = os.path.dirname(gltf_path)
    
    with open(gltf_path, 'r', encoding='utf-8') as f:
        gltf = json.load(f)
    
    # Embed images
    if 'images' in gltf:
        for img in gltf['images']:
            if 'uri' in img and not img['uri'].startswith('data:'):
                tex_path = os.path.join(gltf_dir, img['uri'].replace('\\', '/'))
                if os.path.exists(tex_path):
                    with open(tex_path, 'rb') as tf:
                        tex_bytes = tf.read()
                    mime = get_mime(tex_path)
                    img['uri'] = f'data:{mime};base64,{base64.b64encode(tex_bytes).decode("ascii")}'
                    print(f'    Embedded image: {os.path.basename(tex_path)} ({len(tex_bytes)} bytes)')
                else:
                    print(f'    WARNING: Missing texture: {img["uri"]}')
                    # Tiny placeholder
                    img['uri'] = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQI12NgAAIABQABNjN9GQAAAAlwSFlzAAAWJQAAFiUBSVIk8AAAABl0RVh0U29mdHdhcmUAcGFpbnQubmV0IDQuMC4xMkMEa+wAAAANSURBVBhXY/j//z8DAAj8Av6IXwbgAAAAAElFTkSuQmCC'
    
    # Read and embed the .bin buffer
    bin_data = b''
    if 'buffers' in gltf:
        for buf in gltf['buffers']:
            if 'uri' in buf and not buf['uri'].startswith('data:'):
                bin_path = os.path.join(gltf_dir, buf['uri'].replace('\\', '/'))
                if os.path.exists(bin_path):
                    with open(bin_path, 'rb') as bf:
                        bin_data = bf.read()
                    # Remove URI - will be inline BIN chunk
                    del buf['uri']
                    buf['byteLength'] = len(bin_data)
    
    # Build GLB
    json_str = json.dumps(gltf, separators=(',', ':'))
    while len(json_str) % 4 != 0:
        json_str += ' '
    json_bytes = json_str.encode('utf-8')
    
    while len(bin_data) % 4 != 0:
        bin_data += b'\x00'
    
    total = 12 + 8 + len(json_bytes)
    if bin_data:
        total += 8 + len(bin_data)
    
    with open(out_glb_path, 'wb') as f:
        f.write(b'glTF')
        f.write(struct.pack('<I', 2))
        f.write(struct.pack('<I', total))
        f.write(struct.pack('<I', len(json_bytes)))
        f.write(b'JSON')
        f.write(json_bytes)
        if bin_data:
            f.write(struct.pack('<I', len(bin_data)))
            f.write(b'BIN\x00')
            f.write(bin_data)
    
    return True

def process_glb(glb_path, out_glb_path):
    """Repack a GLB with external texture URIs into a self-contained GLB."""
    glb_dir = os.path.dirname(glb_path)
    
    with open(glb_path, 'rb') as f:
        magic = f.read(4)
        version = struct.unpack('<I', f.read(4))[0]
        total_length = struct.unpack('<I', f.read(4))[0]
        
        json_chunk_len = struct.unpack('<I', f.read(4))[0]
        json_chunk_type = f.read(4)
        json_data = f.read(json_chunk_len).decode('utf-8')
        
        bin_data = b''
        pos = f.tell()
        remaining = total_length - pos
        if remaining > 8:
            bin_chunk_len = struct.unpack('<I', f.read(4))[0]
            bin_chunk_type = f.read(4)
            bin_data = f.read(bin_chunk_len)
    
    gltf = json.loads(json_data)
    
    modified = False
    if 'images' in gltf:
        for img in gltf['images']:
            if 'uri' in img and not img['uri'].startswith('data:'):
                tex_path = os.path.join(glb_dir, img['uri'].replace('\\', '/'))
                if os.path.exists(tex_path):
                    with open(tex_path, 'rb') as tf:
                        tex_bytes = tf.read()
                    mime = get_mime(tex_path)
                    img['uri'] = f'data:{mime};base64,{base64.b64encode(tex_bytes).decode("ascii")}'
                    modified = True
                    print(f'    Embedded image: {os.path.basename(tex_path)} ({len(tex_bytes)} bytes)')
                else:
                    print(f'    WARNING: Missing texture: {img["uri"]}')
                    img['uri'] = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQI12NgAAIABQABNjN9GQAAAAlwSFlzAAAWJQAAFiUBSVIk8AAAABl0RVh0U29mdHdhcmUAcGFpbnQubmV0IDQuMC4xMkMEa+wAAAANSURBVBhXY/j//z8DAAj8Av6IXwbgAAAAAElFTkSuQmCC'
                    modified = True
    
    if not modified:
        # Already self-contained, just copy
        shutil.copy2(glb_path, out_glb_path)
        return True
    
    # Write repacked GLB
    json_str = json.dumps(gltf, separators=(',', ':'))
    while len(json_str) % 4 != 0:
        json_str += ' '
    json_bytes = json_str.encode('utf-8')
    
    while len(bin_data) % 4 != 0:
        bin_data += b'\x00'
    
    total = 12 + 8 + len(json_bytes)
    if bin_data:
        total += 8 + len(bin_data)
    
    with open(out_glb_path, 'wb') as f:
        f.write(b'glTF')
        f.write(struct.pack('<I', 2))
        f.write(struct.pack('<I', total))
        f.write(struct.pack('<I', len(json_bytes)))
        f.write(b'JSON')
        f.write(json_bytes)
        if bin_data:
            f.write(struct.pack('<I', len(bin_data)))
            f.write(b'BIN\x00')
            f.write(bin_data)
    
    return True


def generate_base64_js():
    """Generate gltfData.js with Base64 embedded models."""
    base64_dict = {}
    
    for model_name in MODEL_MAP.keys():
        glb_path = os.path.join(MODELS_DIR, f'{model_name}.glb')
        if not os.path.exists(glb_path):
            print(f'  {model_name}.glb not found, skipping')
            continue
        
        size = os.path.getsize(glb_path)
        if size > MAX_SIZE_BYTES:
            print(f'  {model_name}.glb too large ({size} bytes > {MAX_SIZE_BYTES}), skipping for Base64')
            continue
        
        with open(glb_path, 'rb') as f:
            b64 = base64.b64encode(f.read()).decode('ascii')
        
        key = f'gltf_{model_name}'
        base64_dict[key] = f'data:application/octet-stream;base64,{b64}'
        print(f'  Embedded {key}: {size} bytes')
    
    js_content = f'// Auto-generated Base64 GLTF Data (self-contained GLB with embedded textures)\n// CORS-free: works with file:/// protocol\nwindow.GLTF_MODEL_DATA = {json.dumps(base64_dict)};\n'
    
    with open(OUTPUT_JS, 'w', encoding='utf-8') as f:
        f.write(js_content)
    
    print(f'\nGenerated {OUTPUT_JS} ({os.path.getsize(OUTPUT_JS)} bytes)')


# === MAIN ===
print("=" * 60)
print("Step 1: Re-extract ZIPs and repack as self-contained GLB")
print("=" * 60)

for model_name, zip_name in MODEL_MAP.items():
    zip_path = os.path.join(GAME_DIR, zip_name)
    out_glb = os.path.join(MODELS_DIR, f'{model_name}.glb')
    
    if not os.path.exists(zip_path):
        print(f'\n{model_name}: ZIP not found ({zip_name}), skipping')
        continue
    
    print(f'\n{model_name} <- {zip_name}')
    success = make_self_contained_glb(zip_path, out_glb)
    if success:
        size = os.path.getsize(out_glb)
        print(f'  Output: {out_glb} ({size} bytes)')
    else:
        print(f'  FAILED to process')

# Verify
print("\n" + "=" * 60)
print("Step 2: Verify all GLB files are self-contained")
print("=" * 60)

for model_name in MODEL_MAP.keys():
    glb_path = os.path.join(MODELS_DIR, f'{model_name}.glb')
    if not os.path.exists(glb_path):
        print(f'  {model_name}.glb: MISSING')
        continue
    
    with open(glb_path, 'rb') as f:
        f.read(12)
        jl = struct.unpack('<I', f.read(4))[0]
        f.read(4)
        jd = f.read(min(jl, 10000)).decode('utf-8', 'ignore')
    
    ext_uris = [u for u in re.findall(r'"uri"\s*:\s*"([^"]+)"', jd) if not u.startswith('data:')]
    size = os.path.getsize(glb_path)
    status = 'SELF-CONTAINED' if not ext_uris else f'HAS EXTERNAL: {ext_uris}'
    print(f'  {model_name}.glb: {size} bytes - {status}')

print("\n" + "=" * 60)
print("Step 3: Generate Base64 JS data file")
print("=" * 60)
generate_base64_js()

print("\nAll done!")
