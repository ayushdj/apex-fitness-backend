export interface NutritionChunk {
  id: string;
  title: string;
  content: string;
  tags: string[];
}

export const NUTRITION_KNOWLEDGE: NutritionChunk[] = [

  // ── Calorie targets ────────────────────────────────────────────────
  {
    id: 'cal-targets',
    title: 'Daily Calorie Targets by Goal',
    content: `Calorie needs depend on goal, bodyweight, and activity level.
Fat loss (cutting): Body weight (lbs) × 10–12 = daily calories. Creates a 300–500 kcal deficit.
Maintenance (recomp): Body weight (lbs) × 13–15 = daily calories. Supports performance without weight change.
Muscle gain (bulking): Body weight (lbs) × 16–18 = daily calories. Lean bulk: +200–300 kcal/day over maintenance.
Example: 180 lb athlete cutting = 1800–2160 kcal/day. Bulking = 2880–3240 kcal/day.
Track calories for 2 weeks, adjust by 100–200 kcal if weight isn't moving as intended.`,
    tags: ['calories', 'cutting', 'bulking', 'fat loss', 'muscle gain', 'diet'],
  },
  {
    id: 'macro-ratios',
    title: 'Macronutrient Ratios for Athletes',
    content: `Protein: 0.7–1.0g per lb of bodyweight daily. Essential for muscle repair and growth.
Higher end (1g/lb) during caloric deficit or heavy training to preserve muscle.
Carbohydrates: Primary fuel for high-intensity exercise. 2–3g/lb for strength athletes, 3–5g/lb for endurance.
Fat: Minimum 0.35g/lb/day for hormonal health. Don't drop below 20% of total calories.
Muscle gain macro split example (180 lb): 180g protein (720 kcal), 250g carbs (1000 kcal), 70g fat (630 kcal) ≈ 2350 kcal.
Fat loss macro split (180 lb at 2000 kcal): 180g protein, 150g carbs, 55g fat.`,
    tags: ['macros', 'protein', 'carbs', 'fat', 'muscle gain', 'fat loss'],
  },
  {
    id: 'meal-timing',
    title: 'Meal Timing and Frequency',
    content: `Pre-workout (1–2h before): 30–50g carbs + 20–30g protein. Example: rice + chicken, oats + protein shake.
Post-workout (within 2h): 40–60g carbs + 30–40g protein to maximize muscle protein synthesis.
Meal frequency: 3–5 meals/day. Spreading protein in meals of 25–40g optimizes muscle protein synthesis.
Fasting is fine if total daily calories and protein are met. 16:8 intermittent fasting is compatible with muscle gain.
Carb backloading: Placing majority of carbs around training enhances performance and body composition.
Pre-bed protein: 30–40g casein (cottage cheese, Greek yogurt, casein shake) reduces overnight muscle breakdown.`,
    tags: ['meal timing', 'pre-workout', 'post-workout', 'intermittent fasting', 'meal frequency'],
  },
  {
    id: 'hydration',
    title: 'Hydration for Performance',
    content: `Daily baseline: 0.5–0.7 oz per lb of bodyweight. A 180 lb athlete needs 90–126 oz (2.5–3.7L) daily.
Add 16–24 oz for every hour of training. Urine color should be pale yellow.
Electrolytes matter during sessions >60 min: sodium, potassium, magnesium. Sports drinks or electrolyte tablets.
Dehydration of just 2% bodyweight reduces strength by 5–10% and cognition significantly.
Caffeine (3–6mg/kg) is an evidence-based ergogenic aid. 1–2 cups of coffee or pre-workout 30–45min before training.`,
    tags: ['hydration', 'water', 'electrolytes', 'performance', 'caffeine'],
  },

  // ── Protein sources ────────────────────────────────────────────────
  {
    id: 'proteins-meat',
    title: 'Animal Protein Sources — Meat',
    content: `Chicken breast (cooked, 100g): 165 kcal | 31g protein | 3.6g fat | 0g carbs. Lean, versatile.
Chicken thigh (cooked, 100g): 209 kcal | 26g protein | 11g fat | 0g carbs. More flavorful, slightly fattier.
Turkey breast (cooked, 100g): 157 kcal | 30g protein | 3.2g fat | 0g carbs. Very lean.
Lean ground beef 95% (cooked, 100g): 174 kcal | 26g protein | 7.5g fat | 0g carbs.
Ground beef 80/20 (cooked, 100g): 254 kcal | 26g protein | 17g fat | 0g carbs. Higher calorie.
Beef sirloin steak (cooked, 100g): 207 kcal | 27g protein | 11g fat | 0g carbs.
Flank steak (cooked, 100g): 192 kcal | 28g protein | 8.5g fat | 0g carbs. Lean, high protein.
Pork tenderloin (cooked, 100g): 143 kcal | 26g protein | 3.5g fat | 0g carbs. Very lean pork.
Pork loin (cooked, 100g): 172 kcal | 25g protein | 7.5g fat | 0g carbs.
Lamb leg (cooked, 100g): 218 kcal | 26g protein | 12g fat | 0g carbs. Rich in zinc and iron.
Bison (cooked, 100g): 143 kcal | 28g protein | 3.3g fat | 0g carbs. Very lean, high iron.
Venison/deer (cooked, 100g): 158 kcal | 30g protein | 3.2g fat | 0g carbs.`,
    tags: ['protein', 'meat', 'chicken', 'beef', 'turkey', 'pork', 'muscle building', 'high protein'],
  },
  {
    id: 'proteins-fish',
    title: 'Fish and Seafood Protein Sources',
    content: `Salmon (cooked, 100g): 208 kcal | 28g protein | 10g fat | 0g carbs. Omega-3 rich (~2.3g EPA/DHA).
Tilapia (cooked, 100g): 128 kcal | 26g protein | 2.7g fat | 0g carbs. Very lean, mild flavor.
Cod (cooked, 100g): 105 kcal | 23g protein | 0.9g fat | 0g carbs. Extremely lean.
Tuna (canned in water, 100g): 116 kcal | 25.5g protein | 0.8g fat | 0g carbs. Convenient high protein.
Tuna (fresh/cooked, 100g): 184 kcal | 30g protein | 6.3g fat | 0g carbs.
Sardines (canned in oil, 100g): 208 kcal | 25g protein | 11.5g fat | 0g carbs. Rich in omega-3 and calcium.
Shrimp (cooked, 100g): 99 kcal | 24g protein | 0.3g fat | 0.2g carbs. Very lean.
Halibut (cooked, 100g): 140 kcal | 27g protein | 2.9g fat | 0g carbs.
Mahi-mahi (cooked, 100g): 109 kcal | 24g protein | 0.9g fat | 0g carbs. Very lean.
Sea bass (cooked, 100g): 124 kcal | 24g protein | 2.6g fat | 0g carbs.
Trout (cooked, 100g): 190 kcal | 26g protein | 8.5g fat | 0g carbs. Omega-3 rich.
Scallops (cooked, 100g): 111 kcal | 20g protein | 1.2g fat | 5g carbs.`,
    tags: ['protein', 'fish', 'seafood', 'salmon', 'tuna', 'omega-3', 'lean protein', 'muscle building'],
  },
  {
    id: 'proteins-eggs-dairy',
    title: 'Eggs and Dairy Protein Sources',
    content: `Whole egg (1 large, 50g): 78 kcal | 6g protein | 5g fat | 0.6g carbs. Complete amino acid profile.
Egg whites (100g): 52 kcal | 11g protein | 0.2g fat | 0.7g carbs. Pure protein, low calorie.
Greek yogurt, non-fat (100g): 59 kcal | 10g protein | 0.4g fat | 3.6g carbs. Probiotic, high protein.
Greek yogurt, full fat (100g): 97 kcal | 9g protein | 5g fat | 3.8g carbs.
Cottage cheese, low fat (100g): 84 kcal | 12g protein | 2.3g fat | 3.4g carbs. High casein, slow digesting.
Cottage cheese, full fat (100g): 103 kcal | 11g protein | 4.5g fat | 3.4g carbs.
Milk, whole (240ml): 149 kcal | 8g protein | 8g fat | 12g carbs.
Milk, skim (240ml): 83 kcal | 8g protein | 0.2g fat | 12g carbs.
Cheddar cheese (100g): 403 kcal | 25g protein | 33g fat | 1.3g carbs. Calorie dense.
Mozzarella (100g): 280 kcal | 28g protein | 17g fat | 3.1g carbs.
Ricotta (100g): 174 kcal | 11g protein | 13g fat | 3g carbs.
Whey protein powder (30g serving): ~120 kcal | 24g protein | 1.5g fat | 3g carbs. Fast absorbing post-workout.
Casein protein powder (30g serving): ~120 kcal | 24g protein | 1g fat | 4g carbs. Slow digesting, good pre-bed.`,
    tags: ['protein', 'eggs', 'dairy', 'Greek yogurt', 'cottage cheese', 'whey', 'casein', 'muscle building'],
  },
  {
    id: 'proteins-plant',
    title: 'Plant-Based Protein Sources (Vegetarian and Vegan)',
    content: `Tofu, firm (100g): 76 kcal | 8g protein | 4.5g fat | 1.9g carbs. Complete protein. Absorbs flavor.
Tofu, silken (100g): 55 kcal | 6g protein | 3g fat | 1.4g carbs. Great for smoothies/sauces.
Tempeh (100g): 193 kcal | 19g protein | 11g fat | 9g carbs. Fermented, high protein, gut-friendly.
Edamame (100g): 121 kcal | 11g protein | 5g fat | 8.9g carbs. Complete protein, fiber rich.
Lentils, cooked (100g): 116 kcal | 9g protein | 0.4g fat | 20g carbs. High fiber, iron.
Black beans, cooked (100g): 132 kcal | 8.9g protein | 0.5g fat | 24g carbs.
Chickpeas, cooked (100g): 164 kcal | 8.9g protein | 2.6g fat | 27g carbs. Versatile, high fiber.
Kidney beans, cooked (100g): 127 kcal | 8.7g protein | 0.5g fat | 23g carbs.
Seitan (100g): 370 kcal | 75g protein | 1.9g fat | 14g carbs. Highest plant protein source. NOT gluten-free.
Textured vegetable protein / TVP (dry, 100g): 329 kcal | 52g protein | 0.5g fat | 38g carbs.
Hemp seeds (30g): 166 kcal | 9.5g protein | 15g fat | 2.6g carbs. Complete protein, omega-3.
Pumpkin seeds (30g): 163 kcal | 8.6g protein | 14g fat | 4.2g carbs. High zinc and magnesium.
Pea protein powder (30g serving): ~120 kcal | 24g protein | 2g fat | 2g carbs. Great BCAA profile.
Nutritional yeast (15g): 45 kcal | 5g protein | 0.5g fat | 4g carbs. B12 fortified, cheesy flavor.
Quinoa (cooked, 100g): 120 kcal | 4.4g protein | 1.9g fat | 21g carbs. Complete protein grain.`,
    tags: ['plant protein', 'vegetarian', 'vegan', 'tofu', 'lentils', 'beans', 'tempeh', 'protein'],
  },

  // ── Carbohydrate sources ───────────────────────────────────────────
  {
    id: 'carbs-grains',
    title: 'Grain and Starch Carbohydrate Sources',
    content: `White rice, cooked (100g): 130 kcal | 2.7g protein | 0.3g fat | 28g carbs. Fast digesting, great post-workout.
Brown rice, cooked (100g): 112 kcal | 2.6g protein | 0.9g fat | 23g carbs. More fiber, slower digesting.
Oats, rolled dry (100g): 389 kcal | 17g protein | 7g fat | 66g carbs. 240ml cup = 150 kcal, 5g protein.
Oatmeal, cooked (100g): 71 kcal | 2.5g protein | 1.5g fat | 12g carbs. High fiber, beta-glucan.
White potato, baked (100g): 93 kcal | 2.5g protein | 0.1g fat | 21g carbs. High potassium.
Sweet potato, baked (100g): 103 kcal | 2.3g protein | 0.1g fat | 24g carbs. Beta-carotene rich.
White bread (1 slice, 30g): 79 kcal | 2.7g protein | 1g fat | 15g carbs. Fast digesting.
Whole wheat bread (1 slice, 30g): 70 kcal | 3.6g protein | 1g fat | 12g carbs. More fiber.
Pasta (cooked, 100g): 131 kcal | 5g protein | 1.1g fat | 25g carbs. Versatile carb source.
Whole wheat pasta (cooked, 100g): 124 kcal | 5.3g protein | 1.1g fat | 24g carbs.
Corn tortilla (1, 26g): 57 kcal | 1.5g protein | 0.7g fat | 12g carbs. Gluten-free.
Quinoa (cooked, 100g): 120 kcal | 4.4g protein | 1.9g fat | 21g carbs. Complete protein.
Buckwheat (cooked, 100g): 92 kcal | 3.4g protein | 0.6g fat | 20g carbs. Gluten-free.
Cream of rice (cooked, 100g): 65 kcal | 1.2g protein | 0.1g fat | 14g carbs. Easy to digest.`,
    tags: ['carbs', 'rice', 'oats', 'potato', 'bread', 'pasta', 'grains', 'energy', 'carbohydrates'],
  },
  {
    id: 'carbs-fruit',
    title: 'Fruit Sources of Carbohydrates',
    content: `Banana (medium, 118g): 105 kcal | 1.3g protein | 0.4g fat | 27g carbs. Fast carbs, potassium.
Apple (medium, 182g): 95 kcal | 0.5g protein | 0.3g fat | 25g carbs. High fiber.
Orange (medium, 131g): 62 kcal | 1.2g protein | 0.2g fat | 15g carbs. Vitamin C.
Blueberries (100g): 57 kcal | 0.7g protein | 0.3g fat | 14g carbs. High antioxidants.
Strawberries (100g): 32 kcal | 0.7g protein | 0.3g fat | 7.7g carbs. Low calorie, high vitamin C.
Mango (100g): 60 kcal | 0.8g protein | 0.4g fat | 15g carbs. High sugar, great pre-workout.
Pineapple (100g): 50 kcal | 0.5g protein | 0.1g fat | 13g carbs. Bromelain aids digestion.
Watermelon (100g): 30 kcal | 0.6g protein | 0.2g fat | 7.6g carbs. Very low calorie, high volume.
Grapes (100g): 67 kcal | 0.6g protein | 0.4g fat | 17g carbs.
Kiwi (100g): 61 kcal | 1.1g protein | 0.5g fat | 15g carbs. Vitamin C, digestion.
Dates (100g): 282 kcal | 2.5g protein | 0.4g fat | 75g carbs. Dense fast carbs, great pre-workout.
Raisins (100g): 299 kcal | 3.1g protein | 0.5g fat | 79g carbs. Calorie dense carb source.
Cherries (100g): 50 kcal | 1g protein | 0.3g fat | 12g carbs. Tart cherries reduce muscle soreness.`,
    tags: ['fruit', 'carbs', 'banana', 'berries', 'pre-workout', 'antioxidants', 'carbohydrates'],
  },

  // ── Fats ──────────────────────────────────────────────────────────
  {
    id: 'healthy-fats',
    title: 'Healthy Fat Sources for Athletes',
    content: `Avocado (100g): 160 kcal | 2g protein | 15g fat | 9g carbs (7g fiber). Potassium, monounsaturated fat.
Almonds (30g): 173 kcal | 6g protein | 15g fat | 6g carbs. Vitamin E, magnesium.
Walnuts (30g): 185 kcal | 4.3g protein | 18.5g fat | 3.9g carbs. Highest omega-3 of any nut.
Cashews (30g): 157 kcal | 5.2g protein | 12g fat | 8.6g carbs. Magnesium, iron.
Peanuts (30g): 170 kcal | 7.7g protein | 15g fat | 4.6g carbs. Actually a legume; high protein/fat.
Peanut butter (2 tbsp, 32g): 188 kcal | 8g protein | 16g fat | 6g carbs. Easy calories.
Almond butter (2 tbsp, 32g): 196 kcal | 6.7g protein | 18g fat | 6g carbs.
Olive oil (1 tbsp, 14g): 119 kcal | 0g protein | 13.5g fat | 0g carbs. Heart-healthy, monounsaturated.
Coconut oil (1 tbsp, 14g): 121 kcal | 0g protein | 14g fat | 0g carbs. MCTs for quick energy.
Flaxseeds (1 tbsp, 10g): 55 kcal | 1.9g protein | 4.3g fat | 3g carbs. ALA omega-3.
Chia seeds (1 tbsp, 12g): 58 kcal | 2g protein | 3.7g fat | 5g carbs. Omega-3, fiber.
Hemp seeds (3 tbsp, 30g): 166 kcal | 9.5g protein | 15g fat | 2.6g carbs. Complete protein + omega-3.
Sunflower seeds (30g): 165 kcal | 5.5g protein | 14g fat | 5.7g carbs. Vitamin E.
Dark chocolate 70%+ (30g): 170 kcal | 2.1g protein | 12g fat | 13g carbs. Antioxidants, magnesium.`,
    tags: ['fat', 'healthy fats', 'nuts', 'avocado', 'olive oil', 'omega-3', 'seeds', 'testosterone'],
  },

  // ── Vegetables ────────────────────────────────────────────────────
  {
    id: 'vegetables-high-volume',
    title: 'Vegetables — High Volume, Low Calorie',
    content: `Spinach (100g): 23 kcal | 2.9g protein | 0.4g fat | 3.6g carbs. Iron, folate, nitrates for performance.
Kale (100g): 49 kcal | 4.3g protein | 0.9g fat | 9g carbs. Calcium, vitamin K.
Broccoli (100g): 34 kcal | 2.8g protein | 0.4g fat | 7g carbs. High fiber, vitamin C, DIM.
Cauliflower (100g): 25 kcal | 1.9g protein | 0.3g fat | 5g carbs. Low carb rice/crust substitute.
Zucchini/courgette (100g): 17 kcal | 1.2g protein | 0.3g fat | 3.1g carbs. Very low calorie volume food.
Cucumber (100g): 16 kcal | 0.7g protein | 0.1g fat | 3.6g carbs. Mostly water, very low calorie.
Celery (100g): 16 kcal | 0.7g protein | 0.2g fat | 3g carbs. High volume, virtually no calories.
Bell pepper (100g): 31 kcal | 1g protein | 0.3g fat | 6g carbs. Highest vitamin C of any vegetable.
Mushrooms (100g): 22 kcal | 3.1g protein | 0.3g fat | 3.3g carbs. Vitamin D (if UV-exposed), immune support.
Tomatoes (100g): 18 kcal | 0.9g protein | 0.2g fat | 3.9g carbs. Lycopene antioxidant.
Asparagus (100g): 20 kcal | 2.2g protein | 0.1g fat | 3.9g carbs. Natural diuretic, folate.
Green beans (100g): 31 kcal | 1.8g protein | 0.1g fat | 7g carbs.
Cabbage (100g): 25 kcal | 1.3g protein | 0.1g fat | 5.8g carbs. Budget-friendly, high fiber.
Romaine lettuce (100g): 17 kcal | 1.2g protein | 0.3g fat | 3.3g carbs. Vitamin A, K.
Baby carrots (100g): 35 kcal | 0.8g protein | 0.2g fat | 8g carbs. Beta-carotene, portable snack.`,
    tags: ['vegetables', 'low calorie', 'high volume', 'cutting', 'fiber', 'micronutrients', 'fat loss'],
  },

  // ── Dietary patterns ──────────────────────────────────────────────
  {
    id: 'vegetarian-diet-plan',
    title: 'Vegetarian Athlete Nutrition Plan',
    content: `Vegetarian athletes can absolutely build muscle and perform at high levels with smart planning.
Key challenge: Getting enough complete protein and sufficient calories.
Protein strategy: Combine rice + beans (complete amino acid profile), eat eggs and dairy, use protein powders.
Top vegetarian protein sources (daily staples): Greek yogurt, cottage cheese, eggs, tofu, tempeh, edamame, lentils, chickpeas.
Sample 2400 kcal vegetarian muscle-building day:
  Breakfast: 3 scrambled eggs + oats with protein powder + banana = ~700 kcal, 50g protein
  Lunch: Lentil + rice bowl + spinach salad + feta = ~600 kcal, 35g protein
  Snack: Greek yogurt + almonds + berries = ~350 kcal, 20g protein
  Dinner: Tofu stir-fry + brown rice + broccoli = ~600 kcal, 35g protein
  Evening: Cottage cheese + peanut butter = ~300 kcal, 25g protein
  Total: ~2550 kcal, ~165g protein
Micronutrients to monitor: Iron (eat with vitamin C), B12 (eggs/dairy cover it), zinc (pumpkin seeds), calcium (dairy/fortified foods), omega-3 (hemp/flax/chia or algae supplement).`,
    tags: ['vegetarian', 'diet plan', 'plant protein', 'meal plan', 'muscle building', 'sample diet'],
  },
  {
    id: 'vegan-diet-plan',
    title: 'Vegan Athlete Nutrition Plan',
    content: `Vegan athletes can build muscle and compete at high levels with strategic planning.
Protein priority: Aim for 0.8–1g/lb bodyweight using diverse plant sources throughout the day.
Best vegan protein sources: Seitan, tempeh, tofu, edamame, lentils, black beans, chickpeas, pea protein, hemp seeds.
Sample 2500 kcal vegan muscle-building day (180 lb athlete):
  Breakfast: Pea protein smoothie + oats + banana + nut butter = ~750 kcal, 45g protein
  Lunch: Tempeh + quinoa + roasted vegetables = ~650 kcal, 40g protein
  Snack: Edamame + rice cakes + hummus = ~400 kcal, 20g protein
  Dinner: Lentil + black bean curry + brown rice + kale = ~600 kcal, 35g protein
  Evening: Hemp seeds + dates + almond butter = ~400 kcal, 15g protein
  Total: ~2800 kcal, ~155g protein
Supplements to consider: B12 (essential — no vegan food source), Vitamin D3 (algae-based), omega-3 (algae oil), creatine, zinc.
Creatine is especially important for vegans as it's only found in animal products but the body can synthesize less without dietary intake.`,
    tags: ['vegan', 'diet plan', 'plant protein', 'meal plan', 'supplements', 'B12', 'muscle building'],
  },
  {
    id: 'omnivore-diet-plan',
    title: 'Omnivore Athlete Nutrition Plan',
    content: `Omnivore athletes have the most flexible options for hitting protein and calorie targets.
Sample 2800 kcal muscle-building day (180 lb athlete, ~1g protein/lb):
  Breakfast: 4 whole eggs + 2 slices whole wheat toast + orange juice = ~550 kcal, 32g protein
  Mid-morning: Greek yogurt + berries + granola = ~400 kcal, 20g protein
  Lunch: 200g chicken breast + 200g white rice + broccoli + olive oil = ~700 kcal, 55g protein
  Pre-workout snack: Banana + whey protein shake = ~280 kcal, 28g protein
  Dinner: 200g salmon + sweet potato + asparagus = ~600 kcal, 45g protein
  Evening: Cottage cheese + walnuts = ~300 kcal, 25g protein
  Total: ~2830 kcal, ~205g protein
For fat loss at same bodyweight (target 2200 kcal, 180g protein):
  Reduce rice portions by half, use leaner cuts (chicken breast over thighs), drop granola, swap dinner to tilapia + vegetables only.`,
    tags: ['omnivore', 'diet plan', 'meal plan', 'muscle building', 'fat loss', 'chicken', 'sample diet'],
  },
  {
    id: 'high-protein-fat-loss',
    title: 'High Protein Fat Loss Diet Strategy',
    content: `Fat loss requires a caloric deficit, but protein must stay high to preserve muscle.
Target: 1g protein per lb bodyweight, deficit of 300–500 kcal/day.
High-satiety, low-calorie foods to prioritize: egg whites, chicken breast, white fish (cod, tilapia), shrimp, Greek yogurt, cottage cheese, vegetables, whey protein.
Volume eating strategy: Fill half the plate with non-starchy vegetables (broccoli, spinach, zucchini, cucumber — ~30 kcal per cup).
Hunger management: Eat protein at every meal (keeps you full), drink water before meals, use soup/salads as starters.
Foods to moderate (calorie dense): nuts, oils, cheese, dried fruit, sauces, alcohol.
Avoid liquid calories: juices, sodas, alcohol. Exception: protein shakes.
Diet breaks: After 8–12 weeks of deficit, a 1–2 week maintenance refeed can restore leptin, performance, and adherence.`,
    tags: ['fat loss', 'cutting', 'high protein', 'diet', 'caloric deficit', 'volume eating', 'satiety'],
  },
  {
    id: 'muscle-gain-diet',
    title: 'Muscle Gain Diet Strategy',
    content: `Muscle gain requires a caloric surplus with high protein intake. Lean bulk: 200–300 kcal over maintenance.
Protein: 0.8–1g/lb bodyweight. Spread across 4–5 meals of 30–50g each.
Calorie-dense, nutrient-rich foods for gaining: oats, rice, pasta, whole eggs, full-fat dairy, nut butters, avocados, lean meat in large portions, protein shakes with milk.
Bulking meal example (600–700 kcal): 250g ground beef + 200g rice + avocado + olive oil drizzle.
Mass gainer smoothie (800+ kcal): 2 cups whole milk + 2 bananas + 2 tbsp peanut butter + 1 cup oats + 1 scoop protein powder.
Lean bulk vs dirty bulk: Lean bulk (+200–300 kcal) adds muscle with minimal fat gain. Takes longer but better body composition. Dirty bulk (unrestricted eating) adds mass faster but more fat to cut later.
Sleep is anabolic: 7–9 hours per night. Growth hormone peaks during deep sleep.`,
    tags: ['muscle gain', 'bulking', 'caloric surplus', 'diet', 'mass gaining', 'lean bulk', 'dirty bulk'],
  },
  {
    id: 'pre-post-workout-nutrition',
    title: 'Pre and Post Workout Nutrition',
    content: `Pre-workout (60–90 min before training):
Goal: Fuel performance, prevent muscle breakdown.
Ideal: 30–50g carbs + 20–30g protein + low fiber/fat (for fast digestion).
Examples: Chicken + white rice, oatmeal + protein shake, banana + Greek yogurt, rice cakes + peanut butter + whey.
Immediate pre-workout (15–30 min): Simple carbs only if needed. Banana, dates, gels, sports drink.

Post-workout (within 30–60 min):
Goal: Replenish glycogen, stimulate muscle protein synthesis (MPS).
Ideal: 40–60g carbs + 30–40g protein.
Examples: Chicken + rice, salmon + sweet potato, protein shake + banana + milk, Greek yogurt + oats.
The "anabolic window" is wider than thought — eating within 2 hours is fine. Total daily nutrition matters more.

Intra-workout (for sessions >75 min or intense): 30–60g fast carbs per hour (gels, sports drink, banana).`,
    tags: ['pre-workout', 'post-workout', 'nutrition timing', 'muscle gain', 'performance', 'carbs', 'protein'],
  },

  // ── Supplements ───────────────────────────────────────────────────
  {
    id: 'supplements',
    title: 'Evidence-Based Supplements for Athletes',
    content: `Grade A evidence (proven, safe):
1. Creatine monohydrate: 3–5g/day. Increases strength, power, and muscle mass. Cheap and extremely safe. Take daily regardless of training day.
2. Whey protein: 20–40g post-workout or to hit daily protein goals. Complete amino acid profile.
3. Caffeine: 3–6mg/kg 30–45min pre-workout. Improves strength, endurance, focus. Tolerance builds; cycle off periodically.
4. Vitamin D3: 2000–4000 IU/day with fat. Most people are deficient. Critical for testosterone, bone health, immunity.
5. Fish oil/Omega-3: 2–3g EPA+DHA/day. Reduces inflammation, supports heart and joint health.

Grade B evidence (likely useful):
- Beta-alanine: 3.2–6.4g/day. Reduces muscle burn in 60–240 sec work. Causes harmless tingling (paresthesia).
- Magnesium glycinate: 200–400mg before bed. Improves sleep, reduces cramps. Most athletes are deficient.
- Zinc: 15–30mg/day if deficient (athletes often are). Supports testosterone.

Skip: Proprietary blends, fat burners, most pre-workout complexes (caffeine + creatine is 90% of the benefit).`,
    tags: ['supplements', 'creatine', 'whey protein', 'caffeine', 'vitamin D', 'fish oil', 'omega-3', 'performance'],
  },
  {
    id: 'diet-for-endurance',
    title: 'Nutrition for Endurance Athletes',
    content: `Endurance sports (running, cycling, swimming) require higher carbohydrate intake than strength sports.
Daily carbs: 5–10g/kg bodyweight depending on training volume. A 70kg runner doing 60km/week needs 350–700g carbs/day.
Protein: 1.2–1.6g/kg/day. Slightly lower than strength athletes but still critical for muscle repair.
Fat: 20–35% of calories. Important for fat-oxidation training adaptations.
Pre-race fueling: High carb meal (pasta, rice, bread) 3–4 hours before. Low fiber, low fat, moderate protein.
During race/long session (>75 min): 30–60g carbs/hour. Gels, dates, bananas, sports drink.
Post-endurance recovery: Carbs + protein within 30 min. Chocolate milk is a surprisingly effective recovery drink (carb:protein ratio 4:1).
Carb loading (before race >2h): 3 days of 10g carbs/kg/day, reduce training. Tops off glycogen stores fully.`,
    tags: ['endurance', 'running', 'cycling', 'carbs', 'carb loading', 'race nutrition', 'glycogen', 'marathon'],
  },
  {
    id: 'diet-for-athletes-recovery',
    title: 'Recovery Nutrition and Anti-Inflammatory Foods',
    content: `Recovery nutrition reduces muscle soreness and speeds return to performance.
Within 30 min post-workout: 30–40g protein + 40–60g carbs. Stimulates MPS and glycogen replenishment.
Anti-inflammatory foods to include regularly: fatty fish (salmon, sardines, mackerel), tart cherries, turmeric + black pepper, ginger, berries, dark leafy greens, olive oil, walnuts.
Tart cherry juice (240ml twice daily): Shown to reduce DOMS by up to 25% and improve sleep quality.
Glycine (from collagen/bone broth): 5–10g before sleep + vitamin C. Supports tendon and ligament recovery.
Alcohol impairs muscle protein synthesis and sleep quality — limit to 1–2 drinks max on rest days.
Sleep optimization: The most underrated recovery tool. 7–9 hours. Keep room cool (65–67°F), dark, and consistent schedule.`,
    tags: ['recovery', 'anti-inflammatory', 'soreness', 'DOMS', 'sleep', 'tart cherry', 'collagen', 'muscle repair'],
  },
  {
    id: 'food-prep-tips',
    title: 'Meal Prep Strategies for Athletes',
    content: `Weekly batch cooking saves time and ensures you always have compliant meals ready.
Proteins: Cook 1–1.5kg chicken breast, ground beef, or salmon on Sunday. Portion into containers.
Carbs: Cook large batches of rice (use rice cooker), quinoa, or sweet potatoes. Last 5 days refrigerated.
Vegetables: Roast a sheet pan of broccoli, cauliflower, bell peppers, zucchini with olive oil. Quick to reheat.
Eggs: Hard-boil 12 eggs at once. Ready for quick protein boost all week.
Overnight oats: Prep 5 jars on Sunday (oats + protein powder + berries + chia + almond milk). Grab and go each morning.
Freezer meals: Double batch of chili, lentil soup, or ground turkey rice bowls. Freeze in portions.
Smart shopping list: Chicken breast, eggs, Greek yogurt, oats, rice, sweet potatoes, broccoli, spinach, bananas, almonds, olive oil, canned tuna.
Time investment: 2–3 hours on Sunday = 30+ meals prepped. ROI is enormous for consistency.`,
    tags: ['meal prep', 'batch cooking', 'food prep', 'consistency', 'weekly prep', 'time saving'],
  },
  {
    id: 'foods-for-hormones',
    title: 'Foods That Support Hormonal Health and Testosterone',
    content: `Testosterone and hormonal health are critical for muscle building and recovery.
Foods that support healthy testosterone: Oysters (zinc), beef (zinc + saturated fat), eggs (cholesterol = testosterone precursor), avocado (monounsaturated fat), pomegranate juice, garlic (quercetin), cruciferous vegetables (DIM reduces estrogen), Brazil nuts (selenium), vitamin D-rich foods.
Zinc-rich foods: Oysters (highest source), beef, pumpkin seeds, cashews, chickpeas, dark meat chicken.
Don't avoid dietary fat or cholesterol excessively — fat is required for testosterone synthesis. Target 0.5g fat/lb bodyweight minimum.
Foods to minimize for hormonal health: Processed soy in excess, alcohol, refined sugar, trans fats, seed/vegetable oils in large amounts.
Cortisol management: Chronic stress elevates cortisol which suppresses testosterone. Adapt diet: sufficient calories, adequate carbs around training, enough sleep.`,
    tags: ['testosterone', 'hormones', 'zinc', 'dietary fat', 'oysters', 'eggs', 'muscle building'],
  },
  {
    id: 'gluten-free-options',
    title: 'Gluten-Free Athletic Nutrition',
    content: `Athletes with celiac disease or gluten sensitivity can perform at the highest levels with smart substitutions.
Gluten-free grains and starches: Rice (all types), potatoes, sweet potatoes, quinoa, oats (certified GF), corn/polenta, buckwheat, amaranth, millet, tapioca.
High carb GF pre-workout foods: White rice, rice cakes, potatoes, banana, dates, GF oats.
Protein sources (naturally GF): All meat, fish, eggs, dairy, legumes, tofu, tempeh.
Watch out: Soy sauce (use tamari instead), many processed foods, cross-contamination in oats.
GF bread alternatives: Rice bread, corn tortillas, cassava wraps, lettuce wraps.
Certified GF protein powders: Most whey isolates, pea protein, rice protein, hemp protein are GF.`,
    tags: ['gluten-free', 'celiac', 'rice', 'quinoa', 'oats', 'potatoes', 'special diet'],
  },
  {
    id: 'calorie-dense-foods',
    title: 'Calorie-Dense Foods for Hard Gainers',
    content: `Hard gainers (ectomorphs or high-metabolism athletes) need calorie-dense foods to hit surplus targets.
Calorie dense foods per 100g:
Olive oil: 884 kcal. Drizzle on everything.
Peanut butter: 588 kcal. Add to oats, smoothies, rice cakes.
Almonds: 579 kcal. Handful as snack = 200+ kcal.
Dark chocolate 85%: 598 kcal.
Avocado: 160 kcal. Add to everything.
Cheddar cheese: 403 kcal.
Whole eggs: 155 kcal each.
Strategies for eating more: Liquid calories (mass gainer smoothies), eat every 3–4 hours by alarm, add fats to every meal (butter, oils, nut butters), don't fill up on vegetables before main course, dense carbs over fibrous ones.
Mass smoothie recipe (1000+ kcal): 2 cups whole milk + 1 cup oats + 2 bananas + 3 tbsp peanut butter + 1 scoop protein + 2 tbsp olive oil. Blend.`,
    tags: ['hard gainer', 'ectomorph', 'calorie dense', 'mass gaining', 'weight gain', 'bulking', 'smoothie'],
  },
  {
    id: 'foods-gut-health',
    title: 'Gut Health and Digestive Performance',
    content: `Gut health directly impacts nutrient absorption, immunity, and even mood and performance.
Probiotic foods (live cultures): Greek yogurt, kefir, cottage cheese, tempeh, kimchi, sauerkraut, kombucha, miso.
Prebiotic foods (feed good bacteria): Garlic, onions, leeks, asparagus, bananas (especially unripe), oats, apples, flaxseed.
Fiber targets: 25–35g/day. Both soluble (oats, beans, flax) and insoluble (vegetables, whole grains).
Foods to reduce for better digestion: Excess processed food, artificial sweeteners in large amounts (sorbitol, maltitol), excessive fiber immediately pre-workout (causes GI distress).
Runner's gut: Common in distance running. Combat with low-fiber, low-fat meals 3+ hours pre-run.
Digestive enzymes: Supplementing before high-protein or high-fat meals can improve absorption and reduce bloating.`,
    tags: ['gut health', 'probiotics', 'fiber', 'digestion', 'yogurt', 'fermented foods', 'kefir'],
  },
  {
    id: 'sample-cutting-day',
    title: 'Sample High Protein Cutting Day (2000 kcal)',
    content: `Goal: 2000 kcal, 200g protein, for a 180–200 lb athlete in a cutting phase.
Breakfast (450 kcal, 50g protein):
  - 5 egg whites + 2 whole eggs scrambled (215 kcal, 30g protein)
  - 1/2 cup oats with water + cinnamon (150 kcal, 5g protein)
  - 1 cup black coffee
  - 1/2 cup strawberries (25 kcal)
Lunch (500 kcal, 55g protein):
  - 250g chicken breast grilled (412 kcal, 77g protein) — use less for balance
  - Actually: 200g chicken breast + 1 cup broccoli + 1 tbsp olive oil
Snack (200 kcal, 30g protein):
  - 1 scoop whey protein + water (120 kcal, 25g protein)
  - 1 rice cake with 0.5 tbsp almond butter
Dinner (550 kcal, 50g protein):
  - 180g salmon fillet (374 kcal, 40g protein)
  - 2 cups roasted vegetables (zucchini, peppers, onion) with olive oil spray
  - Side salad with balsamic vinegar
Evening (250 kcal, 30g protein):
  - 200g low fat cottage cheese + cinnamon + stevia
Total: ~2000 kcal, ~190g protein, ~150g carbs, ~55g fat`,
    tags: ['cutting', 'fat loss', 'sample diet', '2000 calories', 'high protein', 'meal plan', 'diet example'],
  },
  {
    id: 'sample-bulking-day',
    title: 'Sample Lean Bulking Day (3000 kcal)',
    content: `Goal: 3000 kcal, 200g protein, for a 180 lb athlete in a lean bulk phase.
Breakfast (700 kcal, 50g protein):
  - 3 whole eggs scrambled + 2 slices whole wheat toast (450 kcal, 30g protein)
  - 1 cup oatmeal with 1 scoop protein, blueberries, and nut butter
Lunch (800 kcal, 55g protein):
  - 220g chicken thigh (cooked) + 1.5 cups white rice + broccoli + olive oil drizzle
Snack (400 kcal, 25g protein):
  - 1 cup Greek yogurt + 1/4 cup granola + banana
Pre-workout (300 kcal, 25g protein):
  - Protein shake with 1 cup 2% milk + banana
Dinner (800 kcal, 55g protein):
  - 220g ground beef 80/20 + 1.5 cups pasta + marinara sauce + parmesan
Total: ~3000 kcal, ~210g protein, ~320g carbs, ~90g fat
Post-workout additions if needed: Rice cakes with peanut butter, chocolate milk (8oz = 160 kcal, 8g protein).`,
    tags: ['bulking', 'muscle gain', 'sample diet', '3000 calories', 'meal plan', 'lean bulk', 'diet example'],
  },
];
