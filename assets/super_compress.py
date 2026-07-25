import os
import json
import struct
import io
from PIL import Image

def super_compress_glb(glb_path, max_dim=256, jpeg_quality=65):
    if not os.path.exists(glb_path):
        return
    
    with open(glb_path, 'rb') as f:
        data = f.read()
    
    if len(data) < 20 or data[:4] != b'glTF':
        return

    version = struct.unpack('<I', data[4:8])[0]
    length = struct.unpack('<I', data[8:12])[0]

    # Chunk 0: JSON
    json_chunk_len = struct.unpack('<I', data[12:16])[0]
    json_chunk_type = data[16:20]
    json_data = data[20:20+json_chunk_len].decode('utf-8')
    gltf = json.loads(json_data)

    # Chunk 1: BIN
    bin_offset = 20 + json_chunk_len
    if bin_offset >= len(data):
        return

    bin_chunk_len = struct.unpack('<I', data[bin_offset:bin_offset+4])[0]
    bin_data = bytearray(data[bin_offset+8:bin_offset+8+bin_chunk_len])

    buffer_views = gltf.get('bufferViews', [])
    images = gltf.get('images', [])

    new_bin = bytearray()
    new_buffer_views = []

    # Map old byteOffset -> new byteOffset
    for view in buffer_views:
        old_offset = view.get('byteOffset', 0)
        old_len = view.get('byteLength', 0)
        chunk = bin_data[old_offset:old_offset+old_len]

        # Check if buffer view is an image
        is_image_view = False
        for img in images:
            if img.get('bufferView') == len(new_buffer_views):
                is_image_view = True
                break

        if is_image_view:
            try:
                im = Image.open(io.BytesIO(chunk))
                im = im.convert('RGB')
                im.thumbnail((max_dim, max_dim), Image.Resampling.LANCZOS)
                
                out = io.BytesIO()
                im.save(out, format='JPEG', quality=jpeg_quality, optimize=True)
                compressed_bytes = out.getvalue()
                
                # Align to 4 bytes
                padding = (4 - (len(compressed_bytes) % 4)) % 4
                compressed_bytes += b'\x00' * padding

                new_offset = len(new_bin)
                new_bin.extend(compressed_bytes)

                view_copy = dict(view)
                view_copy['byteOffset'] = new_offset
                view_copy['byteLength'] = len(compressed_bytes)
                new_buffer_views.append(view_copy)
                continue
            except Exception as e:
                pass

        # Non-image or failed image
        padding = (4 - (len(chunk) % 4)) % 4
        chunk_padded = chunk + b'\x00' * padding

        new_offset = len(new_bin)
        new_bin.extend(chunk_padded)

        view_copy = dict(view)
        view_copy['byteOffset'] = new_offset
        view_copy['byteLength'] = len(chunk)
        new_buffer_views.append(view_copy)

    gltf['bufferViews'] = new_buffer_views
    gltf['buffers'][0]['byteLength'] = len(new_bin)

    new_json_str = json.dumps(gltf, separators=(',', ':')).encode('utf-8')
    json_pad = (4 - (len(new_json_str) % 4)) % 4
    new_json_str += b' ' * json_pad

    header = struct.pack('<4sII', b'glTF', 2, 12 + 8 + len(new_json_str) + 8 + len(new_bin))
    json_header = struct.pack('<I4s', len(new_json_str), b'JSON')
    bin_header = struct.pack('<I4s', len(new_bin), b'BIN\x00')

    new_glb = header + json_header + new_json_str + bin_header + bytes(new_bin)

    with open(glb_path, 'wb') as f:
        f.write(new_glb)

    print(f"Compressed {os.path.basename(glb_path)}: {len(data)/1024:.1f} KB -> {len(new_glb)/1024:.1f} KB")

if __name__ == '__main__':
    models_dir = 'assets/models'
    for f in os.listdir(models_dir):
        if f.endswith('.glb'):
            super_compress_glb(os.path.join(models_dir, f))
