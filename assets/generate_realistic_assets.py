import os
import struct
import math

def create_realistic_banana_glb():
    # Construct a real 3D curved banana peel with 3 outer peeling flaps
    positions = []
    normals = []
    indices = []

    # 1. Main Curved Banana Center Body (Cream White / Light Yellow)
    # Arc curve points along Z-axis
    num_rings = 10
    num_sides = 6
    radius = 0.18

    for r_idx in range(num_rings):
        t = r_idx / (num_rings - 1)
        # Curve along arc
        angle_arc = (t - 0.5) * 1.2
        cy = math.sin(angle_arc) * 0.8
        cz = (t - 0.5) * 1.2
        r_scale = math.sin(t * math.pi) * radius + 0.05

        for s_idx in range(num_sides):
            st = (s_idx / num_sides) * math.pi * 2
            nx = math.cos(st)
            ny = math.sin(st)

            px = nx * r_scale
            py = cy + ny * r_scale
            pz = cz

            positions.extend([px, py, pz])
            normals.extend([nx, ny, 0.0])

    # Connect center body rings
    for r_idx in range(num_rings - 1):
        for s_idx in range(num_sides):
            next_s = (s_idx + 1) % num_sides
            i1 = r_idx * num_sides + s_idx
            i2 = r_idx * num_sides + next_s
            i3 = (r_idx + 1) * num_sides + s_idx
            i4 = (r_idx + 1) * num_sides + next_s

            indices.extend([i1, i3, i2,  i2, i3, i4])

    # 2. Add 3 Peeled Skin Flaps curving outward at top
    base_vert_count = len(positions) // 3

    for flap_idx in range(3):
        flap_angle = (flap_idx / 3.0) * math.pi * 2
        flap_pts = 6

        for f_idx in range(flap_pts):
            ft = f_idx / (flap_pts - 1)
            # Curve flap outwards
            flare = ft * 0.65
            drop = -ft * 0.7
            
            px = math.cos(flap_angle) * (0.2 + flare)
            py = 0.4 + drop
            pz = math.sin(flap_angle) * (0.2 + flare)

            positions.extend([px, py, pz])
            normals.extend([math.cos(flap_angle), 0.5, math.sin(flap_angle)])

        # Connect flap line into strip
        f_start = base_vert_count + (flap_idx * flap_pts)
        for f_idx in range(flap_pts - 1):
            i1 = f_start + f_idx
            i2 = f_start + f_idx + 1
            indices.extend([i1, i2, i1])

    count_verts = len(positions) // 3
    count_indices = len(indices)

    min_x = min(positions[0::3])
    max_x = max(positions[0::3])
    min_y = min(positions[1::3])
    max_y = max(positions[1::3])
    min_z = min(positions[2::3])
    max_z = max(positions[2::3])

    json_str = f'''{{
        "asset": {{"version": "2.0", "generator": "EcoHero Realistic Banana Exporter"}},
        "scenes": [{{"nodes": [0]}}],
        "nodes": [{{"mesh": 0, "name": "KulitPisangRill"}}],
        "meshes": [{{"primitives": [{{"attributes": {{"POSITION": 0, "NORMAL": 1}}, "indices": 2, "material": 0}}]}}],
        "materials": [{{"pbrMetallicRoughness": {{"baseColorFactor": [0.98, 0.85, 0.08, 1.0], "metallicFactor": 0.05, "roughnessFactor": 0.5}}}}],
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
    glb.extend(struct.pack('<I', 0x46546C67))
    glb.extend(struct.pack('<I', 2))
    glb.extend(struct.pack('<I', total_length))

    glb.extend(struct.pack('<I', len(json_bytes)))
    glb.extend(struct.pack('<I', 0x4E4F534A))
    glb.extend(json_bytes)

    glb.extend(struct.pack('<I', len(bin_data)))
    glb.extend(struct.pack('<I', 0x00414E49))
    glb.extend(bin_data)

    return glb

def main():
    target_path = 'c:/Users/Hype/Documents/GameHima/assets/models/banana.glb'
    glb_data = create_realistic_banana_glb()
    with open(target_path, 'wb') as f:
        f.write(glb_data)
    print(f"Generated Realistic Banana GLB Asset: {len(glb_data)} bytes")

if __name__ == '__main__':
    main()
