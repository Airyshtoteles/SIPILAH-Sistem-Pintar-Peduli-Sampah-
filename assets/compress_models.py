"""
Compress GLB files by resizing embedded texture images to web-optimized sizes (max 512x512 JPEG/PNG),
drastically reducing file size from 140MB down to ~10MB total for ultra-fast Vercel deployment!
"""
import struct, json, os, base64, io, sys
from PIL import Image

MODELS_DIR = 'c:/Users/Hype/Documents/GameHima/assets/models'
MAX_TEXTURE_DIM = 512  # Resize textures larger than 512x512 down to 512x512 for mobile performance
JPEG_QUALITY = 75       # 75% quality JPEG compression

def compress_glb(glb_path):
    orig_size = os.path.getsize(glb_path)
    
    with open(glb_path, 'rb') as f:
        magic = f.read(4)
        if magic != b'glTF':
            return False
        
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
        for i, img in enumerate(gltf['images']):
            if 'uri' in img and img['uri'].startswith('data:'):
                data_uri = img['uri']
                header, b64_str = data_uri.split(',', 1)
                img_bytes = base64.b64decode(b64_str)
                
                try:
                    pil_img = Image.open(io.BytesIO(img_bytes))
                    w, h = pil_img.size
                    
                    # Resize if larger than MAX_TEXTURE_DIM
                    if w > MAX_TEXTURE_DIM or h > MAX_TEXTURE_DIM or len(img_bytes) > 200000:
                        pil_img.thumbnail((MAX_TEXTURE_DIM, MAX_TEXTURE_DIM), Image.LANCZOS)
                        
                        out_buf = io.BytesIO()
                        # Convert RGBA to RGB for JPEG if no transparency needed, or save compressed PNG
                        has_alpha = pil_img.mode in ('RGBA', 'LA') or (pil_img.mode == 'P' and 'transparency' in pil_img.info)
                        
                        if has_alpha:
                            pil_img.save(out_buf, format='PNG', optimize=True)
                            new_mime = 'image/png'
                        else:
                            if pil_img.mode != 'RGB':
                                pil_img = pil_img.convert('RGB')
                            pil_img.save(out_buf, format='JPEG', quality=JPEG_QUALITY, optimize=True)
                            new_mime = 'image/jpeg'
                        
                        comp_bytes = out_buf.getvalue()
                        if len(comp_bytes) < len(img_bytes):
                            b64_comp = base64.b64encode(comp_bytes).decode('ascii')
                            img['uri'] = f'data:{new_mime};base64,{b64_comp}'
                            modified = True
                            print(f'    Image [{i}]: {w}x{h} ({len(img_bytes)} B) -> {pil_img.size[0]}x{pil_img.size[1]} ({len(comp_bytes)} B)')
                except Exception as e:
                    print(f'    Warning image [{i}]: {e}')
    
    if not modified:
        return False
    
    json_str = json.dumps(gltf, separators=(',', ':'))
    while len(json_str) % 4 != 0:
        json_str += ' '
    json_bytes = json_str.encode('utf-8')
    
    while len(bin_data) % 4 != 0:
        bin_data += b'\x00'
    
    new_total = 12 + 8 + len(json_bytes)
    if bin_data:
        new_total += 8 + len(bin_data)
    
    with open(glb_path, 'wb') as f:
        f.write(b'glTF')
        f.write(struct.pack('<I', 2))
        f.write(struct.pack('<I', new_total))
        f.write(struct.pack('<I', len(json_bytes)))
        f.write(b'JSON')
        f.write(json_bytes)
        if bin_data:
            f.write(struct.pack('<I', len(bin_data)))
            f.write(b'BIN\x00')
            f.write(bin_data)
    
    new_size = os.path.getsize(glb_path)
    ratio = (1 - (new_size / orig_size)) * 100
    print(f'  Compressed: {orig_size} B -> {new_size} B ({ratio:.1f}% reduction)')
    return True


print("==========================================================")
print("Compressing all 3D GLB Models for Fast Vercel Deployment")
print("==========================================================")

total_before = 0
total_after = 0

for root, dirs, files in os.walk(MODELS_DIR):
    for filename in files:
        if filename.endswith('.glb'):
            path = os.path.join(root, filename)
            sz_before = os.path.getsize(path)
            total_before += sz_before
            print(f"\nProcessing {filename} ({sz_before} bytes)...")
            compress_glb(path)
            sz_after = os.path.getsize(path)
            total_after += sz_after

print("\n" + "=" * 60)
print(f"TOTAL BEFORE COMPRESSION : {total_before / (1024*1024):.2f} MB")
print(f"TOTAL AFTER COMPRESSION  : {total_after / (1024*1024):.2f} MB")
print(f"TOTAL SAVINGS            : {(1 - (total_after/total_before)) * 100:.1f}% REDUCTION!")
print("=" * 60)
