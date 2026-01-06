-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Create songs table
CREATE TABLE public.songs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  audio_url TEXT NOT NULL,
  cover_url TEXT,
  uploaded_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on songs
ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;

-- Songs policies (both users can see all songs, only uploader can insert)
CREATE POLICY "Authenticated users can view songs" ON public.songs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can upload songs" ON public.songs FOR INSERT TO authenticated WITH CHECK (
  uploaded_by IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);
CREATE POLICY "Users can delete own songs" ON public.songs FOR DELETE TO authenticated USING (
  uploaded_by IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);

-- Create plays table to track listens
CREATE TABLE public.plays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  song_id UUID NOT NULL REFERENCES public.songs(id) ON DELETE CASCADE,
  played_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  played_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on plays
ALTER TABLE public.plays ENABLE ROW LEVEL SECURITY;

-- Plays policies
CREATE POLICY "Authenticated users can view plays" ON public.plays FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can record own plays" ON public.plays FOR INSERT TO authenticated WITH CHECK (
  played_by IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);

-- Create favorites table
CREATE TABLE public.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  song_id UUID NOT NULL REFERENCES public.songs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(song_id, user_id)
);

-- Enable RLS on favorites
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- Favorites policies
CREATE POLICY "Authenticated users can view favorites" ON public.favorites FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can add own favorites" ON public.favorites FOR INSERT TO authenticated WITH CHECK (
  user_id IN (SELECT id FROM public.profiles WHERE profiles.user_id = auth.uid())
);
CREATE POLICY "Users can remove own favorites" ON public.favorites FOR DELETE TO authenticated USING (
  user_id IN (SELECT id FROM public.profiles WHERE profiles.user_id = auth.uid())
);

-- Create storage bucket for audio files
INSERT INTO storage.buckets (id, name, public) VALUES ('audio', 'audio', true);

-- Storage policies for audio bucket
CREATE POLICY "Authenticated users can upload audio" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'audio');
CREATE POLICY "Anyone can view audio" ON storage.objects FOR SELECT USING (bucket_id = 'audio');
CREATE POLICY "Users can delete own audio" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'audio');

-- Create storage bucket for covers
INSERT INTO storage.buckets (id, name, public) VALUES ('covers', 'covers', true);

-- Storage policies for covers bucket
CREATE POLICY "Authenticated users can upload covers" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'covers');
CREATE POLICY "Anyone can view covers" ON storage.objects FOR SELECT USING (bucket_id = 'covers');
CREATE POLICY "Users can delete own covers" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'covers');

-- Create storage bucket for avatars
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- Storage policies for avatars bucket
CREATE POLICY "Authenticated users can upload avatars" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'avatars');
CREATE POLICY "Anyone can view avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');

-- Trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'display_name', 'User'));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();