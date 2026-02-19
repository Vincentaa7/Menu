import os
import uuid
from typing import Optional, List
from fastapi import APIRouter, HTTPException, Header, UploadFile, File
from pydantic import BaseModel
from database import supabase

router = APIRouter()

SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
STORAGE_BUCKET = "recipe-images"


# ── Helpers ──────────────────────────────────────────────────────────────────

def get_user_id(authorization: str) -> str:
    """Extract + verify JWT, return user_id."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")
    token = authorization.split(" ", 1)[1]
    try:
        user = supabase.auth.get_user(token)
        return user.user.id
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")


# ── Schemas ───────────────────────────────────────────────────────────────────

class RecipeCreate(BaseModel):
    title: str
    image_url: Optional[str] = None
    ingredients: List[str] = []
    steps: List[str] = []
    category: str = "Umum"


class RecipeUpdate(BaseModel):
    title: Optional[str] = None
    image_url: Optional[str] = None
    ingredients: Optional[List[str]] = None
    steps: Optional[List[str]] = None
    category: Optional[str] = None


# ── Image Upload ──────────────────────────────────────────────────────────────

@router.post("/upload-image")
async def upload_image(
    file: UploadFile = File(...),
    authorization: Optional[str] = Header(None),
):
    user_id = get_user_id(authorization)
    ext = file.filename.rsplit(".", 1)[-1] if "." in file.filename else "jpg"
    file_path = f"{user_id}/{uuid.uuid4()}.{ext}"
    contents = await file.read()

    try:
        supabase.storage.from_(STORAGE_BUCKET).upload(
            path=file_path,
            file=contents,
            file_options={"content-type": file.content_type},
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image upload failed: {str(e)}")

    public_url = f"{SUPABASE_URL}/storage/v1/object/public/{STORAGE_BUCKET}/{file_path}"
    return {"url": public_url}


# ── CRUD Endpoints ────────────────────────────────────────────────────────────

@router.get("")
def list_recipes(search: Optional[str] = None, category: Optional[str] = None):
    """Public feed — no auth required."""
    query = supabase.table("recipes").select("*").order("created_at", desc=True)

    if search:
        query = query.ilike("title", f"%{search}%")
    if category:
        query = query.eq("category", category)

    result = query.execute()
    return result.data


@router.get("/{recipe_id}")
def get_recipe(recipe_id: str):
    result = supabase.table("recipes").select("*").eq("id", recipe_id).single().execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Recipe not found")
    return result.data


@router.post("", status_code=201)
def create_recipe(
    recipe: RecipeCreate,
    authorization: Optional[str] = Header(None),
):
    user_id = get_user_id(authorization)
    payload = {
        "user_id": user_id,
        "title": recipe.title,
        "image_url": recipe.image_url,
        "ingredients": recipe.ingredients,
        "steps": recipe.steps,
        "category": recipe.category,
    }
    result = supabase.table("recipes").insert(payload).execute()
    return result.data[0]


@router.put("/{recipe_id}")
def update_recipe(
    recipe_id: str,
    recipe: RecipeUpdate,
    authorization: Optional[str] = Header(None),
):
    user_id = get_user_id(authorization)

    # Verify ownership
    existing = supabase.table("recipes").select("user_id").eq("id", recipe_id).single().execute()
    if not existing.data:
        raise HTTPException(status_code=404, detail="Recipe not found")
    if existing.data["user_id"] != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to edit this recipe")

    updates = recipe.model_dump(exclude_none=True)
    result = supabase.table("recipes").update(updates).eq("id", recipe_id).execute()
    return result.data[0]


@router.delete("/{recipe_id}", status_code=204)
def delete_recipe(
    recipe_id: str,
    authorization: Optional[str] = Header(None),
):
    user_id = get_user_id(authorization)

    existing = supabase.table("recipes").select("user_id").eq("id", recipe_id).single().execute()
    if not existing.data:
        raise HTTPException(status_code=404, detail="Recipe not found")
    if existing.data["user_id"] != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this recipe")

    supabase.table("recipes").delete().eq("id", recipe_id).execute()
    return None
