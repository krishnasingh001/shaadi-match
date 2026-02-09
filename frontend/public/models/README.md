# 3D Avatar Models

This directory should contain the GLTF/GLB avatar models from the GitHub repository.

## How to Add the Avatar Models

1. **Clone or download the repository:**
   ```bash
   git clone https://github.com/mahakPandeyOfficial/3D-Avatar-React-Threejs.git
   ```

2. **Find the avatar model files:**
   - Look in the `public` folder of the cloned repository
   - Find `.glb` or `.gltf` files (these are the 3D model files)

3. **Copy the model files to this directory:**
   - Copy the female avatar model as: `female-avatar.glb`
   - Copy the male avatar model as: `male-avatar.glb`
   - Or use the actual filenames from the repository and update the component accordingly

4. **Alternative: Use Ready Player Me or other avatar services:**
   - You can also download free avatar models from:
     - Ready Player Me: https://readyplayer.me/
     - Mixamo: https://www.mixamo.com/
     - Sketchfab: https://sketchfab.com/

## File Structure

```
public/
  models/
    female-avatar.glb  (or .gltf)
    male-avatar.glb    (or .gltf)
```

## Note

If the model files are not found, the application will automatically fall back to using geometric avatars (the smooth cylinder-based characters).
