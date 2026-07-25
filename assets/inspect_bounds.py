"""
Inspect bounding box size of each GLB model to find exact target sizes.
"""
import struct, json, os

models_dir = 'c:/Users/Hype/Documents/GameHima/assets/models'
files = [
    'box.glb', 'banana.glb', 'apple.glb', 'leaf.glb', 'bread.glb',
    'bottle.glb', 'can.glb', 'duck.glb', 'straw.glb', 'battery.glb',
    'bulb.glb', 'medicine.glb', 'thermometer.glb', 'paper.glb',
    'newspaper.glb', 'carton.glb'
]

for fname in files:
    path = os.path.join(models_dir, fname)
    if not os.path.exists(path):
        print(f'{fname}: NOT FOUND')
        continue
    
    size_bytes = os.path.getsize(path)
    with open(path, 'rb') as f:
        f.read(12)
        json_len = struct.unpack('<I', f.read(4))[0]
        f.read(4)
        json_data = f.read(json_len).decode('utf-8', 'ignore')
    
    gltf = json.loads(json_data)
    
    # Find min/max in accessors
    bounds = []
    if 'accessors' in gltf:
        for acc in gltf['accessors']:
            if acc.get('type') == 'VEC3' and 'min' in acc and 'max' in acc:
                mn = acc['min']
                mx = acc['max']
                dx = mx[0] - mn[0]
                dy = mx[1] - mn[1]
                dz = mx[2] - mn[2]
                max_d = max(dx, dy, dz)
                bounds.append((max_d, dx, dy, dz, mn, mx))
    
    bounds.sort(key=lambda x: x[0], reverse=True)
    top_b = bounds[0] if bounds else (0,0,0,0,[],[])
    print(f'{fname:15s}: bytes={size_bytes:8d}, max_dim={top_b[0]:.2f} (dx={top_b[1]:.2f}, dy={top_b[2]:.2f}, dz={top_b[3]:.2f})')
