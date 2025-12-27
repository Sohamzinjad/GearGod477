from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

from app.database import get_db
from app.models import Category, Team
from app.schemas import Category as CategorySchema, CategoryCreate

router = APIRouter()

# Category Endpoints
@router.post("/categories/", response_model=CategorySchema)
async def create_category(category: CategoryCreate, db: AsyncSession = Depends(get_db)):
    db_category = Category(
        name=category.name,
        responsible_id=category.responsible_id,
        company_name=category.company_name
    )
    db.add(db_category)
    await db.commit()
    await db.refresh(db_category)
    return db_category

@router.get("/categories/", response_model=List[CategorySchema])
async def read_categories(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Category).offset(skip).limit(limit))
    return result.scalars().all()


