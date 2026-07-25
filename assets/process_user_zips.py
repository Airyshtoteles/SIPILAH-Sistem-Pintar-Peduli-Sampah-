import os
import zipfile
import json
import struct
import shutil

# Mapping of ZIP filename keywords to game item IDs & model file targets
ZIP_MAPPING = [
  ('banana', 'banana.glb'),
  ('apple', 'apple.glb'),
  ('leaf', 'leaf.glb'),
  ('bread', 'bread.glb'),
  ('bottle', 'bottle.glb'),
  ('soda_can', 'can.glb'),
  ('duck', 'duck.glb'),
  ('soda_cup', 'straw.glb'),
  ('battery', 'battery.glb'),
  ('light_bulb', 'bulb.glb'),
  ('medicine', 'medicine.glb'),
  ('thermometer', 'thermometer.glb'),
  ('cardboard', 'box.glb'),
  ('a18eff', 'paper.glb'),
  ('newspaper', 'newspaper.glb'),
  ('milk_carton', 'carton.glb')
]

def pack_gltf_to_glb(gltf_path, output_glb_path):
    base_dir = os.path.dirname(gltf_path)
    with open(gltf_path, 'r', encoding='utf-8') as f:
        gltf_json = json.load(f)

    bin_data = bytearray()
    if 'buffers' in gltf_json and len(gltf_json['buffers']) > 0:
        buf_info = gltf_json['buffers'][0]
        uri = buf_info.get('uri', '')
        if uri and not uri.startswith('data:'):
            bin_path = os.path.join(base_dir, uri)
            if os.path.exists(bin_path):
                with open(bin_path, 'rb') as bf:
                    bin_data = bytearray(bf.read())
            buf_info.pop('uri', None)

    # Embed textures into buffer if possible or leave material clean
    json_bytes = json.dumps(gltf_json).encode('utf-8')
    padding_len = (4 - (len(json_bytes) % 4)) % 4
    json_bytes += b' ' * padding_len

    bin_padding = (4 - (len(bin_data) % 4)) % 4
    bin_data.extend(b'\x00' * bin_padding)

    total_length = 12 + 8 + len(json_bytes) + 8 + len(bin_data)

    glb = bytearray()
    glb.extend(struct.pack('<I', 0x46546C67)) # 'glTF'
    glb.extend(struct.pack('<I', 2))           # Version 2
    glb.extend(struct.pack('<I', total_length))

    glb.extend(struct.pack('<I', len(json_bytes)))
    glb.extend(struct.pack('<I', 0x4E4F534A)) # 'JSON'
    glb.extend(json_bytes)

    glb.extend(struct.pack('<I', len(bin_data)))
    glb.extend(struct.pack('<I', 0x00414E49)) # 'BIN\0'
    glb.extend(bin_data)

    with open(output_glb_path, 'wb') as out_f:
        out_f.write(glb)
    print(f"Packed GLTF -> GLB: {output_glb_path} ({len(glb)} bytes)")

def process_zip(zip_name, target_glb_name):
    project_dir = 'c:/Users/Hype/Documents/GameHima'
    zip_path = os.path.join(project_dir, zip_name)
    extract_dir = os.path.join(project_dir, 'assets', 'temp_extract', zip_name.replace('.zip', ''))
    output_glb_path = os.path.join(project_dir, 'assets', 'models', target_glb_name)

    if not os.path.exists(zip_path):
        print(f"ZIP file not found: {zip_path}")
        return

    print(f"Extracting {zip_name}...")
    with zipfile.ZipFile(zip_path, 'r') as zip_ref:
        zip_ref.extractall(extract_dir)

    # Search for scene.gltf or scene.glb or any .gltf / .glb inside extracted folder
    target_file = None
    for root, dirs, files in os.walk(extract_dir):
        for file in files:
            if file.endswith('.gltf') or file.endswith('.glb'):
                target_file = os.path.join(root, file)
                break
        if target_file:
            break

    if not target_file:
        print(f"No GLTF/GLB found in {zip_name}")
        return

    print(f"Found model file: {target_file}")
    if target_file.endswith('.glb'):
        shutil.copyfile(target_file, output_glb_path)
        print(f"Copied GLB -> {output_glb_path} ({os.path.getsize(output_glb_path)} bytes)")
    else:
        pack_gltf_to_glb(target_file, output_glb_path)

def main():
    project_dir = 'c:/Users/Hype/Documents/GameHima'
    zip_files = [f for f in os.listdir(project_dir) if f.endswith('.zip')]
    print(f"Found {len(zip_files)} downloaded ZIP files in GameHima: {zip_files}")

    for zip_file in zip_files:
        matched_target = None
        for keyword, target_glb in ZIP_MAPPING:
            if keyword in zip_file.lower():
                matched_target = target_glb
                break
        
        if not matched_target:
            matched_target = zip_file.replace('.zip', '.glb').lower()

        process_zip(zip_file, matched_target)

    # Clean temp extraction directory
    shutil.rmtree(os.path.join(project_dir, 'assets', 'temp_extract'), ignore_errors=True)
    print("All user ZIP models processed successfully!")

if __name__ == '__main__':
    main()
