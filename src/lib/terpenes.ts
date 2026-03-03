export const TERPENE_INFO: Record<
  string,
  { emoji: string; description: string; effects: string }
> = {
  myrcene: {
    emoji: "🥭",
    description: "Most common terpene in cannabis. Found in mangoes, hops, and lemongrass.",
    effects: "Relaxing, sedating, anti-inflammatory",
  },
  limonene: {
    emoji: "🍋",
    description: "Citrusy terpene found in lemon rinds and orange peels.",
    effects: "Mood elevation, stress relief, anti-anxiety",
  },
  caryophyllene: {
    emoji: "🌶️",
    description: "Spicy, peppery terpene. The only terpene that binds to CB2 receptors.",
    effects: "Anti-inflammatory, pain relief, anti-anxiety",
  },
  beta_caryophyllene: {
    emoji: "🌶️",
    description: "Spicy, peppery terpene. The only terpene that binds to CB2 receptors.",
    effects: "Anti-inflammatory, pain relief, anti-anxiety",
  },
  linalool: {
    emoji: "💜",
    description: "Floral terpene abundant in lavender.",
    effects: "Calming, sleep aid, anti-anxiety",
  },
  pinene: {
    emoji: "🌲",
    description: "Fresh pine scent. Found in pine needles, rosemary, and basil.",
    effects: "Alertness, memory retention, anti-inflammatory",
  },
  alpha_pinene: {
    emoji: "🌲",
    description: "Fresh pine scent. Found in pine needles and rosemary.",
    effects: "Alertness, memory retention, anti-inflammatory",
  },
  humulene: {
    emoji: "🍺",
    description: "Earthy, woody terpene found in hops and coriander.",
    effects: "Appetite suppressant, anti-inflammatory",
  },
  terpinolene: {
    emoji: "🌸",
    description: "Complex floral, herbal, and piney aroma. Found in lilacs and tea tree.",
    effects: "Uplifting, mildly sedating, antioxidant",
  },
  ocimene: {
    emoji: "🌿",
    description: "Sweet, herbal, and woody. Found in mint, parsley, and orchids.",
    effects: "Uplifting, anti-inflammatory, antiviral",
  },
  terpineol: {
    emoji: "🍵",
    description: "Pleasant lilac-like aroma. Found in pine oil and petitgrain.",
    effects: "Relaxing, antibiotic, antioxidant",
  },
  valencene: {
    emoji: "🍊",
    description: "Sweet citrus aroma reminiscent of Valencia oranges.",
    effects: "Uplifting, anti-inflammatory, insect repellent",
  },
  bisabolol: {
    emoji: "🌼",
    description: "Delicate floral scent found in chamomile.",
    effects: "Soothing, anti-irritation, anti-inflammatory",
  },
  geraniol: {
    emoji: "🌹",
    description: "Rose-like floral scent found in geraniums.",
    effects: "Neuroprotective, antioxidant, anti-inflammatory",
  },
  camphene: {
    emoji: "🏔️",
    description: "Earthy, musky aroma with damp woodland notes.",
    effects: "Antioxidant, pain relief, cardiovascular support",
  },
};

export const CONSUMPTION_METHODS = [
  { value: "joint", label: "Joint", emoji: "🚬" },
  { value: "blunt", label: "Blunt", emoji: "🟤" },
  { value: "bong", label: "Bong", emoji: "🫧" },
  { value: "pipe", label: "Pipe", emoji: "🪈" },
  { value: "pax", label: "Pax/Vape", emoji: "💨" },
  { value: "dab", label: "Dab", emoji: "🔥" },
  { value: "concentrate", label: "Concentrate", emoji: "💎" },
  { value: "edible", label: "Edible", emoji: "🍪" },
  { value: "tincture", label: "Tincture", emoji: "💧" },
  { value: "topical", label: "Topical", emoji: "🧴" },
];

export const FEELING_OPTIONS = [
  "relaxed", "happy", "euphoric", "uplifted", "creative",
  "energetic", "focused", "giggly", "hungry", "sleepy",
  "talkative", "tingly", "aroused", "calm", "meditative",
];
