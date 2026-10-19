import os
from PIL import Image

def generate_assets():
    # Load scaled master icon
    master_path = 'assets/test_scaled_icon.png'
    master = Image.open(master_path).convert('RGB')
    
    # 1. assets/icon.png (1024x1024)
    master.save('assets/icon.png', format='PNG', optimize=True)
    print("Generated assets/icon.png (1024x1024)")
    
    # 2. assets/bazaar-icon-512.png (512x512 - Cafe Bazaar Standard)
    bazaar = master.resize((512, 512), Image.Resampling.LANCZOS)
    bazaar.save('assets/bazaar-icon-512.png', format='PNG', optimize=True)
    print("Generated assets/bazaar-icon-512.png (512x512, Cafe Bazaar Standard)")
    
    # 3. assets/android-icon-foreground.png (1024x1024)
    master.save('assets/android-icon-foreground.png', format='PNG', optimize=True)
    print("Generated assets/android-icon-foreground.png (1024x1024)")
    
    # 4. assets/android-icon-background.png (1024x1024)
    # Background is already saved from test_project, let's ensure it's 1024x1024
    if os.path.exists('assets/android-icon-background.png'):
        print("assets/android-icon-background.png already exists.")
        
    # 5. assets/splash-icon.png (512x512)
    bazaar.save('assets/splash-icon.png', format='PNG', optimize=True)
    print("Generated assets/splash-icon.png (512x512)")
    
    # 6. assets/app_logo.png (256x256)
    app_logo = master.resize((256, 256), Image.Resampling.LANCZOS)
    app_logo.save('assets/app_logo.png', format='PNG', optimize=True)
    print("Generated assets/app_logo.png (256x256)")
    
    # 7. assets/favicon.png (64x64)
    favicon = master.resize((64, 64), Image.Resampling.LANCZOS)
    favicon.save('assets/favicon.png', format='PNG', optimize=True)
    print("Generated assets/favicon.png (64x64)")

if __name__ == '__main__':
    generate_assets()
