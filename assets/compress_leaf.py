import struct
import json
import io
from PIL import Image

def strip_and_compress_leaf():
    with open('assets/models/leaf.glb', 'rb') as f:
        data = f.read()

    json_len = struct.unpack('<I', data[12:16])[0]
    gltf = json.loads(data[20:20+json_len].decode('utf-8'))

    bin_offset = 20 + json_len
    bin_len = struct.unpack('<I', data[bin_offset:bin_offset+4])[0]
    bin_data = data[bin_offset+8:bin_offset+8+bin_len]

    images = gltf.get('images', [])
    buffer_views = gltf.get('bufferViews', [])

    # We only keep Image 0 (baseColorTexture) and compress it to 256x256 JPEG
    base_img_info = images[0]
    bv_idx = base_img_info['bufferView']
    bv = buffer_views[bv_idx]
    
    img_bytes = bin_data[bv['byteOffset']:bv['byteOffset']+bv['byteLength']]

    im = Image.open(io.BytesIO(img_bytes)).convert('RGB')
    im.thumbnail((256, 256), Image.Resampling.LANCZOS)

    out = io.BytesIO()
    im.save(out, format='JPEG', quality=65, optimize=True)
    comp_img_bytes = out.getvalue()

    # Rebuild BIN with geometry + compressed base color texture only
    # Find all geometry buffer views (position, normal, texcoord, indices)
    accessors = gltf.get('accessors', [])
    geom_bv_indices = set(acc['bufferView'] for acc in accessors if 'bufferView' in acc)

    new_bin = bytearray()
    new_buffer_views = []
    old_to_new_bv = {}

    for idx, view in enumerate(buffer_views):
        if idx in geom_bv_indices:
            old_off = view['byteOffset']
            old_len = view['byteLength']
            chunk = bin_data[old_off:old_off+old_len]
            
            pad = (4 - (len(chunk) % 4)) % 4
            chunk_padded = chunk + b'\x00' * pad

            new_off = len(new_bin)
            new_bin.extend(chunk_padded)

            v_copy = dict(view)
            v_copy['byteOffset'] = new_off
            v_copy['byteLength'] = len(chunk)
            old_to_new_bv[idx] = len(new_buffer_views)
            new_buffer_views.append(v_copy)

    # Append compressed texture
    pad = (4 - (len(comp_img_bytes) % 4)) % 4
    comp_padded = comp_img_bytes + b'\x00' * pad

    tex_bv_off = len(new_bin)
    new_bin.extend(comp_padded)

    tex_bv_idx = len(new_buffer_views)
    new_buffer_views.append({
        'buffer': 0,
        'byteOffset': tex_bv_off,
        'byteLength': len(comp_img_bytes)
    })

    # Update accessors
    for acc in accessors:
        if 'bufferView' in acc:
            acc['bufferView'] = old_to_new_bv[acc['bufferView']]

    # Update gltf structures
    gltf['bufferViews'] = new_buffer_views
    gltf['images'] = [{'mimeType': 'image/jpeg', 'bufferView': tex_bv_idx}]
    gltf['textures'] = [{'sampler': 0, 'source': 0}]
    gltf['materials'] = [{
        'name': 'leaf_mat',
        'doubleSided': True,
        'pbrMetallicRoughness': {
            'baseColorTexture': {'index': 0},
            'metallicFactor': 0.0,
            'roughnessFactor': 0.8
        }
    }]
    gltf['buffers'][0]['byteLength'] = len(new_bin)

    new_json = json.dumps(gltf, separators=(',', ':')).encode('utf-8')
    jpad = (4 - (len(new_json) % 4)) % 4
    new_json += b' ' * jpad

    header = struct.pack('<4sII', b'glTF', 2, 12 + 8 + len(new_json) + 8 + len(new_bin))
    json_h = struct.pack('<I4s', len(new_json), b'JSON')
    bin_h = struct.pack('<I4s', len(new_bin), b'BIN\x00')

    res_glb = header + json_h + new_json + bin_h + bytes(new_bin)

    with open('assets/models/leaf.glb', 'wb') as f:
        f.write(res_glb)

    print(f"✅ Dry Leaf compressed from 7.08 MB down to {len(res_glb)/1024:.1f} KB!")

if __name__ == '__main__':
    strip_and_compress_leaf()
