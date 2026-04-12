begin;

-- ============================================================
-- FIRST 5 DIALOG SCENARIOS - EASY BATCH 01
-- Categories used from current DB UUIDs provided by user
-- ============================================================

-- ============================================================
-- 1) greetings-introductions / easy
-- Scenario: introducing yourself at a language course
-- ============================================================

insert into public.dialog_scenarios (
  id,
  category_id,
  slug,
  difficulty,
  is_premium,
  is_active,
  order_index,
  estimated_seconds,
  turn_count,
  character_name,
  character_role,
  qa_status,
  content_version,
  title_tr, title_en, title_sv, title_de, title_es, title_fr, title_pt,
  summary_tr, summary_en, summary_sv, summary_de, summary_es, summary_fr, summary_pt,
  user_goal_tr, user_goal_en, user_goal_sv, user_goal_de, user_goal_es, user_goal_fr, user_goal_pt
) values (
  '11111111-1111-4111-8111-111111111111',
  '499ece2e-7b06-4358-a721-547eeb12783c',
  'greetings-language-course-introduce-yourself-easy-01',
  1,
  false,
  true,
  1,
  75,
  5,
  'Emma',
  'classmate',
  'approved',
  1,
  'Dil kursunda kendini tanıtma',
  'Introducing yourself at a language course',
  'Presentera dig på en språkkurs',
  'Sich in einem Sprachkurs vorstellen',
  'Presentarte en un curso de idiomas',
  'Se présenter dans un cours de langue',
  'Apresentar-se em um curso de idiomas',
  'Kullanıcının dil kursunda kendini tanıtmayı ve temel sorulara cevap vermeyi öğrenmesi.',
  'The user learns to introduce themselves and answer basic questions in a language course.',
  'Användaren lär sig att presentera sig och svara på grundläggande frågor på en språkkurs.',
  'Der Nutzer lernt, sich in einem Sprachkurs vorzustellen und einfache Fragen zu beantworten.',
  'El usuario aprende a presentarse y responder preguntas básicas en un curso de idiomas.',
  'L’utilisateur apprend à se présenter et à répondre à des questions simples dans un cours de langue.',
  'O usuário aprende a se apresentar e responder perguntas básicas em um curso de idiomas.',
  'Kendini tanıtmak ve kısa bir ilk konuşmayı tamamlamak',
  'Introduce yourself and complete a short first conversation',
  'Presentera dig själv och avsluta ett kort första samtal',
  'Sich vorstellen und ein kurzes erstes Gespräch abschließen',
  'Presentarte y completar una breve primera conversación',
  'Te présenter et terminer une courte première conversation',
  'Apresentar-se e completar uma curta primeira conversa'
);

insert into public.dialog_turns (
  id,
  scenario_id,
  turn_index,
  speaker_type,
  prompt_type,
  grammar_focus,
  vocabulary_focus,
  message_tr, message_en, message_sv, message_de, message_es, message_fr, message_pt
) values
(
  '11111111-1111-4111-8111-111111111201',
  '11111111-1111-4111-8111-111111111111',
  1,
  'character',
  'greeting',
  'basic_greeting',
  'introductions',
  'Merhaba! Ben Emma. Senin adın ne?',
  'Hi! I''m Emma. What''s your name?',
  'Hej! Jag heter Emma. Vad heter du?',
  'Hallo! Ich bin Emma. Wie heißt du?',
  '¡Hola! Soy Emma. ¿Cómo te llamas?',
  'Salut ! Je m''appelle Emma. Comment tu t''appelles ?',
  'Oi! Eu sou Emma. Como você se chama?'
),
(
  '11111111-1111-4111-8111-111111111202',
  '11111111-1111-4111-8111-111111111111',
  2,
  'character',
  'origin_question',
  'to_be_from',
  'countries',
  'Tanıştığımıza memnun oldum. Nerelisin?',
  'Nice to meet you. Where are you from?',
  'Trevligt att träffas. Var kommer du ifrån?',
  'Freut mich. Woher kommst du?',
  'Encantada de conocerte. ¿De dónde eres?',
  'Enchantée de te rencontrer. D''où viens-tu ?',
  'Prazer em conhecer você. De onde você é?'
),
(
  '11111111-1111-4111-8111-111111111203',
  '11111111-1111-4111-8111-111111111111',
  3,
  'character',
  'language_question',
  'speak_language',
  'languages',
  'Burada hangi dili öğreniyorsun?',
  'Which language are you learning here?',
  'Vilket språk lär du dig här?',
  'Welche Sprache lernst du hier?',
  '¿Qué idioma estás aprendiendo aquí?',
  'Quelle langue apprends-tu ici ?',
  'Que idioma você está aprendendo aqui?'
),
(
  '11111111-1111-4111-8111-111111111204',
  '11111111-1111-4111-8111-111111111111',
  4,
  'character',
  'small_talk',
  'like_enjoy',
  'class_experience',
  'Ders hoşuna gidiyor mu?',
  'Do you like the class?',
  'Tycker du om kursen?',
  'Gefällt dir der Kurs?',
  '¿Te gusta la clase?',
  'Tu aimes le cours ?',
  'Você gosta da aula?'
),
(
  '11111111-1111-4111-8111-111111111205',
  '11111111-1111-4111-8111-111111111111',
  5,
  'character',
  'closing',
  'simple_closing',
  'introductions',
  'Harika. Sonra görüşürüz!',
  'Great. See you later!',
  'Bra. Vi ses senare!',
  'Super. Bis später!',
  'Genial. ¡Nos vemos luego!',
  'Super. À plus tard !',
  'Ótimo. Até mais tarde!'
);

insert into public.dialog_turn_options (
  id, turn_id, option_index, is_correct, distractor_type,
  text_tr, text_en, text_sv, text_de, text_es, text_fr, text_pt
) values
(
  '11111111-1111-4111-8111-111111112001',
  '11111111-1111-4111-8111-111111111201',
  1, true, null,
  'Benim adım Ali.',
  'My name is Ali.',
  'Jag heter Ali.',
  'Ich heiße Ali.',
  'Me llamo Ali.',
  'Je m''appelle Ali.',
  'Meu nome é Ali.'
),
(
  '11111111-1111-4111-8111-111111112002',
  '11111111-1111-4111-8111-111111111201',
  2, false, 'wrong_intent',
  'Ben Türkiye''denim.',
  'I''m from Turkey.',
  'Jag kommer från Turkiet.',
  'Ich komme aus der Türkei.',
  'Soy de Turquía.',
  'Je viens de Turquie.',
  'Eu sou da Turquia.'
),
(
  '11111111-1111-4111-8111-111111112003',
  '11111111-1111-4111-8111-111111111201',
  3, false, 'wrong_context',
  'Kahve istiyorum.',
  'I want a coffee.',
  'Jag vill ha kaffe.',
  'Ich möchte einen Kaffee.',
  'Quiero un café.',
  'Je veux un café.',
  'Eu quero um café.'
),

(
  '11111111-1111-4111-8111-111111112004',
  '11111111-1111-4111-8111-111111111202',
  1, true, null,
  'Ben Türkiye''denim.',
  'I''m from Turkey.',
  'Jag kommer från Turkiet.',
  'Ich komme aus der Türkei.',
  'Soy de Turquía.',
  'Je viens de Turquie.',
  'Eu sou da Turquia.'
),
(
  '11111111-1111-4111-8111-111111112005',
  '11111111-1111-4111-8111-111111111202',
  2, false, 'wrong_intent',
  'Benim adım Ali.',
  'My name is Ali.',
  'Jag heter Ali.',
  'Ich heiße Ali.',
  'Me llamo Ali.',
  'Je m''appelle Ali.',
  'Meu nome é Ali.'
),
(
  '11111111-1111-4111-8111-111111112006',
  '11111111-1111-4111-8111-111111111202',
  3, false, 'wrong_context',
  'İstasyona gidiyorum.',
  'I''m going to the station.',
  'Jag ska till stationen.',
  'Ich gehe zum Bahnhof.',
  'Voy a la estación.',
  'Je vais à la gare.',
  'Estou indo para a estação.'
),

(
  '11111111-1111-4111-8111-111111112007',
  '11111111-1111-4111-8111-111111111203',
  1, true, null,
  'İngilizce öğreniyorum.',
  'I''m learning English.',
  'Jag lär mig engelska.',
  'Ich lerne Englisch.',
  'Estoy aprendiendo inglés.',
  'J''apprends l''anglais.',
  'Estou aprendendo inglês.'
),
(
  '11111111-1111-4111-8111-111111112008',
  '11111111-1111-4111-8111-111111111203',
  2, false, 'near_context_wrong_intent',
  'Bu benim ilk dersim.',
  'This is my first class.',
  'Det här är min första lektion.',
  'Das ist mein erster Kurs.',
  'Esta es mi primera clase.',
  'C''est mon premier cours.',
  'Esta é minha primeira aula.'
),
(
  '11111111-1111-4111-8111-111111112009',
  '11111111-1111-4111-8111-111111111203',
  3, false, 'wrong_context',
  'Saat üçte başlıyor.',
  'It starts at three o''clock.',
  'Den börjar klockan tre.',
  'Es beginnt um drei Uhr.',
  'Empieza a las tres.',
  'Ça commence à trois heures.',
  'Começa às três.'
),

(
  '11111111-1111-4111-8111-111111112010',
  '11111111-1111-4111-8111-111111111204',
  1, true, null,
  'Evet, çok hoşuma gidiyor.',
  'Yes, I like it a lot.',
  'Ja, jag tycker om den mycket.',
  'Ja, er gefällt mir sehr.',
  'Sí, me gusta mucho.',
  'Oui, je l''aime beaucoup.',
  'Sim, eu gosto muito.'
),
(
  '11111111-1111-4111-8111-111111112011',
  '11111111-1111-4111-8111-111111111204',
  2, false, 'near_context_wrong_intent',
  'Öğretmen çok nazik.',
  'The teacher is very kind.',
  'Läraren är väldigt snäll.',
  'Der Lehrer ist sehr nett.',
  'La profesora es muy amable.',
  'Le professeur est très gentil.',
  'A professora é muito gentil.'
),
(
  '11111111-1111-4111-8111-111111112012',
  '11111111-1111-4111-8111-111111111204',
  3, false, 'wrong_context',
  'Otobüsü kaçırdım.',
  'I missed the bus.',
  'Jag missade bussen.',
  'Ich habe den Bus verpasst.',
  'Perdí el autobús.',
  'J''ai raté le bus.',
  'Perdi o ônibus.'
),

(
  '11111111-1111-4111-8111-111111112013',
  '11111111-1111-4111-8111-111111111205',
  1, true, null,
  'Görüşürüz!',
  'See you!',
  'Vi ses!',
  'Bis dann!',
  '¡Nos vemos!',
  'À bientôt !',
  'Até logo!'
),
(
  '11111111-1111-4111-8111-111111112014',
  '11111111-1111-4111-8111-111111111205',
  2, false, 'wrong_intent',
  'Tekrar eder misin?',
  'Can you repeat that?',
  'Kan du upprepa det?',
  'Kannst du das wiederholen?',
  '¿Puedes repetir eso?',
  'Tu peux répéter ?',
  'Você pode repetir isso?'
),
(
  '11111111-1111-4111-8111-111111112015',
  '11111111-1111-4111-8111-111111111205',
  3, false, 'wrong_context',
  'Kartla ödeyebilir miyim?',
  'Can I pay by card?',
  'Kan jag betala med kort?',
  'Kann ich mit Karte bezahlen?',
  '¿Puedo pagar con tarjeta?',
  'Je peux payer par carte ?',
  'Posso pagar com cartão?'
);

-- ============================================================
-- 2) cafe-restaurant / easy
-- Scenario: ordering a coffee to go
-- ============================================================

insert into public.dialog_scenarios (
  id,
  category_id,
  slug,
  difficulty,
  is_premium,
  is_active,
  order_index,
  estimated_seconds,
  turn_count,
  character_name,
  character_role,
  qa_status,
  content_version,
  title_tr, title_en, title_sv, title_de, title_es, title_fr, title_pt,
  summary_tr, summary_en, summary_sv, summary_de, summary_es, summary_fr, summary_pt,
  user_goal_tr, user_goal_en, user_goal_sv, user_goal_de, user_goal_es, user_goal_fr, user_goal_pt
) values (
  '22222222-2222-4222-8222-222222222222',
  'fe819bad-497b-4325-8f14-789c5c55790e',
  'cafe-order-coffee-to-go-easy-01',
  1,
  false,
  true,
  2,
  80,
  5,
  'Lucas',
  'barista',
  'approved',
  1,
  'Paket kahve siparişi verme',
  'Ordering a coffee to go',
  'Beställa kaffe att ta med',
  'Einen Kaffee zum Mitnehmen bestellen',
  'Pedir un café para llevar',
  'Commander un café à emporter',
  'Pedir um café para viagem',
  'Kullanıcının kafede paket kahve siparişi vermeyi öğrenmesi.',
  'The user learns to order a coffee to go at a cafe.',
  'Användaren lär sig att beställa kaffe att ta med på ett kafé.',
  'Der Nutzer lernt, in einem Café einen Kaffee zum Mitnehmen zu bestellen.',
  'El usuario aprende a pedir un café para llevar en una cafetería.',
  'L’utilisateur apprend à commander un café à emporter dans un café.',
  'O usuário aprende a pedir um café para viagem em um café.',
  'Paket kahve siparişi vermek ve siparişi tamamlamak',
  'Order a coffee to go and complete the order',
  'Beställa kaffe att ta med och slutföra beställningen',
  'Einen Kaffee zum Mitnehmen bestellen und die Bestellung abschließen',
  'Pedir un café para llevar y completar el pedido',
  'Commander un café à emporter et terminer la commande',
  'Pedir um café para viagem e concluir o pedido'
);

insert into public.dialog_turns (
  id,
  scenario_id,
  turn_index,
  speaker_type,
  prompt_type,
  grammar_focus,
  vocabulary_focus,
  message_tr, message_en, message_sv, message_de, message_es, message_fr, message_pt
) values
(
  '22222222-2222-4222-8222-222222222301',
  '22222222-2222-4222-8222-222222222222',
  1,
  'character',
  'order_start',
  'polite_request',
  'cafe_order',
  'Merhaba! Ne istersiniz?',
  'Hello! What would you like?',
  'Hej! Vad vill du ha?',
  'Hallo! Was möchten Sie?',
  '¡Hola! ¿Qué le gustaría?',
  'Bonjour ! Que voulez-vous ?',
  'Olá! O que você gostaria?'
),
(
  '22222222-2222-4222-8222-222222222302',
  '22222222-2222-4222-8222-222222222222',
  2,
  'character',
  'size_question',
  'choice_question',
  'drink_size',
  'Tabii. Hangi boy olsun?',
  'Sure. What size would you like?',
  'Självklart. Vilken storlek vill du ha?',
  'Natürlich. Welche Größe möchten Sie?',
  'Claro. ¿Qué tamaño le gustaría?',
  'Bien sûr. Quelle taille voulez-vous ?',
  'Claro. Que tamanho você gostaria?'
),
(
  '22222222-2222-4222-8222-222222222303',
  '22222222-2222-4222-8222-222222222222',
  3,
  'character',
  'takeaway_question',
  'yes_no_answer',
  'takeaway',
  'Burada mı içeceksiniz, paket mi olsun?',
  'For here or to go?',
  'Här eller att ta med?',
  'Hier oder zum Mitnehmen?',
  '¿Para aquí o para llevar?',
  'Sur place ou à emporter ?',
  'Para aqui ou para viagem?'
),
(
  '22222222-2222-4222-8222-222222222304',
  '22222222-2222-4222-8222-222222222222',
  4,
  'character',
  'payment_question',
  'payment_method',
  'cafe_payment',
  'Tamam. Başka bir şey ister misiniz?',
  'Okay. Would you like anything else?',
  'Okej. Vill du ha något mer?',
  'Okay. Möchten Sie noch etwas?',
  'Bien. ¿Quiere algo más?',
  'D''accord. Vous voulez autre chose ?',
  'Certo. Você quer mais alguma coisa?'
),
(
  '22222222-2222-4222-8222-222222222305',
  '22222222-2222-4222-8222-222222222222',
  5,
  'character',
  'closing',
  'simple_response',
  'pickup_closing',
  'Harika. Kahveniz birazdan hazır olacak.',
  'Great. Your coffee will be ready in a moment.',
  'Bra. Ditt kaffe blir klart om en stund.',
  'Super. Ihr Kaffee ist gleich fertig.',
  'Perfecto. Su café estará listo en un momento.',
  'Parfait. Votre café sera prêt dans un instant.',
  'Ótimo. Seu café ficará pronto em instantes.'
);

insert into public.dialog_turn_options (
  id, turn_id, option_index, is_correct, distractor_type,
  text_tr, text_en, text_sv, text_de, text_es, text_fr, text_pt
) values
(
  '22222222-2222-4222-8222-222222223001',
  '22222222-2222-4222-8222-222222222301',
  1, true, null,
  'Bir kahve istiyorum, lütfen.',
  'I''d like a coffee, please.',
  'Jag skulle vilja ha en kaffe, tack.',
  'Ich hätte gern einen Kaffee, bitte.',
  'Quisiera un café, por favor.',
  'Je voudrais un café, s''il vous plaît.',
  'Eu gostaria de um café, por favor.'
),
(
  '22222222-2222-4222-8222-222222223002',
  '22222222-2222-4222-8222-222222222301',
  2, false, 'near_context_wrong_intent',
  'Menüyü görebilir miyim?',
  'Can I see the menu?',
  'Kan jag få se menyn?',
  'Kann ich die Speisekarte sehen?',
  '¿Puedo ver el menú?',
  'Je peux voir le menu ?',
  'Posso ver o cardápio?'
),
(
  '22222222-2222-4222-8222-222222223003',
  '22222222-2222-4222-8222-222222222301',
  3, false, 'wrong_context',
  'Tren istasyonu nerede?',
  'Where is the train station?',
  'Var ligger tågstationen?',
  'Wo ist der Bahnhof?',
  '¿Dónde está la estación de tren?',
  'Où est la gare ?',
  'Onde fica a estação de trem?'
),

(
  '22222222-2222-4222-8222-222222223004',
  '22222222-2222-4222-8222-222222222302',
  1, true, null,
  'Orta boy olsun, lütfen.',
  'Medium, please.',
  'Mellan, tack.',
  'Mittel, bitte.',
  'Mediano, por favor.',
  'Moyen, s''il vous plaît.',
  'Médio, por favor.'
),
(
  '22222222-2222-4222-8222-222222223005',
  '22222222-2222-4222-8222-222222222302',
  2, false, 'near_context_wrong_intent',
  'Sütlü olsun, lütfen.',
  'With milk, please.',
  'Med mjölk, tack.',
  'Mit Milch, bitte.',
  'Con leche, por favor.',
  'Avec du lait, s''il vous plaît.',
  'Com leite, por favor.'
),
(
  '22222222-2222-4222-8222-222222223006',
  '22222222-2222-4222-8222-222222222302',
  3, false, 'wrong_context',
  'Ben arkadaşımı bekliyorum.',
  'I''m waiting for my friend.',
  'Jag väntar på min vän.',
  'Ich warte auf meinen Freund.',
  'Estoy esperando a mi amigo.',
  'J''attends mon ami.',
  'Estou esperando meu amigo.'
),

(
  '22222222-2222-4222-8222-222222223007',
  '22222222-2222-4222-8222-222222222303',
  1, true, null,
  'Paket olsun, lütfen.',
  'To go, please.',
  'Att ta med, tack.',
  'Zum Mitnehmen, bitte.',
  'Para llevar, por favor.',
  'À emporter, s''il vous plaît.',
  'Para viagem, por favor.'
),
(
  '22222222-2222-4222-8222-222222223008',
  '22222222-2222-4222-8222-222222222303',
  2, false, 'near_context_wrong_intent',
  'Burada oturmak istiyorum.',
  'I want to sit here.',
  'Jag vill sitta här.',
  'Ich möchte hier sitzen.',
  'Quiero sentarme aquí.',
  'Je veux m''asseoir ici.',
  'Quero sentar aqui.'
),
(
  '22222222-2222-4222-8222-222222223009',
  '22222222-2222-4222-8222-222222222303',
  3, false, 'wrong_context',
  'Saat kaçta kapanıyorsunuz?',
  'What time do you close?',
  'Vilken tid stänger ni?',
  'Wann schließen Sie?',
  '¿A qué hora cierran?',
  'Vous fermez à quelle heure ?',
  'Que horas vocês fecham?'
),

(
  '22222222-2222-4222-8222-222222223010',
  '22222222-2222-4222-8222-222222222304',
  1, true, null,
  'Hayır, bu kadar.',
  'No, that''s all.',
  'Nej, det är allt.',
  'Nein, das ist alles.',
  'No, eso es todo.',
  'Non, c''est tout.',
  'Não, só isso.'
),
(
  '22222222-2222-4222-8222-222222223011',
  '22222222-2222-4222-8222-222222222304',
  2, false, 'near_context_wrong_intent',
  'Kartla ödeyebilir miyim?',
  'Can I pay by card?',
  'Kan jag betala med kort?',
  'Kann ich mit Karte bezahlen?',
  '¿Puedo pagar con tarjeta?',
  'Je peux payer par carte ?',
  'Posso pagar com cartão?'
),
(
  '22222222-2222-4222-8222-222222223012',
  '22222222-2222-4222-8222-222222222304',
  3, false, 'wrong_context',
  'Bir otel arıyorum.',
  'I''m looking for a hotel.',
  'Jag letar efter ett hotell.',
  'Ich suche ein Hotel.',
  'Estoy buscando un hotel.',
  'Je cherche un hôtel.',
  'Estou procurando um hotel.'
),

(
  '22222222-2222-4222-8222-222222223013',
  '22222222-2222-4222-8222-222222222305',
  1, true, null,
  'Teşekkür ederim.',
  'Thank you.',
  'Tack.',
  'Danke.',
  'Gracias.',
  'Merci.',
  'Obrigado.'
),
(
  '22222222-2222-4222-8222-222222223014',
  '22222222-2222-4222-8222-222222222305',
  2, false, 'wrong_intent',
  'Şekersiz olsun.',
  'No sugar, please.',
  'Utan socker, tack.',
  'Ohne Zucker, bitte.',
  'Sin azúcar, por favor.',
  'Sans sucre, s''il vous plaît.',
  'Sem açúcar, por favor.'
),
(
  '22222222-2222-4222-8222-222222223015',
  '22222222-2222-4222-8222-222222222305',
  3, false, 'wrong_context',
  'Bugün hava çok güzel.',
  'The weather is very nice today.',
  'Det är fint väder idag.',
  'Das Wetter ist heute sehr schön.',
  'Hace muy buen tiempo hoy.',
  'Il fait très beau aujourd''hui.',
  'O tempo está muito bom hoje.'
);

-- ============================================================
-- 3) shopping-store / easy
-- Scenario: asking for a T-shirt in another size
-- ============================================================

insert into public.dialog_scenarios (
  id,
  category_id,
  slug,
  difficulty,
  is_premium,
  is_active,
  order_index,
  estimated_seconds,
  turn_count,
  character_name,
  character_role,
  qa_status,
  content_version,
  title_tr, title_en, title_sv, title_de, title_es, title_fr, title_pt,
  summary_tr, summary_en, summary_sv, summary_de, summary_es, summary_fr, summary_pt,
  user_goal_tr, user_goal_en, user_goal_sv, user_goal_de, user_goal_es, user_goal_fr, user_goal_pt
) values (
  '33333333-3333-4333-8333-333333333333',
  'b7f18d1f-b22e-447f-8364-2b5bb7e2962b',
  'shopping-ask-for-another-size-easy-01',
  1,
  false,
  true,
  3,
  85,
  5,
  'Sofia',
  'store_assistant',
  'approved',
  1,
  'Başka beden isteme',
  'Asking for another size',
  'Be om en annan storlek',
  'Nach einer anderen Größe fragen',
  'Pedir otra talla',
  'Demander une autre taille',
  'Pedir outro tamanho',
  'Kullanıcının mağazada başka bir beden istemeyi öğrenmesi.',
  'The user learns to ask for another size in a store.',
  'Användaren lär sig att be om en annan storlek i en butik.',
  'Der Nutzer lernt, in einem Geschäft nach einer anderen Größe zu fragen.',
  'El usuario aprende a pedir otra talla en una tienda.',
  'L’utilisateur apprend à demander une autre taille dans un magasin.',
  'O usuário aprende a pedir outro tamanho em uma loja.',
  'Bir ürün için başka beden istemek ve satın alma kararını tamamlamak',
  'Ask for another size and complete a simple shopping interaction',
  'Be om en annan storlek och avsluta en enkel köpsituation',
  'Nach einer anderen Größe fragen und eine einfache Kaufsituation abschließen',
  'Pedir otra talla y completar una interacción simple de compra',
  'Demander une autre taille et terminer une interaction d’achat simple',
  'Pedir outro tamanho e concluir uma interação simples de compra'
);

insert into public.dialog_turns (
  id, scenario_id, turn_index, speaker_type, prompt_type, grammar_focus, vocabulary_focus,
  message_tr, message_en, message_sv, message_de, message_es, message_fr, message_pt
) values
(
  '33333333-3333-4333-8333-333333333401',
  '33333333-3333-4333-8333-333333333333',
  1, 'character', 'offer_help', 'can_i_help', 'shopping_help',
  'Merhaba, yardımcı olabilir miyim?',
  'Hello, can I help you?',
  'Hej, kan jag hjälpa dig?',
  'Hallo, kann ich Ihnen helfen?',
  'Hola, ¿puedo ayudarle?',
  'Bonjour, puis-je vous aider ?',
  'Olá, posso ajudar você?'
),
(
  '33333333-3333-4333-8333-333333333402',
  '33333333-3333-4333-8333-333333333333',
  2, 'character', 'size_question', 'have_in_size', 'clothing_sizes',
  'Elbette. Hangi beden lazım?',
  'Of course. What size do you need?',
  'Självklart. Vilken storlek behöver du?',
  'Natürlich. Welche Größe brauchen Sie?',
  'Claro. ¿Qué talla necesita?',
  'Bien sûr. Quelle taille vous faut-il ?',
  'Claro. Que tamanho você precisa?'
),
(
  '33333333-3333-4333-8333-333333333403',
  '33333333-3333-4333-8333-333333333333',
  3, 'character', 'availability', 'store_availability', 'shopping_stock',
  'Bir bakayım. Başka bir renk ister misiniz?',
  'Let me check. Would you like another color?',
  'Låt mig titta. Vill du ha en annan färg?',
  'Ich schaue mal nach. Möchten Sie eine andere Farbe?',
  'Déjeme comprobarlo. ¿Quiere otro color?',
  'Je vais vérifier. Vous voulez une autre couleur ?',
  'Deixe-me verificar. Você quer outra cor?'
),
(
  '33333333-3333-4333-8333-333333333404',
  '33333333-3333-4333-8333-333333333333',
  4, 'character', 'availability_result', 'simple_preference', 'shopping_choice',
  'Siyahı var. Denemek ister misiniz?',
  'We have it in black. Would you like to try it on?',
  'Vi har den i svart. Vill du prova den?',
  'Wir haben sie in Schwarz. Möchten Sie sie anprobieren?',
  'La tenemos en negro. ¿Quiere probársela?',
  'Nous l''avons en noir. Voulez-vous l''essayer ?',
  'Temos na cor preta. Você quer experimentar?'
),
(
  '33333333-3333-4333-8333-333333333405',
  '33333333-3333-4333-8333-333333333333',
  5, 'character', 'closing', 'purchase_closing', 'shopping_checkout',
  'Tamam. Kabin şurada.',
  'Okay. The fitting room is over there.',
  'Okej. Provhytten är där borta.',
  'Okay. Die Umkleidekabine ist dort drüben.',
  'Bien. El probador está allí.',
  'D''accord. La cabine est là-bas.',
  'Certo. O provador é ali.'
);

insert into public.dialog_turn_options (
  id, turn_id, option_index, is_correct, distractor_type,
  text_tr, text_en, text_sv, text_de, text_es, text_fr, text_pt
) values
(
  '33333333-3333-4333-8333-333333334001',
  '33333333-3333-4333-8333-333333333401',
  1, true, null,
  'Evet, bunun daha büyük bedeni var mı?',
  'Yes, do you have this in a larger size?',
  'Ja, har ni den här i en större storlek?',
  'Ja, haben Sie das in einer größeren Größe?',
  'Sí, ¿tiene esto en una talla más grande?',
  'Oui, vous l''avez dans une taille plus grande ?',
  'Sim, você tem isso em um tamanho maior?'
),
(
  '33333333-3333-4333-8333-333333334002',
  '33333333-3333-4333-8333-333333333401',
  2, false, 'near_context_wrong_intent',
  'Bunun fiyatı ne kadar?',
  'How much is this?',
  'Hur mycket kostar den här?',
  'Wie viel kostet das?',
  '¿Cuánto cuesta esto?',
  'Combien ça coûte ?',
  'Quanto custa isso?'
),
(
  '33333333-3333-4333-8333-333333334003',
  '33333333-3333-4333-8333-333333333401',
  3, false, 'wrong_context',
  'Ben bir taksi bekliyorum.',
  'I''m waiting for a taxi.',
  'Jag väntar på en taxi.',
  'Ich warte auf ein Taxi.',
  'Estoy esperando un taxi.',
  'J''attends un taxi.',
  'Estou esperando um táxi.'
),

(
  '33333333-3333-4333-8333-333333334004',
  '33333333-3333-4333-8333-333333333402',
  1, true, null,
  'Large beden lazım.',
  'I need a large.',
  'Jag behöver en storlek large.',
  'Ich brauche Größe L.',
  'Necesito una talla grande.',
  'Il me faut une taille L.',
  'Eu preciso do tamanho grande.'
),
(
  '33333333-3333-4333-8333-333333334005',
  '33333333-3333-4333-8333-333333333402',
  2, false, 'near_context_wrong_intent',
  'Mavi olanı tercih ederim.',
  'I prefer the blue one.',
  'Jag föredrar den blå.',
  'Ich bevorzuge die blaue.',
  'Prefiero la azul.',
  'Je préfère la bleue.',
  'Eu prefiro a azul.'
),
(
  '33333333-3333-4333-8333-333333334006',
  '33333333-3333-4333-8333-333333333402',
  3, false, 'wrong_context',
  'Bugün erken geldim.',
  'I came early today.',
  'Jag kom tidigt idag.',
  'Ich bin heute früh gekommen.',
  'Llegué temprano hoy.',
  'Je suis arrivé tôt aujourd''hui.',
  'Cheguei cedo hoje.'
),

(
  '33333333-3333-4333-8333-333333334007',
  '33333333-3333-4333-8333-333333333403',
  1, true, null,
  'Hayır, bu renk iyi.',
  'No, this color is fine.',
  'Nej, den här färgen är bra.',
  'Nein, diese Farbe ist gut.',
  'No, este color está bien.',
  'Non, cette couleur va bien.',
  'Não, esta cor está boa.'
),
(
  '33333333-3333-4333-8333-333333334008',
  '33333333-3333-4333-8333-333333333403',
  2, false, 'near_context_wrong_intent',
  'İndirim var mı?',
  'Is there a discount?',
  'Finns det rabatt?',
  'Gibt es einen Rabatt?',
  '¿Hay descuento?',
  'Y a-t-il une réduction ?',
  'Tem desconto?'
),
(
  '33333333-3333-4333-8333-333333334009',
  '33333333-3333-4333-8333-333333333403',
  3, false, 'wrong_context',
  'Ben eve gidiyorum.',
  'I''m going home.',
  'Jag går hem.',
  'Ich gehe nach Hause.',
  'Me voy a casa.',
  'Je rentre à la maison.',
  'Estou indo para casa.'
),

(
  '33333333-3333-4333-8333-333333334010',
  '33333333-3333-4333-8333-333333333404',
  1, true, null,
  'Evet, lütfen.',
  'Yes, please.',
  'Ja, tack.',
  'Ja, bitte.',
  'Sí, por favor.',
  'Oui, s''il vous plaît.',
  'Sim, por favor.'
),
(
  '33333333-3333-4333-8333-333333334011',
  '33333333-3333-4333-8333-333333333404',
  2, false, 'near_context_wrong_intent',
  'Kartla ödeyeceğim.',
  'I''ll pay by card.',
  'Jag betalar med kort.',
  'Ich zahle mit Karte.',
  'Pagaré con tarjeta.',
  'Je vais payer par carte.',
  'Vou pagar com cartão.'
),
(
  '33333333-3333-4333-8333-333333334012',
  '33333333-3333-4333-8333-333333333404',
  3, false, 'wrong_context',
  'Bir kahve istiyorum.',
  'I''d like a coffee.',
  'Jag skulle vilja ha en kaffe.',
  'Ich hätte gern einen Kaffee.',
  'Quiero un café.',
  'Je voudrais un café.',
  'Eu gostaria de um café.'
),

(
  '33333333-3333-4333-8333-333333334013',
  '33333333-3333-4333-8333-333333333405',
  1, true, null,
  'Teşekkür ederim.',
  'Thank you.',
  'Tack.',
  'Danke.',
  'Gracias.',
  'Merci.',
  'Obrigado.'
),
(
  '33333333-3333-4333-8333-333333334014',
  '33333333-3333-4333-8333-333333333405',
  2, false, 'wrong_intent',
  'Daha küçük bedeniniz var mı?',
  'Do you have a smaller size?',
  'Har ni en mindre storlek?',
  'Haben Sie eine kleinere Größe?',
  '¿Tiene una talla más pequeña?',
  'Vous avez une taille plus petite ?',
  'Você tem um tamanho menor?'
),
(
  '33333333-3333-4333-8333-333333334015',
  '33333333-3333-4333-8333-333333333405',
  3, false, 'wrong_context',
  'Otelim şehir merkezinde.',
  'My hotel is in the city center.',
  'Mitt hotell ligger i centrum.',
  'Mein Hotel ist im Stadtzentrum.',
  'Mi hotel está en el centro.',
  'Mon hôtel est au centre-ville.',
  'Meu hotel fica no centro da cidade.'
);

-- ============================================================
-- 4) directions-navigation / easy
-- Scenario: asking where the train station is
-- ============================================================

insert into public.dialog_scenarios (
  id,
  category_id,
  slug,
  difficulty,
  is_premium,
  is_active,
  order_index,
  estimated_seconds,
  turn_count,
  character_name,
  character_role,
  qa_status,
  content_version,
  title_tr, title_en, title_sv, title_de, title_es, title_fr, title_pt,
  summary_tr, summary_en, summary_sv, summary_de, summary_es, summary_fr, summary_pt,
  user_goal_tr, user_goal_en, user_goal_sv, user_goal_de, user_goal_es, user_goal_fr, user_goal_pt
) values (
  '44444444-4444-4444-8444-444444444444',
  'adf19cdc-3493-4d87-bf09-c29867a070ba',
  'directions-ask-for-train-station-easy-01',
  1,
  false,
  true,
  4,
  75,
  5,
  'Noah',
  'passerby',
  'approved',
  1,
  'Tren istasyonunu sorma',
  'Asking for the train station',
  'Fråga efter tågstationen',
  'Nach dem Bahnhof fragen',
  'Preguntar por la estación de tren',
  'Demander où est la gare',
  'Perguntar onde fica a estação de trem',
  'Kullanıcının birine tren istasyonunun yerini sormayı öğrenmesi.',
  'The user learns to ask someone where the train station is.',
  'Användaren lär sig att fråga någon var tågstationen ligger.',
  'Der Nutzer lernt, jemanden zu fragen, wo der Bahnhof ist.',
  'El usuario aprende a preguntar a alguien dónde está la estación de tren.',
  'L’utilisateur apprend à demander à quelqu’un où se trouve la gare.',
  'O usuário aprende a perguntar a alguém onde fica a estação de trem.',
  'Yol sormak, tarif almak ve konuşmayı kapatmak',
  'Ask for directions, understand the answer, and close the conversation',
  'Fråga efter vägen, förstå svaret och avsluta samtalet',
  'Nach dem Weg fragen, die Antwort verstehen und das Gespräch beenden',
  'Pedir indicaciones, entender la respuesta y cerrar la conversación',
  'Demander son chemin, comprendre la réponse et terminer la conversation',
  'Pedir direções, entender a resposta e encerrar a conversa'
);

insert into public.dialog_turns (
  id, scenario_id, turn_index, speaker_type, prompt_type, grammar_focus, vocabulary_focus,
  message_tr, message_en, message_sv, message_de, message_es, message_fr, message_pt
) values
(
  '44444444-4444-4444-8444-444444444501',
  '44444444-4444-4444-8444-444444444444',
  1, 'character', 'offer_help', 'can_i_help', 'directions',
  'Merhaba. Yardımcı olabilir miyim?',
  'Hello. Can I help you?',
  'Hej. Kan jag hjälpa dig?',
  'Hallo. Kann ich Ihnen helfen?',
  'Hola. ¿Puedo ayudarle?',
  'Bonjour. Puis-je vous aider ?',
  'Olá. Posso ajudar você?'
),
(
  '44444444-4444-4444-8444-444444444502',
  '44444444-4444-4444-8444-444444444444',
  2, 'character', 'direction_answer', 'location_preposition', 'station_directions',
  'Evet, tabii. Düz gidin ve sola dönün.',
  'Yes, of course. Go straight and turn left.',
  'Ja, självklart. Gå rakt fram och sväng vänster.',
  'Ja, natürlich. Gehen Sie geradeaus und biegen Sie links ab.',
  'Sí, claro. Siga recto y gire a la izquierda.',
  'Oui, bien sûr. Allez tout droit et tournez à gauche.',
  'Sim, claro. Siga em frente e vire à esquerda.'
),
(
  '44444444-4444-4444-8444-444444444503',
  '44444444-4444-4444-8444-444444444444',
  3, 'character', 'distance_info', 'distance_question', 'location_distance',
  'Oradan yaklaşık beş dakika sürer.',
  'It takes about five minutes from there.',
  'Det tar ungefär fem minuter därifrån.',
  'Von dort dauert es ungefähr fünf Minuten.',
  'Desde allí tarda unos cinco minutos.',
  'À partir de là, cela prend environ cinq minutes.',
  'A partir dali, leva cerca de cinco minutos.'
),
(
  '44444444-4444-4444-8444-444444444504',
  '44444444-4444-4444-8444-444444444444',
  4, 'character', 'landmark_info', 'landmark_reference', 'navigation_landmarks',
  'İstasyonu sol tarafta göreceksiniz.',
  'You will see the station on the left.',
  'Du kommer att se stationen på vänster sida.',
  'Sie werden den Bahnhof auf der linken Seite sehen.',
  'Verá la estación a la izquierda.',
  'Vous verrez la gare sur la gauche.',
  'Você verá a estação à esquerda.'
),
(
  '44444444-4444-4444-8444-444444444505',
  '44444444-4444-4444-8444-444444444444',
  5, 'character', 'closing', 'simple_closing', 'thanks_closing',
  'Rica ederim.',
  'You''re welcome.',
  'Varsågod.',
  'Gern geschehen.',
  'De nada.',
  'De rien.',
  'De nada.'
);

insert into public.dialog_turn_options (
  id, turn_id, option_index, is_correct, distractor_type,
  text_tr, text_en, text_sv, text_de, text_es, text_fr, text_pt
) values
(
  '44444444-4444-4444-8444-444444445001',
  '44444444-4444-4444-8444-444444444501',
  1, true, null,
  'Evet, tren istasyonu nerede?',
  'Yes, where is the train station?',
  'Ja, var ligger tågstationen?',
  'Ja, wo ist der Bahnhof?',
  'Sí, ¿dónde está la estación de tren?',
  'Oui, où est la gare ?',
  'Sim, onde fica a estação de trem?'
),
(
  '44444444-4444-4444-8444-444444445002',
  '44444444-4444-4444-8444-444444444501',
  2, false, 'near_context_wrong_intent',
  'Burada park edebilir miyim?',
  'Can I park here?',
  'Kan jag parkera här?',
  'Kann ich hier parken?',
  '¿Puedo aparcar aquí?',
  'Je peux me garer ici ?',
  'Posso estacionar aqui?'
),
(
  '44444444-4444-4444-8444-444444445003',
  '44444444-4444-4444-8444-444444444501',
  3, false, 'wrong_context',
  'Bir kahve istiyorum.',
  'I''d like a coffee.',
  'Jag skulle vilja ha en kaffe.',
  'Ich hätte gern einen Kaffee.',
  'Quiero un café.',
  'Je voudrais un café.',
  'Eu gostaria de um café.'
),

(
  '44444444-4444-4444-8444-444444445004',
  '44444444-4444-4444-8444-444444444502',
  1, true, null,
  'Teşekkür ederim.',
  'Thank you.',
  'Tack.',
  'Danke.',
  'Gracias.',
  'Merci.',
  'Obrigado.'
),
(
  '44444444-4444-4444-8444-444444445005',
  '44444444-4444-4444-8444-444444444502',
  2, false, 'near_context_wrong_intent',
  'Sağa mı döneyim?',
  'Should I turn right?',
  'Ska jag svänga höger?',
  'Soll ich rechts abbiegen?',
  '¿Debo girar a la derecha?',
  'Je dois tourner à droite ?',
  'Devo virar à direita?'
),
(
  '44444444-4444-4444-8444-444444445006',
  '44444444-4444-4444-8444-444444444502',
  3, false, 'wrong_context',
  'Ben burada çalışıyorum.',
  'I work here.',
  'Jag jobbar här.',
  'Ich arbeite hier.',
  'Trabajo aquí.',
  'Je travaille ici.',
  'Eu trabalho aqui.'
),

(
  '44444444-4444-4444-8444-444444445007',
  '44444444-4444-4444-8444-444444444503',
  1, true, null,
  'Yakınmış.',
  'That''s close.',
  'Det är nära.',
  'Das ist nah.',
  'Está cerca.',
  'C''est proche.',
  'É perto.'
),
(
  '44444444-4444-4444-8444-444444445008',
  '44444444-4444-4444-8444-444444444503',
  2, false, 'near_context_wrong_intent',
  'Otobüsle gideceğim.',
  'I''ll go by bus.',
  'Jag åker med buss.',
  'Ich fahre mit dem Bus.',
  'Iré en autobús.',
  'J''irai en bus.',
  'Vou de ônibus.'
),
(
  '44444444-4444-4444-8444-444444445009',
  '44444444-4444-4444-8444-444444444503',
  3, false, 'wrong_context',
  'Arkadaşımı bekliyorum.',
  'I''m waiting for my friend.',
  'Jag väntar på min vän.',
  'Ich warte auf meinen Freund.',
  'Estoy esperando a mi amigo.',
  'J''attends mon ami.',
  'Estou esperando meu amigo.'
),

(
  '44444444-4444-4444-8444-444444445010',
  '44444444-4444-4444-8444-444444444504',
  1, true, null,
  'Tamam, anladım.',
  'Okay, I understand.',
  'Okej, jag förstår.',
  'Okay, ich verstehe.',
  'Vale, entiendo.',
  'D''accord, je comprends.',
  'Certo, eu entendi.'
),
(
  '44444444-4444-4444-8444-444444445011',
  '44444444-4444-4444-8444-444444444504',
  2, false, 'near_context_wrong_intent',
  'Tren ne zaman geliyor?',
  'When does the train arrive?',
  'När kommer tåget?',
  'Wann kommt der Zug?',
  '¿Cuándo llega el tren?',
  'Quand arrive le train ?',
  'Quando o trem chega?'
),
(
  '44444444-4444-4444-8444-444444445012',
  '44444444-4444-4444-8444-444444444504',
  3, false, 'wrong_context',
  'Bir masa ayırttım.',
  'I booked a table.',
  'Jag bokade ett bord.',
  'Ich habe einen Tisch reserviert.',
  'Reservé una mesa.',
  'J''ai réservé une table.',
  'Reservei uma mesa.'
),

(
  '44444444-4444-4444-8444-444444445013',
  '44444444-4444-4444-8444-444444444505',
  1, true, null,
  'Yardımınız için teşekkürler.',
  'Thanks for your help.',
  'Tack för hjälpen.',
  'Danke für Ihre Hilfe.',
  'Gracias por su ayuda.',
  'Merci pour votre aide.',
  'Obrigado pela ajuda.'
),
(
  '44444444-4444-4444-8444-444444445014',
  '44444444-4444-4444-8444-444444444505',
  2, false, 'wrong_intent',
  'Tekrar eder misiniz?',
  'Can you repeat that?',
  'Kan du upprepa det?',
  'Können Sie das wiederholen?',
  '¿Puede repetir eso?',
  'Pouvez-vous répéter ?',
  'Você pode repetir isso?'
),
(
  '44444444-4444-4444-8444-444444445015',
  '44444444-4444-4444-8444-444444444505',
  3, false, 'wrong_context',
  'Ben büyük beden arıyorum.',
  'I''m looking for a larger size.',
  'Jag letar efter en större storlek.',
  'Ich suche eine größere Größe.',
  'Busco una talla más grande.',
  'Je cherche une taille plus grande.',
  'Estou procurando um tamanho maior.'
);

-- ============================================================
-- 5) taxi-transport / easy
-- Scenario: telling a taxi driver the address
-- ============================================================

insert into public.dialog_scenarios (
  id,
  category_id,
  slug,
  difficulty,
  is_premium,
  is_active,
  order_index,
  estimated_seconds,
  turn_count,
  character_name,
  character_role,
  qa_status,
  content_version,
  title_tr, title_en, title_sv, title_de, title_es, title_fr, title_pt,
  summary_tr, summary_en, summary_sv, summary_de, summary_es, summary_fr, summary_pt,
  user_goal_tr, user_goal_en, user_goal_sv, user_goal_de, user_goal_es, user_goal_fr, user_goal_pt
) values (
  '55555555-5555-4555-8555-555555555555',
  '0e5880f9-757e-4fbb-a63e-0f6a09b1134c',
  'taxi-give-address-easy-01',
  1,
  false,
  true,
  5,
  80,
  5,
  'Omar',
  'taxi_driver',
  'approved',
  1,
  'Takside adres verme',
  'Giving an address in a taxi',
  'Ge en adress i en taxi',
  'Eine Adresse im Taxi angeben',
  'Dar una dirección en un taxi',
  'Donner une adresse dans un taxi',
  'Dar um endereço em um táxi',
  'Kullanıcının taksiye binebildiği, adres söyleyebildiği ve ödemeyi konuşabildiği temel diyalog.',
  'A basic dialog where the user gets into a taxi, gives an address, and talks about payment.',
  'En grundläggande dialog där användaren går in i en taxi, ger en adress och pratar om betalning.',
  'Ein grundlegender Dialog, in dem der Nutzer in ein Taxi steigt, eine Adresse nennt und über die Bezahlung spricht.',
  'Un diálogo básico en el que el usuario sube a un taxi, da una dirección y habla del pago.',
  'Un dialogue de base dans lequel l’utilisateur monte dans un taxi, donne une adresse et parle du paiement.',
  'Um diálogo básico em que o usuário entra em um táxi, dá um endereço e fala sobre o pagamento.',
  'Adresi söylemek, onay almak ve ödemeyi tamamlamak',
  'Give the address, confirm the ride, and complete the payment interaction',
  'Ge adressen, bekräfta resan och avsluta betalningsinteraktionen',
  'Die Adresse nennen, die Fahrt bestätigen und die Bezahlung abschließen',
  'Dar la dirección, confirmar el trayecto y completar la interacción de pago',
  'Donner l’adresse, confirmer le trajet et terminer l’interaction de paiement',
  'Dar o endereço, confirmar a corrida e concluir a interação de pagamento'
);

insert into public.dialog_turns (
  id, scenario_id, turn_index, speaker_type, prompt_type, grammar_focus, vocabulary_focus,
  message_tr, message_en, message_sv, message_de, message_es, message_fr, message_pt
) values
(
  '55555555-5555-4555-8555-555555555601',
  '55555555-5555-4555-8555-555555555555',
  1, 'character', 'destination_question', 'destination_statement', 'taxi_address',
  'Merhaba. Nereye gidiyorsunuz?',
  'Hello. Where are you going?',
  'Hej. Vart ska du?',
  'Hallo. Wohin fahren Sie?',
  'Hola. ¿Adónde va?',
  'Bonjour. Où allez-vous ?',
  'Olá. Para onde você vai?'
),
(
  '55555555-5555-4555-8555-555555555602',
  '55555555-5555-4555-8555-555555555555',
  2, 'character', 'confirmation', 'place_confirmation', 'taxi_destination',
  'Tamam. Şehir merkezine, doğru mu?',
  'Okay. To the city center, right?',
  'Okej. Till centrum, eller hur?',
  'Okay. Ins Stadtzentrum, richtig?',
  'Bien. Al centro, ¿correcto?',
  'D''accord. Au centre-ville, c''est bien ça ?',
  'Certo. Para o centro da cidade, correto?'
),
(
  '55555555-5555-4555-8555-555555555603',
  '55555555-5555-4555-8555-555555555555',
  3, 'character', 'payment_question', 'payment_method', 'taxi_payment',
  'Kartla mı, nakitle mi ödeyeceksiniz?',
  'Will you pay by card or cash?',
  'Betalar du med kort eller kontanter?',
  'Zahlen Sie mit Karte oder bar?',
  '¿Pagará con tarjeta o en efectivo?',
  'Vous payerez par carte ou en espèces ?',
  'Você vai pagar com cartão ou em dinheiro?'
),
(
  '55555555-5555-4555-8555-555555555604',
  '55555555-5555-4555-8555-555555555555',
  4, 'character', 'arrival_notice', 'simple_response', 'taxi_arrival',
  'Tamam. Yaklaşık on dakika sürecek.',
  'Okay. It will take about ten minutes.',
  'Okej. Det tar ungefär tio minuter.',
  'Okay. Es dauert ungefähr zehn Minuten.',
  'Bien. Tardará unos diez minutos.',
  'D''accord. Cela prendra environ dix minutes.',
  'Certo. Vai levar cerca de dez minutos.'
),
(
  '55555555-5555-4555-8555-555555555605',
  '55555555-5555-4555-8555-555555555555',
  5, 'character', 'closing', 'thanks_closing', 'taxi_closing',
  'Geldik.',
  'We''re here.',
  'Vi är framme.',
  'Wir sind da.',
  'Hemos llegado.',
  'Nous sommes arrivés.',
  'Chegamos.'
);

insert into public.dialog_turn_options (
  id, turn_id, option_index, is_correct, distractor_type,
  text_tr, text_en, text_sv, text_de, text_es, text_fr, text_pt
) values
(
  '55555555-5555-4555-8555-555555556001',
  '55555555-5555-4555-8555-555555555601',
  1, true, null,
  'Şehir merkezine gitmek istiyorum.',
  'I''d like to go to the city center.',
  'Jag vill åka till centrum.',
  'Ich möchte ins Stadtzentrum fahren.',
  'Quiero ir al centro.',
  'Je voudrais aller au centre-ville.',
  'Eu gostaria de ir ao centro da cidade.'
),
(
  '55555555-5555-4555-8555-555555556002',
  '55555555-5555-4555-8555-555555555601',
  2, false, 'near_context_wrong_intent',
  'Havaalanı ne kadar uzak?',
  'How far is the airport?',
  'Hur långt är det till flygplatsen?',
  'Wie weit ist der Flughafen?',
  '¿Qué tan lejos está el aeropuerto?',
  'L''aéroport est à quelle distance ?',
  'Quão longe fica o aeroporto?'
),
(
  '55555555-5555-4555-8555-555555556003',
  '55555555-5555-4555-8555-555555555601',
  3, false, 'wrong_context',
  'Bir masa ayırttım.',
  'I booked a table.',
  'Jag bokade ett bord.',
  'Ich habe einen Tisch reserviert.',
  'Reservé una mesa.',
  'J''ai réservé une table.',
  'Reservei uma mesa.'
),

(
  '55555555-5555-4555-8555-555555556004',
  '55555555-5555-4555-8555-555555555602',
  1, true, null,
  'Evet, doğru.',
  'Yes, that''s right.',
  'Ja, det stämmer.',
  'Ja, das stimmt.',
  'Sí, correcto.',
  'Oui, c''est ça.',
  'Sim, está certo.'
),
(
  '55555555-5555-4555-8555-555555556005',
  '55555555-5555-4555-8555-555555555602',
  2, false, 'near_context_wrong_intent',
  'Biraz acelem var.',
  'I''m in a bit of a hurry.',
  'Jag har lite bråttom.',
  'Ich habe es ein bisschen eilig.',
  'Tengo un poco de prisa.',
  'Je suis un peu pressé.',
  'Estou com um pouco de pressa.'
),
(
  '55555555-5555-4555-8555-555555556006',
  '55555555-5555-4555-8555-555555555602',
  3, false, 'wrong_context',
  'Büyük bedeniniz var mı?',
  'Do you have a larger size?',
  'Har ni en större storlek?',
  'Haben Sie eine größere Größe?',
  '¿Tiene una talla más grande?',
  'Vous avez une taille plus grande ?',
  'Você tem um tamanho maior?'
),

(
  '55555555-5555-4555-8555-555555556007',
  '55555555-5555-4555-8555-555555555603',
  1, true, null,
  'Kartla ödeyeceğim.',
  'I''ll pay by card.',
  'Jag betalar med kort.',
  'Ich zahle mit Karte.',
  'Pagaré con tarjeta.',
  'Je paierai par carte.',
  'Vou pagar com cartão.'
),
(
  '55555555-5555-4555-8555-555555556008',
  '55555555-5555-4555-8555-555555555603',
  2, false, 'near_context_wrong_intent',
  'Burada ineceğim.',
  'I''ll get off here.',
  'Jag går av här.',
  'Ich steige hier aus.',
  'Bajaré aquí.',
  'Je descends ici.',
  'Vou descer aqui.'
),
(
  '55555555-5555-4555-8555-555555556009',
  '55555555-5555-4555-8555-555555555603',
  3, false, 'wrong_context',
  'İngilizce öğreniyorum.',
  'I''m learning English.',
  'Jag lär mig engelska.',
  'Ich lerne Englisch.',
  'Estoy aprendiendo inglés.',
  'J''apprends l''anglais.',
  'Estou aprendendo inglês.'
),

(
  '55555555-5555-4555-8555-555555556010',
  '55555555-5555-4555-8555-555555555604',
  1, true, null,
  'Tamam, teşekkür ederim.',
  'Okay, thank you.',
  'Okej, tack.',
  'Okay, danke.',
  'Vale, gracias.',
  'D''accord, merci.',
  'Certo, obrigado.'
),
(
  '55555555-5555-4555-8555-555555556011',
  '55555555-5555-4555-8555-555555555604',
  2, false, 'near_context_wrong_intent',
  'Mümkünse hızlı gidelim.',
  'Let''s go quickly if possible.',
  'Låt oss åka snabbt om möjligt.',
  'Fahren wir bitte schnell, wenn möglich.',
  'Vayamos rápido si es posible.',
  'Allons vite si possible.',
  'Vamos rápido, se possível.'
),
(
  '55555555-5555-4555-8555-555555556012',
  '55555555-5555-4555-8555-555555555604',
  3, false, 'wrong_context',
  'Bugün dersim var.',
  'I have a class today.',
  'Jag har lektion idag.',
  'Ich habe heute Unterricht.',
  'Tengo clase hoy.',
  'J''ai cours aujourd''hui.',
  'Tenho aula hoje.'
),

(
  '55555555-5555-4555-8555-555555556013',
  '55555555-5555-4555-8555-555555555605',
  1, true, null,
  'Teşekkür ederim. İyi günler.',
  'Thank you. Have a nice day.',
  'Tack. Ha en bra dag.',
  'Danke. Schönen Tag noch.',
  'Gracias. Que tenga un buen día.',
  'Merci. Bonne journée.',
  'Obrigado. Tenha um bom dia.'
),
(
  '55555555-5555-4555-8555-555555556014',
  '55555555-5555-4555-8555-555555555605',
  2, false, 'wrong_intent',
  'Bir dakika bekleyin.',
  'Please wait a minute.',
  'Vänta en minut, tack.',
  'Warten Sie bitte eine Minute.',
  'Espere un minuto, por favor.',
  'Attendez une minute, s''il vous plaît.',
  'Espere um minuto, por favor.'
),
(
  '55555555-5555-4555-8555-555555556015',
  '55555555-5555-4555-8555-555555555605',
  3, false, 'wrong_context',
  'Bu sınıfı seviyorum.',
  'I like this class.',
  'Jag tycker om den här kursen.',
  'Ich mag diesen Kurs.',
  'Me gusta esta clase.',
  'J''aime ce cours.',
  'Eu gosto desta aula.'
);

commit;