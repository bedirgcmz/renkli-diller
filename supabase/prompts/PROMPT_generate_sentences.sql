-- ============================================================
-- CHATGPT PROMPT: Parlio Uygulaması İçin Yeni Cümle Üretimi
-- ============================================================
--
-- Sen bir dil öğrenme uygulaması için içerik üretiyorsun.
-- Aşağıda önce sistemin kurallarını, sonra mevcut örnekleri göreceksin.
-- En sonda senden ne üretmeni istediğimizi belirteceğiz.
--
-- ── SİSTEM KURALLARI ──────────────────────────────────────
--
-- UYGULAMA: Parlio — 7 dilde cümle kartı ile dil öğrenme uygulaması
-- DESTEKLENEN DİLLER: tr (Türkçe), en (İngilizce), sv (İsveççe),
--                    de (Almanca), es (İspanyolca), fr (Fransızca), pt (Portekizce)
--
-- HER CÜMLE:
--   - Tek bir ifade/deyim/kalıp öğretir
--   - O ifade cümle içinde ** çift yıldız ** ile işaretlenir
--   - Her dil versiyonunda ifade o dile doğal çevirisiyle işaretlenir
--   - Cümlenin geri kalanı o dile uygun, doğal konuşma diliyle yazılır
--
-- KEYWORDS KURALI (ÇOK ÖNEMLİ):
--   - keywords_tr, keywords_en, keywords_sv... alanları JSON array'dir
--   - Sadece ** arasındaki kelime/ifadeyi içerir, cümlenin geri kalanını değil
--   - Format: '["ifade"]'  — tek eleman, tırnak içinde
--   - Her dil için ayrı keywords alanı vardır
--   - ** işaretleri text içinde kalır, keywords sadece o kelimeyi tutar
--   Örnek:
--     text_tr  = '**Dürüst olmak gerekirse**, bu film pek hoşuma gitmedi.'
--     keywords_tr = '["dürüst olmak gerekirse"]'
--     text_en  = '**To be honest**, I didn''t really enjoy this film.'
--     keywords_en = '["to be honest"]'
--
-- DİKKAT: İfade farklı dillerde farklı konumda olabilir!
--   - TR'de cümle başında olabilir, EN'de ortada olabilir
--   - Her dilde grammatik açıdan en doğal yer seçilmeli
--   - ** işareti neredeyse keywords da o kelimeyi içermelidir
--
-- DIFFICULTY:
--   'beginner'    — çok yaygın, kısa, günlük kullanım
--   'intermediate' — biraz daha az bilinen ama sık kullanılan
--   'advanced'    — deyimsel, kültürel, ya da daha az tahmin edilebilir
--
-- KATEGORİLER (category_id → isim):
--   1  → Günlük Konuşma     (is_free: true)
--   2  → İş İngilizcesi     (is_free: true)
--   3  → Phrasal Verbs      (is_free: false)
--   4  → Travel / Seyahat   (is_free: false)
--   5  → Academic           (is_free: false)
--   6  → Idioms             (is_free: false)
--   7  → Grammar Patterns   (is_free: false)
--   8  → Technology         (is_free: false)
--   9  → Health             (is_free: false)
--   10 → Social & Modern    (is_free: false)
--
-- is_free: Genellikle false. Kategori 1 ve 2 cümlelerinde true kullanılabilir.
--
-- sort_order: Mevcut son sort_order'dan devam et.
--   Kategori 1'de şu an 30 cümle var (sort_order 1-30), yeni cümleler 31'den başlar.
--   Kategori 2'de şu an 30 cümle var (sort_order 31-60), yeni cümleler 61'den başlar.
--   (İstenilen kategoriyi belirt, sort_order'ı ona göre ayarla)
--
-- SQL single-quote kuralı: Cümle içinde apostrof varsa '' (çift tek tırnak) kullan
--   Örnek: I didn''t, it''s, you''re
--
-- ── MEVCUT ÖRNEKLER (bu kalıpla üret) ────────────────────
--
-- Aşağıdaki 10 örnek sistemdeki gerçek verilerden alınmıştır.
-- Format ve kaliteyi bu örneklerden anla.

INSERT INTO sentences (
  category_id, text_tr, text_en, text_sv, text_de, text_es, text_fr, text_pt,
  keywords_tr, keywords_en, keywords_sv, keywords_de, keywords_es, keywords_fr, keywords_pt,
  difficulty, is_free, sort_order
) VALUES

-- Örnek 1 — Günlük Konuşma / beginner
(1, '**Bu arada**, yarın serbest misin?',
    '**By the way**, are you free tomorrow?',
    '**Förresten**, är du ledig imorgon?',
    '**Übrigens**, bist du morgen frei?',
    '**Por cierto**, ¿mañana tienes libre?',
    '**Au fait**, tu es libre demain ?',
    '**Por sinal**, você está livre amanhã?',
    '["bu arada"]', '["by the way"]', '["förresten"]', '["übrigens"]',
    '["por cierto"]', '["au fait"]', '["por sinal"]',
    'beginner', true, 1),

-- Örnek 2 — Günlük Konuşma / beginner
(1, '**Tabii ki** sana yardım ederim, sor istediğini.',
    '**Of course** I''ll help you, just ask.',
    '**Självklart** hjälper jag dig, fråga bara.',
    '**Natürlich** helfe ich dir, frag einfach.',
    '**Por supuesto** que te ayudaré, solo pregunta.',
    '**Bien sûr** que je t''aide, demande juste.',
    '**Claro que** vou te ajudar, é só perguntar.',
    '["tabii ki"]', '["of course"]', '["självklart"]', '["natürlich"]',
    '["por supuesto"]', '["bien sûr"]', '["claro que"]',
    'beginner', true, 10),

-- Örnek 3 — Günlük Konuşma / intermediate
(1, '**Nasıl oluyor** da bu kadar hızlı öğrenebiliyorsun?',
    '**How come** you can learn so fast?',
    '**Hur kommer det sig** att du kan lära dig så snabbt?',
    '**Wie kommt es**, dass du so schnell lernen kannst?',
    '**¿Cómo es posible** que puedas aprender tan rápido?',
    '**Comment se fait-il** que tu apprennes si vite ?',
    '**Como é possível** que você aprenda tão rápido?',
    '["nasıl oluyor"]', '["how come"]', '["hur kommer det sig"]', '["wie kommt es"]',
    '["¿cómo es posible"]', '["comment se fait-il"]', '["como é possível"]',
    'intermediate', true, 12),

-- Örnek 4 — Günlük Konuşma / advanced
(1, 'Bir şemsiye al, **her ihtimale karşı**.',
    'Take an umbrella, **just in case**.',
    'Ta ett paraply, **för säkerhets skull**.',
    'Nimm einen Regenschirm mit, **für alle Fälle**.',
    'Lleva un paraguas, **por si acaso**.',
    'Prends un parapluie, **au cas où**.',
    'Leve um guarda-chuva, **só para garantir**.',
    '["her ihtimale karşı"]', '["just in case"]', '["för säkerhets skull"]', '["für alle Fälle"]',
    '["por si acaso"]', '["au cas où"]', '["só para garantir"]',
    'advanced', true, 26),

-- Örnek 5 — İş İngilizcesi / beginner
(2, 'Araştırıp **size geri döneceğim**.',
    'I''ll look into it and **get back to you**.',
    'Jag ska undersöka det och **återkomma till dig**.',
    'Ich werde das prüfen und mich **bei Ihnen melden**.',
    'Lo investigaré y **me pondré en contacto** contigo.',
    'Je vais me renseigner et **vous recontacterai**.',
    'Vou verificar e **retornarei para você**.',
    '["size geri döneceğim"]', '["get back to you"]', '["återkomma till dig"]', '["bei Ihnen melden"]',
    '["me pondré en contacto"]', '["vous recontacterai"]', '["retornarei para você"]',
    'beginner', true, 31),

-- Örnek 6 — İş İngilizcesi / intermediate
(2, 'Seni **gelişmelerden haberdar** edeceğim.',
    'I''ll keep you **in the loop**.',
    'Jag håller dig **informerad**.',
    'Ich werde dich **auf dem Laufenden** halten.',
    'Te mantendré **al tanto** de los avances.',
    'Je te tiendrai **au courant** des développements.',
    'Vou te manter **a par** dos desenvolvimentos.',
    '["gelişmelerden haberdar"]', '["in the loop"]', '["informerad"]', '["auf dem Laufenden"]',
    '["al tanto"]', '["au courant"]', '["a par"]',
    'intermediate', true, 47),

-- Örnek 7 — İş İngilizcesi / advanced
(2, 'Şimdi **önemli olan** sonuçları konuşalım.',
    'Let''s **cut to the chase** and discuss results.',
    'Låt oss **gå rakt på sak** och diskutera resultaten.',
    'Lass uns **auf den Punkt kommen** und die Ergebnisse besprechen.',
    'Vamos **ir al grano** y hablar de los resultados.',
    'Allons **droit au but** et parlons des résultats.',
    'Vamos **direto ao ponto** e discutir os resultados.',
    '["önemli olan"]', '["cut to the chase"]', '["gå rakt på sak"]', '["auf den Punkt kommen"]',
    '["ir al grano"]', '["droit au but"]', '["direto ao ponto"]',
    'advanced', true, 58),

-- Örnek 8 — Phrasal Verbs / beginner
(3, 'Işığı **açar mısın**?',
    'Can you **turn on** the light?',
    'Kan du **sätta på** ljuset?',
    'Kannst du das Licht **einschalten**?',
    '¿Puedes **encender** la luz?',
    'Tu peux **allumer** la lumière ?',
    'Você pode **acender** a luz?',
    '["açar mısın"]', '["turn on"]', '["sätta på"]', '["einschalten"]',
    '["encender"]', '["allumer"]', '["acender"]',
    'beginner', false, 61),

-- Örnek 9 — Günlük Konuşma / intermediate (** cümle ortasında)
(1, 'Geç kaldım, özür dilerim. — **Boşver**, önemli değil.',
    'I''m late, I''m sorry. — **Never mind**, it''s okay.',
    'Jag är sen, förlåt. — **Strunta i det**, det är okej.',
    'Ich bin spät, tut mir leid. — **Macht nichts**, ist okay.',
    'Llego tarde, lo siento. — **No importa**, está bien.',
    'Je suis en retard, désolé. — **Peu importe**, c''est ok.',
    'Estou atrasado, desculpe. — **Não tem problema**, tudo bem.',
    '["boşver"]', '["never mind"]', '["strunta i det"]', '["macht nichts"]',
    '["no importa"]', '["peu importe"]', '["não tem problema"]',
    'intermediate', true, 16),

-- Örnek 10 — Günlük Konuşma / advanced (** cümle sonunda)
(1, 'Pahalı, **bunun yanı sıra** çok uzakta da.',
    'It''s expensive, **besides** it''s very far away.',
    'Det är dyrt, **dessutom** är det väldigt långt bort.',
    'Es ist teuer, **außerdem** ist es sehr weit entfernt.',
    'Es caro, **además** está muy lejos.',
    'C''est cher, **de plus** c''est très loin.',
    'É caro, **além disso** fica muito longe.',
    '["bunun yanı sıra"]', '["besides"]', '["dessutom"]', '["außerdem"]',
    '["además"]', '["de plus"]', '["além disso"]',
    'advanced', true, 27);

-- ── ŞİMDİ SENDEN İSTEDİĞİMİZ ─────────────────────────────
--
-- Yukarıdaki kurallara ve örneklere bakarak şunu üret:
--
--   KATEGORİ: [buraya kategori adı ve ID'si yaz, örn: "Günlük Konuşma (category_id=1)"]
--   ADET: [kaç cümle istediğini yaz, örn: "10 cümle"]
--   DIFFICULTY DAĞILIMI: [örn: "3 beginner, 4 intermediate, 3 advanced"]
--   KONU/TEMA (opsiyonel): [örn: "zaman ifadeleri", "kibarca reddetme", "serbest"]
--   SORT_ORDER BAŞLANGICI: [mevcut son + 1, örn: "31'den başla"]
--
-- ÇIKTI FORMAT: Sadece çalıştırılabilir SQL INSERT bloğu.
-- Ürettiğin her cümle için:
--   ✓ 7 dilde text_* ve keywords_* doldurulmuş olmalı
--   ✓ ** işaretleri doğru yerleştirilmiş olmalı
--   ✓ keywords sadece ** arasındaki ifadeyi içermeli
--   ✓ Her dilde ifade o dile en doğal karşılığıyla yazılmalı
--   ✓ SQL apostrof kuralına uyulmalı ('')
