-- ============================================================
-- Recipe Sharing SaaS — Supabase SQL Schema
-- Run this in: Supabase Dashboard > SQL Editor > New Query
-- ============================================================

-- Enable UUID extension (already enabled in Supabase by default)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLE: recipes
-- ============================================================
CREATE TABLE IF NOT EXISTS public.recipes (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title       TEXT NOT NULL,
    image_url   TEXT,
    ingredients JSONB NOT NULL DEFAULT '[]'::jsonb,
    steps       JSONB NOT NULL DEFAULT '[]'::jsonb,
    category    TEXT NOT NULL DEFAULT 'Umum',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for faster user-specific queries
CREATE INDEX IF NOT EXISTS idx_recipes_user_id ON public.recipes(user_id);
CREATE INDEX IF NOT EXISTS idx_recipes_category ON public.recipes(category);
CREATE INDEX IF NOT EXISTS idx_recipes_created_at ON public.recipes(created_at DESC);

-- ============================================================
-- TABLE: saved_recipes (bookmarks)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.saved_recipes (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    recipe_id   UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
    saved_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, recipe_id)  -- prevent duplicate bookmarks
);

CREATE INDEX IF NOT EXISTS idx_saved_recipes_user_id ON public.saved_recipes(user_id);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS on both tables
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_recipes ENABLE ROW LEVEL SECURITY;

-- ---- RECIPES POLICIES ----

-- Anyone can read all recipes (public feed)
CREATE POLICY "Public can view all recipes"
    ON public.recipes FOR SELECT
    USING (true);

-- Authenticated users can create recipes
CREATE POLICY "Authenticated users can create recipes"
    ON public.recipes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Only owner can update their recipe
CREATE POLICY "Owners can update their recipes"
    ON public.recipes FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Only owner can delete their recipe
CREATE POLICY "Owners can delete their recipes"
    ON public.recipes FOR DELETE
    USING (auth.uid() = user_id);

-- ---- SAVED_RECIPES POLICIES ----

-- Users can only see their own bookmarks
CREATE POLICY "Users can view their own bookmarks"
    ON public.saved_recipes FOR SELECT
    USING (auth.uid() = user_id);

-- Users can bookmark recipes
CREATE POLICY "Users can create bookmarks"
    ON public.saved_recipes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can remove their own bookmarks
CREATE POLICY "Users can delete their own bookmarks"
    ON public.saved_recipes FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================================
-- STORAGE BUCKET: recipe-images
-- Run these separately in SQL Editor
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('recipe-images', 'recipe-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload images"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'recipe-images' AND auth.role() = 'authenticated');

-- Allow public to view images
CREATE POLICY "Public can view recipe images"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'recipe-images');

-- Allow owners to delete their images
CREATE POLICY "Owners can delete their images"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'recipe-images' AND auth.uid()::text = (storage.foldername(name))[1]);
