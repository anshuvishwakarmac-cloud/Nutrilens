const { z } = require('zod');
const { BIG_9_ALLERGENS } = require('../models/User');

const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    profile: z
      .object({
        age: z.number().min(1).max(120).optional(),
        weight: z.number().min(20).max(300).optional(),
        height: z.number().min(50).max(250).optional(),
        goal: z.enum(['lose', 'maintain', 'gain']).optional(),
        dailyCalorieTarget: z.number().min(500).max(10000).optional()
      })
      .optional(),
    allergens: z
      .array(z.enum(BIG_9_ALLERGENS))
      .optional()
  })
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required')
  })
});

const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    profile: z
      .object({
        age: z.number().min(1).max(120).optional(),
        weight: z.number().min(20).max(300).optional(),
        height: z.number().min(50).max(250).optional(),
        goal: z.enum(['lose', 'maintain', 'gain']).optional(),
        dailyCalorieTarget: z.number().min(500).max(10000).optional()
      })
      .optional(),
    allergens: z.array(z.string()).optional()
  })
});

const foodItemSchema = z.object({
  name: z.string().min(1, 'Food name is required'),
  estimated_grams: z.number().min(1),
  calories: z.number().min(0),
  protein_g: z.number().min(0),
  carbs_g: z.number().min(0),
  fat_g: z.number().min(0),
  fiber_g: z.number().min(0).default(0),
  sugar_g: z.number().min(0).default(0),
  confidence: z.number().min(0).max(1).optional(),
  usdaVerified: z.boolean().optional()
});

const saveMealSchema = z.object({
  body: z.object({
    imageUrl: z.string().url('Valid image URL required').or(z.string().min(1)),
    mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
    foods: z.array(foodItemSchema).min(1, 'At least one food item is required'),
    notes: z.string().optional(),
    eatenAt: z.string().datetime({ offset: true }).optional().or(z.string().optional())
  })
});

module.exports = {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  saveMealSchema
};
