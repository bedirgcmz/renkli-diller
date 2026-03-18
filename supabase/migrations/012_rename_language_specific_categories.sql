-- Dile özgü kategori isimlerini nötr hale getir
-- "Business English" → "İş & Kariyer" (her dilde kendi karşılığı)
-- "Phrasal Verbs" → her dilde doğal gramer terimi

UPDATE categories SET
  name_tr = 'İş & Kariyer',
  name_en = 'Business & Career',
  name_sv = 'Affärsliv',
  name_de = 'Berufsleben',
  name_es = 'Negocios y Carrera',
  name_fr = 'Affaires et Carrière',
  name_pt = 'Negócios e Carreira'
WHERE name_en = 'Business English';

UPDATE categories SET
  name_tr = 'Birleşik Fiiller',
  name_en = 'Phrasal Verbs',
  name_sv = 'Partikelverb',
  name_de = 'Phrasal Verbs',
  name_es = 'Verbos Frasales',
  name_fr = 'Verbes à Particule',
  name_pt = 'Verbos Frasais'
WHERE name_en = 'Phrasal Verbs';
