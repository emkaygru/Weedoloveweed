import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env" });
dotenv.config({ path: "../.env" });

const connectionString =
  process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const RECIPES = [
  {
    title: "Classic Cannabutter",
    category: "edible",
    description: "The base of almost every cannabis edible. Rich, infused butter ready to use in any recipe.",
    ingredients: [
      "1 cup (225g) unsalted butter",
      "1 cup water",
      "7–10g decarboxylated cannabis flower (or 5g ABV)",
      "Cheesecloth for straining",
    ],
    instructions: [
      "Decarboxylate your cannabis: spread ground flower on a baking sheet and bake at 240°F (115°C) for 40 minutes. Let cool.",
      "In a saucepan, melt butter with 1 cup water over low heat. The water prevents burning and is removed later.",
      "Add decarboxylated cannabis to the butter mixture.",
      "Simmer on the lowest heat for 2–3 hours, stirring occasionally. Do NOT boil.",
      "Line a strainer with cheesecloth over a bowl. Pour the mixture through, pressing gently to extract all butter.",
      "Discard the plant material. Refrigerate the strained liquid for 1 hour.",
      "The butter will solidify on top. Remove it and discard the water layer underneath.",
      "Store cannabutter in an airtight container in the fridge (2 weeks) or freezer (3 months).",
    ],
    servings: 16,
    mgThcTotal: null,
    notes: "Use 1 tbsp per serving as a starting point. Potency varies by flower strength.",
    isBuiltIn: true,
  },
  {
    title: "Cannabis Coconut Oil",
    category: "edible",
    description: "Versatile infused oil for baking, capsules, or topicals. Coconut oil binds fat-soluble cannabinoids very efficiently.",
    ingredients: [
      "1 cup (240ml) coconut oil",
      "7–10g decarboxylated cannabis flower",
      "Cheesecloth for straining",
    ],
    instructions: [
      "Decarboxylate your cannabis at 240°F (115°C) for 40 minutes. Let cool and grind coarsely.",
      "Combine coconut oil and cannabis in a slow cooker or double boiler.",
      "Cook on low (160–200°F / 70–93°C) for 4–6 hours, stirring every hour.",
      "Alternatively, use an Instant Pot: combine oil and cannabis in a mason jar, seal loosely, cook on low pressure for 4 hours.",
      "Strain through cheesecloth into a clean jar, squeezing out all oil.",
      "Seal and store at room temperature (1 month) or refrigerator (3 months).",
    ],
    servings: 24,
    mgThcTotal: null,
    notes: "Great as a 1:1 substitute for butter in baking. Also used as a base for topicals.",
    isBuiltIn: true,
  },
  {
    title: "Canna Chocolate Bark",
    category: "edible",
    description: "Dead simple chocolate bark. Fancy-looking, easy to dose, easy to share.",
    ingredients: [
      "200g dark or milk chocolate chips",
      "2–4 tbsp cannabutter (see Cannabutter recipe)",
      "Toppings: flaky salt, dried fruit, nuts, sprinkles",
    ],
    instructions: [
      "Line a baking sheet with parchment paper.",
      "Melt chocolate in a double boiler or microwave in 30-second bursts, stirring between each.",
      "Once melted and smooth, stir in cannabutter until fully incorporated.",
      "Pour onto parchment and spread to ~¼ inch thickness.",
      "Sprinkle toppings of your choice over the surface.",
      "Refrigerate for 30–60 minutes until fully set.",
      "Break into pieces. Each piece should have roughly the same dose.",
      "Store in the fridge in an airtight container.",
    ],
    servings: 16,
    mgThcTotal: null,
    notes: "Calculate dose based on your cannabutter potency. Break into equal pieces for consistent dosing.",
    isBuiltIn: true,
  },
  {
    title: "Cannabis Gummies",
    category: "edible",
    description: "Precise, portable, and easy to store. Uses tincture or distillate for consistent dosing.",
    ingredients: [
      "½ cup fruit juice (any flavour)",
      "2 tbsp lemon juice",
      "2 tbsp unflavoured gelatin (about 2 packets)",
      "2 tbsp honey or sugar",
      "1–2ml cannabis tincture or distillate (dosed to your preference)",
      "Gummy moulds",
    ],
    instructions: [
      "Combine fruit juice and lemon juice in a small saucepan over low heat.",
      "Whisk in gelatin and sweetener until fully dissolved. Do not boil.",
      "Remove from heat. Let cool slightly to about 100°F (do not let it set).",
      "Stir in your tincture or distillate thoroughly.",
      "Pour mixture into gummy moulds using a dropper or small spoon.",
      "Refrigerate for at least 2 hours until firm.",
      "Pop out of moulds, coat lightly in citric acid/sugar for a sour finish (optional).",
      "Store in an airtight container in the fridge for up to 2 weeks.",
    ],
    servings: 30,
    mgThcTotal: null,
    notes: "Use distillate for flavour-neutral gummies. Tincture may add a slight cannabis taste.",
    isBuiltIn: true,
  },
  {
    title: "Soothing Cannabis Body Balm",
    category: "topical",
    description: "A simple, healing salve for sore muscles and dry skin. No psychoactive effects — cannabinoids don't enter the bloodstream through skin.",
    ingredients: [
      "½ cup cannabis coconut oil (see Cannabis Coconut Oil recipe)",
      "¼ cup beeswax pellets",
      "1 tbsp shea butter",
      "15 drops lavender essential oil",
      "10 drops peppermint essential oil (for cooling)",
    ],
    instructions: [
      "Combine cannabis coconut oil, beeswax, and shea butter in a double boiler over low heat.",
      "Stir until everything is melted and combined.",
      "Remove from heat and let cool for 5 minutes — do not let it set.",
      "Add essential oils and stir well.",
      "Pour into small tins or glass jars.",
      "Let cool completely at room temperature for 1–2 hours until solid.",
      "Apply a small amount to sore areas and massage in.",
    ],
    servings: null,
    mgThcTotal: null,
    notes: "For a firmer balm add more beeswax; for a softer consistency use less. Add more peppermint for extra cooling.",
    isBuiltIn: true,
  },
  {
    title: "Green Dragon Tincture",
    category: "tincture",
    description: "A classic high-proof alcohol tincture. Discreet, fast-acting under the tongue, and easy to dose.",
    ingredients: [
      "7g decarboxylated cannabis flower",
      "250ml high-proof grain alcohol (Everclear 151+) or food-grade vegetable glycerin for non-alcohol version",
      "Mason jar with lid",
      "Dark glass dropper bottles for storage",
    ],
    instructions: [
      "Decarboxylate cannabis at 240°F (115°C) for 40 minutes. Let cool completely.",
      "Place decarbed cannabis in a clean mason jar.",
      "Pour alcohol over the cannabis, ensuring it is fully submerged.",
      "Seal tightly and shake vigorously for 1–2 minutes.",
      "Let soak for 24–48 hours at room temperature, shaking once or twice daily. (For a milder flavour, keep in the freezer.)",
      "Strain through cheesecloth or a coffee filter into a clean container.",
      "Transfer to dark glass dropper bottles. Label with dose estimate.",
      "Store in a cool, dark place. Alcohol tincture keeps indefinitely; glycerin version keeps 1 year.",
    ],
    servings: 50,
    mgThcTotal: null,
    notes: "Start with 0.5ml (half a dropper) held under tongue for 60–90 seconds. Effects in 15–45 minutes.",
    isBuiltIn: true,
  },
  {
    title: "Cannabis Capsules",
    category: "capsule",
    description: "The most discreet, odour-free way to dose. Fill empty gel capsules with infused oil.",
    ingredients: [
      "Cannabis coconut oil (see recipe)",
      "Empty size 0 or 00 gelatin or vegan capsules",
      "Capsule filling machine or small dropper/syringe",
    ],
    instructions: [
      "Warm cannabis coconut oil just enough to make it liquid (if it has solidified).",
      "Using a syringe or dropper, fill each capsule with your desired amount of oil.",
      "Size 0 holds ~0.5ml; size 00 holds ~0.9ml.",
      "Cap each capsule firmly.",
      "Store in an airtight container in the fridge.",
      "Start with 1 capsule and wait 2 hours before redosing.",
    ],
    servings: 30,
    mgThcTotal: null,
    notes: "Label your containers with oil potency. Refrigerating keeps capsules firm and extends shelf life.",
    isBuiltIn: true,
  },
];

async function main() {
  console.log("Seeding built-in recipes…");
  for (const recipe of RECIPES) {
    await prisma.recipe.upsert({
      where: {
        // Use title as a unique identifier for seeding
        id: recipe.title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
      },
      update: {},
      create: {
        id: recipe.title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
        ...recipe,
      },
    });
    console.log(`  ✓ ${recipe.title}`);
  }
  console.log("Done!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
