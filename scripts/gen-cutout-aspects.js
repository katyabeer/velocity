#!/usr/bin/env node
/**
 * Generates src/data/cutoutAspects.ts — every garment cutout's width/height,
 * read straight out of the PNG headers.
 *
 * WHY THIS IS A BUILD STEP AND NOT A RUNTIME READ. `ComposedFlatLay` needs each
 * cutout's true proportion to size it (see the note in that file). The obvious
 * call, `Image.resolveAssetSource`, DOES NOT EXIST on react-native-web — a
 * static require resolves to a plain URL there — and it threw at the first
 * placement. `Image.getSize` works on both but is asynchronous, which would
 * mean laying the plate out square and then re-flowing it.
 *
 * The cutouts are static files in the repo. Their dimensions cannot change at
 * runtime, so reading them once here is both exact and free.
 *
 * RE-RUN IT after any re-crop of the delivery:
 *     node scripts/gen-cutout-aspects.js
 */

const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, '..', 'assets', 'garments');
const OUT = path.join(__dirname, '..', 'src', 'data', 'cutoutAspects.ts');

/** PNG: an 8-byte signature, then the IHDR chunk with width/height at 16..24. */
function pngSize(file) {
  const fd = fs.openSync(file, 'r');
  const head = Buffer.alloc(24);
  fs.readSync(fd, head, 0, 24, 0);
  fs.closeSync(fd);
  if (head.toString('ascii', 1, 4) !== 'PNG') return null;
  return { w: head.readUInt32BE(16), h: head.readUInt32BE(20) };
}

const rows = fs
  .readdirSync(DIR)
  .filter((f) => f.startsWith('garm_') && f.endsWith('.png'))
  .sort()
  .map((f) => {
    const size = pngSize(path.join(DIR, f));
    if (!size) return null;
    /* `garm_structured-trench-coat.png` -> `structured trench coat`, which is
       the name the catalogue and every pick key on. */
    const name = f.replace(/^garm_/, '').replace(/\.png$/, '').replace(/-/g, ' ');
    return `  '${name}': ${(size.w / size.h).toFixed(4)},`;
  })
  .filter(Boolean);

const out = `/**
 * GENERATED — do not edit. \`node scripts/gen-cutout-aspects.js\`
 *
 * Each cutout's width / height, read from the PNG headers. The files are
 * cropped to their alpha bounding box, so this is the GARMENT's proportion
 * rather than a frame's.
 *
 * Read by ui/ComposedFlatLay.tsx to size every piece to the same visual mass.
 * See the generator for why this is not read at runtime.
 */

export const CUTOUT_ASPECT: Record<string, number> = {
${rows.join('\n')}
};

/** Square is the honest fallback for a name with no cutout — a legacy fixture
 *  draws a text tile, and a square frame is what the plate did before any of
 *  this. */
export const DEFAULT_ASPECT = 1;
`;

fs.writeFileSync(OUT, out);
console.log(`gen-cutout-aspects: ${rows.length} cutouts -> src/data/cutoutAspects.ts`);
