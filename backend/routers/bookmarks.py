from typing import Optional
from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from database import supabase

router = APIRouter()


def get_user_id(authorization: str) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")
    token = authorization.split(" ", 1)[1]
    try:
        user = supabase.auth.get_user(token)
        return user.user.id
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")


class BookmarkCreate(BaseModel):
    recipe_id: str


@router.get("")
def get_bookmarks(authorization: Optional[str] = Header(None)):
    """Return all bookmarked recipes for the authenticated user."""
    user_id = get_user_id(authorization)
    # Join saved_recipes with recipes to return full recipe data
    result = (
        supabase.table("saved_recipes")
        .select("id, saved_at, recipe_id, recipes(*)")
        .eq("user_id", user_id)
        .order("saved_at", desc=True)
        .execute()
    )
    return result.data


@router.post("", status_code=201)
def add_bookmark(
    payload: BookmarkCreate,
    authorization: Optional[str] = Header(None),
):
    user_id = get_user_id(authorization)

    # Check recipe exists
    recipe = supabase.table("recipes").select("id").eq("id", payload.recipe_id).execute()
    if not recipe.data:
        raise HTTPException(status_code=404, detail="Recipe not found")

    try:
        result = supabase.table("saved_recipes").insert(
            {"user_id": user_id, "recipe_id": payload.recipe_id}
        ).execute()
        return result.data[0]
    except Exception as e:
        # Unique constraint violation = already bookmarked
        raise HTTPException(status_code=409, detail="Recipe already bookmarked")


@router.delete("/{recipe_id}", status_code=204)
def remove_bookmark(
    recipe_id: str,
    authorization: Optional[str] = Header(None),
):
    user_id = get_user_id(authorization)
    supabase.table("saved_recipes").delete().eq("user_id", user_id).eq("recipe_id", recipe_id).execute()
    return None
