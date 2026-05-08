import os
import json
import re
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain

load_dotenv()

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY", "")


def get_llm():
    return ChatGoogleGenerativeAI(
        model="gemini-1.5-flash",
        google_api_key=GOOGLE_API_KEY,
        temperature=0.2,
    )


def clean_json_response(text: str) -> str:
    """Strip markdown fences and extract raw JSON."""
    text = text.strip()
    text = re.sub(r"^```json\s*", "", text)
    text = re.sub(r"^```\s*", "", text)
    text = re.sub(r"\s*```$", "", text)
    return text.strip()


def process_recipe_with_llm(page_text: str) -> dict:
    llm = get_llm()

    # ── PROMPT 1: Extract structured recipe ──────────────────────────────────
    extraction_prompt = PromptTemplate(
        input_variables=["page_text"],
        template="""
You are a recipe extraction expert. From the raw webpage text below, extract the recipe details.

Return ONLY a valid JSON object — no markdown, no explanation, no extra text.

JSON structure:
{{
  "title": "Recipe name",
  "cuisine": "e.g. Italian, Indian, American",
  "prep_time": "e.g. 10 minutes",
  "cook_time": "e.g. 20 minutes",
  "total_time": "e.g. 30 minutes",
  "servings": "e.g. 4 servings",
  "difficulty": "easy | medium | hard",
  "ingredients": [
    {{"quantity": "2", "unit": "cups", "item": "all-purpose flour"}},
    {{"quantity": "1", "unit": "tsp", "item": "salt"}}
  ],
  "instructions": [
    "Step 1: Preheat oven to 350°F.",
    "Step 2: Mix dry ingredients."
  ]
}}

Rules:
- difficulty: judge based on technique complexity
- If a field is not found, use null
- Ingredients must always have quantity, unit, item — use empty string if unknown
- Instructions must be numbered steps as plain strings

Webpage text:
{page_text}
"""
    )

    # ── PROMPT 2: Generate enhancements ──────────────────────────────────────
    enhancement_prompt = PromptTemplate(
        input_variables=["recipe_json"],
        template="""
You are a nutrition and culinary expert. Given this recipe JSON, generate enhancements.

Return ONLY a valid JSON object — no markdown, no explanation.

JSON structure:
{{
  "nutrition": {{
    "calories": "e.g. 350 kcal per serving",
    "protein": "e.g. 12g",
    "carbs": "e.g. 45g",
    "fat": "e.g. 8g"
  }},
  "substitutions": [
    {{"original": "butter", "substitute": "olive oil", "note": "Use 3/4 the amount"}},
    {{"original": "all-purpose flour", "substitute": "almond flour", "note": "For gluten-free version"}},
    {{"original": "sugar", "substitute": "honey", "note": "Use 3/4 cup honey per 1 cup sugar"}}
  ],
  "shopping_list": {{
    "dairy": ["2 cups milk", "1 cup butter"],
    "produce": ["2 cloves garlic", "1 onion"],
    "pantry": ["2 cups flour", "1 tsp salt"],
    "meat": ["500g chicken breast"],
    "other": []
  }},
  "related_recipes": [
    {{"title": "Related Recipe 1", "description": "Brief description why it's related"}},
    {{"title": "Related Recipe 2", "description": "Brief description"}},
    {{"title": "Related Recipe 3", "description": "Brief description"}}
  ]
}}

Recipe JSON:
{recipe_json}
"""
    )

    # Run extraction
    extraction_chain = LLMChain(llm=llm, prompt=extraction_prompt)
    extraction_result = extraction_chain.run(page_text=page_text)
    extraction_clean = clean_json_response(extraction_result)

    try:
        recipe_data = json.loads(extraction_clean)
    except json.JSONDecodeError as e:
        raise Exception(f"Failed to parse recipe extraction JSON: {e}\nRaw: {extraction_clean[:500]}")

    # Run enhancement
    enhancement_chain = LLMChain(llm=llm, prompt=enhancement_prompt)
    enhancement_result = enhancement_chain.run(recipe_json=json.dumps(recipe_data))
    enhancement_clean = clean_json_response(enhancement_result)

    try:
        enhancement_data = json.loads(enhancement_clean)
    except json.JSONDecodeError as e:
        raise Exception(f"Failed to parse enhancement JSON: {e}\nRaw: {enhancement_clean[:500]}")

    # Merge
    return {
        "title": recipe_data.get("title", "Unknown Recipe"),
        "cuisine": recipe_data.get("cuisine"),
        "prep_time": recipe_data.get("prep_time"),
        "cook_time": recipe_data.get("cook_time"),
        "total_time": recipe_data.get("total_time"),
        "servings": recipe_data.get("servings"),
        "difficulty": recipe_data.get("difficulty"),
        "ingredients": recipe_data.get("ingredients", []),
        "instructions": recipe_data.get("instructions", []),
        "nutrition": enhancement_data.get("nutrition", {}),
        "substitutions": enhancement_data.get("substitutions", []),
        "shopping_list": enhancement_data.get("shopping_list", {}),
        "related_recipes": enhancement_data.get("related_recipes", []),
    }


def generate_meal_plan_llm(recipes: list) -> dict:
    llm = get_llm()

    meal_plan_prompt = PromptTemplate(
        input_variables=["recipes_json"],
        template="""
You are a meal planning expert. Given these recipes, generate a combined meal plan.

Return ONLY a valid JSON object — no markdown, no explanation.

JSON structure:
{{
  "recipes": ["Recipe 1 title", "Recipe 2 title"],
  "combined_shopping_list": {{
    "dairy": ["item1", "item2"],
    "produce": ["item1", "item2"],
    "pantry": ["item1", "item2"],
    "meat": ["item1"],
    "other": []
  }},
  "meal_plan_notes": "Brief paragraph with tips on how to prep these meals together efficiently."
}}

Rules:
- Combine and deduplicate shopping list items across all recipes
- Group by category
- Add quantities where possible

Recipes:
{recipes_json}
"""
    )

    chain = LLMChain(llm=llm, prompt=meal_plan_prompt)
    result = chain.run(recipes_json=json.dumps(recipes))
    clean = clean_json_response(result)

    try:
        return json.loads(clean)
    except json.JSONDecodeError as e:
        raise Exception(f"Failed to parse meal plan JSON: {e}")
