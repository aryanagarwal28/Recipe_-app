from pydantic import BaseModel
from typing import Optional, List


class Ingredient(BaseModel):
    quantity: str
    unit: str
    item: str


class Nutrition(BaseModel):
    calories: str
    protein: str
    carbs: str
    fat: str


class Substitution(BaseModel):
    original: str
    substitute: str
    note: str


class ShoppingList(BaseModel):
    dairy: List[str] = []
    produce: List[str] = []
    pantry: List[str] = []
    meat: List[str] = []
    other: List[str] = []


class RelatedRecipe(BaseModel):
    title: str
    description: str


class RecipeResponse(BaseModel):
    id: int
    url: str
    title: str
    cuisine: Optional[str]
    prep_time: Optional[str]
    cook_time: Optional[str]
    total_time: Optional[str]
    servings: Optional[str]
    difficulty: Optional[str]
    ingredients: Optional[List[dict]]
    instructions: Optional[List[str]]
    nutrition: Optional[dict]
    substitutions: Optional[List[dict]]
    shopping_list: Optional[dict]
    related_recipes: Optional[List[dict]]
    created_at: Optional[str]

    class Config:
        from_attributes = True


class RecipeListItem(BaseModel):
    id: int
    title: str
    cuisine: Optional[str]
    difficulty: Optional[str]
    url: str
    created_at: str


class MealPlanRequest(BaseModel):
    recipe_ids: List[int]


class MealPlanResponse(BaseModel):
    recipes: List[str]
    combined_shopping_list: dict
    meal_plan_notes: str
