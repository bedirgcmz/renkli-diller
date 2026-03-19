-- ============================================================
-- Migration 014: Seed Reading Texts
-- 2 categories × 5 texts = 10 texts (all free, order_index 1–10)
-- Categories: daily_life (1-5), travel (6-10)
-- ============================================================

-- ── DAILY LIFE ────────────────────────────────────────────────────────────────

-- Text 1: Morning Coffee
INSERT INTO reading_texts (slug, category, difficulty, is_premium, order_index, estimated_reading_seconds,
  title_tr, title_en, title_sv, title_de, title_es, title_fr, title_pt,
  body_tr, body_en, body_sv, body_de, body_es, body_fr, body_pt)
VALUES (
  'daily-life-morning-coffee', 'daily_life', 1, false, 1, 75,
  -- titles
  'Sabah Kahvesi', 'Morning Coffee', 'Morgonkaffe', 'Morgenkaffee',
  'Café de la Mañana', 'Café du Matin', 'Café da Manhã',
  -- body_tr
  'Ayşe her sabah erken **kalkar** ve mutfağa gider. Kahve makinesini çalıştırır ve pencerenin önünde **bekler**. Dışarıda kuşlar ötüyor, sokak henüz sessiz.

Kahvesi hazır olunca en sevdiği **kupasına** döker. İlk yudumla gözleri açılır. Bu sessiz sabah anı ona güç verir.

İşe gitmeden önce Ayşe her zaman bir **not** yazar. Bugün yapacaklarını, küçük hedeflerini. Basit ama etkili bir alışkanlık.',

  -- body_en
  'Ayşe **wakes up** early every morning and goes to the kitchen. She starts the coffee machine and **waits** by the window. Outside, birds are singing, the street is still quiet.

When her coffee is ready, she pours it into her favourite **mug**. With the first sip, her eyes open fully. This quiet morning moment gives her strength.

Before going to work, Ayşe always writes a **note**. Her tasks for the day, small goals. A simple but effective habit.',

  -- body_sv
  'Ayşe **vaknar** tidigt varje morgon och går till köket. Hon startar kaffemaskinen och **väntar** vid fönstret. Utanför sjunger fåglar, gatan är fortfarande tyst.

När kaffet är klart häller hon upp det i sin favoritmugg. Med det första klunket öppnas ögonen helt. Det tysta morgonögonblicket ger henne styrka.

Innan hon går till jobbet skriver Ayşe alltid en **anteckning**. Dagens uppgifter, små mål. En enkel men effektiv **vana**.',

  -- body_de
  'Ayşe **wacht** jeden Morgen früh auf und geht in die Küche. Sie startet die Kaffeemaschine und **wartet** am Fenster. Draußen singen Vögel, die Straße ist noch still.

Als ihr Kaffee fertig ist, gießt sie ihn in ihre Lieblingstasse. Mit dem ersten Schluck öffnen sich ihre Augen vollständig. Dieser stille Morgenmoment gibt ihr Kraft.

Bevor sie zur Arbeit geht, schreibt Ayşe immer eine **Notiz**. Die Aufgaben des Tages, kleine Ziele. Eine einfache aber wirkungsvolle **Gewohnheit**.',

  -- body_es
  'Ayşe **se despierta** temprano cada mañana y va a la cocina. Enciende la cafetera y **espera** junto a la ventana. Afuera, los pájaros cantan, la calle está todavía tranquila.

Cuando su café está listo, lo sirve en su **taza** favorita. Con el primer sorbo, sus ojos se abren por completo. Este tranquilo momento matutino le da fuerza.

Antes de ir al trabajo, Ayşe siempre escribe una **nota**. Las tareas del día, pequeños objetivos. Un **hábito** simple pero efectivo.',

  -- body_fr
  'Ayşe **se réveille** tôt chaque matin et va dans la cuisine. Elle démarre la cafetière et **attend** près de la fenêtre. Dehors, les oiseaux chantent, la rue est encore calme.

Quand son café est prêt, elle le verse dans sa **tasse** préférée. À la première gorgée, ses yeux s''ouvrent complètement. Ce moment matinal silencieux lui donne de la force.

Avant d''aller travailler, Ayşe écrit toujours une **note**. Les tâches de la journée, petits objectifs. Une **habitude** simple mais efficace.',

  -- body_pt
  'Ayşe **acorda** cedo toda manhã e vai para a cozinha. Liga a cafeteira e **espera** perto da janela. Lá fora, os pássaros cantam, a rua ainda está quieta.

Quando o café está pronto, ela serve na sua **caneca** favorita. Com o primeiro gole, seus olhos se abrem completamente. Este momento matinal tranquilo lhe dá força.

Antes de ir trabalhar, Ayşe sempre escreve uma **nota**. As tarefas do dia, pequenos objetivos. Um **hábito** simples mas eficaz.'
);

INSERT INTO reading_text_keywords (reading_text_id, position_index, color_index,
  keyword_tr, keyword_en, keyword_sv, keyword_de, keyword_es, keyword_fr, keyword_pt)
SELECT id, 0, 0, 'kalkar', 'wakes up', 'vaknar', 'wacht', 'se despierta', 'se réveille', 'acorda'
FROM reading_texts WHERE slug = 'daily-life-morning-coffee';

INSERT INTO reading_text_keywords (reading_text_id, position_index, color_index,
  keyword_tr, keyword_en, keyword_sv, keyword_de, keyword_es, keyword_fr, keyword_pt)
SELECT id, 1, 2, 'bekler', 'waits', 'väntar', 'wartet', 'espera', 'attend', 'espera'
FROM reading_texts WHERE slug = 'daily-life-morning-coffee';

INSERT INTO reading_text_keywords (reading_text_id, position_index, color_index,
  keyword_tr, keyword_en, keyword_sv, keyword_de, keyword_es, keyword_fr, keyword_pt)
SELECT id, 2, 4, 'kupasına', 'mug', 'mugg', 'Tasse', 'taza', 'tasse', 'caneca'
FROM reading_texts WHERE slug = 'daily-life-morning-coffee';

INSERT INTO reading_text_keywords (reading_text_id, position_index, color_index,
  keyword_tr, keyword_en, keyword_sv, keyword_de, keyword_es, keyword_fr, keyword_pt)
SELECT id, 3, 6, 'not', 'note', 'anteckning', 'Notiz', 'nota', 'note', 'nota'
FROM reading_texts WHERE slug = 'daily-life-morning-coffee';

INSERT INTO reading_text_keywords (reading_text_id, position_index, color_index,
  keyword_tr, keyword_en, keyword_sv, keyword_de, keyword_es, keyword_fr, keyword_pt)
SELECT id, 4, 8, 'alışkanlık', 'habit', 'vana', 'Gewohnheit', 'hábito', 'habitude', 'hábito'
FROM reading_texts WHERE slug = 'daily-life-morning-coffee';

-- ─────────────────────────────────────────────────────────────────────────────

-- Text 2: Grocery Shopping
INSERT INTO reading_texts (slug, category, difficulty, is_premium, order_index, estimated_reading_seconds,
  title_tr, title_en, title_sv, title_de, title_es, title_fr, title_pt,
  body_tr, body_en, body_sv, body_de, body_es, body_fr, body_pt)
VALUES (
  'daily-life-grocery-shopping', 'daily_life', 1, false, 2, 80,
  'Markette Alışveriş', 'Grocery Shopping', 'Matvaruhandel', 'Einkaufen',
  'Ir al Supermercado', 'Faire les Courses', 'Fazer Compras',

  'Can markete gitmeden önce bir **alışveriş listesi** hazırlar. Ekmek, süt, meyve ve sebze. Listeye bakarak gezmek zaman kazandırır.

Kasaya geldiğinde Can fiyatlara dikkat eder. Bir ürün pahalıysa ucuz **alternatif** arar. Akıllıca **harcamak** önemli bir beceri.

Evine dönerken poşetleri taşımak zahmetlidir. Ama doldurulan buzdolabını görmek onu mutlu eder. Küçük bir **başarı** hissi.',

  'Before going to the market, Can prepares a **shopping list**. Bread, milk, fruit and vegetables. Shopping with a list saves time.

At the checkout, Can pays attention to prices. If a product is expensive, he looks for a cheaper **alternative**. **Spending** wisely is an important skill.

Carrying the bags on the way home is tiring. But seeing the full fridge makes him happy. A small sense of **achievement**.',

  'Innan Can går till affären förbereder han en **inköpslista**. Bröd, mjölk, frukt och grönsaker. Att handla med en lista sparar tid.

Vid kassan uppmärksammar Can priserna. Om en produkt är dyr letar han efter ett billigare **alternativ**. Att **spendera** klokt är en viktig färdighet.

Att bära kassarna hem är ansträngande. Men att se det fulla kylskåpet gör honom glad. En liten känsla av **framgång**.',

  'Bevor Can auf den Markt geht, bereitet er eine **Einkaufsliste** vor. Brot, Milch, Obst und Gemüse. Mit einer Liste einzukaufen spart Zeit.

An der Kasse achtet Can auf die Preise. Wenn ein Produkt teuer ist, sucht er nach einer günstigeren **Alternative**. Klug **ausgeben** ist eine wichtige Fähigkeit.

Die Tüten nach Hause zu tragen ist anstrengend. Aber den vollen Kühlschrank zu sehen macht ihn glücklich. Ein kleines Gefühl von **Erfolg**.',

  'Antes de ir al mercado, Can prepara una **lista de compras**. Pan, leche, frutas y verduras. Ir de compras con una lista ahorra tiempo.

En la caja, Can presta atención a los precios. Si un producto es caro, busca una **alternativa** más barata. **Gastar** con inteligencia es una habilidad importante.

Cargar las bolsas camino a casa es agotador. Pero ver el refrigerador lleno lo hace feliz. Una pequeña sensación de **logro**.',

  'Avant d''aller au marché, Can prépare une **liste de courses**. Pain, lait, fruits et légumes. Faire ses courses avec une liste fait gagner du temps.

À la caisse, Can fait attention aux prix. Si un produit est cher, il cherche une **alternative** moins chère. **Dépenser** intelligemment est une compétence importante.

Porter les sacs en rentrant à la maison est fatigant. Mais voir le réfrigérateur plein le rend heureux. Un petit sentiment de **réussite**.',

  'Antes de ir ao mercado, Can prepara uma **lista de compras**. Pão, leite, frutas e verduras. Fazer compras com uma lista economiza tempo.

No caixa, Can presta atenção nos preços. Se um produto é caro, ele procura uma **alternativa** mais barata. **Gastar** com sabedoria é uma habilidade importante.

Carregar as sacolas no caminho para casa é cansativo. Mas ver a geladeira cheia o faz feliz. Uma pequena sensação de **conquista**.'
);

INSERT INTO reading_text_keywords (reading_text_id, position_index, color_index,
  keyword_tr, keyword_en, keyword_sv, keyword_de, keyword_es, keyword_fr, keyword_pt)
SELECT id, 0, 1, 'alışveriş listesi', 'shopping list', 'inköpslista', 'Einkaufsliste', 'lista de compras', 'liste de courses', 'lista de compras'
FROM reading_texts WHERE slug = 'daily-life-grocery-shopping';

INSERT INTO reading_text_keywords (reading_text_id, position_index, color_index,
  keyword_tr, keyword_en, keyword_sv, keyword_de, keyword_es, keyword_fr, keyword_pt)
SELECT id, 1, 3, 'alternatif', 'alternative', 'alternativ', 'Alternative', 'alternativa', 'alternative', 'alternativa'
FROM reading_texts WHERE slug = 'daily-life-grocery-shopping';

INSERT INTO reading_text_keywords (reading_text_id, position_index, color_index,
  keyword_tr, keyword_en, keyword_sv, keyword_de, keyword_es, keyword_fr, keyword_pt)
SELECT id, 2, 5, 'harcamak', 'spending', 'spendera', 'ausgeben', 'gastar', 'dépenser', 'gastar'
FROM reading_texts WHERE slug = 'daily-life-grocery-shopping';

INSERT INTO reading_text_keywords (reading_text_id, position_index, color_index,
  keyword_tr, keyword_en, keyword_sv, keyword_de, keyword_es, keyword_fr, keyword_pt)
SELECT id, 3, 7, 'başarı', 'achievement', 'framgång', 'Erfolg', 'logro', 'réussite', 'conquista'
FROM reading_texts WHERE slug = 'daily-life-grocery-shopping';

-- ─────────────────────────────────────────────────────────────────────────────

-- Text 3: Phone Call with a Friend
INSERT INTO reading_texts (slug, category, difficulty, is_premium, order_index, estimated_reading_seconds,
  title_tr, title_en, title_sv, title_de, title_es, title_fr, title_pt,
  body_tr, body_en, body_sv, body_de, body_es, body_fr, body_pt)
VALUES (
  'daily-life-phone-call', 'daily_life', 1, false, 3, 70,
  'Arkadaşla Telefon', 'A Phone Call', 'Ett Telefonsamtal', 'Ein Telefonat',
  'Una Llamada Telefónica', 'Un Coup de Téléphone', 'Uma Ligação',

  'Selin uzun süredir arkadaşını **aramadı**. Bugün sonunda telefonu eline aldı. Birkaç saniye bekledi, ardından sesini duydu.

Konuşma başlayınca sanki hiç **zaman** geçmemiş gibi oldu. Güldüler, eski anıları **paylaştılar**, birbirlerinin haberini sordular.

Telefonu kapatırken Selin kendini çok daha iyi hissetti. Bazen tek ihtiyacın olan şey tanıdık bir **ses** ve samimi bir **sohbet**.',

  'Selin hadn''t **called** her friend in a long time. Today she finally picked up the phone. She waited a few seconds, then heard her voice.

Once the conversation started, it felt as if no **time** had passed. They laughed, **shared** old memories, asked about each other''s lives.

When she hung up, Selin felt much better. Sometimes all you need is a familiar **voice** and a sincere **conversation**.',

  'Selin hade inte **ringt** sin vän på länge. Idag tog hon äntligen upp telefonen. Hon väntade några sekunder och hörde sedan hennes röst.

När samtalet väl började kändes det som om ingen **tid** hade gått. De skrattade, **delade** gamla minnen och frågade om varandras liv.

När hon lade på kände sig Selin mycket bättre. Ibland är allt du behöver en bekant **röst** och ett uppriktigt **samtal**.',

  'Selin hatte ihre Freundin lange nicht **angerufen**. Heute nahm sie endlich das Telefon. Sie wartete ein paar Sekunden, dann hörte sie ihre Stimme.

Als das Gespräch begann, fühlte es sich an, als wäre keine **Zeit** vergangen. Sie lachten, **teilten** alte Erinnerungen und fragten nach dem Leben des anderen.

Als sie auflegte, fühlte sich Selin viel besser. Manchmal ist alles, was man braucht, eine vertraute **Stimme** und ein aufrichtiges **Gespräch**.',

  'Selin no había **llamado** a su amiga en mucho tiempo. Hoy finalmente tomó el teléfono. Esperó unos segundos y luego escuchó su voz.

Una vez que comenzó la conversación, parecía como si no hubiera pasado **tiempo**. Rieron, **compartieron** viejos recuerdos y preguntaron por la vida del otro.

Cuando colgó, Selin se sintió mucho mejor. A veces todo lo que necesitas es una **voz** familiar y una **conversación** sincera.',

  'Selin n''avait pas **appelé** son amie depuis longtemps. Aujourd''hui, elle a finalement pris le téléphone. Elle a attendu quelques secondes, puis a entendu sa voix.

Une fois la conversation commencée, c''était comme si aucun **temps** ne s''était écoulé. Elles ont ri, **partagé** de vieux souvenirs et demandé des nouvelles l''une de l''autre.

Quand elle a raccroché, Selin s''est sentie beaucoup mieux. Parfois, tout ce dont on a besoin est une **voix** familière et une **conversation** sincère.',

  'Selin não havia **ligado** para sua amiga há muito tempo. Hoje ela finalmente pegou o telefone. Esperou alguns segundos e então ouviu sua voz.

Uma vez que a conversa começou, pareceu como se nenhum **tempo** tivesse passado. Elas riram, **compartilharam** velhas memórias e perguntaram sobre a vida uma da outra.

Quando desligou, Selin se sentiu muito melhor. Às vezes, tudo que você precisa é de uma **voz** familiar e de uma **conversa** sincera.'
);

INSERT INTO reading_text_keywords (reading_text_id, position_index, color_index,
  keyword_tr, keyword_en, keyword_sv, keyword_de, keyword_es, keyword_fr, keyword_pt)
SELECT id, 0, 0, 'aramadı', 'called', 'ringt', 'angerufen', 'llamado', 'appelé', 'ligado'
FROM reading_texts WHERE slug = 'daily-life-phone-call';

INSERT INTO reading_text_keywords (reading_text_id, position_index, color_index,
  keyword_tr, keyword_en, keyword_sv, keyword_de, keyword_es, keyword_fr, keyword_pt)
SELECT id, 1, 3, 'zaman', 'time', 'tid', 'Zeit', 'tiempo', 'temps', 'tempo'
FROM reading_texts WHERE slug = 'daily-life-phone-call';

INSERT INTO reading_text_keywords (reading_text_id, position_index, color_index,
  keyword_tr, keyword_en, keyword_sv, keyword_de, keyword_es, keyword_fr, keyword_pt)
SELECT id, 2, 5, 'paylaştılar', 'shared', 'delade', 'teilten', 'compartieron', 'partagé', 'compartilharam'
FROM reading_texts WHERE slug = 'daily-life-phone-call';

INSERT INTO reading_text_keywords (reading_text_id, position_index, color_index,
  keyword_tr, keyword_en, keyword_sv, keyword_de, keyword_es, keyword_fr, keyword_pt)
SELECT id, 3, 7, 'ses', 'voice', 'röst', 'Stimme', 'voz', 'voix', 'voz'
FROM reading_texts WHERE slug = 'daily-life-phone-call';

INSERT INTO reading_text_keywords (reading_text_id, position_index, color_index,
  keyword_tr, keyword_en, keyword_sv, keyword_de, keyword_es, keyword_fr, keyword_pt)
SELECT id, 4, 9, 'sohbet', 'conversation', 'samtal', 'Gespräch', 'conversación', 'conversation', 'conversa'
FROM reading_texts WHERE slug = 'daily-life-phone-call';

-- ─────────────────────────────────────────────────────────────────────────────

-- Text 4: Working from Home
INSERT INTO reading_texts (slug, category, difficulty, is_premium, order_index, estimated_reading_seconds,
  title_tr, title_en, title_sv, title_de, title_es, title_fr, title_pt,
  body_tr, body_en, body_sv, body_de, body_es, body_fr, body_pt)
VALUES (
  'daily-life-working-from-home', 'daily_life', 2, false, 4, 85,
  'Evden Çalışmak', 'Working from Home', 'Jobba hemifrån', 'Von zu Hause arbeiten',
  'Trabajar desde Casa', 'Travailler à la Maison', 'Trabalhar de Casa',

  'Bugün Mert ofise gitmek zorunda değil. Evden **çalışacak**. Kahvesini yaptı, bilgisayarını açtı ve kendine küçük bir çalışma **düzeni** kurdu.

İlk iki saat çok **verimli** geçti. Ama öğleden sonra dikkatini dağıtan şeyler çıktı. Buzdolabı, telefon, dışarıdan gelen sesler.

Mert bir karar verdi: her saat başı beş dakika **mola**. Bu basit kural sayesinde günün geri kalanını çok daha **odaklı** geçirdi.',

  'Today Mert doesn''t have to go to the office. He will **work** from home. He made his coffee, turned on his computer and set up a small work **routine** for himself.

The first two hours were very **productive**. But in the afternoon, distractions appeared. The fridge, the phone, sounds from outside.

Mert made a decision: a five-minute **break** every hour. Thanks to this simple rule, he spent the rest of the day much more **focused**.',

  'Idag behöver Mert inte gå till kontoret. Han ska **jobba** hemifrån. Han lagade sitt kaffe, satte på datorn och skapade en liten arbets**rutin** för sig själv.

De första två timmarna var mycket **produktiva**. Men på eftermiddagen dök distraktioner upp. Kylskåpet, telefonen, ljud utifrån.

Mert tog ett beslut: fem minuters **paus** varje timme. Tack vare denna enkla regel tillbringade han resten av dagen mycket mer **fokuserat**.',

  'Heute muss Mert nicht ins Büro. Er wird von zu Hause **arbeiten**. Er kochte seinen Kaffee, schaltete den Computer ein und richtete sich eine kleine Arbeits**routine** ein.

Die ersten zwei Stunden waren sehr **produktiv**. Aber am Nachmittag tauchten Ablenkungen auf. Der Kühlschrank, das Telefon, Geräusche von draußen.

Mert traf eine Entscheidung: fünf Minuten **Pause** jede Stunde. Dank dieser einfachen Regel verbrachte er den Rest des Tages viel **konzentrierter**.',

  'Hoy Mert no tiene que ir a la oficina. Va a **trabajar** desde casa. Preparó su café, encendió el ordenador y se creó una pequeña **rutina** de trabajo.

Las primeras dos horas fueron muy **productivas**. Pero por la tarde aparecieron las distracciones. El refrigerador, el teléfono, los sonidos del exterior.

Mert tomó una decisión: cinco minutos de **descanso** cada hora. Gracias a esta simple regla, pasó el resto del día mucho más **enfocado**.',

  'Aujourd''hui Mert n''a pas besoin d''aller au bureau. Il va **travailler** depuis chez lui. Il a préparé son café, allumé son ordinateur et mis en place une petite **routine** de travail.

Les deux premières heures ont été très **productives**. Mais l''après-midi, des distractions sont apparues. Le réfrigérateur, le téléphone, les sons de l''extérieur.

Mert a pris une décision : cinq minutes de **pause** chaque heure. Grâce à cette règle simple, il a passé le reste de la journée bien plus **concentré**.',

  'Hoje Mert não precisa ir ao escritório. Ele vai **trabalhar** de casa. Fez seu café, ligou o computador e criou uma pequena **rotina** de trabalho.

As primeiras duas horas foram muito **produtivas**. Mas à tarde, as distrações apareceram. A geladeira, o telefone, os sons lá de fora.

Mert tomou uma decisão: cinco minutos de **pausa** a cada hora. Graças a esta regra simples, ele passou o resto do dia muito mais **focado**.'
);

INSERT INTO reading_text_keywords (reading_text_id, position_index, color_index,
  keyword_tr, keyword_en, keyword_sv, keyword_de, keyword_es, keyword_fr, keyword_pt)
SELECT id, 0, 2, 'çalışacak', 'work', 'jobba', 'arbeiten', 'trabajar', 'travailler', 'trabalhar'
FROM reading_texts WHERE slug = 'daily-life-working-from-home';

INSERT INTO reading_text_keywords (reading_text_id, position_index, color_index,
  keyword_tr, keyword_en, keyword_sv, keyword_de, keyword_es, keyword_fr, keyword_pt)
SELECT id, 1, 4, 'düzeni', 'routine', 'rutin', 'Routine', 'rutina', 'routine', 'rotina'
FROM reading_texts WHERE slug = 'daily-life-working-from-home';

INSERT INTO reading_text_keywords (reading_text_id, position_index, color_index,
  keyword_tr, keyword_en, keyword_sv, keyword_de, keyword_es, keyword_fr, keyword_pt)
SELECT id, 2, 6, 'verimli', 'productive', 'produktiva', 'produktiv', 'productivas', 'productives', 'produtivas'
FROM reading_texts WHERE slug = 'daily-life-working-from-home';

INSERT INTO reading_text_keywords (reading_text_id, position_index, color_index,
  keyword_tr, keyword_en, keyword_sv, keyword_de, keyword_es, keyword_fr, keyword_pt)
SELECT id, 3, 1, 'mola', 'break', 'paus', 'Pause', 'descanso', 'pause', 'pausa'
FROM reading_texts WHERE slug = 'daily-life-working-from-home';

INSERT INTO reading_text_keywords (reading_text_id, position_index, color_index,
  keyword_tr, keyword_en, keyword_sv, keyword_de, keyword_es, keyword_fr, keyword_pt)
SELECT id, 4, 8, 'odaklı', 'focused', 'fokuserat', 'konzentrierter', 'enfocado', 'concentré', 'focado'
FROM reading_texts WHERE slug = 'daily-life-working-from-home';

-- ─────────────────────────────────────────────────────────────────────────────

-- Text 5: Neighbourhood Walk
INSERT INTO reading_texts (slug, category, difficulty, is_premium, order_index, estimated_reading_seconds,
  title_tr, title_en, title_sv, title_de, title_es, title_fr, title_pt,
  body_tr, body_en, body_sv, body_de, body_es, body_fr, body_pt)
VALUES (
  'daily-life-neighbourhood-walk', 'daily_life', 1, false, 5, 70,
  'Mahalle Yürüyüşü', 'A Neighbourhood Walk', 'En Promenad i Kvarteret', 'Ein Spaziergang im Viertel',
  'Un Paseo por el Barrio', 'Une Promenade dans le Quartier', 'Uma Caminhada no Bairro',

  'Leyla her akşam eve gelmeden önce kısa bir **yürüyüş** yapar. Aynı sokaklar, aynı ağaçlar ama her gün farklı bir **atmosfer**.

Bugün yaşlı bir komşusuyla karşılaştı. Birkaç dakika **sohbet** ettiler. Hava, yeni açılan fırın, mahalledeki küçük değişiklikler.

Bu küçük **bağlantılar** Leyla için çok değerli. Büyük şehirde bile insan insana ihtiyaç duyar. Yürüyüş ona hem dinginlik hem de **aidiyet** hissi verir.',

  'Leyla takes a short **walk** every evening before coming home. The same streets, the same trees but a different **atmosphere** each day.

Today she ran into an elderly neighbour. They **chatted** for a few minutes. The weather, the new bakery, the small changes in the neighbourhood.

These small **connections** are very valuable to Leyla. Even in a big city, people need each other. The walk gives her both peace and a sense of **belonging**.',

  'Leyla tar en kort **promenad** varje kväll innan hon kommer hem. Samma gator, samma träd men en annan **atmosfär** varje dag.

Idag stötte hon på en äldre granne. De **pratade** i några minuter. Vädret, det nya bageriet, de små förändringarna i kvarteret.

Dessa små **kontakter** är mycket värdefulla för Leyla. Även i en stor stad behöver människor varandra. Promenaden ger henne både lugn och en känsla av **tillhörighet**.',

  'Leyla macht jeden Abend einen kurzen **Spaziergang**, bevor sie nach Hause kommt. Dieselben Straßen, dieselben Bäume, aber jeden Tag eine andere **Atmosphäre**.

Heute begegnete sie einer älteren Nachbarin. Sie **plauderten** ein paar Minuten. Das Wetter, die neue Bäckerei, die kleinen Veränderungen im Viertel.

Diese kleinen **Verbindungen** sind für Leyla sehr wertvoll. Auch in einer Großstadt brauchen Menschen einander. Der Spaziergang gibt ihr sowohl Ruhe als auch ein Gefühl von **Zugehörigkeit**.',

  'Leyla da un corto **paseo** cada tarde antes de llegar a casa. Las mismas calles, los mismos árboles pero una **atmósfera** diferente cada día.

Hoy se encontró con una vecina mayor. **Charlaron** unos minutos. El tiempo, la nueva panadería, los pequeños cambios en el barrio.

Estas pequeñas **conexiones** son muy valiosas para Leyla. Incluso en una gran ciudad, las personas se necesitan mutuamente. El paseo le da tanto paz como un sentido de **pertenencia**.',

  'Leyla fait une courte **promenade** chaque soir avant de rentrer chez elle. Les mêmes rues, les mêmes arbres mais une **atmosphère** différente chaque jour.

Aujourd''hui elle a croisé une voisine âgée. Elles ont **bavardé** quelques minutes. La météo, la nouvelle boulangerie, les petits changements dans le quartier.

Ces petites **connexions** sont très précieuses pour Leyla. Même dans une grande ville, les gens ont besoin les uns des autres. La promenade lui donne à la fois la sérénité et un sentiment d''**appartenance**.',

  'Leyla faz uma curta **caminhada** toda tarde antes de chegar em casa. As mesmas ruas, as mesmas árvores mas uma **atmosfera** diferente a cada dia.

Hoje ela encontrou uma vizinha idosa. Elas **conversaram** por alguns minutos. O tempo, a nova padaria, as pequenas mudanças no bairro.

Essas pequenas **conexões** são muito valiosas para Leyla. Mesmo em uma cidade grande, as pessoas precisam umas das outras. A caminhada lhe dá tanto paz quanto um senso de **pertencimento**.'
);

INSERT INTO reading_text_keywords (reading_text_id, position_index, color_index,
  keyword_tr, keyword_en, keyword_sv, keyword_de, keyword_es, keyword_fr, keyword_pt)
SELECT id, 0, 3, 'yürüyüş', 'walk', 'promenad', 'Spaziergang', 'paseo', 'promenade', 'caminhada'
FROM reading_texts WHERE slug = 'daily-life-neighbourhood-walk';

INSERT INTO reading_text_keywords (reading_text_id, position_index, color_index,
  keyword_tr, keyword_en, keyword_sv, keyword_de, keyword_es, keyword_fr, keyword_pt)
SELECT id, 1, 5, 'atmosfer', 'atmosphere', 'atmosfär', 'Atmosphäre', 'atmósfera', 'atmosphère', 'atmosfera'
FROM reading_texts WHERE slug = 'daily-life-neighbourhood-walk';

INSERT INTO reading_text_keywords (reading_text_id, position_index, color_index,
  keyword_tr, keyword_en, keyword_sv, keyword_de, keyword_es, keyword_fr, keyword_pt)
SELECT id, 2, 7, 'sohbet', 'chatted', 'pratade', 'plauderten', 'charlaron', 'bavardé', 'conversaram'
FROM reading_texts WHERE slug = 'daily-life-neighbourhood-walk';

INSERT INTO reading_text_keywords (reading_text_id, position_index, color_index,
  keyword_tr, keyword_en, keyword_sv, keyword_de, keyword_es, keyword_fr, keyword_pt)
SELECT id, 3, 1, 'bağlantılar', 'connections', 'kontakter', 'Verbindungen', 'conexiones', 'connexions', 'conexões'
FROM reading_texts WHERE slug = 'daily-life-neighbourhood-walk';

INSERT INTO reading_text_keywords (reading_text_id, position_index, color_index,
  keyword_tr, keyword_en, keyword_sv, keyword_de, keyword_es, keyword_fr, keyword_pt)
SELECT id, 4, 9, 'aidiyet', 'belonging', 'tillhörighet', 'Zugehörigkeit', 'pertenencia', 'appartenance', 'pertencimento'
FROM reading_texts WHERE slug = 'daily-life-neighbourhood-walk';

-- ── TRAVEL ───────────────────────────────────────────────────────────────────

-- Text 6: Airport Check-in
INSERT INTO reading_texts (slug, category, difficulty, is_premium, order_index, estimated_reading_seconds,
  title_tr, title_en, title_sv, title_de, title_es, title_fr, title_pt,
  body_tr, body_en, body_sv, body_de, body_es, body_fr, body_pt)
VALUES (
  'travel-airport-checkin', 'travel', 1, false, 6, 80,
  'Havalimanında Check-in', 'Airport Check-in', 'Incheckning på Flygplatsen', 'Flughafen-Check-in',
  'Facturación en el Aeropuerto', 'Enregistrement à l''Aéroport', 'Check-in no Aeroporto',

  'Uçuşundan üç saat önce Zeynep havalimanına **vardı**. Check-in sırasına girdi ve pasaportunu hazırladı.

Görevli ona kaç parça **bagaj** olduğunu sordu. Zeynep bir valiz ve bir el çantasıyla geldiğini söyledi. Valize **etiket** yapıştırıldı ve bant üzerine bırakıldı.

Kartını aldı, güvenlik kontrolüne geçti. **Bekleme** salonuna girince rahatlıca oturdu. Yolculuk başlamıştı.',

  'Zeynep **arrived** at the airport three hours before her flight. She joined the check-in queue and prepared her passport.

The agent asked her how many pieces of **luggage** she had. Zeynep said she came with one suitcase and one carry-on. A **tag** was attached to the suitcase and it was placed on the belt.

She received her boarding pass and went through security. Once she entered the **waiting** lounge, she sat down comfortably. The journey had begun.',

  'Zeynep **anlände** till flygplatsen tre timmar före sin flygning. Hon ställde sig i incheckkön och förberedde sitt pass.

Agenten frågade henne hur många **bagage** hon hade. Zeynep sa att hon kom med en resväska och ett handbagage. En **etikett** fästes på resväskan och den placerades på bandet.

Hon fick sitt boardingkort och gick igenom säkerhetskontrollen. När hon kom in i **väntsalen** satte hon sig bekvämt. Resan hade börjat.',

  'Zeynep **kam** drei Stunden vor ihrem Flug am Flughafen an. Sie reihte sich in die Check-in-Schlange ein und bereitete ihren Pass vor.

Der Mitarbeiter fragte sie, wie viele **Gepäckstücke** sie habe. Zeynep sagte, sie habe einen Koffer und ein Handgepäck. Ein **Etikett** wurde am Koffer befestigt und er wurde aufs Band gelegt.

Sie erhielt ihre Bordkarte und ging durch die Sicherheitskontrolle. Als sie den **Wartebereich** betrat, setzte sie sich gemütlich hin. Die Reise hatte begonnen.',

  'Zeynep **llegó** al aeropuerto tres horas antes de su vuelo. Se puso en la fila de facturación y preparó su pasaporte.

El agente le preguntó cuántas piezas de **equipaje** tenía. Zeynep dijo que venía con una maleta y un bolso de mano. Se colocó una **etiqueta** en la maleta y se puso en la cinta.

Recibió su tarjeta de embarque y pasó por el control de seguridad. Una vez que entró en la sala de **espera**, se sentó cómodamente. El viaje había comenzado.',

  'Zeynep **est arrivée** à l''aéroport trois heures avant son vol. Elle a rejoint la file d''enregistrement et préparé son passeport.

L''agent lui a demandé combien de pièces de **bagages** elle avait. Zeynep a dit qu''elle venait avec une valise et un bagage à main. Une **étiquette** a été apposée sur la valise et elle a été déposée sur le tapis.

Elle a reçu sa carte d''embarquement et est passée par le contrôle de sécurité. Une fois entrée dans la salle d''**attente**, elle s''est assise confortablement. Le voyage avait commencé.',

  'Zeynep **chegou** ao aeroporto três horas antes do seu voo. Ela entrou na fila de check-in e preparou seu passaporte.

O agente perguntou quantas peças de **bagagem** ela tinha. Zeynep disse que veio com uma mala e uma bolsa de mão. Uma **etiqueta** foi colocada na mala e ela foi colocada na esteira.

Ela recebeu seu cartão de embarque e passou pelo controle de segurança. Ao entrar na sala de **espera**, sentou-se confortavelmente. A viagem havia começado.'
);

INSERT INTO reading_text_keywords (reading_text_id, position_index, color_index,
  keyword_tr, keyword_en, keyword_sv, keyword_de, keyword_es, keyword_fr, keyword_pt)
SELECT id, 0, 0, 'vardı', 'arrived', 'anlände', 'kam', 'llegó', 'est arrivée', 'chegou'
FROM reading_texts WHERE slug = 'travel-airport-checkin';

INSERT INTO reading_text_keywords (reading_text_id, position_index, color_index,
  keyword_tr, keyword_en, keyword_sv, keyword_de, keyword_es, keyword_fr, keyword_pt)
SELECT id, 1, 2, 'bagaj', 'luggage', 'bagage', 'Gepäckstücke', 'equipaje', 'bagages', 'bagagem'
FROM reading_texts WHERE slug = 'travel-airport-checkin';

INSERT INTO reading_text_keywords (reading_text_id, position_index, color_index,
  keyword_tr, keyword_en, keyword_sv, keyword_de, keyword_es, keyword_fr, keyword_pt)
SELECT id, 2, 5, 'etiket', 'tag', 'etikett', 'Etikett', 'etiqueta', 'étiquette', 'etiqueta'
FROM reading_texts WHERE slug = 'travel-airport-checkin';

INSERT INTO reading_text_keywords (reading_text_id, position_index, color_index,
  keyword_tr, keyword_en, keyword_sv, keyword_de, keyword_es, keyword_fr, keyword_pt)
SELECT id, 3, 8, 'bekleme', 'waiting', 'väntsalen', 'Wartebereich', 'espera', 'attente', 'espera'
FROM reading_texts WHERE slug = 'travel-airport-checkin';

-- ─────────────────────────────────────────────────────────────────────────────

-- Text 7: Hotel Arrival
INSERT INTO reading_texts (slug, category, difficulty, is_premium, order_index, estimated_reading_seconds,
  title_tr, title_en, title_sv, title_de, title_es, title_fr, title_pt,
  body_tr, body_en, body_sv, body_de, body_es, body_fr, body_pt)
VALUES (
  'travel-hotel-arrival', 'travel', 1, false, 7, 75,
  'Otele Varış', 'Arriving at the Hotel', 'Ankomst till Hotellet', 'Ankunft im Hotel',
  'Llegada al Hotel', 'Arrivée à l''Hôtel', 'Chegada ao Hotel',

  'Emre otele **giriş** yaptı. Resepsiyonist ona sıcak bir şekilde güldü ve pasaportunu istedi.

"Odanız hazır," dedi. Emre **anahtarını** aldı ve asansöre yürüdü. Oda temiz ve sessizdi. Penceresinden şehir **manzarası** görünüyordu.

Bavulunu bıraktı, biraz dinlendi. Yarın çok yer **gezecekti**. Ama bu gece sadece dinlenmek istiyordu. Seyahatin en güzel anlarından biri: yeni bir yerde ilk gece.',

  'Emre **checked in** at the hotel. The receptionist smiled warmly and asked for his passport.

"Your room is ready," she said. Emre took his **key** and walked to the elevator. The room was clean and quiet. From the window, there was a view of the city **skyline**.

He put down his suitcase and rested a little. Tomorrow he would **explore** many places. But tonight he just wanted to rest. One of the best moments of travel: the first night in a new place.',

  'Emre **checkade in** på hotellet. Receptionisten log varmt och bad om hans pass.

"Ditt rum är klart," sa hon. Emre tog sin **nyckel** och gick mot hissen. Rummet var rent och tyst. Från fönstret syntes en utsikt över stadens **silhuett**.

Han lade ner sin resväska och vilade lite. Imorgon skulle han **utforska** många platser. Men ikväll ville han bara vila. Ett av resans bästa ögonblick: den första natten på en ny plats.',

  'Emre **checkte ein** im Hotel. Die Rezeptionistin lächelte herzlich und bat um seinen Pass.

"Ihr Zimmer ist fertig," sagte sie. Emre nahm seinen **Schlüssel** und ging zum Aufzug. Das Zimmer war sauber und ruhig. Vom Fenster aus sah man die **Skyline** der Stadt.

Er stellte seinen Koffer ab und ruhte sich ein wenig aus. Morgen würde er viele Orte **erkunden**. Aber heute Abend wollte er nur ausruhen. Einer der schönsten Momente einer Reise: die erste Nacht an einem neuen Ort.',

  'Emre hizo el **check-in** en el hotel. La recepcionista sonrió calurosamente y pidió su pasaporte.

"Su habitación está lista," dijo. Emre tomó su **llave** y caminó hacia el ascensor. La habitación estaba limpia y tranquila. Desde la ventana se veía el **horizonte** de la ciudad.

Dejó su maleta y descansó un poco. Mañana **exploraría** muchos lugares. Pero esta noche solo quería descansar. Uno de los mejores momentos del viaje: la primera noche en un lugar nuevo.',

  'Emre a **fait son check-in** à l''hôtel. La réceptionniste a souri chaleureusement et demandé son passeport.

"Votre chambre est prête," dit-elle. Emre a pris sa **clé** et a marché vers l''ascenseur. La chambre était propre et calme. Depuis la fenêtre, on voyait la **skyline** de la ville.

Il a posé sa valise et s''est reposé un peu. Demain il **explorerait** de nombreux endroits. Mais ce soir il voulait juste se reposer. Un des meilleurs moments du voyage : la première nuit dans un nouvel endroit.',

  'Emre fez o **check-in** no hotel. A recepcionista sorriu calorosamente e pediu seu passaporte.

"Seu quarto está pronto," disse ela. Emre pegou sua **chave** e caminhou até o elevador. O quarto estava limpo e silencioso. Da janela, havia uma vista do **horizonte** da cidade.

Ele largou a mala e descansou um pouco. Amanhã ele **exploraria** muitos lugares. Mas esta noite ele só queria descansar. Um dos melhores momentos da viagem: a primeira noite em um lugar novo.'
);

INSERT INTO reading_text_keywords (reading_text_id, position_index, color_index,
  keyword_tr, keyword_en, keyword_sv, keyword_de, keyword_es, keyword_fr, keyword_pt)
SELECT id, 0, 1, 'giriş', 'checked in', 'checkade in', 'checkte ein', 'check-in', 'fait son check-in', 'check-in'
FROM reading_texts WHERE slug = 'travel-hotel-arrival';

INSERT INTO reading_text_keywords (reading_text_id, position_index, color_index,
  keyword_tr, keyword_en, keyword_sv, keyword_de, keyword_es, keyword_fr, keyword_pt)
SELECT id, 1, 4, 'anahtarını', 'key', 'nyckel', 'Schlüssel', 'llave', 'clé', 'chave'
FROM reading_texts WHERE slug = 'travel-hotel-arrival';

INSERT INTO reading_text_keywords (reading_text_id, position_index, color_index,
  keyword_tr, keyword_en, keyword_sv, keyword_de, keyword_es, keyword_fr, keyword_pt)
SELECT id, 2, 6, 'manzarası', 'skyline', 'silhuett', 'Skyline', 'horizonte', 'skyline', 'horizonte'
FROM reading_texts WHERE slug = 'travel-hotel-arrival';

INSERT INTO reading_text_keywords (reading_text_id, position_index, color_index,
  keyword_tr, keyword_en, keyword_sv, keyword_de, keyword_es, keyword_fr, keyword_pt)
SELECT id, 3, 9, 'gezecekti', 'explore', 'utforska', 'erkunden', 'exploraría', 'explorerait', 'exploraria'
FROM reading_texts WHERE slug = 'travel-hotel-arrival';

-- ─────────────────────────────────────────────────────────────────────────────

-- Text 8: Asking for Directions
INSERT INTO reading_texts (slug, category, difficulty, is_premium, order_index, estimated_reading_seconds,
  title_tr, title_en, title_sv, title_de, title_es, title_fr, title_pt,
  body_tr, body_en, body_sv, body_de, body_es, body_fr, body_pt)
VALUES (
  'travel-asking-directions', 'travel', 1, false, 8, 70,
  'Yol Sorma', 'Asking for Directions', 'Fråga om Vägen', 'Nach dem Weg Fragen',
  'Pedir Indicaciones', 'Demander son Chemin', 'Pedir Direções',

  'Fatih müzede kayboldu. Çıkış neredeydi? Yanındaki bir adamdan **yardım** istedi.

Adam ona yavaşça anlattı: "Sola dön, düz git, merdivenden **in**." Fatih dinledi ve tekrarladı. Adam başını salladı, doğruydu.

Birkaç dakika sonra Fatih çıkışta duruyordu. Dil bilmek her zaman bu kadar **işe yaramayabilir** ama bir **selam** ve kibarca sormak her yerde kapı açar.',

  'Fatih got lost in the museum. Where was the exit? He asked a man nearby for **help**.

The man explained slowly: "Turn left, go straight, go **down** the stairs." Fatih listened and repeated it. The man nodded, it was correct.

A few minutes later Fatih was standing at the exit. Knowing a language may not always be this **useful**, but a **greeting** and asking politely opens doors everywhere.',

  'Fatih gick vilse på museet. Var var utgången? Han bad en man i närheten om **hjälp**.

Mannen förklarade långsamt: "Sväng vänster, gå rakt fram, gå **ner** för trappan." Fatih lyssnade och upprepade. Mannen nickade, det var rätt.

Några minuter senare stod Fatih vid utgången. Att kunna ett språk är kanske inte alltid så här **användbart**, men en **hälsning** och ett artigt frågande öppnar dörrar överallt.',

  'Fatih verlief sich im Museum. Wo war der Ausgang? Er bat einen Mann in der Nähe um **Hilfe**.

Der Mann erklärte langsam: "Links abbiegen, geradeaus gehen, die Treppe **hinuntergehen**." Fatih hörte zu und wiederholte es. Der Mann nickte, es stimmte.

Wenige Minuten später stand Fatih am Ausgang. Eine Sprache zu kennen ist vielleicht nicht immer so **nützlich**, aber ein **Gruß** und höfliches Fragen öffnet überall Türen.',

  'Fatih se perdió en el museo. ¿Dónde estaba la salida? Le pidió **ayuda** a un hombre cercano.

El hombre explicó despacio: "Gira a la izquierda, sigue recto, **baja** las escaleras." Fatih escuchó y repitió. El hombre asintió, era correcto.

Unos minutos después Fatih estaba parado en la salida. Saber un idioma puede que no siempre sea tan **útil**, pero un **saludo** y preguntar amablemente abre puertas en todas partes.',

  'Fatih s''est perdu dans le musée. Où était la sortie ? Il a demandé **de l''aide** à un homme à proximité.

L''homme a expliqué lentement : "Tournez à gauche, allez tout droit, **descendez** les escaliers." Fatih a écouté et répété. L''homme a hoché la tête, c''était correct.

Quelques minutes plus tard, Fatih se tenait à la sortie. Connaître une langue n''est peut-être pas toujours aussi **utile**, mais un **bonjour** et une question polie ouvrent des portes partout.',

  'Fatih se perdeu no museu. Onde ficava a saída? Ele pediu **ajuda** a um homem próximo.

O homem explicou devagar: "Vire à esquerda, vá em frente, **desça** as escadas." Fatih ouviu e repetiu. O homem concordou com a cabeça, estava correto.

Alguns minutos depois Fatih estava parado na saída. Conhecer um idioma pode não ser sempre tão **útil**, mas uma **saudação** e perguntar educadamente abre portas em todos os lugares.'
);

INSERT INTO reading_text_keywords (reading_text_id, position_index, color_index,
  keyword_tr, keyword_en, keyword_sv, keyword_de, keyword_es, keyword_fr, keyword_pt)
SELECT id, 0, 0, 'yardım', 'help', 'hjälp', 'Hilfe', 'ayuda', 'de l''aide', 'ajuda'
FROM reading_texts WHERE slug = 'travel-asking-directions';

INSERT INTO reading_text_keywords (reading_text_id, position_index, color_index,
  keyword_tr, keyword_en, keyword_sv, keyword_de, keyword_es, keyword_fr, keyword_pt)
SELECT id, 1, 3, 'in', 'down', 'ner', 'hinuntergehen', 'baja', 'descendez', 'desça'
FROM reading_texts WHERE slug = 'travel-asking-directions';

INSERT INTO reading_text_keywords (reading_text_id, position_index, color_index,
  keyword_tr, keyword_en, keyword_sv, keyword_de, keyword_es, keyword_fr, keyword_pt)
SELECT id, 2, 6, 'işe yaramayabilir', 'useful', 'användbart', 'nützlich', 'útil', 'utile', 'útil'
FROM reading_texts WHERE slug = 'travel-asking-directions';

INSERT INTO reading_text_keywords (reading_text_id, position_index, color_index,
  keyword_tr, keyword_en, keyword_sv, keyword_de, keyword_es, keyword_fr, keyword_pt)
SELECT id, 3, 8, 'selam', 'greeting', 'hälsning', 'Gruß', 'saludo', 'bonjour', 'saudação'
FROM reading_texts WHERE slug = 'travel-asking-directions';

-- ─────────────────────────────────────────────────────────────────────────────

-- Text 9: Restaurant Abroad
INSERT INTO reading_texts (slug, category, difficulty, is_premium, order_index, estimated_reading_seconds,
  title_tr, title_en, title_sv, title_de, title_es, title_fr, title_pt,
  body_tr, body_en, body_sv, body_de, body_es, body_fr, body_pt)
VALUES (
  'travel-restaurant-abroad', 'travel', 2, false, 9, 85,
  'Yurt Dışında Restoran', 'A Restaurant Abroad', 'En Restaurang Utomlands', 'Restaurant im Ausland',
  'Un Restaurante en el Extranjero', 'Un Restaurant à l''Étranger', 'Um Restaurante no Exterior',

  'Nil yabancı bir ülkede güzel bir restorana girdi. Garson ona **menüyü** getirdi. Hiç tanımadığı yemekler vardı.

"Bu ne?" diye sordu ve parmağıyla bir yemeği **gösterdi**. Garson anlattı ama Nil hâlâ emin değildi. "Tavsiye eder misiniz?" diye ekledi.

Garson gülümsedi ve en popüler yemeği **önerdi**. Nil denemeye karar verdi. Yemek harikaydı. Bazen bilmediğin şeyi **denemek** en güzel macera.',

  'Nil entered a nice restaurant in a foreign country. The waiter brought her the **menu**. There were dishes she had never heard of.

"What is this?" she asked and **pointed** at a dish. The waiter explained but Nil was still unsure. "Do you recommend it?" she added.

The waiter smiled and **suggested** the most popular dish. Nil decided to try it. The food was wonderful. Sometimes **trying** something you don''t know is the greatest adventure.',

  'Nil gick in på en fin restaurang i ett främmande land. Servitören gav henne **menyn**. Det fanns rätter hon aldrig hört talas om.

"Vad är det här?" frågade hon och **pekade** på en rätt. Servitören förklarade men Nil var fortfarande osäker. "Rekommenderar ni den?" tillade hon.

Servitören log och **föreslog** den mest populära rätten. Nil bestämde sig för att prova. Maten var underbar. Ibland är det det bästa äventyret att **prova** något man inte känner till.',

  'Nil betrat ein schönes Restaurant in einem fremden Land. Der Kellner brachte ihr die **Speisekarte**. Es gab Gerichte, von denen sie noch nie gehört hatte.

"Was ist das?" fragte sie und **zeigte** auf ein Gericht. Der Kellner erklärte es, aber Nil war immer noch unsicher. "Empfehlen Sie es?" fügte sie hinzu.

Der Kellner lächelte und **empfahl** das beliebteste Gericht. Nil entschied sich, es zu versuchen. Das Essen war wunderbar. Manchmal ist es das größte Abenteuer, etwas Unbekanntes zu **probieren**.',

  'Nil entró a un bonito restaurante en un país extranjero. El mesero le trajo el **menú**. Había platos que nunca había escuchado.

"¿Qué es esto?" preguntó y **señaló** un plato. El mesero explicó pero Nil seguía sin estar segura. "¿Lo recomiendan?" añadió.

El mesero sonrió y **sugirió** el plato más popular. Nil decidió probarlo. La comida era maravillosa. A veces **probar** algo que no conoces es la mayor aventura.',

  'Nil est entrée dans un beau restaurant dans un pays étranger. Le serveur lui a apporté le **menu**. Il y avait des plats qu''elle n''avait jamais entendus.

"Qu''est-ce que c''est ?" a-t-elle demandé en **montrant** un plat du doigt. Le serveur a expliqué mais Nil n''était toujours pas sûre. "Vous le recommandez ?" a-t-elle ajouté.

Le serveur a souri et a **suggéré** le plat le plus populaire. Nil a décidé de l''essayer. La nourriture était merveilleuse. Parfois **essayer** quelque chose qu''on ne connaît pas est la plus belle aventure.',

  'Nil entrou em um belo restaurante em um país estrangeiro. O garçom trouxe o **cardápio**. Havia pratos que ela nunca havia ouvido falar.

"O que é isso?" ela perguntou e **apontou** para um prato. O garçom explicou mas Nil ainda estava insegura. "Vocês recomendam?" ela adicionou.

O garçom sorriu e **sugeriu** o prato mais popular. Nil decidiu experimentar. A comida era maravilhosa. Às vezes **experimentar** algo que você não conhece é a maior aventura.'
);

INSERT INTO reading_text_keywords (reading_text_id, position_index, color_index,
  keyword_tr, keyword_en, keyword_sv, keyword_de, keyword_es, keyword_fr, keyword_pt)
SELECT id, 0, 2, 'menüyü', 'menu', 'menyn', 'Speisekarte', 'menú', 'menu', 'cardápio'
FROM reading_texts WHERE slug = 'travel-restaurant-abroad';

INSERT INTO reading_text_keywords (reading_text_id, position_index, color_index,
  keyword_tr, keyword_en, keyword_sv, keyword_de, keyword_es, keyword_fr, keyword_pt)
SELECT id, 1, 4, 'gösterdi', 'pointed', 'pekade', 'zeigte', 'señaló', 'montrant', 'apontou'
FROM reading_texts WHERE slug = 'travel-restaurant-abroad';

INSERT INTO reading_text_keywords (reading_text_id, position_index, color_index,
  keyword_tr, keyword_en, keyword_sv, keyword_de, keyword_es, keyword_fr, keyword_pt)
SELECT id, 2, 6, 'önerdi', 'suggested', 'föreslog', 'empfahl', 'sugirió', 'suggéré', 'sugeriu'
FROM reading_texts WHERE slug = 'travel-restaurant-abroad';

INSERT INTO reading_text_keywords (reading_text_id, position_index, color_index,
  keyword_tr, keyword_en, keyword_sv, keyword_de, keyword_es, keyword_fr, keyword_pt)
SELECT id, 3, 9, 'denemek', 'trying', 'prova', 'probieren', 'probar', 'essayer', 'experimentar'
FROM reading_texts WHERE slug = 'travel-restaurant-abroad';

-- ─────────────────────────────────────────────────────────────────────────────

-- Text 10: On the Train
INSERT INTO reading_texts (slug, category, difficulty, is_premium, order_index, estimated_reading_seconds,
  title_tr, title_en, title_sv, title_de, title_es, title_fr, title_pt,
  body_tr, body_en, body_sv, body_de, body_es, body_fr, body_pt)
VALUES (
  'travel-on-the-train', 'travel', 1, false, 10, 75,
  'Trende', 'On the Train', 'På Tåget', 'Im Zug',
  'En el Tren', 'Dans le Train', 'No Trem',

  'Hakan trene bindi ve pencerenin yanındaki **koltuğa** oturdu. Tren hareket etti. Dışarısı hızla geçen ağaçlar ve tarlalar.

Yanındaki yolcu ona döndü: "Nereye **gidiyorsunuz**?" diye sordu. Hakan şehrin adını söyledi. Yolcu gülümsedi; aynı yere gidiyorlardı.

Sohbet etmeye başladılar. Şehir hakkında **tavsiyeler** aldı. En iyi kahveciler, **görülmesi** gereken yerler. Tren yolculuğu bir maceraya dönüştü.',

  'Hakan got on the train and sat in the **seat** by the window. The train moved. Outside, quickly passing trees and fields.

The passenger next to him turned: "Where are you **going**?" he asked. Hakan said the name of the city. The passenger smiled; they were going to the same place.

They started talking. He got **recommendations** about the city. The best cafés, places **to see**. The train journey turned into an adventure.',

  'Hakan gick på tåget och satte sig på **sätet** vid fönstret. Tåget rörde sig. Utanför snabbt passerande träd och fält.

Passageraren bredvid honom vände sig om: "Vart **åker** du?" frågade han. Hakan sa stadens namn. Passageraren log; de åkte till samma ställe.

De började prata. Han fick **rekommendationer** om staden. De bästa kaféerna, **sevärdheter**. Tågresan förvandlades till ett äventyr.',

  'Hakan stieg in den Zug und setzte sich auf den **Sitz** am Fenster. Der Zug fuhr ab. Draußen schnell vorbeiziehende Bäume und Felder.

Der Passagier neben ihm drehte sich um: "Wohin **fahren** Sie?" fragte er. Hakan nannte den Namen der Stadt. Der Passagier lächelte; sie fuhren zum gleichen Ort.

Sie begannen zu reden. Er bekam **Empfehlungen** über die Stadt. Die besten Cafés, **Sehenswürdigkeiten**. Die Zugfahrt wurde zu einem Abenteuer.',

  'Hakan subió al tren y se sentó en el **asiento** junto a la ventana. El tren se movió. Afuera, árboles y campos que pasaban rápidamente.

El pasajero de al lado se volvió: "¿A dónde **va**?" preguntó. Hakan dijo el nombre de la ciudad. El pasajero sonrió; iban al mismo lugar.

Empezaron a hablar. Recibió **recomendaciones** sobre la ciudad. Los mejores cafés, lugares **que ver**. El viaje en tren se convirtió en una aventura.',

  'Hakan est monté dans le train et s''est assis sur le **siège** près de la fenêtre. Le train a démarré. Dehors, des arbres et des champs qui défilaient rapidement.

Le passager à côté de lui s''est retourné : "Où **allez**-vous ?" a-t-il demandé. Hakan a dit le nom de la ville. Le passager a souri ; ils allaient au même endroit.

Ils ont commencé à parler. Il a eu des **recommandations** sur la ville. Les meilleurs cafés, les endroits **à voir**. Le voyage en train s''est transformé en aventure.',

  'Hakan entrou no trem e sentou no **assento** perto da janela. O trem se moveu. Lá fora, árvores e campos passando rapidamente.

O passageiro ao lado se virou: "Para onde você **vai**?" ele perguntou. Hakan disse o nome da cidade. O passageiro sorriu; eles iam para o mesmo lugar.

Eles começaram a conversar. Ele recebeu **recomendações** sobre a cidade. Os melhores cafés, lugares **para ver**. A viagem de trem se transformou em uma aventura.'
);

INSERT INTO reading_text_keywords (reading_text_id, position_index, color_index,
  keyword_tr, keyword_en, keyword_sv, keyword_de, keyword_es, keyword_fr, keyword_pt)
SELECT id, 0, 1, 'koltuğa', 'seat', 'sätet', 'Sitz', 'asiento', 'siège', 'assento'
FROM reading_texts WHERE slug = 'travel-on-the-train';

INSERT INTO reading_text_keywords (reading_text_id, position_index, color_index,
  keyword_tr, keyword_en, keyword_sv, keyword_de, keyword_es, keyword_fr, keyword_pt)
SELECT id, 1, 3, 'gidiyorsunuz', 'going', 'åker', 'fahren', 'va', 'allez', 'vai'
FROM reading_texts WHERE slug = 'travel-on-the-train';

INSERT INTO reading_text_keywords (reading_text_id, position_index, color_index,
  keyword_tr, keyword_en, keyword_sv, keyword_de, keyword_es, keyword_fr, keyword_pt)
SELECT id, 2, 5, 'tavsiyeler', 'recommendations', 'rekommendationer', 'Empfehlungen', 'recomendaciones', 'recommandations', 'recomendações'
FROM reading_texts WHERE slug = 'travel-on-the-train';

INSERT INTO reading_text_keywords (reading_text_id, position_index, color_index,
  keyword_tr, keyword_en, keyword_sv, keyword_de, keyword_es, keyword_fr, keyword_pt)
SELECT id, 3, 7, 'görülmesi', 'to see', 'sevärdheter', 'Sehenswürdigkeiten', 'que ver', 'à voir', 'para ver'
FROM reading_texts WHERE slug = 'travel-on-the-train';
