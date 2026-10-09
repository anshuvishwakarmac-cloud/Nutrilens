# NutriLens: AI Meal Photo Nutrition Analyzer

NutriLens is a production-ready full-stack AI application that lets users snap a photo of a meal plate using their browser camera or file upload, automatically identifies foods using Vision AI, estimates portion sizes in grams, verifies nutrient metrics against **USDA FoodData Central API**, screens for the **Big 9 Allergens** against a personalized user profile, provides an interactive food breakdown editor, logs meals to MongoDB, and displays weekly nutrition trends on a dashboard built with Recharts.

---

## Tech Stack

- **Frontend**: React (Vite), Tailwind CSS, Recharts, Axios, Lucide Icons, Browser `getUserMedia` Camera API
- **Backend**: Node.js, Express.js (REST API), Multer (File limits), Zod validation, Helmet, CORS, Express Rate Limit
- **Database**: MongoDB Atlas with Mongoose (Indexes & Aggregation Pipelines for Weekly Trends)
- **AI & Verification**: Gemini Vision LLM (`@google/genai`), USDA FoodData Central API, Allergen Screening Engine
- **Image Storage**: Cloudinary (with local disk storage fallback)
- **Authentication**: JWT & bcryptjs password hashing
- **Testing**: Jest + Supertest (Backend API integration tests)

---

## Directory Structure

```
NutriLens/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection handler
│   ├── controllers/
│   │   ├── authController.js     # Signup & Login with JWT
│   │   ├── userController.js     # User profile & allergen settings
│   │   ├── mealController.js     # Vision AI analysis, USDA check & meal CRUD
│   │   └── trendController.js    # MongoDB aggregation pipeline for weekly stats
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT bearer authentication middleware
│   │   ├── validateMiddleware.js # Zod schema validation wrapper
│   │   ├── uploadMiddleware.js   # Multer file upload (5MB max)
│   │   └── errorMiddleware.js    # Global error & 404 handler
│   ├── models/
│   │   ├── User.js               # User schema with Big 9 allergen profile
│   │   └── Meal.js               # Meal schema with food breakdown & recalculate hook
│   ├── routes/
│   │   ├── authRoutes.js         # /api/auth routes
│   │   ├── userRoutes.js         # /api/users routes
│   │   ├── mealRoutes.js         # /api/meals routes
│   │   └── trendRoutes.js        # /api/trends routes
│   ├── services/
│   │   ├── aiService.js          # Gemini Vision prompt & JSON extractor
│   │   ├── usdaService.js        # USDA FoodData Central cross-checker
│   │   ├── allergenService.js    # Big 9 allergen matching engine
│   │   └── storageService.js     # Cloudinary / local file upload handler
│   ├── tests/
│   │   ├── auth.test.js          # Auth API integration test suite
│   │   └── meal.test.js          # Meal & Trends API test suite
│   ├── app.js                    # Express app configuration
│   ├── server.js                 # Server entrypoint
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/                  # Axios client & API endpoints
│   │   ├── components/           # Navbar, CameraCapture, FoodItemEditor, AllergenWarning, etc.
│   │   ├── context/              # AuthContext & user session state
│   │   ├── pages/                # LoginPage, RegisterPage, DashboardPage, AnalyzePage, HistoryPage, ProfilePage
│   │   ├── utils/                # Client-side image compressor canvas utility
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
├── .env.example
└── README.md
```

---

## Exact AI Prompt & Output JSON Schema

The Vision LLM service (`backend/services/aiService.js`) sends the image buffer along with the following strict prompt:

```text
You are NutriLens Vision AI, an expert nutritionist and computer vision system.
Analyze the provided meal plate image.
Identify each food item, estimate its portion size in grams, and calculate its nutritional content.

Return ONLY raw JSON with NO markdown formatting, NO ```json wrappers, and NO extra conversational text.

The output MUST adhere to this exact JSON schema:
{
  "foods": [
    {
      "name": "string",
      "estimated_grams": number,
      "calories": number,
      "protein_g": number,
      "carbs_g": number,
      "fat_g": number,
      "fiber_g": number,
      "sugar_g": number,
      "confidence": number (between 0.0 and 1.0)
    }
  ],
  "total": {
    "calories": number,
    "protein_g": number,
    "carbs_g": number,
    "fat_g": number,
    "fiber_g": number,
    "sugar_g": number
  },
  "allergens": ["milk" | "eggs" | "fish" | "shellfish" | "tree nuts" | "peanuts" | "wheat" | "soy" | "sesame"],
  "notes": "string summary of the meal analysis"
}
```

---

## API Endpoints Reference

### Authentication
- `POST /api/auth/register` - Create user account with profile & allergen preferences.
- `POST /api/auth/login` - Authenticate user & return JWT token.

### User Profile
- `GET /api/users/me` - Fetch authenticated user profile.
- `PUT /api/users/me` - Update profile (age, weight, height, goal, daily target, allergens).

### Meal Analyzer & Log Operations
- `POST /api/meals/analyze` - Upload image (multipart/form-data `image`). Runs Vision AI analysis, USDA verification, and Allergen screening. Returns preview breakdown (un-saved).
- `POST /api/meals` - Save confirmed or user-edited meal entry.
- `GET /api/meals` - Get meal log history with filtering (`mealType`, `from`, `to`) & pagination.
- `GET /api/meals/:id` - Fetch single meal entry.
- `PUT /api/meals/:id` - Edit logged meal notes/items.
- `DELETE /api/meals/:id` - Remove meal log entry.

### Weekly & Daily Analytics
- `GET /api/trends/weekly?weeks=4` - Returns weekly aggregated metrics via MongoDB pipeline (avg daily calories, macro split, goal adherence %, WoW % change).
- `GET /api/trends/daily?from=&to=` - Returns daily aggregated intake between date ranges.

---

## Setup & Running Locally

### 1. Backend Setup
```bash
cd backend
npm install

# Copy environment variables file
cp .env.example .env
```

Edit `backend/.env` with your settings (e.g. MongoDB URI, Gemini API Key, USDA API Key).

Start backend in development mode:
```bash
npm run dev
```
Backend API will run on `http://localhost:5000`.

### 2. Running Backend Tests
```bash
cd backend
npm test
```

### 3. Frontend Setup
```bash
cd frontend
npm install

# Start Vite development server
npm run dev
```
Frontend will be available at `http://localhost:3000`.

---

## Deployment Guide

### 1. MongoDB Atlas
1. Create a MongoDB Atlas cluster.
2. In **Database Access**, create a user with read/write permissions.
3. In **Network Access**, add `0.0.0.0/0` (or IP whitelist for hosting).
4. Copy the connection string to `MONGODB_URI` environment variable.

### 2. Backend Deployment (Render / Railway)
1. Push project repository to GitHub.
2. Create a new Web Service on Render or Railway pointing to the `backend` directory.
3. Build Command: `npm install`
4. Start Command: `node server.js`
5. Add Environment Variables: `MONGODB_URI`, `JWT_SECRET`, `GEMINI_API_KEY`, `USDA_API_KEY`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.

### 3. Frontend Deployment (Vercel / Netlify)
1. Import repository to Vercel/Netlify pointing to the `frontend` root directory.
2. Framework Preset: **Vite**
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. Add rewrite/proxy rules pointing `/api/*` requests to your backend production URL.

---

## Medical Disclaimer

Nutritional metrics, portion estimates, and allergen warnings are generated using Artificial Intelligence and USDA FoodData Central cross-verification. Output values are approximate estimates and should **not** be considered medical or professional dietary advice.
