-- ============================================================
-- CHATGPT PROMPT: Parlio Uygulaması İçin Yeni Okuma Metni Üretimi
-- ============================================================
--
-- Sen bir dil öğrenme uygulaması için günlük okuma metinleri üretiyorsun.
-- Aşağıda önce sistemin kurallarını, sonra gerçek bir örneği göreceksin.
-- En sonda senden ne üretmeni istediğimizi belirteceğiz.
--
-- ── SİSTEM KURALLARI ──────────────────────────────────────
--
-- UYGULAMA: Parlio — kullanıcılar hedef dilde kısa metinler okur
-- DESTEKLENEN DİLLER: tr, en, sv, de, es, fr, pt
--
-- METİN YAPISI:
--   - 3 paragraf, her paragraf 2-3 cümle
--   - Toplam ~80-120 kelime (hedef dilde)
--   - Günlük hayat diliyle yazılır, ağır akademik dil yok
--   - Bir karakterin (isim verilebilir) bakış açısından ya da genel anlatıyla
--
-- KEYWORD SİSTEMİ (ÇOK ÖNEMLİ):
--   - Her metinde 4-6 adet öğretici kelime/ifade seçilir
--   - Bu kelimeler body metninde ** çift yıldız ** arasına alınır
--   - Kelimeler 0'dan başlayan pozisyon sırasıyla (position_index) işaretlenir
--   - position_index metinde soldan sağa, yukarıdan aşağıya sıraya göre verilir
--   - position_index 0 = metinde ilk çıkan keyword, 1 = ikinci, vb.
--
--   KRITIK KURAL: Her dildeki body'de **aynı kaç numaralı keyword** işaretleniyorsa,
--   o dildeki karşılığı reading_text_keywords'de o position_index'e yazılır.
--   Kelimenin sırası tüm dillerde aynı olmalı (1. keyword her dilde 1. çıkan).
--
--   Örnek (position_index 0 = "wakes up" / "kalkar"):
--     body_tr: 'Ayşe her sabah erken **kalkar** ve mutfağa gider.'
--     body_en: 'Ayşe **wakes up** early every morning and goes to the kitchen.'
--     keyword_tr = 'kalkar', keyword_en = 'wakes up'
--
--   Keyword body'deki exact spelling ile eşleşmeli (** içindeki harf harf aynı)
--
-- color_index:
--   Her keyword için 0-9 arasında benzersiz renk indeksi.
--   Önerilen: 0, 2, 4, 6, 8 (ya da 0, 1, 2, 3, 4 — sıralı da olur)
--   Aynı metinde aynı color_index tekrar kullanılmaz.
--
-- SLUG: kebab-case, kategori-konu formatı
--   Örnek: 'daily-life-morning-coffee', 'travel-airport-check-in'
--
-- KATEGORİLER:
--   'daily_life'  — günlük hayat rutinleri
--   'travel'      — seyahat, havalimanı, otel
--   'work'        — iş hayatı, ofis, toplantı
--
-- difficulty:
--   1 = beginner   (basit kelimeler, kısa cümleler)
--   2 = intermediate
--   3 = advanced   (daha karmaşık yapılar, az bilinen kelimeler)
--
-- estimated_reading_seconds: yaklaşık okuma süresi (genellikle 60-100)
-- is_premium: false = ücretsiz, true = premium
-- order_index: mevcut son order_index + 1 (şu an 10 metin var, 11'den başla)
--
-- SQL single-quote kuralı: Metin içinde apostrof varsa '' (çift tek tırnak) kullan
--
-- ── GERÇEK ÖRNEK ──────────────────────────────────────────
--
-- Bu örnek sistemdeki ilk metinden alınmıştır. Format ve kaliteyi buradan anla.

-- ── ÖRNEK METİN: "Sabah Kahvesi" (order_index=1, 5 keyword) ──────────────────

INSERT INTO reading_texts (
  slug, category, difficulty, is_premium, order_index, estimated_reading_seconds,
  title_tr, title_en, title_sv, title_de, title_es, title_fr, title_pt,
  body_tr, body_en, body_sv, body_de, body_es, body_fr, body_pt
) VALUES (
  'daily-life-morning-coffee',
  'daily_life', 1, false, 1, 75,

  -- TITLES (7 dil)
  'Sabah Kahvesi', 'Morning Coffee', 'Morgonkaffe', 'Morgenkaffee',
  'Café de la Mañana', 'Café du Matin', 'Café da Manhã',

  -- BODY TR (keyword sırası: kalkar=0, bekler=1, kupasına=2, not=3, alışkanlık=4)
  'Ayşe her sabah erken **kalkar** ve mutfağa gider. Kahve makinesini çalıştırır ve pencerenin önünde **bekler**. Dışarıda kuşlar ötüyor, sokak henüz sessiz.

Kahvesi hazır olunca en sevdiği **kupasına** döker. İlk yudumla gözleri açılır. Bu sessiz sabah anı ona güç verir.

İşe gitmeden önce Ayşe her zaman bir **not** yazar. Bugün yapacaklarını, küçük hedeflerini. Basit ama etkili bir **alışkanlık**.',

  -- BODY EN
  'Ayşe **wakes up** early every morning and goes to the kitchen. She starts the coffee machine and **waits** by the window. Outside, birds are singing, the street is still quiet.

When her coffee is ready, she pours it into her favourite **mug**. With the first sip, her eyes open fully. This quiet morning moment gives her strength.

Before going to work, Ayşe always writes a **note**. Her tasks for the day, small goals. A simple but effective **habit**.',

  -- BODY SV
  'Ayşe **vaknar** tidigt varje morgon och går till köket. Hon startar kaffemaskinen och **väntar** vid fönstret. Utanför sjunger fåglar, gatan är fortfarande tyst.

När kaffet är klart häller hon upp det i sin favorit**mugg**. Med det första klunket öppnas ögonen helt. Det tysta morgonögonblicket ger henne styrka.

Innan hon går till jobbet skriver Ayşe alltid en **anteckning**. Dagens uppgifter, små mål. En enkel men effektiv **vana**.',

  -- BODY DE
  'Ayşe **wacht** jeden Morgen früh auf und geht in die Küche. Sie startet die Kaffeemaschine und **wartet** am Fenster. Draußen singen Vögel, die Straße ist noch still.

Als ihr Kaffee fertig ist, gießt sie ihn in ihre Lieblings**tasse**. Mit dem ersten Schluck öffnen sich ihre Augen vollständig. Dieser stille Morgenmoment gibt ihr Kraft.

Bevor sie zur Arbeit geht, schreibt Ayşe immer eine **Notiz**. Die Aufgaben des Tages, kleine Ziele. Eine einfache aber wirkungsvolle **Gewohnheit**.',

  -- BODY ES
  'Ayşe **se despierta** temprano cada mañana y va a la cocina. Enciende la cafetera y **espera** junto a la ventana. Afuera, los pájaros cantan, la calle está todavía tranquila.

Cuando su café está listo, lo sirve en su **taza** favorita. Con el primer sorbo, sus ojos se abren por completo. Este tranquilo momento matutino le da fuerza.

Antes de ir al trabajo, Ayşe siempre escribe una **nota**. Las tareas del día, pequeños objetivos. Un **hábito** simple pero efectivo.',

  -- BODY FR
  'Ayşe **se réveille** tôt chaque matin et va dans la cuisine. Elle démarre la cafetière et **attend** près de la fenêtre. Dehors, les oiseaux chantent, la rue est encore calme.

Quand son café est prêt, elle le verse dans sa **tasse** préférée. À la première gorgée, ses yeux s''ouvrent complètement. Ce moment matinal silencieux lui donne de la force.

Avant d''aller travailler, Ayşe écrit toujours une **note**. Les tâches de la journée, petits objectifs. Une **habitude** simple mais efficace.',

  -- BODY PT
  'Ayşe **acorda** cedo toda manhã e vai para a cozinha. Liga a cafeteira e **espera** perto da janela. Lá fora, os pássaros cantam, a rua ainda está quieta.

Quando o café está pronto, ela serve na sua **caneca** favorita. Com o primeiro gole, seus olhos se abrem completamente. Este momento matinal tranquilo lhe dá força.

Antes de ir trabalhar, Ayşe sempre escreve uma **nota**. As tareas do dia, pequenos objetivos. Um **hábito** simples mas eficaz.'
);

-- KEYWORDS (her keyword için ayrı INSERT — slug ile text ID bulunur)
-- position_index 0: kalkar / wakes up / vaknar / wacht / se despierta / se réveille / acorda
INSERT INTO reading_text_keywords (reading_text_id, position_index, color_index,
  keyword_tr, keyword_en, keyword_sv, keyword_de, keyword_es, keyword_fr, keyword_pt)
SELECT id, 0, 0, 'kalkar', 'wakes up', 'vaknar', 'wacht', 'se despierta', 'se réveille', 'acorda'
FROM reading_texts WHERE slug = 'daily-life-morning-coffee';

-- position_index 1: bekler / waits / väntar / wartet / espera / attend / espera
INSERT INTO reading_text_keywords (reading_text_id, position_index, color_index,
  keyword_tr, keyword_en, keyword_sv, keyword_de, keyword_es, keyword_fr, keyword_pt)
SELECT id, 1, 2, 'bekler', 'waits', 'väntar', 'wartet', 'espera', 'attend', 'espera'
FROM reading_texts WHERE slug = 'daily-life-morning-coffee';

-- position_index 2: kupasına / mug / mugg / Tasse / taza / tasse / caneca
INSERT INTO reading_text_keywords (reading_text_id, position_index, color_index,
  keyword_tr, keyword_en, keyword_sv, keyword_de, keyword_es, keyword_fr, keyword_pt)
SELECT id, 2, 4, 'kupasına', 'mug', 'mugg', 'Tasse', 'taza', 'tasse', 'caneca'
FROM reading_texts WHERE slug = 'daily-life-morning-coffee';

-- position_index 3: not / note / anteckning / Notiz / nota / note / nota
INSERT INTO reading_text_keywords (reading_text_id, position_index, color_index,
  keyword_tr, keyword_en, keyword_sv, keyword_de, keyword_es, keyword_fr, keyword_pt)
SELECT id, 3, 6, 'not', 'note', 'anteckning', 'Notiz', 'nota', 'note', 'nota'
FROM reading_texts WHERE slug = 'daily-life-morning-coffee';

-- position_index 4: alışkanlık / habit / vana / Gewohnheit / hábito / habitude / hábito
INSERT INTO reading_text_keywords (reading_text_id, position_index, color_index,
  keyword_tr, keyword_en, keyword_sv, keyword_de, keyword_es, keyword_fr, keyword_pt)
SELECT id, 4, 8, 'alışkanlık', 'habit', 'vana', 'Gewohnheit', 'hábito', 'habitude', 'hábito'
FROM reading_texts WHERE slug = 'daily-life-morning-coffee';

-- ── ŞİMDİ SENDEN İSTEDİĞİMİZ ─────────────────────────────
--
-- Yukarıdaki kurallara ve örneğe bakarak şunu üret:
--
--   KATEGORİ: [daily_life / travel / work]
--   ADET: [kaç metin istediğini yaz, örn: "3 metin"]
--   DIFFICULTY: [1, 2 ya da 3 — ya da karışık]
--   KONU/TEMA (opsiyonel): [örn: "restoran", "iş toplantısı", "serbest"]
--   ORDER_INDEX BAŞLANGICI: [şu an 10 metin var, 11'den başla]
--   IS_PREMIUM: [false = ücretsiz, true = premium]
--
-- ÇIKTI FORMAT: Her metin için:
--   1. reading_texts INSERT bloğu
--   2. Her keyword için ayrı reading_text_keywords INSERT bloğu (slug ile)
--
-- KONTROL LİSTESİ:
--   ✓ 7 dilde title_* ve body_* doldurulmuş
--   ✓ Her body'de 4-6 keyword ** ile işaretlenmiş
--   ✓ Keyword sırası tüm dillerde aynı (position_index eşleşmesi)
--   ✓ keyword_* alanındaki kelime body'deki ** içindekiyle birebir aynı
--   ✓ color_index aynı metinde tekrarlanmıyor (0, 2, 4, 6, 8 önerilen)
--   ✓ slug benzersiz ve kebab-case
--   ✓ SQL apostrof kuralına uyulmuş ('')
--   ✓ Dil doğal ve akıcı (makine çevirisi gibi değil)
