const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const BIG_9_ALLERGENS = [
  'milk',
  'eggs',
  'fish',
  'shellfish',
  'tree nuts',
  'peanuts',
  'wheat',
  'soy',
  'sesame'
];

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required']
    },
    profile: {
      age: { type: Number, default: 25, min: 1, max: 120 },
      weight: { type: Number, default: 70, min: 20, max: 300 }, // kg
      height: { type: Number, default: 175, min: 50, max: 250 }, // cm
      goal: {
        type: String,
        enum: ['lose', 'maintain', 'gain'],
        default: 'maintain'
      },
      dailyCalorieTarget: { type: Number, default: 2000, min: 500, max: 10000 }
    },
    allergens: [
      {
        type: String,
        lowercase: true,
        trim: true,
        enum: BIG_9_ALLERGENS
      }
    ]
  },
  {
    timestamps: true
  }
);

// Password verification method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.passwordHash);
};

// Password hashing pre-save hook
userSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
  next();
});

const User = mongoose.model('User', userSchema);
module.exports = { User, BIG_9_ALLERGENS };
