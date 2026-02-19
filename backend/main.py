import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from routers import recipes, bookmarks, chat

load_dotenv()

app = FastAPI(
    title="Recipe Sharing API",
    description="Backend API for the Recipe Sharing SaaS platform.",
    version="1.0.0",
)

# --- CORS ---
allowed_origins_str = os.environ.get("ALLOWED_ORIGINS", "http://localhost:3000")
allowed_origins = [o.strip() for o in allowed_origins_str.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Routers ---
app.include_router(recipes.router, prefix="/api/recipes", tags=["Recipes"])
app.include_router(bookmarks.router, prefix="/api/bookmarks", tags=["Bookmarks"])
app.include_router(chat.router, prefix="/api/chat", tags=["Chef Bot"])


@app.get("/", tags=["Health"])
def root():
    return {"status": "ok", "message": "Recipe Sharing API is running 🍳"}
