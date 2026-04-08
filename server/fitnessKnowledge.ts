// Curated fitness knowledge chunks for RAG
// These supplement the exercise database with training principles,
// periodization science, nutrition guidelines, and athlete archetypes.

export const FITNESS_KNOWLEDGE: { id: string; title: string; content: string; tags: string[] }[] = [
  // ─── Training Principles ──────────────────────────────────────────────
  {
    id: "progressive-overload",
    title: "Progressive Overload",
    tags: ["strength", "training", "principles", "muscle", "progression"],
    content: `Progressive overload is the cornerstone of all strength and physique development. You must continually increase the training stimulus over time to force adaptation. Methods include: adding weight to the bar (load progression), adding reps at the same weight, adding sets, decreasing rest periods, improving technique, or increasing frequency. For beginners, weekly linear progression (add 2.5–5 kg per session on major lifts) is most effective. Intermediate athletes benefit from weekly or monthly progression. Without progressive overload, the body has no reason to change.`,
  },
  {
    id: "periodization",
    title: "Periodization and Programming",
    tags: ["periodization", "programming", "training", "phases", "deload", "volume", "intensity"],
    content: `Periodization is the systematic variation of training variables (volume, intensity, frequency) over time to optimize performance and prevent overtraining. Linear periodization: steadily increase intensity while decreasing volume over weeks. Block periodization: distinct phases focused on accumulation (high volume), intensification (high intensity), and realization (peaking). Undulating periodization: vary volume and intensity daily or weekly. A typical 4-week mesocycle: 3 progressive weeks followed by 1 deload week at 40–50% volume. Deload weeks are critical for recovery, hormonal normalization, and preventing cumulative fatigue.`,
  },
  {
    id: "strength-training",
    title: "Strength Training Fundamentals",
    tags: ["strength", "powerlifting", "squat", "deadlift", "bench", "sets", "reps", "1RM"],
    content: `Strength is best developed with heavy compound lifts at 1–5 reps, 85–95% 1RM, with long rest periods (3–5 minutes). Key lifts: squat, deadlift, bench press, overhead press, barbell row. To build maximal strength: train the specific competition lifts frequently (3–4x/week at lower intensities with 1–2 high-intensity days). Rep ranges: 1–3 reps = neural strength, 4–6 reps = strength-hypertrophy, 6–12 reps = hypertrophy, 12–20 reps = muscular endurance. Rest: 3–5 min for compound lifts, 1–2 min for isolation.`,
  },
  {
    id: "hypertrophy",
    title: "Muscle Hypertrophy (Size) Training",
    tags: ["hypertrophy", "muscle", "size", "aesthetics", "bodybuilding", "volume", "sets", "reps"],
    content: `Hypertrophy requires sufficient mechanical tension, metabolic stress, and muscle damage. Optimal rep range: 6–20 reps, with most growth occurring in 8–15 range. Weekly volume per muscle group: 10–20 sets is effective for most trainees. Frequency: each muscle group 2x per week is optimal. Progressive overload is still critical — increase volume or load over weeks. Training to within 1–3 reps of failure (RPE 7–9) is more important than exact rep ranges. Rest: 60–90 seconds for isolation exercises, 2–3 minutes for compound movements.`,
  },
  {
    id: "hybrid-athlete",
    title: "Hybrid Athlete Training: Balancing Strength and Cardio",
    tags: ["hybrid", "athlete", "endurance", "strength", "concurrent", "interference", "cardio", "running", "lifting"],
    content: `Hybrid athletes train both strength and cardiovascular fitness. The interference effect (cardio blunting strength gains) is real but manageable. Strategies: separate strength and cardio sessions by at least 6 hours; perform cardio after strength, not before; use low-impact cardio (cycling, swimming, rowing) to minimize muscle damage; keep cardio in Zone 2 for base building; limit high-intensity intervals to 1–2x/week. Example weekly split for hybrid: Mon Strength, Tue Zone 2 run (30–45 min), Wed Strength, Thu Rest, Fri Strength, Sat Long run or HIIT, Sun Mobility/recovery.`,
  },
  {
    id: "dancer-athlete",
    title: "Strength Training for Dancers and Performers",
    tags: ["dancer", "dance", "performer", "mobility", "explosive", "strength", "flexibility", "aesthetics", "lean"],
    content: `Dancers need a unique combination: strength without bulk, explosive power, maintained flexibility and range of motion, and exceptional body control. Priority lifts: Romanian deadlift, split squat, single-leg work, hip thrust, Copenhagen plank (adductors), Nordic hamstring curl. Program design: lower volume per session (avoid excessive soreness that impairs dance), bias unilateral exercises, include loaded stretching, prioritize hip and thoracic mobility. Avoid pure hypertrophy blocks — instead blend strength (3–5 reps) with power work (jumps, med ball). Plyometrics: box jumps, depth jumps, lateral bounds develop explosiveness without excessive size.`,
  },
  {
    id: "runner-strength",
    title: "Strength Training for Runners",
    tags: ["runner", "running", "endurance", "strength", "injury", "prevention", "performance"],
    content: `Runners benefit enormously from strength training: reduced injury risk, improved running economy, delayed fatigue. Key exercises: single-leg deadlift, hip thrust, calf raises (heavy, full ROM), step-ups, Copenhagen adductor press, Bulgarian split squat. Hip abductor work (lateral band walks, side-lying clams) prevents IT band syndrome and knee valgus. Strength frequency: 2x/week is sufficient for most runners. Avoid high-volume leg work within 48 hours of key running sessions. Focus on hip and glute strength — weak glutes are the most common limiter for recreational runners.`,
  },
  {
    id: "zone2-cardio",
    title: "Zone 2 Cardio and Aerobic Base Building",
    tags: ["cardio", "zone 2", "aerobic", "base", "mitochondria", "endurance", "heart rate", "fat burning"],
    content: `Zone 2 training (60–70% max HR, conversational pace) builds the aerobic base: more mitochondria, improved fat oxidation, better cardiovascular efficiency. For most people, this is the intensity where you can speak in full sentences. Benefits: lower resting heart rate over time, improved recovery between hard sessions, fat loss support. Recommended: 150–300 min/week of Zone 2 for performance; even 60–90 min/week benefits general health. Modalities: slow running, cycling, rowing, incline walking. This is the most underused training tool — most people train too hard during easy sessions and too easy during hard sessions.`,
  },

  // ─── Mobility and Recovery ───────────────────────────────────────────
  {
    id: "mobility-training",
    title: "Mobility and Flexibility Training",
    tags: ["mobility", "flexibility", "stretching", "hip", "shoulder", "spine", "recovery", "range of motion"],
    content: `Mobility is the ability to actively move through a full range of motion. It differs from flexibility (passive range). Training mobility: dynamic warm-up before training (leg swings, hip circles, arm circles, thoracic rotations), loaded stretching during training (deep squat, Bulgarian split squat at full depth), static stretching after training or on rest days (hold 30–90 seconds). Critical areas: hip flexors and adductors (sitting shortens them), thoracic spine (desk posture restricts rotation), shoulders and thoracic extension. Yoga and dance training are excellent systematic approaches. Minimum: 10–15 min mobility work daily for anyone with restricted range.`,
  },
  {
    id: "recovery-science",
    title: "Recovery, Sleep, and HRV",
    tags: ["recovery", "sleep", "HRV", "heart rate variability", "rest", "deload", "overtraining", "wearable"],
    content: `Recovery is when adaptation occurs — training only provides the stimulus. Sleep is the most powerful recovery tool: 7–9 hours nightly. Sleep deprivation directly impairs strength output, muscle protein synthesis, cognitive performance, and fat loss. Heart Rate Variability (HRV): morning HRV 10–15% below baseline indicates accumulated fatigue — reduce training volume by 20–40% that day. Resting heart rate elevated by 5+ bpm = incomplete recovery. Signs of overreaching: decreased performance, elevated resting HR, poor sleep, mood changes, loss of motivation. Active recovery: light walking, swimming, or yoga accelerates recovery versus complete rest.`,
  },

  // ─── Nutrition ───────────────────────────────────────────────────────
  {
    id: "protein-requirements",
    title: "Protein Requirements for Athletes",
    tags: ["protein", "nutrition", "muscle", "recovery", "intake", "macros", "diet"],
    content: `Protein is essential for muscle protein synthesis and recovery. Recommendations: strength athletes 1.6–2.2 g/kg bodyweight; endurance athletes 1.4–1.7 g/kg; general fitness 1.2–1.6 g/kg; body recomposition 2.0–2.4 g/kg. High-protein sources: chicken breast (31g/100g), Greek yogurt (10g/100g), eggs (13g/100g), salmon (25g/100g), cottage cheese (11g/100g), lean beef (26g/100g), tofu (8g/100g). Spread protein across 3–5 meals, aiming for 30–50g per meal to maximize muscle protein synthesis. Pre-sleep protein (casein or cottage cheese) supports overnight recovery. Leucine threshold (~2.5g leucine per meal) triggers MPS.`,
  },
  {
    id: "calorie-goals",
    title: "Calorie Targets for Different Goals",
    tags: ["calories", "weight loss", "cut", "bulk", "maintenance", "TDEE", "deficit", "surplus", "nutrition"],
    content: `Caloric intake drives body composition change. TDEE (Total Daily Energy Expenditure) calculation: BMR × activity multiplier. Activity: sedentary ×1.2, lightly active ×1.375, moderately active ×1.55, very active ×1.725. Goal adjustments: fat loss: 300–500 kcal deficit (0.5–1% bodyweight/week loss rate). Muscle gain: 200–300 kcal surplus (0.25–0.5% bodyweight/week gain). Recomposition: maintenance calories with high protein (2.0+ g/kg). Aggressive cuts (>1000 kcal deficit) cause muscle loss and hormonal disruption. For performance athletes: prioritize carbohydrates around training (before and after sessions) for glycogen replenishment.`,
  },
  {
    id: "carbs-performance",
    title: "Carbohydrates and Athletic Performance",
    tags: ["carbs", "carbohydrates", "performance", "glycogen", "energy", "pre-workout", "post-workout", "nutrition"],
    content: `Carbohydrates are the primary fuel for high-intensity exercise and the brain. Glycogen (stored carbs in muscle and liver) fuels workouts up to 90 minutes at high intensity. For strength training: consume 30–60g carbohydrates within 2 hours before training; 30–60g post-workout. For endurance: carb-loading (7–10g/kg for 1–2 days before events) maximizes glycogen stores. Daily carb targets: 3–5g/kg for moderate training, 5–7g/kg for heavy training. Carb sources: rice, oats, potatoes, fruit, pasta, bread. Low-carb or keto diets impair high-intensity performance but may suit very low-intensity or rest days.`,
  },
  {
    id: "weight-management",
    title: "Body Composition and Fat Loss Strategies",
    tags: ["fat loss", "weight loss", "lean", "aesthetics", "body fat", "cut", "diet", "calorie deficit"],
    content: `Sustainable fat loss requires a moderate calorie deficit (300–500 kcal/day), high protein (2.0+ g/kg to preserve muscle), and continued resistance training. Do not stop lifting during a cut — this is the primary driver of muscle preservation. Rate of loss: 0.5–1% bodyweight/week is sustainable without muscle loss. Faster cutting increases lean mass loss risk. Tracking: use a food scale for 2–4 weeks to calibrate awareness (most people underestimate intake by 20–30%). Sleep deprivation increases hunger hormones (ghrelin) and decreases satiety hormones (leptin). Avoid excessive cardio — prioritize NEAT (non-exercise activity thermogenesis) by increasing daily steps.`,
  },
  {
    id: "meal-timing",
    title: "Meal Timing and Frequency",
    tags: ["meal timing", "intermittent fasting", "meal frequency", "pre-workout", "post-workout", "nutrition"],
    content: `Meal timing matters most around training, not for total daily intake. Pre-workout meal (1–3 hours before): mixed protein + carbs (e.g., chicken + rice, oats + protein powder). Post-workout: protein + carbs within 2 hours (the "anabolic window" is wider than once thought — up to 5–6 hours post-exercise). Total daily protein and calories are more important than precise timing. Intermittent fasting (16:8) can work if you hit protein targets — it's a schedule tool, not magic. 3–5 meals per day is optimal for most people. Avoid training fasted for strength sessions — research shows impaired performance; cardio fasted has mixed evidence.`,
  },
  {
    id: "supplements",
    title: "Evidence-Based Supplements for Athletes",
    tags: ["supplements", "creatine", "protein powder", "caffeine", "nutrition", "performance"],
    content: `Supplements with strong evidence: Creatine monohydrate (3–5g/day) — increases strength by 5–15%, power output, and lean mass; safe for long-term use; no loading phase needed. Caffeine (3–6mg/kg, 45–60 min pre-workout) — significant performance enhancer for both strength and endurance. Protein powder — convenient dietary protein source, no special anabolic properties beyond total protein intake. Omega-3 fatty acids (2–3g EPA/DHA daily) — anti-inflammatory, may reduce muscle soreness. Vitamin D3 (1000–2000 IU/day) if sunlight-deficient. Beta-alanine — delays muscular fatigue for 60–240 second efforts. NOT evidence-based: BCAAs (redundant with sufficient protein), most "fat burners", testosterone boosters.`,
  },

  // ─── Workout Structure ──────────────────────────────────────────────
  {
    id: "workout-splits",
    title: "Training Splits and Frequency",
    tags: ["split", "frequency", "full body", "PPL", "upper lower", "schedule", "days per week"],
    content: `Training split selection depends on frequency and goals. Full body (3x/week): best for beginners and busy schedules; high frequency per muscle group. Upper/Lower (4x/week): balanced frequency and volume; good intermediate option. Push/Pull/Legs (PPL, 6x/week): high volume; requires good recovery. Bro split (chest day, back day, etc.): low frequency per muscle; suboptimal for most. For hybrid athletes: 3 strength + 2–3 cardio days. Research suggests training each muscle 2x/week is optimal for hypertrophy. 1x/week can maintain but not maximally grow muscle. Frequency can be increased without increasing total volume by splitting sessions.`,
  },
  {
    id: "warmup-protocol",
    title: "Warm-Up and Activation Protocols",
    tags: ["warm up", "activation", "preparation", "glutes", "hip", "injury prevention"],
    content: `An effective warm-up improves performance, reduces injury risk, and primes neural pathways. Structure: 5 min general cardiovascular elevation (light bike/row/jog), 5–10 min dynamic mobility (leg swings, hip circles, arm circles, thoracic rotation, world's greatest stretch), 2–3 activation sets (band pull-aparts for shoulders, glute bridges or clamshells for hips), then warm-up sets before working sets (bar, 40%, 60%, 80% of working weight). Glute activation is especially important for lower body training — many athletes have dormant glutes due to prolonged sitting. Avoid prolonged static stretching immediately pre-workout (reduces maximal force production).`,
  },
];
