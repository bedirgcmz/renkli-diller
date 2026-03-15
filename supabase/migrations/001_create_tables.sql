CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  ui_language TEXT NOT NULL DEFAULT 'tr' CHECK (ui_language IN ('tr', 'en', 'sv', 'de')),
  target_language TEXT NOT NULL DEFAULT 'en' CHECK (target_language IN ('tr', 'en', 'sv', 'de')),
  is_premium BOOLEAN NOT NULL DEFAULT false,
  theme TEXT NOT NULL DEFAULT 'light' CHECK (theme IN ('light', 'dark')),
  daily_goal INTEGER NOT NULL DEFAULT 10 CHECK (daily_goal IN (5, 10, 20, 30)),
  streak_count INTEGER NOT NULL DEFAULT 0,
  last_active DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name_tr TEXT NOT NULL,
  name_en TEXT NOT NULL,
  name_sv TEXT NOT NULL,
  name_de TEXT NOT NULL,
  icon TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_free BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE sentences (
  id SERIAL PRIMARY KEY,
  category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  text_tr TEXT NOT NULL,
  text_en TEXT NOT NULL,
  text_sv TEXT NOT NULL,
  text_de TEXT NOT NULL,
  keywords_tr JSONB NOT NULL DEFAULT '[]',
  keywords_en JSONB NOT NULL DEFAULT '[]',
  keywords_sv JSONB NOT NULL DEFAULT '[]',
  keywords_de JSONB NOT NULL DEFAULT '[]',
  difficulty TEXT NOT NULL DEFAULT 'beginner' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  is_free BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE user_sentences (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  source_text TEXT NOT NULL,
  target_text TEXT NOT NULL,
  keywords JSONB NOT NULL DEFAULT '[]',
  state TEXT NOT NULL DEFAULT 'learning' CHECK (state IN ('learning', 'learned')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE user_progress (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  sentence_id INTEGER NOT NULL REFERENCES sentences(id) ON DELETE CASCADE,
  state TEXT NOT NULL DEFAULT 'learning' CHECK (state IN ('learning', 'learned')),
  learned_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, sentence_id)
);

CREATE TABLE daily_stats (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  sentences_studied INTEGER NOT NULL DEFAULT 0,
  sentences_learned INTEGER NOT NULL DEFAULT 0,
  quiz_correct INTEGER NOT NULL DEFAULT 0,
  quiz_total INTEGER NOT NULL DEFAULT 0,
  UNIQUE(user_id, date)
);

CREATE TABLE quiz_results (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  sentence_id INTEGER REFERENCES sentences(id) ON DELETE SET NULL,
  user_sentence_id INTEGER REFERENCES user_sentences(id) ON DELETE SET NULL,
  quiz_type TEXT NOT NULL CHECK (quiz_type IN ('multiple_choice', 'fill_blank')),
  is_correct BOOLEAN NOT NULL,
  answered_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
