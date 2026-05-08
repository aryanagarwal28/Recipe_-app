# LangChain Prompts Reference

All prompts are implemented in `backend/llm_processor.py`.

---

## 1. Recipe Extraction Prompt

**Purpose:** Extract structured recipe data from raw scraped webpage text.

**Model:** gemini-1.5-flash via LangChain `ChatGoogleGenerativeAI`

**Template:**
```
You are a recipe extraction expert. From the raw webpage text below, extract the recipe details.

Return ONLY a valid JSON object — no markdown, no explanation, no extra text.

JSON structure:
{
  "title": "Recipe name",
  "cuisine": "e.g. Italian, Indian, American",
  "prep_time": "e.g. 10 minutes",
  "cook_time": "e.g. 20 minutes",
  "total_time": "e.g. 30 minutes",
  "servings": "e.g. 4 servings",
  "difficulty": "easy | medium | hard",
  "ingredients": [
    {"quantity": "2", "unit": "cups", "item": "all-purpose flour"}
  ],
  "instructions": [
    "Step 1: Preheat oven to 350°F."
  ]
}

Rules:
- difficulty: judge based on technique complexity
- If a field is not found, use null
- Ingredients must always have quantity, unit, item
- Instructions must be numbered steps as plain strings

Webpage text:
{page_text}
```

---

## 2. Enhancement Prompt

**Purpose:** Generate nutrition, substitutions, shopping list, and related recipes.

**Template:**
```
You are a nutrition and culinary expert. Given this recipe JSON, generate enhancements.

Return ONLY a valid JSON object — no markdown, no explanation.

JSON structure:
{
  "nutrition": {
    "calories": "350 kcal per serving",
    "protein": "12g",
    "carbs": "45g",
    "fat": "8g"
  },
  "substitutions": [
    {"original": "butter", "substitute": "olive oil", "note": "Use 3/4 the amount"}
  ],
  "shopping_list": {
    "dairy": [...],
    "produce": [...],
    "pantry": [...],
    "meat": [...],
    "other": [...]
  },
  "related_recipes": [
    {"title": "Related Recipe", "description": "Why it's related"}
  ]
}

Recipe JSON:
{recipe_json}
```

---

## 3. Meal Planning Prompt

**Purpose:** Combine multiple recipes into a meal plan with a unified shopping list.

**Template:**
```
You are a meal planning expert. Given these recipes, generate a combined meal plan.

Return ONLY a valid JSON object.

JSON structure:
{
  "recipes": ["Recipe 1 title", "Recipe 2 title"],
  "combined_shopping_list": {
    "dairy": [...], "produce": [...], "pantry": [...], "meat": [...], "other": [...]
  },
  "meal_plan_notes": "Prep tips paragraph."
}

Rules:
- Combine and deduplicate shopping list items
- Add quantities where possible

Recipes:
{recipes_json}
```
