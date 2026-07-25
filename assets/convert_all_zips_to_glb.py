"""
Convert all 16 user Sketchfab ZIP files into single binary GLB files in assets/models/
Embeds all texture images and buffers inside each .glb file.
"""
import zipfile, struct, json, os, base64, re, shutil, tempfile

GAME_DIR = 'c:/Users/Hype/Documents/GameHima'
OUTPUT_MODELS_DIR = os.path.join(GAME_DIR, 'assets/models')

os.makedirs(OUTPUT_MODELS_DIR, exist_ok=True)

# Map: output GLB filename -> ZIP filename
ZIP_MAP = {
    'banana.glb':      'low-poly_banana-monster.zip',
    'apple.glb':       'low_poly_apple_core.zip',
    'leaf.glb':        'dry_leaf_.rawscan..zip',
    'bread.glb':       'bread_zombie.zip',
    'bottle.glb':      'low_poly_dirty_plastic_bottle_-_game_ready.zip',
    'can.glb':         'soda_can_crushed_trash_low-poly.zip',
    'duck.glb':        'rubber_duck_-_free_download.zip',
    'straw.glb':       'fast_food_soda_cup.zip',
    'battery.glb':     '9volt_battery_low.zip',
    'bulb.glb':        'realistic_light_bulb__low_poly.zip',
    'medicine.glb':    'medicine_bottle.zip',
    'thermometer.glb': 'thermometer.zip',
    'box.glb':         'cardboard_box_low_poly.zip',
    'paper.glb':       'a18eff8fc5334944b386d36c71fdce17.zip',
    'newspaper.glb':   'psx_style_newspaper.zip',
    'carton.glb':      'super_awesome_milk_carton.zip',
}

def get_mime(filename):
    ext = os.path.splitext(filename)[1].lower()
    return {'png': 'image/png', 'jpg': 'image/jpeg', 'jpeg': 'image/jpeg', 'webp': 'image/webp'}.get(ext.lstrip('.'), 'application/octet-stream')

def convert_zip_to_glb(zip_path, out_glb_path):
    tmp_dir = tempfile.mkdtemp(prefix='zip_conv_')
    try:
        with zipfile.ZipFile(zip_path, 'r') as zf:
            zf.extractall(tmp_dir)
        
        gltf_file = None
        glb_file = None
        for root, dirs, files in os.walk(tmp_dir):
            for f in files:
                if f.lower().endswith('.gltf'):
                    gltf_file = os.path.join(root, f)
                elif f.lower().endswith('.glb'):
                    glb_file = os.path.join(root, f)
        
        if gltf_file:
            return pack_gltf_to_glb(gltf_file, out_glb_path)
        elif glb_file:
            return pack_existing_glb(glb_file, out_glb_path)
        else:
            print(f'  [ERROR] No .gltf or .glb found inside {os.path.basename(zip_path)}')
            return False
    finally:
        shutil.rmtree(tmp_dir, ignore_errors=True)

def pack_gltf_to_glb(gltf_path, out_glb_path):
    gltf_dir = os.path.dirname(gltf_path)
    with open(gltf_path, 'r', encoding='utf-8') as f:
        gltf = json.load(f)
    
    # Embed images as Base64 data URIs
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
                    print(f'    [WARNING] Missing texture: {img["uri"]}')
    
    # Read binary buffer
    bin_data = b''
    if 'buffers' in gltf:
        for buf in gltf['buffers']:
            if 'uri' in buf and not buf['uri'].startswith('data:'):
                bin_path = os.path.join(gltf_dir, buf['uri'].replace('\\', '/'))
                if os.path.exists(bin_path):
                    with open(bin_path, 'rb') as bf:
                        bin_data = bf.read()
                    del buf['uri']
                    buf['byteLength'] = len(bin_data)
    
    # Construct binary GLB file
    json_str = json.dumps(gltf, separators=(',', ':'))
    while len(json_str) % 4 != 0:
        json_str += ' '
    json_bytes = json_str.encode('utf-8')
    
    while len(bin_data) % 4 != 0:
        bin_data += b'\x00'
    
    total_len = 12 + 8 + len(json_bytes)
    if bin_data:
        total_len += 8 + len(bin_data)
    
    with open(out_glb_path, 'wb') as f:
        f.write(b'glTF')
        f.write(struct.pack('<I', 2))
        f.write(struct.pack('<I', total_len))
        f.write(struct.pack('<I', len(json_bytes)))
        f.write(b'JSON')
        f.write(json_bytes)
        if bin_data:
            f.write(struct.pack('<I', len(bin_data)))
            f.write(b'BIN\x00')
            f.write(bin_data)
    
    return True

def pack_existing_glb(glb_path, out_glb_path):
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
    
    if not modified:
        shutil.copy2(glb_path, out_glb_path)
        return True
    
    json_str = json.dumps(gltf, separators=(',', ':'))
    while len(json_str) % 4 != 0:
        json_str += ' '
    json_bytes = json_str.encode('utf-8')
    
    while len(bin_data) % 4 != 0:
        bin_data += b'\x00'
    
    total_len = 12 + 8 + len(json_bytes)
    if bin_data:
        total_len += 8 + len(bin_data)
    
    with open(out_glb_path, 'wb') as f:
        f.write(b'glTF')
        f.write(struct.pack('<I', 2))
        f.write(struct.pack('<I', total_len))
        f.write(struct.pack('<I', len(json_bytes)))
        f.write(b'JSON')
        f.write(json_bytes)
        if bin_data:
            f.write(struct.pack('<I', len(bin_data)))
            f.write(b'BIN\x00')
            f.write(bin_data)
    
    return True


print("==========================================================")
print("Converting all 16 Sketchfab ZIP archives into .GLB models")
print("==========================================================")

for glb_filename, zip_filename in ZIP_MAP.items():
    zip_full_path = os.path.join(GAME_DIR, zip_filename)
    glb_out_path = os.path.join(OUTPUT_MODELS_DIR, glb_filename)
    
    if not os.path.exists(zip_full_path):
        print(f"\n[SKIP] ZIP file not found: {zip_filename}")
        continue
    
    print(f"\nProcessing {zip_filename} -> assets/models/{glb_filename}...")
    success = convert_zip_to_glb(zip_full_path, glb_out_path)
    if success:
        file_size = os.path.getsize(glb_out_path)
        print(f"  SUCCESS: {glb_filename} ({file_size} bytes)")
    else:
        print(f"  FAILED to convert {zip_filename}")

print("\n==========================================================")
print("All ZIP files successfully converted into GLB models!")
print("==========================================================")
