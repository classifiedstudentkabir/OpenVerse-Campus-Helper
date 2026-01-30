import sys
import json
import fitz  # PyMuPDF

def generate(input_path, output_path, config):
    try:
        doc = fitz.open(input_path)
        if not doc:
             raise Exception(f"Failed to open {input_path}")
        
        page = doc[0]  # Assume single page or first page for now

        # Draw overlays
        # config['layers'] is a list of items to draw
        for layer in config.get('layers', []):
            text = layer.get('text', '')
            if not text:
                continue

            # Rect: [x, y, w, h] -> fitz.Rect(x, y, x+w, y+h)
            x = layer.get('x', 0)
            y = layer.get('y', 0)
            w = layer.get('w', 200)
            h = layer.get('h', 50)
            rect = fitz.Rect(x, y, x + w, y + h)

            # Optional: Draw white background to cover existing
            # If 'cover' is true in layer config
            if layer.get('cover', False):
                page.draw_rect(rect, color=(1, 1, 1), fill=(1, 1, 1))

            # Insert Text
            # fitz.insert_textbox(rect, buffer, fontsize, fontname, align, color)
            # color is tuple (r, g, b)
            color_hex = layer.get('color', '#000000')
            try:
                r = int(color_hex[1:3], 16) / 255
                g = int(color_hex[3:5], 16) / 255
                b = int(color_hex[5:7], 16) / 255
            except:
                r, g, b = 0, 0, 0
            
            fontsize = layer.get('fontSize', 12)
            align_map = {'left': 0, 'center': 1, 'right': 2}
            align = align_map.get(layer.get('align', 'left'), 0)
            
            # Using default font for MVP. Custom fonts require registration.
            page.insert_textbox(
                rect, 
                text, 
                fontsize=fontsize, 
                fontname="helv", # Standard Helvetica
                align=align,
                color=(r, g, b)
            )

        if output_path.lower().endswith('.png'):
            # Render to image for preview
            pix = page.get_pixmap()
            pix.save(output_path)
        else:
            doc.save(output_path)
            
        print(json.dumps({"success": True, "path": output_path}))

    except Exception as e:
        print(json.dumps({"success": False, "error": str(e)}))
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) < 4:
        print(json.dumps({"success": False, "error": "Usage: python generate_pdf.py <input> <output> <json_config>"}))
        sys.exit(1)

    input_file = sys.argv[1]
    output_file = sys.argv[2]
    config_str = sys.argv[3]
    
    try:
        config_data = json.loads(config_str)
    except:
        print(json.dumps({"success": False, "error": "Invalid JSON config"}))
        sys.exit(1)

    generate(input_file, output_file, config_data)
