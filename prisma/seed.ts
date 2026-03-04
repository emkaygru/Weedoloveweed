import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { BUILT_IN_STRAINS } from "../src/data/strains";

// ── Helpers ──────────────────────────────────────────────────────────────────

function nameToSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[#']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function slugToName(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

// Terpene name (Leafly capitalized) → lowercase DB key
const TERPENE_KEY: Record<string, string> = {
  Myrcene: "myrcene",
  Caryophyllene: "caryophyllene",
  Limonene: "limonene",
  Pinene: "pinene",
  Terpinolene: "terpinolene",
  Humulene: "humulene",
  Ocimene: "ocimene",
  Linalool: "linalool",
};

// Convert ordered terpene names to numeric profile using placeholder values
const TERPENE_VALUES = [0.035, 0.025, 0.015];
function terpenesToProfile(
  names: string[]
): Record<string, number> | undefined {
  if (!names.length) return undefined;
  const profile: Record<string, number> = {};
  names.forEach((name, i) => {
    const key = TERPENE_KEY[name] ?? name.toLowerCase();
    profile[key] = TERPENE_VALUES[i] ?? 0.01;
  });
  return profile;
}

// ── Slug overrides for built-in strains ──────────────────────────────────────

const SLUG_OVERRIDES: Record<string, string> = {
  "Girl Scout Cookies": "gsc",
  "Gorilla Glue #4": "original-glue",
  GG4: "original-glue",
  "Mac 1": "mac",
  Sherbet: "sunset-sherbert",
  "Do-Si-Dos": "do-si-dos",
  Dosidos: "do-si-dos",
  ACDC: "acdc",
  "Charlotte's Web": "charlottes-web",
  "Lamb's Bread": "lamb-s-bread",
  "Wifi OG": "white-fire-og",
  "Thin Mint Cookies": "thin-mint",
  Chemdawg: "chemdawg",
  "AK-47": "ak-47",
  "King Louis XIII": "king-louis",
};

// ── Extra Leafly strains (not in BUILT_IN_STRAINS) ───────────────────────────
// Ordered terpene names only — numeric values are placeholders (see TERPENE_VALUES)

const LEAFLY_EXTRA: Record<string, string[]> = {
  "22": ["Caryophyllene", "Limonene", "Humulene"],
  "24k-gold": ["Myrcene", "Pinene", "Limonene"],
  "3-kings": ["Caryophyllene", "Limonene", "Humulene"],
  "3x-crazy": ["Myrcene", "Caryophyllene", "Limonene"],
  "501st-og": ["Myrcene", "Limonene", "Caryophyllene"],
  "707-headband": ["Myrcene", "Caryophyllene", "Limonene"],
  "9-pound-hammer": ["Myrcene", "Pinene", "Caryophyllene"],
  "acapulco-gold": ["Caryophyllene", "Limonene", "Myrcene"],
  "afghan-kush": ["Myrcene", "Limonene", "Caryophyllene"],
  afghani: ["Myrcene", "Pinene", "Ocimene"],
  afgoo: ["Myrcene", "Ocimene", "Caryophyllene"],
  "agent-orange": ["Myrcene", "Terpinolene", "Pinene"],
  "alaskan-thunder-fuck": ["Myrcene", "Caryophyllene", "Pinene"],
  "albert-walker": ["Myrcene", "Caryophyllene", "Pinene"],
  "alien-breath": ["Caryophyllene", "Limonene", "Myrcene"],
  "alien-cookies": ["Limonene", "Myrcene", "Caryophyllene"],
  "alien-og": ["Myrcene", "Caryophyllene", "Limonene"],
  "alien-rift": ["Myrcene", "Pinene", "Caryophyllene"],
  "alien-walker": ["Myrcene", "Pinene", "Limonene"],
  "allen-wrench": ["Myrcene", "Caryophyllene", "Pinene"],
  amnesia: ["Terpinolene", "Caryophyllene", "Ocimene"],
  "ancient-og": ["Limonene", "Myrcene", "Caryophyllene"],
  "animal-cookies": ["Caryophyllene", "Limonene", "Myrcene"],
  "apollo-11": ["Myrcene", "Caryophyllene", "Pinene"],
  "apollo-13": ["Myrcene", "Caryophyllene", "Pinene"],
  "banana-og": ["Limonene", "Caryophyllene", "Pinene"],
  "banana-punch": ["Limonene", "Pinene", "Caryophyllene"],
  "banana-split": ["Terpinolene", "Myrcene", "Limonene"],
  bananas: ["Limonene", "Myrcene", "Caryophyllene"],
  "bay-dream": ["Myrcene", "Pinene", "Caryophyllene"],
  "bay-platinum-cookies": ["Caryophyllene", "Limonene", "Humulene"],
  "berry-white": ["Limonene", "Pinene", "Caryophyllene"],
  "big-smooth": ["Pinene", "Myrcene", "Caryophyllene"],
  "birthday-cake-kush": ["Caryophyllene", "Limonene", "Myrcene"],
  "black-betty": ["Myrcene", "Caryophyllene", "Ocimene"],
  "black-cherry-cheesecake": ["Limonene", "Myrcene", "Caryophyllene"],
  "black-cherry-soda": ["Limonene", "Caryophyllene", "Myrcene"],
  "black-dog": ["Limonene", "Caryophyllene", "Myrcene"],
  "black-domina": ["Myrcene", "Pinene", "Caryophyllene"],
  "black-jack": ["Terpinolene", "Caryophyllene", "Ocimene"],
  "black-lime-special-reserve": ["Myrcene", "Pinene", "Caryophyllene"],
  "black-magic": ["Myrcene", "Pinene", "Caryophyllene"],
  blackberry: ["Myrcene", "Limonene", "Caryophyllene"],
  "blackberry-cream": ["Myrcene", "Limonene", "Caryophyllene"],
  "blackberry-fire": ["Myrcene", "Caryophyllene", "Limonene"],
  blackwater: ["Limonene", "Caryophyllene", "Myrcene"],
  "blue-cookies": ["Caryophyllene", "Limonene", "Humulene"],
  "blue-frost": ["Myrcene", "Pinene", "Caryophyllene"],
  "blue-haze": ["Myrcene", "Pinene", "Caryophyllene"],
  "blue-kush": ["Myrcene", "Pinene", "Caryophyllene"],
  "blue-magoo": ["Myrcene", "Caryophyllene", "Pinene"],
  "blue-og": ["Limonene", "Caryophyllene", "Myrcene"],
  "blue-zkittlez": ["Myrcene", "Pinene", "Caryophyllene"],
  "blueberry-ak": ["Limonene", "Myrcene", "Caryophyllene"],
  "blueberry-cookies": ["Myrcene", "Pinene", "Caryophyllene"],
  "blueberry-diesel": ["Caryophyllene", "Limonene", "Humulene"],
  "blueberry-haze": ["Myrcene", "Pinene", "Caryophyllene"],
  "blueberry-jack": ["Terpinolene", "Ocimene", "Myrcene"],
  "blueberry-muffins": ["Myrcene", "Caryophyllene", "Limonene"],
  "boss-og": ["Myrcene", "Limonene", "Caryophyllene"],
  "brian-berry-cough": ["Myrcene", "Caryophyllene", "Humulene"],
  "bruce-banner-3": ["Caryophyllene", "Myrcene", "Limonene"],
  "bubba-76": ["Caryophyllene", "Limonene", "Humulene"],
  "bubba-cookies": ["Caryophyllene", "Limonene", "Humulene"],
  "bubbas-gift": ["Limonene", "Caryophyllene", "Myrcene"],
  "bubble-gum": ["Myrcene", "Pinene", "Caryophyllene"],
  bubblicious: ["Myrcene", "Caryophyllene", "Limonene"],
  cactus: ["Terpinolene", "Myrcene", "Pinene"],
  "candy-apple": ["Pinene", "Myrcene", "Limonene"],
  "candy-jack": ["Terpinolene", "Caryophyllene", "Pinene"],
  candyland: ["Caryophyllene", "Limonene", "Humulene"],
  "cbd-critical-mass": ["Myrcene", "Pinene", "Caryophyllene"],
  cheese: ["Caryophyllene", "Limonene", "Myrcene"],
  "cheese-quake": ["Caryophyllene", "Humulene", "Limonene"],
  "chem-cookies": ["Myrcene", "Caryophyllene", "Limonene"],
  chemo: ["Caryophyllene", "Myrcene", "Limonene"],
  chernobyl: ["Terpinolene", "Myrcene", "Caryophyllene"],
  "cherry-ak-47": ["Myrcene", "Caryophyllene", "Pinene"],
  "cherry-cookies": ["Caryophyllene", "Humulene", "Limonene"],
  "cherry-kush": ["Caryophyllene", "Humulene", "Myrcene"],
  "cherry-og": ["Limonene", "Caryophyllene", "Myrcene"],
  "cherry-wine": ["Myrcene", "Caryophyllene", "Humulene"],
  chiesel: ["Caryophyllene", "Limonene", "Myrcene"],
  "chiquita-banana": ["Limonene", "Myrcene", "Pinene"],
  "chocolate-hashberry": ["Myrcene", "Caryophyllene", "Limonene"],
  "chocolate-thai": ["Myrcene", "Caryophyllene", "Pinene"],
  chocolope: ["Myrcene", "Caryophyllene", "Limonene"],
  "cinderella-99": ["Myrcene", "Caryophyllene", "Limonene"],
  cinex: ["Limonene", "Caryophyllene", "Pinene"],
  "citrus-sap": ["Myrcene", "Pinene", "Caryophyllene"],
  clementine: ["Terpinolene", "Ocimene", "Caryophyllene"],
  "cookie-breath": ["Myrcene", "Caryophyllene", "Pinene"],
  "cookie-dough": ["Caryophyllene", "Myrcene", "Limonene"],
  "cookie-monster": ["Caryophyllene", "Humulene", "Limonene"],
  "cotton-candy-kush": ["Myrcene", "Pinene", "Limonene"],
  "cracker-jack": ["Terpinolene", "Caryophyllene", "Ocimene"],
  "critical-jack": ["Terpinolene", "Caryophyllene", "Pinene"],
  "critical-kush": ["Myrcene", "Caryophyllene", "Limonene"],
  daybreaker: ["Myrcene", "Pinene", "Caryophyllene"],
  daywalker: ["Myrcene", "Limonene", "Caryophyllene"],
  "deadhead-og": ["Caryophyllene", "Limonene", "Myrcene"],
  "designer-og": ["Limonene", "Caryophyllene", "Myrcene"],
  diablo: ["Myrcene", "Caryophyllene", "Limonene"],
  "diamond-og": ["Pinene", "Myrcene", "Caryophyllene"],
  "dj-short-blueberry": ["Myrcene", "Caryophyllene", "Pinene"],
  "docs-og": ["Myrcene", "Caryophyllene", "Limonene"],
  "dogwalker-og": ["Limonene", "Myrcene", "Caryophyllene"],
  "donkey-butter": ["Caryophyllene", "Limonene", "Myrcene"],
  "double-dream": ["Myrcene", "Pinene", "Caryophyllene"],
  "double-tangie-banana": ["Terpinolene", "Myrcene", "Limonene"],
  "dr-who": ["Myrcene", "Pinene", "Limonene"],
  "dream-queen": ["Myrcene", "Caryophyllene", "Ocimene"],
  "duct-tape": ["Limonene", "Caryophyllene", "Myrcene"],
  "durban-kush": ["Terpinolene", "Ocimene", "Myrcene"],
  "dutch-treat": ["Terpinolene", "Myrcene", "Ocimene"],
  "east-coast-sour-diesel": ["Caryophyllene", "Myrcene", "Limonene"],
  elektra: ["Myrcene", "Pinene", "Caryophyllene"],
  "elmers-glue": ["Caryophyllene", "Limonene", "Myrcene"],
  "extreme-cream": ["Limonene", "Myrcene", "Caryophyllene"],
  "face-off-og": ["Myrcene", "Limonene", "Caryophyllene"],
  "fire-og": ["Myrcene", "Limonene", "Caryophyllene"],
  "firewalker-og": ["Myrcene", "Limonene", "Caryophyllene"],
  "forum-cut-cookies": ["Caryophyllene", "Limonene", "Humulene"],
  fpog: ["Limonene", "Myrcene", "Caryophyllene"],
  frankenstein: ["Myrcene", "Pinene", "Ocimene"],
  "fruit-loops": ["Myrcene", "Limonene", "Caryophyllene"],
  "fruit-punch": ["Myrcene", "Limonene", "Caryophyllene"],
  "g-13": ["Myrcene", "Limonene", "Caryophyllene"],
  "game-changer": ["Limonene", "Pinene", "Caryophyllene"],
  "gelato-33": ["Limonene", "Caryophyllene", "Linalool"],
  "ghost-og": ["Myrcene", "Limonene", "Caryophyllene"],
  "ghost-train-haze": ["Terpinolene", "Myrcene", "Limonene"],
  "godfather-og": ["Myrcene", "Caryophyllene", "Limonene"],
  "gods-gift": ["Myrcene", "Pinene", "Caryophyllene"],
  "goji-og": ["Myrcene", "Caryophyllene", "Linalool"],
  "golden-goat": ["Terpinolene", "Caryophyllene", "Myrcene"],
  "golden-lemon": ["Terpinolene", "Myrcene", "Caryophyllene"],
  "golden-pineapple": ["Terpinolene", "Myrcene", "Ocimene"],
  "golden-ticket": ["Terpinolene", "Myrcene", "Pinene"],
  "gorilla-blue": ["Caryophyllene", "Limonene", "Humulene"],
  "gorilla-cookies": ["Caryophyllene", "Limonene", "Myrcene"],
  "grandpas-breath": ["Myrcene", "Caryophyllene", "Limonene"],
  "grape-cookies": ["Caryophyllene", "Limonene", "Humulene"],
  "grape-god": ["Myrcene", "Pinene", "Caryophyllene"],
  grapefruit: ["Myrcene", "Caryophyllene", "Pinene"],
  "green-candy": ["Myrcene", "Ocimene", "Caryophyllene"],
  "green-queen": ["Myrcene", "Caryophyllene", "Humulene"],
  "green-ribbon": ["Limonene", "Caryophyllene", "Myrcene"],
  gutbuster: ["Caryophyllene", "Myrcene", "Limonene"],
  "hardcore-og": ["Limonene", "Myrcene", "Caryophyllene"],
  "harle-tsu": ["Myrcene", "Terpinolene", "Pinene"],
  "head-cheese": ["Myrcene", "Ocimene", "Pinene"],
  "hellfire-og": ["Myrcene", "Pinene", "Caryophyllene"],
  "hells-og": ["Myrcene", "Limonene", "Caryophyllene"],
  herojuana: ["Myrcene", "Limonene", "Caryophyllene"],
  "holy-grail-kush": ["Limonene", "Myrcene", "Caryophyllene"],
  "honey-bananas": ["Limonene", "Caryophyllene", "Myrcene"],
  "huckleberry-diesel": ["Limonene", "Caryophyllene", "Myrcene"],
  "ice-cream-man": ["Terpinolene", "Myrcene", "Caryophyllene"],
  "incredible-bulk": ["Myrcene", "Caryophyllene", "Limonene"],
  "island-sweet-skunk": ["Myrcene", "Terpinolene", "Pinene"],
  j1: ["Terpinolene", "Caryophyllene", "Ocimene"],
  "jah-goo": ["Terpinolene", "Myrcene", "Caryophyllene"],
  "jedi-kush": ["Myrcene", "Caryophyllene", "Pinene"],
  "jesus-og": ["Caryophyllene", "Limonene", "Humulene"],
  "jet-fuel": ["Myrcene", "Caryophyllene", "Limonene"],
  jillybean: ["Myrcene", "Caryophyllene", "Pinene"],
  "juicy-fruit": ["Myrcene", "Caryophyllene", "Pinene"],
  kaboom: ["Terpinolene", "Caryophyllene", "Myrcene"],
  "kandy-kush": ["Limonene", "Caryophyllene", "Myrcene"],
  "key-lime-pie": ["Caryophyllene", "Limonene", "Myrcene"],
  "kimbo-kush": ["Limonene", "Caryophyllene", "Pinene"],
  "kosher-dawg": ["Myrcene", "Limonene", "Caryophyllene"],
  "kosher-kush": ["Myrcene", "Limonene", "Caryophyllene"],
  "kosher-tangie": ["Myrcene", "Caryophyllene", "Pinene"],
  kushage: ["Limonene", "Caryophyllene", "Myrcene"],
  "la-cheese": ["Caryophyllene", "Limonene", "Humulene"],
  "la-kookies": ["Myrcene", "Caryophyllene", "Pinene"],
  "la-og": ["Myrcene", "Limonene", "Caryophyllene"],
  "larry-og": ["Myrcene", "Limonene", "Caryophyllene"],
  lavender: ["Caryophyllene", "Limonene", "Myrcene"],
  "lee-roy": ["Myrcene", "Limonene", "Caryophyllene"],
  "legend-og": ["Myrcene", "Limonene", "Caryophyllene"],
  "lemon-cake": ["Myrcene", "Limonene", "Linalool"],
  "lemon-diesel": ["Caryophyllene", "Pinene", "Myrcene"],
  "lemon-g": ["Myrcene", "Caryophyllene", "Limonene"],
  "lemon-garlic-og": ["Myrcene", "Caryophyllene", "Limonene"],
  "lemon-kush": ["Myrcene", "Pinene", "Caryophyllene"],
  "lemon-kush-headband": ["Limonene", "Caryophyllene", "Pinene"],
  "lemon-meringue": ["Terpinolene", "Caryophyllene", "Pinene"],
  "lemon-skunk": ["Caryophyllene", "Limonene", "Myrcene"],
  "lemon-tree": ["Myrcene", "Pinene", "Caryophyllene"],
  lemonberry: ["Myrcene", "Caryophyllene", "Pinene"],
  "lemonhead-og": ["Myrcene", "Limonene", "Caryophyllene"],
  "liberty-haze": ["Limonene", "Caryophyllene", "Myrcene"],
  lifter: ["Myrcene", "Caryophyllene", "Ocimene"],
  locktite: ["Caryophyllene", "Limonene", "Myrcene"],
  lsd: ["Terpinolene", "Pinene", "Myrcene"],
  "lucid-bolt": ["Pinene", "Myrcene", "Caryophyllene"],
  "mandarin-cookies": ["Myrcene", "Caryophyllene", "Limonene"],
  mango: ["Caryophyllene", "Limonene", "Myrcene"],
  "mango-tango": ["Myrcene", "Caryophyllene", "Limonene"],
  "marionberry-kush": ["Myrcene", "Limonene", "Caryophyllene"],
  "mars-og": ["Caryophyllene", "Limonene", "Myrcene"],
  "master-kush": ["Caryophyllene", "Limonene", "Myrcene"],
  "master-og": ["Caryophyllene", "Limonene", "Myrcene"],
  medusa: ["Myrcene", "Pinene", "Caryophyllene"],
  "mendo-breath": ["Caryophyllene", "Limonene", "Myrcene"],
  "mickey-kush": ["Caryophyllene", "Terpinolene", "Limonene"],
  "mk-ultra": ["Myrcene", "Caryophyllene", "Limonene"],
  "monster-cookies": ["Caryophyllene", "Limonene", "Humulene"],
  "moonshine-haze": ["Terpinolene", "Caryophyllene", "Pinene"],
  motorbreath: ["Limonene", "Caryophyllene", "Myrcene"],
  "mr-nice": ["Myrcene", "Caryophyllene", "Limonene"],
  nepalese: ["Myrcene", "Caryophyllene", "Limonene"],
  nuken: ["Myrcene", "Pinene", "Caryophyllene"],
  "nyc-diesel": ["Myrcene", "Limonene", "Caryophyllene"],
  "obama-kush": ["Caryophyllene", "Limonene", "Pinene"],
  "og-18": ["Myrcene", "Limonene", "Caryophyllene"],
  ogkb: ["Caryophyllene", "Limonene", "Myrcene"],
  ogre: ["Myrcene", "Caryophyllene", "Limonene"],
  "ogre-berry": ["Myrcene", "Caryophyllene", "Humulene"],
  "orange-cookies": ["Terpinolene", "Myrcene", "Caryophyllene"],
  "orange-cream": ["Caryophyllene", "Limonene", "Myrcene"],
  "orange-dream": ["Myrcene", "Pinene", "Caryophyllene"],
  "orange-juice": ["Myrcene", "Pinene", "Limonene"],
  "orange-sherbert": ["Myrcene", "Caryophyllene", "Limonene"],
  "oregon-diesel": ["Caryophyllene", "Limonene", "Pinene"],
  "oregon-lemons": ["Myrcene", "Caryophyllene", "Limonene"],
  "paris-og": ["Limonene", "Caryophyllene", "Myrcene"],
  "peanut-butter-breath": ["Limonene", "Caryophyllene", "Linalool"],
  pennywise: ["Myrcene", "Pinene", "Terpinolene"],
  permafrost: ["Caryophyllene", "Myrcene", "Pinene"],
  "phantom-cookies": ["Caryophyllene", "Limonene", "Humulene"],
  "phantom-og": ["Caryophyllene", "Limonene", "Humulene"],
  "pie-face-og": ["Caryophyllene", "Limonene", "Humulene"],
  "pine-tar-kush": ["Myrcene", "Caryophyllene", "Limonene"],
  pineapple: ["Myrcene", "Caryophyllene", "Ocimene"],
  "pineapple-chunk": ["Myrcene", "Limonene", "Caryophyllene"],
  "pineapple-kush": ["Terpinolene", "Myrcene", "Pinene"],
  "pineapple-sage": ["Terpinolene", "Myrcene", "Limonene"],
  "pineapple-skunk": ["Myrcene", "Caryophyllene", "Limonene"],
  "pink-lemonade": ["Ocimene", "Pinene", "Myrcene"],
  "platinum-bubba-kush": ["Caryophyllene", "Limonene", "Myrcene"],
  "platinum-gsc": ["Caryophyllene", "Limonene", "Humulene"],
  "platinum-kush": ["Caryophyllene", "Limonene", "Myrcene"],
  plushberry: ["Pinene", "Myrcene", "Caryophyllene"],
  "pre-98-bubba-kush": ["Caryophyllene", "Limonene", "Myrcene"],
  "purple-arrow": ["Terpinolene", "Caryophyllene", "Myrcene"],
  "purple-diesel": ["Myrcene", "Caryophyllene", "Limonene"],
  "purple-hindu-kush": ["Limonene", "Caryophyllene", "Pinene"],
  "purple-trainwreck": ["Terpinolene", "Myrcene", "Caryophyllene"],
  "purple-urkle": ["Myrcene", "Caryophyllene", "Pinene"],
  "quantum-kush": ["Limonene", "Caryophyllene", "Myrcene"],
  querkle: ["Myrcene", "Pinene", "Caryophyllene"],
  rainbow: ["Myrcene", "Caryophyllene", "Pinene"],
  rainmaker: ["Limonene", "Caryophyllene", "Myrcene"],
  "raspberry-kush": ["Myrcene", "Limonene", "Caryophyllene"],
  "red-dragon": ["Myrcene", "Caryophyllene", "Limonene"],
  remedy: ["Myrcene", "Pinene", "Caryophyllene"],
  "rollex-og-kush": ["Myrcene", "Limonene", "Caryophyllene"],
  romulan: ["Myrcene", "Caryophyllene", "Pinene"],
  "royal-highness": ["Myrcene", "Caryophyllene", "Pinene"],
  "royal-kush": ["Myrcene", "Pinene", "Caryophyllene"],
  "rudeboi-og": ["Caryophyllene", "Myrcene", "Limonene"],
  sage: ["Myrcene", "Caryophyllene", "Limonene"],
  "sage-n-sour": ["Myrcene", "Pinene", "Caryophyllene"],
  "scooby-snack": ["Caryophyllene", "Limonene", "Linalool"],
  "scotts-og": ["Myrcene", "Limonene", "Caryophyllene"],
  "sensi-star": ["Myrcene", "Caryophyllene", "Limonene"],
  "seor-jack": ["Terpinolene", "Caryophyllene", "Pinene"],
  "sfv-og": ["Myrcene", "Limonene", "Caryophyllene"],
  "shangri-la": ["Myrcene", "Limonene", "Caryophyllene"],
  "shark-shock": ["Myrcene", "Pinene", "Caryophyllene"],
  "silver-haze": ["Myrcene", "Caryophyllene", "Limonene"],
  "silverhawks-og": ["Terpinolene", "Caryophyllene", "Pinene"],
  "slimer-og": ["Terpinolene", "Myrcene", "Limonene"],
  "snoops-dream": ["Myrcene", "Pinene", "Caryophyllene"],
  snowland: ["Terpinolene", "Ocimene", "Pinene"],
  "sour-banana-sherbet": ["Myrcene", "Pinene", "Caryophyllene"],
  "sour-cookies": ["Caryophyllene", "Myrcene", "Limonene"],
  "sour-dog": ["Caryophyllene", "Limonene", "Myrcene"],
  "sour-grape": ["Myrcene", "Pinene", "Caryophyllene"],
  "sour-kosher": ["Caryophyllene", "Myrcene", "Limonene"],
  "sour-kush": ["Caryophyllene", "Limonene", "Humulene"],
  "sour-og": ["Myrcene", "Limonene", "Caryophyllene"],
  "sour-patch-kiss": ["Caryophyllene", "Limonene", "Humulene"],
  "sour-sorbet": ["Limonene", "Myrcene", "Caryophyllene"],
  "sour-space-candy": ["Myrcene", "Terpinolene", "Caryophyllene"],
  "sour-tangie": ["Myrcene", "Pinene", "Caryophyllene"],
  "sour-tsunami": ["Myrcene", "Terpinolene", "Pinene"],
  "star-killer": ["Myrcene", "Caryophyllene", "Limonene"],
  stardawg: ["Caryophyllene", "Myrcene", "Limonene"],
  "strawberry-banana": ["Limonene", "Myrcene", "Caryophyllene"],
  "strawberry-diesel": ["Limonene", "Linalool", "Caryophyllene"],
  "strawberry-fields": ["Terpinolene", "Myrcene", "Pinene"],
  "strawberry-ice": ["Myrcene", "Caryophyllene", "Humulene"],
  "sugar-cookie": ["Caryophyllene", "Limonene", "Humulene"],
  sunshine: ["Myrcene", "Limonene", "Caryophyllene"],
  "super-blue-dream": ["Myrcene", "Pinene", "Caryophyllene"],
  "super-jack": ["Terpinolene", "Caryophyllene", "Pinene"],
  "super-sour-diesel": ["Limonene", "Caryophyllene", "Myrcene"],
  "super-sour-og": ["Limonene", "Myrcene", "Caryophyllene"],
  superglue: ["Caryophyllene", "Limonene", "Myrcene"],
  "suzy-q": ["Myrcene", "Pinene", "Caryophyllene"],
  sweeties: ["Caryophyllene", "Limonene", "Myrcene"],
  "tangerine-dream": ["Myrcene", "Caryophyllene", "Limonene"],
  "tangie-dream": ["Myrcene", "Pinene", "Caryophyllene"],
  "thc-bomb": ["Caryophyllene", "Myrcene", "Humulene"],
  "the-guice": ["Caryophyllene", "Limonene", "Humulene"],
  "the-white": ["Caryophyllene", "Myrcene", "Limonene"],
  "triangle-kush": ["Myrcene", "Limonene", "Caryophyllene"],
  "true-love": ["Pinene", "Myrcene", "Caryophyllene"],
  "true-og": ["Myrcene", "Limonene", "Caryophyllene"],
  "ultraviolet-og": ["Myrcene", "Pinene", "Caryophyllene"],
  "vanilla-kush": ["Terpinolene", "Caryophyllene", "Pinene"],
  "venom-og": ["Myrcene", "Limonene", "Caryophyllene"],
  "violet-delight": ["Myrcene", "Caryophyllene", "Pinene"],
  "watermelon-zkittlez": ["Limonene", "Caryophyllene", "Myrcene"],
  "wedding-crasher": ["Caryophyllene", "Myrcene", "Limonene"],
  "white-buffalo": ["Caryophyllene", "Myrcene", "Limonene"],
  "white-cookies": ["Myrcene", "Caryophyllene", "Limonene"],
  "white-fire-43": ["Limonene", "Caryophyllene", "Myrcene"],
  "white-fire-alien-og": ["Caryophyllene", "Limonene", "Myrcene"],
  "white-gorilla": ["Caryophyllene", "Limonene", "Myrcene"],
  "white-rhino": ["Caryophyllene", "Myrcene", "Limonene"],
  "white-tahoe-cookies": ["Caryophyllene", "Limonene", "Myrcene"],
  "white-urkle": ["Myrcene", "Caryophyllene", "Pinene"],
  "whitewalker-og": ["Limonene", "Myrcene", "Caryophyllene"],
  wookie: ["Caryophyllene", "Myrcene", "Limonene"],
  wookies: ["Caryophyllene", "Limonene", "Humulene"],
  "xj-13": ["Terpinolene", "Caryophyllene", "Pinene"],
  "xxx-og": ["Myrcene", "Limonene", "Caryophyllene"],
  zookies: ["Caryophyllene", "Limonene", "Humulene"],
};

// ── DB client ─────────────────────────────────────────────────────────────────

const adapter = new PrismaPg({
  connectionString:
    process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

// ── Seed ──────────────────────────────────────────────────────────────────────

async function main() {
  // 1. Seed all 85 built-in strains with their full data
  console.log(`Seeding ${BUILT_IN_STRAINS.length} built-in strains...`);
  let count = 0;
  for (const strain of BUILT_IN_STRAINS) {
    const slug = SLUG_OVERRIDES[strain.name] ?? nameToSlug(strain.name);
    await prisma.strain.upsert({
      where: { slug },
      update: {
        name: strain.name,
        type: strain.type,
        thcPercent: strain.thcPercent,
        cbdPercent: strain.cbdPercent,
        description: strain.description,
        effects: strain.effects,
        flavors: strain.flavors,
        terpeneProfile: strain.terpeneProfile ?? undefined,
        isUserCreated: false,
      },
      create: {
        name: strain.name,
        slug,
        type: strain.type,
        thcPercent: strain.thcPercent,
        cbdPercent: strain.cbdPercent,
        description: strain.description,
        effects: strain.effects,
        flavors: strain.flavors,
        terpeneProfile: strain.terpeneProfile ?? undefined,
        isUserCreated: false,
      },
    });
    count++;
  }
  console.log(`  ✓ ${count} built-in strains upserted`);

  // 2. Seed extra Leafly strains with placeholder terpene values
  const extraEntries = Object.entries(LEAFLY_EXTRA);
  console.log(`\nSeeding ${extraEntries.length} extra Leafly strains...`);
  let extraCount = 0;
  let skipped = 0;
  for (const [slug, terpeneNames] of extraEntries) {
    const name = slugToName(slug);
    const terpeneProfile = terpenesToProfile(terpeneNames);
    try {
      await prisma.strain.upsert({
        where: { slug },
        update: { terpeneProfile },
        create: {
          name,
          slug,
          type: "hybrid",
          terpeneProfile,
          isUserCreated: false,
        },
      });
      extraCount++;
    } catch {
      skipped++;
    }
  }
  console.log(`  ✓ ${extraCount} extra strains upserted, ${skipped} skipped`);
  console.log(`\nDone! Total: ${count + extraCount} strains in DB.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
