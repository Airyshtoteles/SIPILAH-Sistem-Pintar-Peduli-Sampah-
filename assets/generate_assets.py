import os
import struct
import math

def create_lowpoly_glb(mesh_type, color_rgb, name):
    r, g, b = color_rgb

    # Generate custom vertices and indices based on mesh_type
    positions = []
    normals = []
    indices = []

    if mesh_type == 'cylinder' or mesh_type == 'bottle' or mesh_type == 'can' or mesh_type == 'bin':
        # Low poly cylinder (8 segments)
        segments = 8
        height = 1.6
        radius = 0.5
        
        # Bottom center (0), Top center (1)
        positions.extend([0, 0, 0,  0, height, 0])
        normals.extend([0, -1, 0,  0, 1, 0])

        for i in range(segments):
            angle = (i / segments) * math.pi * 2
            x = math.cos(angle) * radius
            z = math.sin(angle) * radius
            
            # Bottom ring vertices
            positions.extend([x, 0, z])
            normals.extend([x, 0, z])
            
            # Top ring vertices
            positions.extend([x, height, z])
            normals.extend([x, 0, z])

        # Indices
        for i in range(segments):
            next_i = (i + 1) % segments
            b1 = 2 + i * 2
            t1 = 2 + i * 2 + 1
            b2 = 2 + next_i * 2
            t2 = 2 + next_i * 2 + 1

            # Side quad (2 tris)
            indices.extend([b1, b2, t1,  t1, b2, t2])
            # Bottom cap
            indices.extend([0, b2, b1])
            # Top cap
            indices.extend([1, t1, t2])

    elif mesh_type == 'sphere' or mesh_type == 'apple' or mesh_type == 'bulb':
        # Low poly octahedron / sphere (6 vertices)
        positions = [
             0.0,  0.6,  0.0,
             0.0, -0.6,  0.0,
            -0.5,  0.0,  0.0,
             0.5,  0.0,  0.0,
             0.0,  0.0, -0.5,
             0.0,  0.0,  0.5
        ]
        normals = [
             0.0,  1.0,  0.0,
             0.0, -1.0,  0.0,
            -1.0,  0.0,  0.0,
             1.0,  0.0,  0.0,
             0.0,  0.0, -1.0,
             0.0,  0.0,  1.0
        ]
        indices = [
            0, 2, 5,  0, 5, 3,  0, 3, 4,  0, 4, 2,
            1, 5, 2,  1, 3, 5,  1, 4, 3,  1, 2, 4
        ]

    else: # Box mesh (Cardboard box, paper, battery, bread, carton)
        positions = [
            -0.5, -0.4,  0.5,   0.5, -0.4,  0.5,   0.5,  0.4,  0.5,  -0.5,  0.4,  0.5,
            -0.5, -0.4, -0.5,   0.5, -0.4, -0.5,   0.5,  0.4, -0.5,  -0.5,  0.4, -0.5
        ]
        normals = [
            -0.57, -0.57,  0.57,   0.57, -0.57,  0.57,   0.57,  0.57,  0.57,  -0.57,  0.57,  0.57,
            -0.57, -0.57, -0.57,   0.57, -0.57, -0.57,   0.57,  0.57, -0.57,  -0.57,  0.57, -0.57
        ]
        indices = [
            0, 1, 2,  0, 2, 3,  1, 5, 6,  1, 6, 2,  5, 4, 7,  5, 7, 6,
            4, 0, 3,  4, 3, 7,  3, 2, 6,  3, 6, 7,  4, 5, 1,  4, 1, 0
        ]

    count_verts = len(positions) // 3
    count_indices = len(indices)

    # Calculate bounding box
    min_x = min(positions[0::3])
    max_x = max(positions[0::3])
    min_y = min(positions[1::3])
    max_y = max(positions[1::3])
    min_z = min(positions[2::3])
    max_z = max(positions[2::3])

    # Build GLTF JSON Structure
    json_str = f'''{{
        "asset": {{"version": "2.0", "generator": "EcoHero Fast GLB Exporter"}},
        "scenes": [{{"nodes": [0]}}],
        "nodes": [{{"mesh": 0, "name": "{name}"}}],
        "meshes": [{{"primitives": [{{"attributes": {{"POSITION": 0, "NORMAL": 1}}, "indices": 2, "material": 0}}]}}],
        "materials": [{{"pbrMetallicRoughness": {{"baseColorFactor": [{r}, {g}, {b}, 1.0], "metallicFactor": 0.1, "roughnessFactor": 0.45}}}}],
        "accessors": [
            {{"bufferView": 0, "componentType": 5126, "count": {count_verts}, "type": "VEC3", "max": [{max_x}, {max_y}, {max_z}], "min": [{min_x}, {min_y}, {min_z}]}},
            {{"bufferView": 1, "componentType": 5126, "count": {count_verts}, "type": "VEC3", "max": [1.0, 1.0, 1.0], "min": [-1.0, -1.0, -1.0]}},
            {{"bufferView": 2, "componentType": 5123, "count": {count_indices}, "type": "SCALAR", "max": [{max(indices)}], "min": [0]}}
        ],
        "bufferViews": [
            {{"buffer": 0, "byteOffset": 0, "byteLength": {count_verts * 12}}},
            {{"buffer": 0, "byteOffset": {count_verts * 12}, "byteLength": {count_verts * 12}}},
            {{"buffer": 0, "byteOffset": {count_verts * 24}, "byteLength": {count_indices * 2}}}
        ],
        "buffers": [{{"byteLength": {count_verts * 24 + count_indices * 2}}}]
    }}'''

    json_bytes = json_str.encode('utf-8')
    padding_len = (4 - (len(json_bytes) % 4)) % 4
    json_bytes += b' ' * padding_len

    # Binary Buffer Data
    bin_data = bytearray()
    for val in positions:
        bin_data.extend(struct.pack('<f', val))
    for val in normals:
        bin_data.extend(struct.pack('<f', val))
    for val in indices:
        bin_data.extend(struct.pack('<H', val))

    bin_padding = (4 - (len(bin_data) % 4)) % 4
    bin_data.extend(b'\x00' * bin_padding)

    total_length = 12 + 8 + len(json_bytes) + 8 + len(bin_data)

    glb = bytearray()
    glb.extend(struct.pack('<I', 0x46546C67)) # Magic 'glTF'
    glb.extend(struct.pack('<I', 2))           # Version 2
    glb.extend(struct.pack('<I', total_length))

    glb.extend(struct.pack('<I', len(json_bytes)))
    glb.extend(struct.pack('<I', 0x4E4F534A)) # 'JSON'
    glb.extend(json_bytes)

    glb.extend(struct.pack('<I', len(bin_data)))
    glb.extend(struct.pack('<I', 0x00414E49)) # 'BIN\0'
    glb.extend(bin_data)

    return glb

def main():
    target_dir = 'c:/Users/Hype/Documents/GameHima/assets/models'
    os.makedirs(target_dir, exist_ok=True)

    # 16 Trash Items + 4 Bin Assets (Lightweight GLB models under 5 KB each!)
    assets = [
        # BINS
        ('bin_organik.glb', 'bin', (0.06, 0.72, 0.5), 'BinOrganik'),
        ('bin_anorganik.glb', 'bin', (0.96, 0.62, 0.04), 'BinAnorganik'),
        ('bin_b3.glb', 'bin', (0.93, 0.26, 0.26), 'BinB3'),
        ('bin_daurulang.glb', 'bin', (0.02, 0.71, 0.83), 'BinDaurUlang'),

        # ORGANIK
        ('apple.glb', 'sphere', (0.93, 0.26, 0.26), 'SisaApel'),
        ('banana.glb', 'cylinder', (0.98, 0.8, 0.08), 'KulitPisang'),
        ('leaf.glb', 'cylinder', (0.13, 0.77, 0.36), 'DaunKering'),
        ('bread.glb', 'box', (0.85, 0.47, 0.02), 'RotiKadaluarsa'),

        # ANORGANIK
        ('bottle.glb', 'cylinder', (0.22, 0.74, 0.97), 'BotolPlastik'),
        ('can.glb', 'cylinder', (0.97, 0.45, 0.08), 'KalengMinuman'),
        ('bag.glb', 'box', (0.94, 0.96, 0.98), 'KantongPlastik'),
        ('straw.glb', 'cylinder', (0.92, 0.28, 0.6), 'SedotanPlastik'),

        # B3
        ('battery.glb', 'cylinder', (0.12, 0.16, 0.23), 'BateraiBekas'),
        ('bulb.glb', 'sphere', (0.99, 0.94, 0.54), 'LampuBohlam'),
        ('medicine.glb', 'cylinder', (0.85, 0.47, 0.02), 'BotolObat'),
        ('thermometer.glb', 'cylinder', (0.97, 0.26, 0.26), 'TermometerRaksa'),

        # DAUR ULANG
        ('box.glb', 'box', (0.7, 0.43, 0.04), 'KardusBox'),
        ('paper.glb', 'box', (0.97, 0.98, 0.99), 'KertasBuku'),
        ('newspaper.glb', 'cylinder', (0.88, 0.91, 0.94), 'KoranBekas'),
        ('carton.glb', 'box', (0.01, 0.52, 0.78), 'KartonSusu')
    ]

    for filename, mesh_type, color, name in assets:
        filepath = os.path.join(target_dir, filename)
        data = create_lowpoly_glb(mesh_type, color, name)
        with open(filepath, 'wb') as f:
            f.write(data)
        print(f"Generated GLB Asset: {filename} ({len(data)} bytes)")

if __name__ == '__main__':
    main()
