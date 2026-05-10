import random
from PIL import Image, ImageDraw, ImageFilter

def create_nebula(width, height, filename):
    # Base background (deep space)
    img = Image.new('RGB', (width, height), color=(5, 5, 15))
    draw = ImageDraw.Draw(img)
    
    # Create soft nebula clouds
    colors = [
        (40, 10, 60),  # Purple
        (10, 30, 60),  # Blue
        (60, 20, 40),  # Magenta
        (0, 40, 50)    # Cyan
    ]
    
    for _ in range(15):
        color = random.choice(colors)
        x = random.randint(0, width)
        y = random.randint(0, height)
        size = random.randint(200, 600)
        
        # Draw a soft glowing blob
        overlay = Image.new('RGBA', (width, height), (0,0,0,0))
        overlay_draw = ImageDraw.Draw(overlay)
        
        # Draw multiple concentric circles with decreasing opacity for a soft look
        for r in range(size, 0, -5):
            alpha = int((1 - r/size) * 30)
            overlay_draw.ellipse([x-r, y-r, x+r, y+r], fill=(color[0], color[1], color[2], alpha))
        
        img.paste(Image.alpha_composite(img.convert('RGBA'), overlay).convert('RGB'))

    # Add stars
    for _ in range(500):
        x = random.randint(0, width)
        y = random.randint(0, height)
        brightness = random.randint(150, 255)
        # Some colored stars
        if random.random() < 0.1:
            color = (brightness, random.randint(100, 200), random.randint(100, 200))
        else:
            color = (brightness, brightness, brightness)
        
        draw.point((x, y), fill=color)
        
        # Occasional bright stars with a small glow
        if random.random() < 0.02:
            draw.ellipse([x-1, y-1, x+1, y+1], fill=(255, 255, 255))

    # Apply a slight blur to the whole thing to blend clouds
    img = img.filter(ImageFilter.GaussianBlur(radius=1))
    
    img.save(filename, "PNG")
    print(f"Nebula saved as {filename}")

if __name__ == "__main__":
    create_nebula(1024, 1024, "mini-story/public/assets/nebula.png")
