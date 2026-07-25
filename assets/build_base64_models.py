import os
import base64
import json

def generate_base64_models():
    models_dir = 'c:/Users/Hype/Documents/GameHima/assets/models'
    output_js_path = 'c:/Users/Hype/Documents/GameHima/js/three/gltfData.js'

    model_files = {
        'gltf_banana': 'banana.glb',
        'gltf_apple': 'apple.glb',
        'gltf_leaf': 'leaf.glb',
        'gltf_bread': 'bread.glb',
        'gltf_bottle': 'bottle.glb',
        'gltf_can': 'can.glb',
        'gltf_duck': 'duck.glb',
        'gltf_straw': 'straw.glb',
        'gltf_battery': 'battery.glb',
        'gltf_bulb': 'bulb.glb',
        'gltf_medicine': 'medicine.glb',
        'gltf_thermometer': 'thermometer.glb',
        'gltf_box': 'box.glb',
        'gltf_paper': 'paper.glb',
        'gltf_newspaper': 'newspaper.glb',
        'gltf_carton': 'carton.glb'
    }

    base64_dict = {}

    for key, filename in model_files.items():
        path = os.path.join(models_dir, filename)
        if os.path.exists(path):
            size = os.path.getsize(path)
            with open(path, 'rb') as f:
                b64 = base64.b64encode(f.read()).decode('ascii')
                base64_dict[key] = f"data:application/octet-stream;base64,{b64}"
                print(f"Embedded {key} ({filename}): {size} bytes -> Base64")
        else:
            print(f"File not found: {filename}")

    js_content = f"// Auto-generated Base64 GLTF Data for 100% Offline-First execution\nwindow.GLTF_MODEL_DATA = {json.dumps(base64_dict)};\n"

    with open(output_js_path, 'w', encoding='utf-8') as js_f:
        js_f.write(js_content)

    print(f"\nGenerated {output_js_path} successfully ({os.path.getsize(output_js_path)} bytes)!")

if __name__ == '__main__':
    generate_base64_models()
