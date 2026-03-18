-- sentences tablosuna yeni dil sütunları
ALTER TABLE sentences
  ADD COLUMN IF NOT EXISTS text_es TEXT,
  ADD COLUMN IF NOT EXISTS text_fr TEXT,
  ADD COLUMN IF NOT EXISTS text_pt TEXT,
  ADD COLUMN IF NOT EXISTS keywords_es JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS keywords_fr JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS keywords_pt JSONB DEFAULT '[]';

-- categories tablosuna yeni dil sütunları
ALTER TABLE categories
  ADD COLUMN IF NOT EXISTS name_es TEXT,
  ADD COLUMN IF NOT EXISTS name_fr TEXT,
  ADD COLUMN IF NOT EXISTS name_pt TEXT;

-- Kategori çevirilerini güncelle
UPDATE categories SET
  name_es = CASE name_en
    WHEN 'Daily Conversation' THEN 'Conversación diaria'
    WHEN 'Business English' THEN 'Inglés de negocios'
    WHEN 'Phrasal Verbs' THEN 'Verbos frasales'
    WHEN 'Travel' THEN 'Viajes'
    WHEN 'Academic' THEN 'Académico'
    WHEN 'Idioms' THEN 'Modismos'
    WHEN 'Grammar Patterns' THEN 'Patrones gramaticales'
    WHEN 'Technology' THEN 'Tecnología'
    WHEN 'Health' THEN 'Salud'
    WHEN 'Social & Modern' THEN 'Social y moderno'
  END,
  name_fr = CASE name_en
    WHEN 'Daily Conversation' THEN 'Conversation quotidienne'
    WHEN 'Business English' THEN 'Anglais des affaires'
    WHEN 'Phrasal Verbs' THEN 'Verbes à particule'
    WHEN 'Travel' THEN 'Voyage'
    WHEN 'Academic' THEN 'Académique'
    WHEN 'Idioms' THEN 'Expressions idiomatiques'
    WHEN 'Grammar Patterns' THEN 'Structures grammaticales'
    WHEN 'Technology' THEN 'Technologie'
    WHEN 'Health' THEN 'Santé'
    WHEN 'Social & Modern' THEN 'Social et moderne'
  END,
  name_pt = CASE name_en
    WHEN 'Daily Conversation' THEN 'Conversação diária'
    WHEN 'Business English' THEN 'Inglês de negócios'
    WHEN 'Phrasal Verbs' THEN 'Verbos frasais'
    WHEN 'Travel' THEN 'Viagem'
    WHEN 'Academic' THEN 'Acadêmico'
    WHEN 'Idioms' THEN 'Expressões idiomáticas'
    WHEN 'Grammar Patterns' THEN 'Padrões gramaticais'
    WHEN 'Technology' THEN 'Tecnologia'
    WHEN 'Health' THEN 'Saúde'
    WHEN 'Social & Modern' THEN 'Social e moderno'
  END;
