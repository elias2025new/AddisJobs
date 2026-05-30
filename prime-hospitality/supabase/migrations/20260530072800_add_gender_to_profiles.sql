-- Migration to add gender to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS gender text;
