import struct
import os

def convert_stl_to_glb(stl_path, glb_path):
    with open(stl_path, 'rb') as f:
        data = f.read()

    # Binary STL header: 80 bytes header, 4 bytes count
    num_triangles = struct.unpack('<I', data[80:84])[0]
    print(f"Reading STL with {num_triangles} triangles...")

    positions = []
    normals = []
    indices = []

    # Sample triangles to build a smooth, realistic low-poly banana GLB
    step = max(1, num_triangles // 1200)

    vert_idx = 0
    offset = 84
    for i in range(num_triangles):
        if offset + 50 > len(data):
            break

        nx, ny, nz = struct.unpack('<fff', data[offset:offset+12])
        v1x, v1y, v1z = struct.unpack('<fff', data[offset+12:offset+24])
        v2x, v2y, v2z = struct.unpack('<fff', data[offset+24:offset+36])
        v3x, v3y, v3z = struct.unpack('<fff', data[offset+36:offset+48])
        offset += 50

        if i % step == 0 and vert_idx < 65000:
            scale = 0.008
            positions.extend([v1x*scale, v1y*scale, v1z*scale])
            positions.extend([v2x*scale, v2y*scale, v2z*scale])
            positions.extend([v3x*scale, v3y*scale, v3z*scale])

            normals.extend([nx, ny, nz,  nx, ny, nz,  nx, ny, nz])
            indices.extend([vert_idx, vert_idx+1, vert_idx+2])
            vert_idx += 3

    count_verts = len(positions) // 3
    count_indices = len(indices)

    min_x = min(positions[0::3])
    max_x = max(positions[0::3])
    min_y = min(positions[1::3])
    max_y = max(positions[1::3])
    min_z = min(positions[2::3])
    max_z = max(positions[2::3])

    json_data = {
        "asset": {"version": "2.0", "generator": "EcoHero Real 3D Scan Converter"},
        "scenes": [{"nodes": [0]}],
        "nodes": [{"mesh": 0, "name": "KulitPisangScanRill"}],
        "meshes": [{"primitives": [{"attributes": {"POSITION": 0, "NORMAL": 1}, "indices": 2, "material": 0}]}],
        "materials": [{"pbrMetallicRoughness": {"baseColorFactor": [0.96, 0.82, 0.08, 1.0], "metallicFactor": 0.05, "roughnessFactor": 0.45}}],
        "accessors": [
            {"bufferView": 0, "componentType": 5126, "count": count_verts, "type": "VEC3", "max": [max_x, max_y, max_z], "min": [min_x, min_y, min_z]},
            {"bufferView": 1, "componentType": 5126, "count": count_verts, "type": "VEC3", "max": [1.0, 1.0, 1.0], "min": [-1.0, -1.0, -1.0]},
            {"bufferView": 2, "componentType": 5123, "count": count_indices, "type": "SCALAR", "max": [max(indices)], "min": [0]}
        ],
        "bufferViews": [
            {"buffer": 0, "byteOffset": 0, "byteLength": count_verts * 12},
            {"buffer": 0, "byteOffset": count_verts * 12, "byteLength": count_verts * 12},
            {"buffer": 0, "byteOffset": count_verts * 24, "byteLength": count_indices * 2}
        ],
        "buffers": [{"byteLength": count_verts * 24 + count_indices * 2}]
    }

    import json
    json_bytes = json.dumps(json_data).encode('utf-8')
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
    glb.extend(struct.pack('<I', 0x46546C67)) # 'glTF'
    glb.extend(struct.pack('<I', 2))           # Version 2
    glb.extend(struct.pack('<I', total_length))

    glb.extend(struct.pack('<I', len(json_bytes)))
    glb.extend(struct.pack('<I', 0x4E4F534A)) # 'JSON'
    glb.extend(json_bytes)

    glb.extend(struct.pack('<I', len(bin_data)))
    glb.extend(struct.pack('<I', 0x00414E49)) # 'BIN\0'
    glb.extend(bin_data)

    with open(glb_path, 'wb') as out_f:
        out_f.write(glb)
    
    print(f"Successfully created GLB model at {glb_path} ({len(glb)} bytes)")

if __name__ == '__main__':
    convert_stl_to_glb('c:/Users/Hype/Documents/GameHima/assets/models/banana_scan.stl', 'c:/Users/Hype/Documents/GameHima/assets/models/banana.glb')
