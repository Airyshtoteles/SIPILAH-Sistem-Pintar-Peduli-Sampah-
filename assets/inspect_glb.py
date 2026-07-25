import struct, re, os

models_dir = 'c:/Users/Hype/Documents/GameHima/assets/models'
files = ['can.glb', 'banana.glb', 'apple.glb', 'bottle.glb', 'battery.glb', 'box.glb', 'duck.glb', 'straw.glb', 'bulb.glb', 'medicine.glb', 'thermometer.glb', 'paper.glb', 'newspaper.glb', 'carton.glb', 'bread.glb', 'leaf.glb']

for fname in files:
    path = os.path.join(models_dir, fname)
    if not os.path.exists(path):
        print(f'{fname}: FILE NOT FOUND')
        continue
    
    size = os.path.getsize(path)
    with open(path, 'rb') as f:
        magic = f.read(4)
        if magic != b'glTF':
            print(f'{fname}: NOT GLB (magic={magic})')
            continue
        ver = struct.unpack('<I', f.read(4))[0]
        total = struct.unpack('<I', f.read(4))[0]
        ch1_len = struct.unpack('<I', f.read(4))[0]
        ch1_type = f.read(4)
        json_bytes = f.read(min(ch1_len, 5000))
        json_str = json_bytes.decode('utf-8', 'ignore')
    
    uris = re.findall(r'"uri"\s*:\s*"([^"]+)"', json_str)
    ext_uris = [u for u in uris if not u.startswith('data:')]
    
    print(f'{fname}: size={size}, ver={ver}, json_chunk={ch1_len}, external_URIs={ext_uris}')
