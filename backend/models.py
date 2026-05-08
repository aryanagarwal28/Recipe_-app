from sqlalchemy import Column, Integer, String, Text, DateTime, JSON
from sqlalchemy.sql import func
from database import Base


class Recipe(Base):
    __tablename__ = "recipes"

    id = Column(Integer, primary_key=True, index=True)
    url = Column(String, unique=True, index=True, nullable=False)
    raw_html = Column(Text, nullable=True)

    # Core recipe fields
    title = Column(String, nullable=False)
    cuisine = Column(String, nullable=True)
    prep_time = Column(String, nullable=True)
    cook_time = Column(String, nullable=True)
    total_time = Column(String, nullable=True)
    servings = Column(String, nullable=True)
    difficulty = Column(String, nullable=True)

    # JSON fields
    ingredients = Column(JSON, nullable=True)     # list of {quantity, unit, item}
    instructions = Column(JSON, nullable=True)    # list of strings
    nutrition = Column(JSON, nullable=True)       # {calories, protein, carbs, fat}
    substitutions = Column(JSON, nullable=True)   # list of {original, substitute, note}
    shopping_list = Column(JSON, nullable=True)   # {dairy: [], produce: [], pantry: []}
    related_recipes = Column(JSON, nullable=True) # list of {title, description}

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
