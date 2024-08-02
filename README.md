# seamCarving

Image cropper, using seam carving algorithm. It's not working on all images, but it's a good start.
It supports png and jpg images. All settings can be changed in the async function main() file.
const seamCount defines number of seams that will be removed from the image. The higher the number, the more the image 
will be cropped. Input image should be in the same folder as the script and it name should be input.png. Outut image 
will be saved as output.png.

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```


