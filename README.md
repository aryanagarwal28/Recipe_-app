# 🍳 Recipe Extractor & Meal Planner

An AI-powered full-stack app that scrapes any recipe blog URL and returns structured recipe data, nutrition estimates, substitutions, shopping lists, and related recipes — powered by Google Gemini via LangChain.

---

## 🧱 Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | FastAPI (Python) |
| Database | PostgreSQL + SQLAlchemy |
| LLM | Google Gemini 1.5 Flash via LangChain |
| Scraping | BeautifulSoup4 + Requests |
| Frontend | React + Vite + Tailwind CSS |

---

## 📁 Project Structure

```
recipe-app/
├── backend/
│   ├── main.py           # FastAPI routes
│   ├── database.py       # SQLAlchemy setup
│   ├── models.py         # DB models
│   ├── schemas.py        # Pydantic schemas
│   ├── scraper.py        # BeautifulSoup scraper
│   ├── llm_processor.py  # LangChain + Gemini
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── components/
│   │       ├── ExtractTab.jsx
│   │       ├── HistoryTab.jsx
│   │       ├── RecipeCard.jsx
│   │       └── MealPlanModal.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── .env.example
├── prompts/
│   └── prompts.md
└── sample_data/
    ├── urls.md
    └── grilled_cheese_output.json
```

---

## ⚙️ Setup Instructions

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL running locally
- Google Gemini API key (free at https://aistudio.google.com)

---

### 1. Database Setup

```sql
CREATE DATABASE recipe_db;
```

---

### 2. Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Copy and fill environment variables
cp .env.example .env
# Edit .env with your GOOGLE_API_KEY and DATABASE_URL

# Start the server
uvicorn main:app --reload --port 8000
```

---

### 3. Frontend Setup

```bash
cd frontend
npm install

# Copy and fill environment variables
cp .env.example .env
# VITE_API_URL=http://localhost:8000

npm run dev
# App runs at http://localhost:3000
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/extract` | Extract recipe from URL |
| GET | `/api/recipes` | Get all saved recipes |
| GET | `/api/recipes/{id}` | Get single recipe by ID |
| POST | `/api/meal-plan` | Generate meal plan from recipe IDs |

### POST `/api/extract`
```json
{ "url": "https://www.allrecipes.com/recipe/23891/grilled-cheese-sandwich/" }
```

### POST `/api/meal-plan`
```json
{ "recipe_ids": [1, 2, 3] }
```

---

## 🧪 Testing Instructions

1. Start backend on port 8000
2. Start frontend on port 3000
3. Paste any recipe URL from AllRecipes, BBC Good Food, or Food Network
4. Click "Extract Recipe" and wait ~15–30 seconds
5. View extracted recipe with all enhancements
6. Go to "Saved Recipes" tab to see history
7. Click "Meal Planner" to combine recipes

### Test URLs
```
https://www.allrecipes.com/recipe/23891/grilled-cheese-sandwich/
https://www.allrecipes.com/recipe/10813/best-chocolate-chip-cookies/
```

### API docs (Swagger UI)
```
http://localhost:8000/docs
```

---

## ✅ Features

- [x] URL scraping with BeautifulSoup
- [x] Structured recipe extraction via Gemini LLM
- [x] Nutrition estimation
- [x] Ingredient substitutions
- [x] Categorized shopping list
- [x] Related recipe suggestions
- [x] PostgreSQL storage with URL caching
- [x] Recipe history table
- [x] Details modal
- [x] Meal planner with merged shopping list (bonus)
- [x] URL preview before extraction (bonus)
- [x] Raw HTML storage (bonus)
- [x] Repeated URL caching (bonus)

---

## ⚠️ Notes

- The Gemini free tier allows ~60 requests/minute — sufficient for development
- Extraction takes 15–30 seconds due to two sequential LLM calls
- Some recipe sites (NYT Cooking, serious eats behind paywall) may block scraping
