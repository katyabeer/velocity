/**
 * GENERATED — do not edit. `node scripts/gen-cutout-aspects.js`
 *
 * Each cutout's width / height, read from the PNG headers. The files are
 * cropped to their alpha bounding box, so this is the GARMENT's proportion
 * rather than a frame's.
 *
 * Read by ui/ComposedFlatLay.tsx to size every piece to the same visual mass.
 * See the generator for why this is not read at runtime.
 */

export const CUTOUT_ASPECT: Record<string, number> = {
  'argyle drop shoulder sweater': 1.0580,
  'belted double breasted overcoat': 0.5810,
  'black fine turtleneck': 0.8629,
  'black lace gothic dress': 0.6439,
  'black leather biker jacket': 0.9847,
  'bowler bag': 0.9571,
  'boxy broad shoulder knit': 1.1535,
  'cape detail wool coat': 0.7357,
  'charcoal check pencil skirt': 0.5954,
  'charcoal suit jacket': 1.1503,
  'charcoal suit trouser': 0.4433,
  'chocolate suede boot': 1.1840,
  'chunky biker boot': 1.2403,
  'chunky gold jewellery': 0.9765,
  'chunky lug loafer': 1.9150,
  'clean riding boot': 0.6562,
  'colourful tights': 0.4579,
  'crisp poplin shirt': 1.1841,
  'croc effect knee boot': 0.6089,
  'dark indigo straight jean': 0.5525,
  'drop waist day dress': 0.8045,
  'drop waist pencil skirt': 0.7443,
  'east west shoulder bag': 0.8992,
  'embellished kitten heel': 1.2815,
  'fair isle cable jumper': 1.0687,
  'funnel neck wool coat': 0.5833,
  'fur trapper hat': 0.7871,
  'glove pump heel': 1.5846,
  'jewelled evening clutch': 1.2655,
  'le smoking tuxedo jacket': 0.9427,
  'leather gloves': 0.4420,
  'leather tailored skirt': 0.6641,
  'leopard faux fur coat': 1.0960,
  'long maxi denim skirt': 0.4752,
  'low rise stirrup trouser': 0.4400,
  'maxi wrap scarf': 2.2740,
  'mesh ballet flat': 2.1651,
  'oversized plaid trouser': 0.5895,
  'peep toe pump heel': 0.9605,
  'peplum knit top': 0.7815,
  'peplum sculpted shoulder jacket': 0.9420,
  'plaid check overcoat': 0.6293,
  'pleated wool trouser': 0.5290,
  'pointed stiletto knee boot': 0.5643,
  'shearling collar coat': 1.1007,
  'shield sunglasses': 2.4433,
  'silk charmeuse blouse': 1.0455,
  'slim penny loafer': 2.4895,
  'slouchy suede knee boot': 0.6570,
  'statement brooch': 0.9183,
  'statement fringe midi skirt': 0.5032,
  'structured trench coat': 0.6122,
  'suede jacket': 1.0539,
  'suede tailored skirt': 1.0840,
  'supersized tote': 0.9707,
  'sweater dress': 0.6610,
  'tuxedo dress shirt': 1.1942,
  'useless belt': 1.9750,
  'velvet jewel tone dress': 0.5220,
  'wide leg wool trouser': 0.6559,
};

/** Square is the honest fallback for a name with no cutout — a legacy fixture
 *  draws a text tile, and a square frame is what the plate did before any of
 *  this. */
export const DEFAULT_ASPECT = 1;
