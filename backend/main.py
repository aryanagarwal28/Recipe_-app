from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, HttpUrl
from sqlalchemy.orm import Session
from typing import Optional
import uvicorn

from database import get_db, engine
import models
from scraper import scrape_recipe_page
from llm_processor import process_recipe_with_llm
from schemas import RecipeResponse, RecipeListItem, MealPlanRequest, MealPlanResponse

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Recipe Extractor API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class URLInput(BaseModel):
    url: str


@app.get("/")
def root():
    return {"message": "Recipe Extractor API is running"}


@app.post("/api/extract", response_model=RecipeResponse)
async def extract_recipe(payload: URLInput, db: Session = Depends(get_db)):
    url = payload.url.strip()

    # Check cache
    existing = db.query(models.Recipe).filter(models.Recipe.url == url).first()
    if existing:
        return build_response(existing)

    # Scrape
    try:
        raw_html, page_text = scrape_recipe_page(url)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to scrape URL: {str(e)}")

    # LLM processing
    try:
        data = process_recipe_with_llm(page_text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"LLM processing failed: {str(e)}")

    # Store in DB
    recipe = models.Recipe(
        url=url,
        raw_html=raw_html,
        title=data["title"],
        cuisine=data["cuisine"],
        prep_time=data["prep_time"],
        cook_time=data["cook_time"],
        total_time=data["total_time"],
        servings=data["servings"],
        difficulty=data["difficulty"],
        ingredients=data["ingredients"],
        instructions=data["instructions"],
        nutrition=data["nutrition"],
        substitutions=data["substitutions"],
        shopping_list=data["shopping_list"],
        related_recipes=data["related_recipes"],
    )
    db.add(recipe)
    db.commit()
    db.refresh(recipe)

    return build_response(recipe)


@app.get("/api/recipes", response_model=list[RecipeListItem])
def get_recipes(db: Session = Depends(get_db)):
    recipes = db.query(models.Recipe).order_by(models.Recipe.created_at.desc()).all()
    return [
        RecipeListItem(
            id=r.id,
            title=r.title,
            cuisine=r.cuisine,
            difficulty=r.difficulty,
            url=r.url,
            created_at=str(r.created_at),
        )
        for r in recipes
    ]


@app.get("/api/recipes/{recipe_id}", response_model=RecipeResponse)
def get_recipe(recipe_id: int, db: Session = Depends(get_db)):
    recipe = db.query(models.Recipe).filter(models.Recipe.id == recipe_id).first()
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    return build_response(recipe)


@app.post("/api/meal-plan", response_model=MealPlanResponse)
def generate_meal_plan(payload: MealPlanRequest, db: Session = Depends(get_db)):
    from llm_processor import generate_meal_plan_llm
    recipes = db.query(models.Recipe).filter(models.Recipe.id.in_(payload.recipe_ids)).all()
    if not recipes:
        raise HTTPException(status_code=404, detail="No recipes found")
    result = generate_meal_plan_llm([build_response(r).dict() for r in recipes])
    return result


def build_response(recipe: models.Recipe) -> RecipeResponse:
    return RecipeResponse(
        id=recipe.id,
        url=recipe.url,
        title=recipe.title,
        cuisine=recipe.cuisine,
        prep_time=recipe.prep_time,
        cook_time=recipe.cook_time,
        total_time=recipe.total_time,
        servings=recipe.servings,
        difficulty=recipe.difficulty,
        ingredients=recipe.ingredients,
        instructions=recipe.instructions,
        nutrition=recipe.nutrition,
        substitutions=recipe.substitutions,
        shopping_list=recipe.shopping_list,
        related_recipes=recipe.related_recipes,
        created_at=str(recipe.created_at),
    )


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
