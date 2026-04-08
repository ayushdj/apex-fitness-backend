import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI ?? '';

export async function connectDB() {
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not set in .env');
  }
  await mongoose.connect(MONGODB_URI, { dbName: 'apex' });
  console.log('✓ Connected to MongoDB Atlas');
}

// ── User ─────────────────────────────────────────────────────────────

const userSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  email:       { type: String, required: true, unique: true, lowercase: true },
  password:    { type: String },           // null for Google-only accounts
  googleId:    { type: String, unique: true, sparse: true },
  avatar:      { type: String },
  credits:     { type: Number, default: 5.00 },  // USD remaining
  creditsUsed: { type: Number, default: 0.00 },  // USD spent total
}, { timestamps: true });

export const User = mongoose.model('User', userSchema);

// ── Training plan ─────────────────────────────────────────────────────

const exerciseSchema = new mongoose.Schema({
  name:   { type: String, required: true },
  sets:   { type: Number, required: true },
  reps:   { type: String, required: true },
  weight: { type: String },
  notes:  { type: String },
}, { _id: false });

const trainingDaySchema = new mongoose.Schema({
  dayOfWeek:       { type: String, required: true },
  name:            { type: String, required: true },
  type:            { type: String, required: true },
  focus:           { type: String },
  durationMinutes: { type: Number, default: 0 },
  exercises:       [exerciseSchema],
  coachTip:        { type: String },
}, { _id: false });

const trainingWeekSchema = new mongoose.Schema({
  weekNumber: { type: Number, required: true },
  label:      { type: String },
  theme:      { type: String },
  days:       [trainingDaySchema],
}, { _id: false });

const planSchema = new mongoose.Schema({
  userId:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  planName:       { type: String },
  goal:           { type: String },
  totalWeeks:     { type: Number, default: 8 },
  programSummary: { type: String },
  weeks:          [trainingWeekSchema],
  generatedAt:    { type: Date, default: Date.now },
}, { timestamps: true });

export const Plan = mongoose.model('Plan', planSchema);

// ── Progress ──────────────────────────────────────────────────────────

const progressSchema = new mongoose.Schema({
  userId:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  completedDays: [{ type: String }],   // keys like "w1-Mon", "w2-Thu"
}, { timestamps: true });

export const Progress = mongoose.model('Progress', progressSchema);
