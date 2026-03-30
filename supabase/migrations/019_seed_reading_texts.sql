-- Migration 019: Seed 10 new reading texts (order_index 11-20)
-- Categories: daily_life (4), travel (3), work (3)
-- All 7 languages: tr, en, sv, de, es, fr, pt
-- Keywords: fresh, not used in texts 1-10

-- ─────────────────────────────────────────────────────────────
-- TEXT 11: daily-life-cooking-dinner (daily_life, difficulty 1)
-- Keywords: cook/pişirecek, recipe/tarife, aroma/kokuyla, thickens/koyulaşır, table/sofraya
-- ─────────────────────────────────────────────────────────────

INSERT INTO reading_texts (
  slug, category, difficulty, is_premium, order_index, estimated_reading_seconds,
  title_tr, title_en, title_sv, title_de, title_es, title_fr, title_pt,
  body_tr, body_en, body_sv, body_de, body_es, body_fr, body_pt
) VALUES (
  'daily-life-cooking-dinner',
  'daily_life', 1, false, 11, 80,

  'Akşam Yemeği', 'Cooking Dinner', 'Laga Middag', 'Abendessen Kochen',
  'Cocinar la Cena', 'Préparer le Dîner', 'Cozinhar o Jantar',

  -- BODY TR (keywords: pişirecek=0, tarife=1, kokuyla=2, koyulaşır=3, sofraya=4)
  'Mia bu akşam ailesi için özel bir yemek **pişirecek**. Mutfak tezgahına malzemeleri dizer ve annesinden öğrendiği eski **tarife** bakar. Her şey hazır, ocak yanıyor.

Yavaş yavaş pişen yemek, mutfağı tatlı bir **kokuyla** dolduruyor. Sos karıştırıldıkça **koyulaşır** ve rengi koyulaşır. Mia bir kaşık alıp tadına bakar — tam istediği gibi.

Birkaç dakika sonra aile masaya toplanır. Mia yemeği büyük bir zevkle **sofraya** taşır. Herkes ilk lokmadan sonra gülümser.',

  -- BODY EN
  'Mia is going to **cook** a special meal for her family tonight. She lines up the ingredients on the counter and looks at an old **recipe** she learned from her mother. Everything is ready, the stove is on.

The dish simmers slowly, filling the kitchen with a sweet **aroma**. The sauce **thickens** as it is stirred and its colour deepens. Mia takes a spoon and tastes it — exactly as she wanted.

A few minutes later the family gathers at the table. Mia carries the food happily to the **table**. Everyone smiles after the first bite.',

  -- BODY SV
  'Mia ska **laga** en speciell middag till sin familj ikväll. Hon ställer upp ingredienserna på bänken och tittar på ett gammalt **recept** hon lärt sig av sin mamma. Allt är klart, spisen är på.

Maten puttrar långsamt och fyller köket med en söt **arom**. Såsen **tjocknar** när den rörs om och färgen mörknar. Mia tar en sked och smakar — precis som hon ville ha det.

Några minuter senare samlas familjen vid bordet. Mia bär glatt fram maten till **bordet**. Alla ler efter den första tuggan.',

  -- BODY DE
  'Mia wird heute Abend ein besonderes Gericht für ihre Familie **kochen**. Sie stellt die Zutaten auf der Arbeitsplatte auf und schaut in ein altes **Rezept**, das sie von ihrer Mutter gelernt hat. Alles ist bereit, der Herd ist an.

Das Gericht köchelt langsam und füllt die Küche mit einem süßen **Aroma**. Die Soße **verdickt sich** beim Rühren und ihre Farbe wird dunkler. Mia nimmt einen Löffel und kostet — genau wie gewünscht.

Einige Minuten später versammelt sich die Familie am Tisch. Mia trägt das Essen freudig auf den **Tisch**. Nach dem ersten Bissen lächeln alle.',

  -- BODY ES
  'Mia va a **cocinar** una comida especial para su familia esta noche. Coloca los ingredientes en la encimera y mira una vieja **receta** que aprendió de su madre. Todo está listo, el fuego está encendido.

El plato se cocina a fuego lento, llenando la cocina de un dulce **aroma**. La salsa **espesa** al removerla y su color se oscurece. Mia toma una cuchara y la prueba — exactamente como quería.

Pocos minutos después, la familia se reúne en la mesa. Mia lleva la comida con alegría a la **mesa**. Todos sonríen tras el primer bocado.',

  -- BODY FR
  'Mia va **cuisiner** un repas spécial pour sa famille ce soir. Elle aligne les ingrédients sur le plan de travail et consulte une vieille **recette** apprise auprès de sa mère. Tout est prêt, la cuisinière est allumée.

Le plat mijote doucement, remplissant la cuisine d''un doux **arôme**. La sauce **épaissit** en étant remuée et sa couleur s''intensifie. Mia prend une cuillère et goûte — exactement comme elle le souhaitait.

Quelques minutes plus tard, la famille se réunit à table. Mia apporte joyeusement le repas à **table**. Tout le monde sourit après la première bouchée.',

  -- BODY PT
  'Mia vai **cozinhar** uma refeição especial para a sua família esta noite. Ela alinha os ingredientes na bancada e consulta uma velha **receita** que aprendeu com a mãe. Tudo está pronto, o fogão está ligado.

O prato cozinha em lume brando, enchendo a cozinha com um doce **aroma**. O molho **engrossa** ao ser mexido e a sua cor escurece. Mia pega numa colher e prova — exatamente como queria.

Alguns minutos depois a família reúne-se à mesa. Mia leva a comida alegremente para a **mesa**. Todos sorriem após a primeira garfada.'
);

INSERT INTO reading_text_keywords (reading_text_id, position_index, color_index,
  keyword_tr, keyword_en, keyword_sv, keyword_de, keyword_es, keyword_fr, keyword_pt)
SELECT id, 0, 0, 'pişirecek', 'cook', 'laga', 'kochen', 'cocinar', 'cuisiner', 'cozinhar'
FROM reading_texts WHERE slug = 'daily-life-cooking-dinner';

INSERT INTO reading_text_keywords (reading_text_id, position_index, color_index,
  keyword_tr, keyword_en, keyword_sv, keyword_de, keyword_es, keyword_fr, keyword_pt)
SELECT id, 1, 2, 'tarife', 'recipe', 'recept', 'Rezept', 'receta', 'recette', 'receita'
FROM reading_texts WHERE slug = 'daily-life-cooking-dinner';

INSERT INTO reading_text_keywords (reading_text_id, position_index, color_index,
  keyword_tr, keyword_en, keyword_sv, keyword_de, keyword_es, keyword_fr, keyword_pt)
SELECT id, 2, 4, 'kokuyla', 'aroma', 'arom', 'Aroma', 'aroma', 'arôme', 'aroma'
FROM reading_texts WHERE slug = 'daily-life-cooking-dinner';

INSERT INTO reading_text_keywords (reading_text_id, position_index, color_index,
  keyword_tr, keyword_en, keyword_sv, keyword_de, keyword_es, keyword_fr, keyword_pt)
SELECT id, 3, 6, 'koyulaşır', 'thickens', 'tjocknar', 'verdickt sich', 'espesa', 'épaissit', 'engrossa'
FROM reading_texts WHERE slug = 'daily-life-cooking-dinner';

INSERT INTO reading_text_keywords (reading_text_id, position_index, color_index,
  keyword_tr, keyword_en, keyword_sv, keyword_de, keyword_es, keyword_fr, keyword_pt)
SELECT id, 4, 8, 'sofraya', 'table', 'bordet', 'Tisch', 'mesa', 'table', 'mesa'
FROM reading_texts WHERE slug = 'daily-life-cooking-dinner';

-- ─────────────────────────────────────────────────────────────
-- TEXT 12: daily-life-rainy-day (daily_life, difficulty 1)
-- Keywords: yağmurlu/rainy, kitap/book, bardağına/cup, telaşsız/unhurried, penceresinden/window
-- ─────────────────────────────────────────────────────────────

INSERT INTO reading_texts (
  slug, category, difficulty, is_premium, order_index, estimated_reading_seconds,
  title_tr, title_en, title_sv, title_de, title_es, title_fr, title_pt,
  body_tr, body_en, body_sv, body_de, body_es, body_fr, body_pt
) VALUES (
  'daily-life-rainy-day',
  'daily_life', 1, false, 12, 75,

  'Yağmurlu Bir Gün', 'A Rainy Day', 'En Regnig Dag', 'Ein Regentag',
  'Un Día Lluvioso', 'Une Journée Pluvieuse', 'Um Dia Chuvoso',

  -- BODY TR (keywords: yağmurlu=0, kitap=1, bardağına=2, telaşsız=3, penceresinden=4)
  'Bugün dışarısı **yağmurlu**. Lucas evde kalmaya karar verir ve rahat bir köşeye yerleşir. Uzun zamandır okumak istediği **kitabı** raftan alır.

Sıcak bir çay demler ve en sevdiği **bardağına** döker. Yağmur sesi eşliğinde sayfa çevirir. Bu sakin ritim onu mutlu eder.

Lucas bugün hiçbir yere gitmeyecek, hiçbir şeye yetişmeyecek. **Telaşsız** bir gün bazen tam olarak ihtiyaç duyduğun şeydir. Akşama kadar **penceresinden** yağmuru izler.',

  -- BODY EN
  'Today it is **rainy** outside. Lucas decides to stay home and settles into a cosy corner. He takes a **book** he has been wanting to read for a long time from the shelf.

He brews a hot tea and pours it into his favourite **cup**. He turns pages to the sound of rain. This calm rhythm makes him happy.

Lucas will not go anywhere today, will not rush to anything. An **unhurried** day is sometimes exactly what you need. He watches the rain through his **window** until evening.',

  -- BODY SV
  'Idag är det **regnigt** ute. Lucas bestämmer sig för att stanna hemma och slår sig ner i en mysig vrå. Han tar en **bok** som han länge velat läsa från hyllan.

Han brygger ett varmt te och häller upp det i sin favoritmugg. Han bläddrar i sidor till regnsounds. Denna lugna rytm gör honom glad.

Lucas ska inte gå någonstans idag, inte hasta sig till något. En **ostressad** dag är ibland precis vad man behöver. Han tittar på regnet genom sitt **fönster** ända till kvällen.',

  -- BODY DE
  'Heute ist es draußen **regnerisch**. Lucas beschließt, zu Hause zu bleiben, und macht es sich in einer gemütlichen Ecke bequem. Er nimmt ein **Buch** vom Regal, das er schon lange lesen wollte.

Er brüht einen heißen Tee und gießt ihn in seine Lieblingstasse. Er blättert beim Klang des Regens durch die Seiten. Dieser ruhige Rhythmus macht ihn glücklich.

Lucas wird heute nirgendwo hingehen und sich um nichts beeilen. Ein **geruhsamer** Tag ist manchmal genau das, was man braucht. Er schaut bis zum Abend durch sein **Fenster** auf den Regen.',

  -- BODY ES
  'Hoy está **lluvioso** fuera. Lucas decide quedarse en casa y se instala en un rincón acogedor. Toma un **libro** del estante que lleva tiempo queriendo leer.

Prepara un té caliente y lo vierte en su **taza** favorita. Pasa páginas al son de la lluvia. Este ritmo tranquilo le hace feliz.

Lucas no irá a ningún sitio hoy, no correrá por nada. Un día **tranquilo** es a veces exactamente lo que necesitas. Observa la lluvia por su **ventana** hasta la tarde.',

  -- BODY FR
  'Aujourd''hui, il est **pluvieux** dehors. Lucas décide de rester à la maison et s''installe dans un coin confortable. Il prend un **livre** qu''il voulait lire depuis longtemps sur l''étagère.

Il prépare un thé chaud et le verse dans sa **tasse** préférée. Il tourne les pages au son de la pluie. Ce rythme calme le rend heureux.

Lucas n''ira nulle part aujourd''hui, ne se pressera pour rien. Une journée **tranquille** est parfois exactement ce dont vous avez besoin. Il regarde la pluie par sa **fenêtre** jusqu''au soir.',

  -- BODY PT
  'Hoje está **chuvoso** lá fora. Lucas decide ficar em casa e instala-se num canto acolhedor. Tira um **livro** da prateleira que quer ler há muito tempo.

Prepara um chá quente e verte-o na sua **chávena** favorita. Vira páginas ao som da chuva. Este ritmo calmo deixa-o feliz.

Lucas não vai a lado nenhum hoje, não vai correr para nada. Um dia **tranquilo** é às vezes exatamente o que você precisa. Observa a chuva pela sua **janela** até à noite.'
);

INSERT INTO reading_text_keywords (reading_text_id, position_index, color_index,
  keyword_tr, keyword_en, keyword_sv, keyword_de, keyword_es, keyword_fr, keyword_pt)
SELECT id, 0, 0, 'yağmurlu', 'rainy', 'regnigt', 'regnerisch', 'lluvioso', 'pluvieux', 'chuvoso'
FROM reading_texts WHERE slug = 'daily-life-rainy-day';

INSERT INTO reading_text_keywords (reading_text_id, position_index, color_index,
  keyword_tr, keyword_en, keyword_sv, keyword_de, keyword_es, keyword_fr, keyword_pt)
SELECT id, 1, 2, 'kitap', 'book', 'bok', 'Buch', 'libro', 'livre', 'livro'
FROM reading_texts WHERE slug = 'daily-life-rainy-day';

INSERT INTO reading_text_keywords (reading_text_id, position_index, color_index,
  keyword_tr, keyword_en, keyword_sv, keyword_de, keyword_es, keyword_fr, keyword_pt)
SELECT id, 2, 4, 'bardağına', 'cup', 'mugg', 'Tasse', 'taza', 'tasse', 'chávena'
FROM reading_texts WHERE slug = 'daily-life-rainy-day';

INSERT INTO reading_text_keywords (reading_text_id, position_index, color_index,
  keyword_tr, keyword_en, keyword_sv, keyword_de, keyword_es, keyword_fr, keyword_pt)
SELECT id, 3, 6, 'telaşsız', 'unhurried', 'ostressad', 'geruhsamer', 'tranquilo', 'tranquille', 'tranquilo'
FROM reading_texts WHERE slug = 'daily-life-rainy-day';

INSERT INTO reading_text_keywords (reading_text_id, position_index, color_index,
  keyword_tr, keyword_en, keyword_sv, keyword_de, keyword_es, keyword_fr, keyword_pt)
SELECT id, 4, 8, 'penceresinden', 'window', 'fönster', 'Fenster', 'ventana', 'fenêtre', 'janela'
FROM reading_texts WHERE slug = 'daily-life-rainy-day';

-- ─────────────────────────────────────────────────────────────
-- TEXT 13: daily-life-haircut (daily_life, difficulty 2)
-- Keywords: randevu/appointment, kesiyor/cuts, aynada/mirror, değişim/change, memnun/satisfied
-- ─────────────────────────────────────────────────────────────

INSERT INTO reading_texts (
  slug, category, difficulty, is_premium, order_index, estimated_reading_seconds,
  title_tr, title_en, title_sv, title_de, title_es, title_fr, title_pt,
  body_tr, body_en, body_sv, body_de, body_es, body_fr, body_pt
) VALUES (
  'daily-life-haircut',
  'daily_life', 2, false, 13, 85,

  'Saç Kesimi', 'Getting a Haircut', 'Klippa Håret', 'Einen Haarschnitt Bekommen',
  'Cortarse el Pelo', 'Se Faire Couper les Cheveux', 'Cortar o Cabelo',

  -- BODY TR (keywords: randevu=0, kesiyor=1, aynada=2, değişim=3, memnun=4)
  'Elif bugün için haftalar öncesinden **randevu** almıştı. Kuaföre girdiğinde sıcak bir gülümsemeyle karşılandı. Ne istediğini anlattı; berber başını sallayıp anladığını belirtti.

Berber ustalıkla saçını **kesiyor**, her detaya dikkat ediyor. Elif **aynada** kendi yüzüne bakıyor ve yeni şeklini hayal ediyor. Makas sesinin ritmi onu rahatlatıyor.

İşlem biter bitmez Elif büyük bir **değişim** hisseder. Saçı daha hafif, yüzü daha aydınlık görünüyor. Aynaya bakar ve tamamen **memnun** bir şekilde güler.',

  -- BODY EN
  'Elif had made an **appointment** weeks in advance for today. When she entered the salon, she was greeted with a warm smile. She explained what she wanted; the hairdresser nodded in understanding.

The hairdresser is skilfully **cutting** her hair, paying attention to every detail. Elif watches her own face in the **mirror** and imagines her new look. The rhythm of the scissors relaxes her.

As soon as the process is done, Elif feels a big **change**. Her hair looks lighter, her face brighter. She looks in the mirror and laughs, completely **satisfied**.',

  -- BODY SV
  'Elif hade bokat en **tid** flera veckor i förväg för idag. När hon gick in på salongen möttes hon av ett varmt leende. Hon förklarade vad hon ville ha; frisören nickade förstående.

Frisören **klipper** hennes hår skickligt och uppmärksammar varje detalj. Elif tittar på sitt eget ansikte i **spegeln** och föreställer sig sin nya look. Saxens rytm lugnar henne.

Så fort processen är klar känner Elif en stor **förändring**. Håret ser lättare ut, ansiktet ljusare. Hon tittar i spegeln och skrattar, helt **nöjd**.',

  -- BODY DE
  'Elif hatte für heute schon Wochen im Voraus einen **Termin** gemacht. Als sie den Salon betrat, wurde sie mit einem warmen Lächeln begrüßt. Sie erklärte, was sie wollte; der Friseur nickte verständnisvoll.

Der Friseur **schneidet** ihr Haar geschickt und achtet auf jedes Detail. Elif schaut ihr eigenes Gesicht im **Spiegel** an und stellt sich ihr neues Aussehen vor. Der Rhythmus der Schere beruhigt sie.

Sobald der Prozess abgeschlossen ist, spürt Elif eine große **Veränderung**. Ihr Haar sieht leichter aus, ihr Gesicht heller. Sie schaut in den Spiegel und lacht, völlig **zufrieden**.',

  -- BODY ES
  'Elif había pedido **cita** con semanas de antelación para hoy. Al entrar en el salón, la recibieron con una cálida sonrisa. Explicó lo que quería; la peluquera asintió con la cabeza.

La peluquera le está **cortando** el pelo con habilidad, prestando atención a cada detalle. Elif se mira el rostro en el **espejo** e imagina su nuevo look. El ritmo de las tijeras la relaja.

En cuanto termina el proceso, Elif siente un gran **cambio**. Su pelo parece más ligero, su cara más luminosa. Se mira al espejo y ríe, completamente **satisfecha**.',

  -- BODY FR
  'Elif avait pris **rendez-vous** des semaines à l''avance pour aujourd''hui. En entrant dans le salon, elle fut accueillie avec un sourire chaleureux. Elle expliqua ce qu''elle voulait ; la coiffeuse hocha la tête en signe de compréhension.

La coiffeuse **coupe** ses cheveux habilement, faisant attention à chaque détail. Elif regarde son propre visage dans le **miroir** et imagine son nouveau look. Le rythme des ciseaux la détend.

Dès que le processus est terminé, Elif ressent un grand **changement**. Ses cheveux semblent plus légers, son visage plus lumineux. Elle se regarde dans le miroir et rit, complètement **satisfaite**.',

  -- BODY PT
  'Elif tinha marcado uma **consulta** semanas antes para hoje. Ao entrar no salão, foi recebida com um sorriso caloroso. Explicou o que queria; o cabeleireiro acenou com a cabeça em sinal de compreensão.

O cabeleireiro está a **cortar** o cabelo dela habilmente, prestando atenção a cada detalhe. Elif observa o próprio rosto no **espelho** e imagina o seu novo visual. O ritmo da tesoura relaxa-a.

Assim que o processo termina, Elif sente uma grande **mudança**. O cabelo parece mais leve, o rosto mais luminoso. Olha-se ao espelho e ri, completamente **satisfeita**.'
);

INSERT INTO reading_text_keywords (reading_text_id, position_index, color_index,
  keyword_tr, keyword_en, keyword_sv, keyword_de, keyword_es, keyword_fr, keyword_pt)
SELECT id, 0, 0, 'randevu', 'appointment', 'tid', 'Termin', 'cita', 'rendez-vous', 'consulta'
FROM reading_texts WHERE slug = 'daily-life-haircut';

INSERT INTO reading_text_keywords (reading_text_id, position_index, color_index,
  keyword_tr, keyword_en, keyword_sv, keyword_de, keyword_es, keyword_fr, keyword_pt)
SELECT id, 1, 2, 'kesiyor', 'cutting', 'klipper', 'schneidet', 'cortando', 'coupe', 'cortar'
FROM reading_texts WHERE slug = 'daily-life-haircut';

INSERT INTO reading_text_keywords (reading_text_id, position_index, color_index,
  keyword_tr, keyword_en, keyword_sv, keyword_de, keyword_es, keyword_fr, keyword_pt)
SELECT id, 2, 4, 'aynada', 'mirror', 'spegeln', 'Spiegel', 'espejo', 'miroir', 'espelho'
FROM reading_texts WHERE slug = 'daily-life-haircut';

INSERT INTO reading_text_keywords (reading_text_id, position_index, color_index,
  keyword_tr, keyword_en, keyword_sv, keyword_de, keyword_es, keyword_fr, keyword_pt)
SELECT id, 3, 6, 'değişim', 'change', 'förändring', 'Veränderung', 'cambio', 'changement', 'mudança'
FROM reading_texts WHERE slug = 'daily-life-haircut';

INSERT INTO reading_text_keywords (reading_text_id, position_index, color_index,
  keyword_tr, keyword_en, keyword_sv, keyword_de, keyword_es, keyword_fr, keyword_pt)
SELECT id, 4, 8, 'memnun', 'satisfied', 'nöjd', 'zufrieden', 'satisfecha', 'satisfaite', 'satisfeita'
FROM reading_texts WHERE slug = 'daily-life-haircut';

-- ─────────────────────────────────────────────────────────────
-- TEXT 14: daily-life-morning-gym (daily_life, difficulty 2)
-- Keywords: alarm/alarm, ısınma/warm-up, ter/sweat, enerjik/energetic, kararlılık/determination
-- ─────────────────────────────────────────────────────────────

INSERT INTO reading_texts (
  slug, category, difficulty, is_premium, order_index, estimated_reading_seconds,
  title_tr, title_en, title_sv, title_de, title_es, title_fr, title_pt,
  body_tr, body_en, body_sv, body_de, body_es, body_fr, body_pt
) VALUES (
  'daily-life-morning-gym',
  'daily_life', 2, false, 14, 80,

  'Sabah Sporu', 'Morning Workout', 'Morgonträning', 'Morgensport',
  'Ejercicio Matutino', 'Sport du Matin', 'Treino Matinal',

  -- BODY TR (keywords: alarm=0, ısınma=1, ter=2, enerjik=3, kararlılık=4)
  'Sam sabah altıda çalan **alarmı** duyunca gözlerini açar. Birkaç saniye tereddüt eder, sonra battaniyeyi atar ve ayağa kalkar. Spor kıyafetlerini giyer ve spor salonuna yönelir.

İlk on dakika **ısınma** hareketleriyle geçer. Ardından ağır egzersizler başlar. Sam vücudundaki **ter** damlalarını hisseder; bu onu daha çok çalışmaya iter.

Antrenmandan sonra kasları yorgun ama kendini inanılmaz derecede **enerjik** hisseder. Spor salonundan çıkarken güler; bu rutin ona günlük hayatında büyük bir **kararlılık** verir.',

  -- BODY EN
  'Sam opens his eyes when he hears the **alarm** ringing at six in the morning. He hesitates for a few seconds, then throws off the blanket and gets up. He puts on his sports clothes and heads to the gym.

The first ten minutes pass with **warm-up** movements. Then the heavy exercises begin. Sam feels the drops of **sweat** on his body; this pushes him to work harder.

After the workout his muscles are tired but he feels incredibly **energetic**. He smiles when he leaves the gym; this routine gives him great **determination** in his daily life.',

  -- BODY SV
  'Sam öppnar ögonen när han hör **larmet** ringa klockan sex på morgonen. Han tvekar i några sekunder, kastar sedan undan täcket och reser sig. Han tar på sig träningskläder och beger sig till gymmet.

De första tio minuterna går åt **uppvärmning**. Sedan börjar de tunga övningarna. Sam känner **svett**dropparna på kroppen; det driver honom att arbeta hårdare.

Efter träningen är musklerna trötta men han känner sig otroligt **energisk**. Han ler när han lämnar gymmet; denna rutin ger honom stor **beslutsamhet** i det dagliga livet.',

  -- BODY DE
  'Sam öffnet die Augen, als er den **Wecker** um sechs Uhr morgens klingeln hört. Er zögert einige Sekunden, wirft dann die Decke weg und steht auf. Er zieht seine Sportkleidung an und geht ins Fitnessstudio.

Die ersten zehn Minuten vergehen mit **Aufwärm**übungen. Dann beginnen die schweren Übungen. Sam spürt die **Schweißtropfen** auf seinem Körper; das treibt ihn an, härter zu arbeiten.

Nach dem Training sind seine Muskeln müde, aber er fühlt sich unglaublich **energiegeladen**. Er lächelt, als er das Fitnessstudio verlässt; diese Routine gibt ihm große **Entschlossenheit** im Alltag.',

  -- BODY ES
  'Sam abre los ojos cuando escucha el **despertador** sonar a las seis de la mañana. Duda unos segundos, luego aparta la manta y se levanta. Se pone la ropa deportiva y se dirige al gimnasio.

Los primeros diez minutos pasan con ejercicios de **calentamiento**. Luego comienzan los ejercicios intensos. Sam siente las gotas de **sudor** en su cuerpo; esto le impulsa a trabajar más duro.

Después del entrenamiento sus músculos están cansados pero se siente increíblemente **enérgico**. Sonríe al salir del gimnasio; esta rutina le da gran **determinación** en su vida diaria.',

  -- BODY FR
  'Sam ouvre les yeux quand il entend le **réveil** sonner à six heures du matin. Il hésite quelques secondes, puis rejette la couverture et se lève. Il enfile sa tenue de sport et se dirige vers la salle de sport.

Les dix premières minutes se passent en exercices d''**échauffement**. Ensuite commencent les exercices intenses. Sam sent les gouttes de **sueur** sur son corps ; cela le pousse à travailler plus dur.

Après l''entraînement ses muscles sont fatigués mais il se sent incroyablement **énergique**. Il sourit en quittant la salle de sport ; cette routine lui donne une grande **détermination** dans sa vie quotidienne.',

  -- BODY PT
  'Sam abre os olhos quando ouve o **despertador** tocar às seis da manhã. Hesita por alguns segundos, depois atira o cobertor para o lado e levanta-se. Veste a roupa desportiva e dirige-se ao ginásio.

Os primeiros dez minutos passam com exercícios de **aquecimento**. Depois começam os exercícios pesados. Sam sente as gotas de **suor** no seu corpo; isso empurra-o a trabalhar mais.

Depois do treino os músculos estão cansados mas sente-se incrivelmente **enérgico**. Sorri ao sair do ginásio; esta rotina dá-lhe grande **determinação** na sua vida diária.'
);

INSERT INTO reading_text_keywords (reading_text_id, position_index, color_index,
  keyword_tr, keyword_en, keyword_sv, keyword_de, keyword_es, keyword_fr, keyword_pt)
SELECT id, 0, 0, 'alarm', 'alarm', 'larmet', 'Wecker', 'despertador', 'réveil', 'despertador'
FROM reading_texts WHERE slug = 'daily-life-morning-gym';

INSERT INTO reading_text_keywords (reading_text_id, position_index, color_index,
  keyword_tr, keyword_en, keyword_sv, keyword_de, keyword_es, keyword_fr, keyword_pt)
SELECT id, 1, 2, 'ısınma', 'warm-up', 'uppvärmning', 'Aufwärm', 'calentamiento', 'échauffement', 'aquecimento'
FROM reading_texts WHERE slug = 'daily-life-morning-gym';

INSERT INTO reading_text_keywords (reading_text_id, position_index, color_index,
  keyword_tr, keyword_en, keyword_sv, keyword_de, keyword_es, keyword_fr, keyword_pt)
SELECT id, 2, 4, 'ter', 'sweat', 'svett', 'Schweißtropfen', 'sudor', 'sueur', 'suor'
FROM reading_texts WHERE slug = 'daily-life-morning-gym';

INSERT INTO reading_text_keywords (reading_text_id, position_index, color_index,
  keyword_tr, keyword_en, keyword_sv, keyword_de, keyword_es, keyword_fr, keyword_pt)
SELECT id, 3, 6, 'enerjik', 'energetic', 'energisk', 'energiegeladen', 'enérgico', 'énergique', 'enérgico'
FROM reading_texts WHERE slug = 'daily-life-morning-gym';

INSERT INTO reading_text_keywords (reading_text_id, position_index, color_index,
  keyword_tr, keyword_en, keyword_sv, keyword_de, keyword_es, keyword_fr, keyword_pt)
SELECT id, 4, 8, 'kararlılık', 'determination', 'beslutsamhet', 'Entschlossenheit', 'determinación', 'détermination', 'determinação'
FROM reading_texts WHERE slug = 'daily-life-morning-gym';

-- ─────────────────────────────────────────────────────────────
-- TEXT 15: travel-international-flight (travel, difficulty 2)
-- Keywords: biniyor/boarding, kontrolünden/control, yerleşti/settled, iniş/landing, heyecan/excitement
-- ─────────────────────────────────────────────────────────────

INSERT INTO reading_texts (
  slug, category, difficulty, is_premium, order_index, estimated_reading_seconds,
  title_tr, title_en, title_sv, title_de, title_es, title_fr, title_pt,
  body_tr, body_en, body_sv, body_de, body_es, body_fr, body_pt
) VALUES (
  'travel-international-flight',
  'travel', 2, false, 15, 85,

  'Uluslararası Uçuş', 'International Flight', 'Internationell Flygning', 'Internationaler Flug',
  'Vuelo Internacional', 'Vol International', 'Voo Internacional',

  -- BODY TR (keywords: biniyor=0, kontrolünden=1, yerleşti=2, iniş=3, heyecan=4)
  'Nina ilk yurt dışı uçuşu için havalimanına erken geldi. Bavulunu teslim etti ve pasaport **kontrolünden** geçti. Kapıya yürürken kalbi hızlı atıyordu.

Uçağa **biniyor** ve koltuğuna **yerleşti**. Pencereden bulutlara bakıyor. Kulaklıklarını takıyor, müziği açıyor ve derin bir nefes alıyor.

Birkaç saat sonra pilot **iniş** duyurusunu yaptı. Şehrin ışıkları gözüktü ve Nina içinde büyük bir **heyecan** hissetti. Yeni bir yer, yeni bir macera başlıyordu.',

  -- BODY EN
  'Nina arrived at the airport early for her first international flight. She checked in her luggage and passed through passport **control**. Her heart was beating fast as she walked to the gate.

She is **boarding** the plane and **settled** into her seat. She looks at the clouds through the window. She puts on her headphones, turns on the music and takes a deep breath.

A few hours later the pilot made the **landing** announcement. The city lights appeared and Nina felt a great **excitement** inside her. A new place, a new adventure was beginning.',

  -- BODY SV
  'Nina kom tidigt till flygplatsen för sin första internationella flygning. Hon lämnade in bagaget och passerade passet**kontrollen**. Hennes hjärta slog snabbt när hon gick mot gaten.

Hon **stiger ombord** på planet och **satte sig** på sin plats. Hon tittar på molnen genom fönstret. Hon sätter på sig hörlurarna, sätter på musik och tar ett djupt andetag.

Några timmar senare meddelade piloten **landningen**. Stadens ljus syntes och Nina kände en stor **spänning** inombords. En ny plats, ett nytt äventyr höll på att börja.',

  -- BODY DE
  'Nina kam früh zum Flughafen für ihren ersten internationalen Flug. Sie gab ihr Gepäck auf und passierte die Pass**kontrolle**. Ihr Herz schlug schnell, als sie zum Gate ging.

Sie **steigt ein** und **setzte sich** auf ihren Platz. Sie schaut durch das Fenster auf die Wolken. Sie setzt ihre Kopfhörer auf, schaltet die Musik ein und atmet tief durch.

Einige Stunden später machte der Pilot die **Landungs**ansage. Die Lichter der Stadt erschienen und Nina spürte eine große **Aufregung** in sich. Ein neuer Ort, ein neues Abenteuer begann.',

  -- BODY ES
  'Nina llegó temprano al aeropuerto para su primer vuelo internacional. Facturó el equipaje y pasó por el **control** de pasaportes. Su corazón latía rápido mientras caminaba hacia la puerta.

Está **embarcando** en el avión y se **instaló** en su asiento. Mira las nubes por la ventana. Se pone los auriculares, enciende la música y respira hondo.

Pocas horas después el piloto hizo el anuncio de **aterrizaje**. Las luces de la ciudad aparecieron y Nina sintió una gran **emoción** por dentro. Un nuevo lugar, una nueva aventura estaba comenzando.',

  -- BODY FR
  'Nina est arrivée tôt à l''aéroport pour son premier vol international. Elle a enregistré ses bagages et est passée par le **contrôle** des passeports. Son cœur battait vite en marchant vers la porte.

Elle **embarque** dans l''avion et s''**installa** dans son siège. Elle regarde les nuages par la fenêtre. Elle met ses écouteurs, allume la musique et prend une grande inspiration.

Quelques heures plus tard le pilote fit l''annonce d''**atterrissage**. Les lumières de la ville apparurent et Nina ressentit une grande **excitation** en elle. Un nouvel endroit, une nouvelle aventure commençait.',

  -- BODY PT
  'Nina chegou cedo ao aeroporto para o seu primeiro voo internacional. Despachnou a bagagem e passou pelo **controlo** de passaportes. O coração batia rápido enquanto caminhava para o portão.

Está a fazer o **embarque** no avião e **instalou-se** no seu lugar. Olha para as nuvens pela janela. Coloca os auscultadores, liga a música e respira fundo.

Algumas horas depois o piloto fez o anúncio de **aterragem**. As luzes da cidade apareceram e Nina sentiu uma grande **emoção** por dentro. Um novo lugar, uma nova aventura estava a começar.'
);

INSERT INTO reading_text_keywords (reading_text_id, position_index, color_index,
  keyword_tr, keyword_en, keyword_sv, keyword_de, keyword_es, keyword_fr, keyword_pt)
SELECT id, 0, 0, 'kontrolünden', 'control', 'kontrollen', 'Passkontrolle', 'control', 'contrôle', 'controlo'
FROM reading_texts WHERE slug = 'travel-international-flight';

INSERT INTO reading_text_keywords (reading_text_id, position_index, color_index,
  keyword_tr, keyword_en, keyword_sv, keyword_de, keyword_es, keyword_fr, keyword_pt)
SELECT id, 1, 2, 'biniyor', 'boarding', 'stiger ombord', 'steigt ein', 'embarcando', 'embarque', 'embarque'
FROM reading_texts WHERE slug = 'travel-international-flight';

INSERT INTO reading_text_keywords (reading_text_id, position_index, color_index,
  keyword_tr, keyword_en, keyword_sv, keyword_de, keyword_es, keyword_fr, keyword_pt)
SELECT id, 2, 4, 'yerleşti', 'settled', 'satte sig', 'setzte sich', 'instaló', 'installa', 'instalou-se'
FROM reading_texts WHERE slug = 'travel-international-flight';

INSERT INTO reading_text_keywords (reading_text_id, position_index, color_index,
  keyword_tr, keyword_en, keyword_sv, keyword_de, keyword_es, keyword_fr, keyword_pt)
SELECT id, 3, 6, 'iniş', 'landing', 'landningen', 'Landung', 'aterrizaje', 'atterrissage', 'aterragem'
FROM reading_texts WHERE slug = 'travel-international-flight';

INSERT INTO reading_text_keywords (reading_text_id, position_index, color_index,
  keyword_tr, keyword_en, keyword_sv, keyword_de, keyword_es, keyword_fr, keyword_pt)
SELECT id, 4, 8, 'heyecan', 'excitement', 'spänning', 'Aufregung', 'emoción', 'excitation', 'emoção'
FROM reading_texts WHERE slug = 'travel-international-flight';

-- ─────────────────────────────────────────────────────────────
-- TEXT 16: travel-museum-visit (travel, difficulty 1)
-- Keywords: bilet/ticket, sergi/exhibition, açıklamaları/captions, hatıra/souvenir, saatlerce/hours
-- ─────────────────────────────────────────────────────────────

INSERT INTO reading_texts (
  slug, category, difficulty, is_premium, order_index, estimated_reading_seconds,
  title_tr, title_en, title_sv, title_de, title_es, title_fr, title_pt,
  body_tr, body_en, body_sv, body_de, body_es, body_fr, body_pt
) VALUES (
  'travel-museum-visit',
  'travel', 1, false, 16, 80,

  'Müze Ziyareti', 'Museum Visit', 'Museibesök', 'Museumsbesuch',
  'Visita al Museo', 'Visite au Musée', 'Visita ao Museu',

  -- BODY TR (keywords: bilet=0, sergi=1, açıklamaları=2, hatıra/souvenir=3, saatlerce=4)
  'Omar şehrin ünlü sanat müzesine gitmek için sabah erken kalktı. Gişeden **biletini** aldı ve içeri girdi. İlk adımdan itibaren büyük bir sessizlik onu karşıladı.

İlk katta özel bir **sergi** vardı; eski uygarlıklardan kalma eserler. Omar her tablonun yanındaki **açıklamaları** dikkatle okudu. Bazı eserlerin yüzyıllar öncesinden geldiğini öğrendi.

Çıkarken müze mağazasına uğradı ve küçük bir **hatıra** aldı. Dışarı çıktığında **saatlerce** geçtiğini fark etti. Zaman böyle geçerken hiç anlaşılmıyordu.',

  -- BODY EN
  'Omar got up early in the morning to go to the city''s famous art museum. He bought his **ticket** at the box office and went inside. From the very first step a great silence greeted him.

On the first floor there was a special **exhibition**; artefacts from ancient civilisations. Omar carefully read the **captions** beside each painting. He learned that some works came from centuries ago.

On the way out he stopped at the museum shop and bought a small **souvenir**. When he came outside he realised that **hours** had passed. Time went by without being noticed like that.',

  -- BODY SV
  'Omar steg upp tidigt på morgonen för att besöka stadens berömda konstmuseum. Han köpte sin **biljett** i kassan och gick in. Från allra första steget möttes han av en stor tystnad.

På första våningen fanns en speciell **utställning**; föremål från forntida civilisationer. Omar läste noggrant **texterna** bredvid varje målning. Han fick veta att vissa verk kom från hundratals år sedan.

På väg ut stannade han vid museibutiken och köpte ett litet **minne**. När han kom ut insåg han att **timmar** hade gått. Tid gick förbi utan att märkas på det sättet.',

  -- BODY DE
  'Omar stand früh am Morgen auf, um das berühmte Kunstmuseum der Stadt zu besuchen. Er kaufte seine **Eintrittskarte** an der Kasse und ging hinein. Vom allerersten Schritt an empfing ihn eine große Stille.

Im ersten Stock gab es eine besondere **Ausstellung**; Artefakte aus alten Zivilisationen. Omar las sorgfältig die **Beschriftungen** neben jedem Gemälde. Er erfuhr, dass einige Werke aus Jahrhunderten zuvor stammten.

Auf dem Weg hinaus hielt er am Museumsshop an und kaufte ein kleines **Andenken**. Als er hinauskam, bemerkte er, dass **Stunden** vergangen waren. Die Zeit verging so, ohne bemerkt zu werden.',

  -- BODY ES
  'Omar se levantó temprano por la mañana para visitar el famoso museo de arte de la ciudad. Compró su **entrada** en la taquilla y entró. Desde el primer paso le recibió un gran silencio.

En la primera planta había una **exposición** especial; artefactos de civilizaciones antiguas. Omar leyó cuidadosamente las **descripciones** junto a cada cuadro. Supo que algunas obras venían de siglos atrás.

Al salir pasó por la tienda del museo y compró un pequeño **recuerdo**. Al salir se dio cuenta de que habían pasado **horas**. El tiempo pasaba así sin darse cuenta.',

  -- BODY FR
  'Omar s''est levé tôt le matin pour visiter le célèbre musée d''art de la ville. Il a acheté son **billet** au guichet et est entré. Dès le premier pas, un grand silence l''accueillit.

Au premier étage se trouvait une **exposition** spéciale ; des artefacts de civilisations anciennes. Omar lut attentivement les **légendes** à côté de chaque tableau. Il apprit que certaines œuvres venaient de siècles auparavant.

En sortant, il s''arrêta à la boutique du musée et acheta un petit **souvenir**. Quand il sortit, il réalisa que des **heures** s''étaient écoulées. Le temps passait ainsi sans s''en rendre compte.',

  -- BODY PT
  'Omar acordou cedo de manhã para visitar o famoso museu de arte da cidade. Comprou o seu **bilhete** na bilheteira e entrou. Logo no primeiro passo um grande silêncio o recebeu.

No primeiro andar havia uma **exposição** especial; artefactos de civilizações antigas. Omar leu cuidadosamente as **legendas** ao lado de cada quadro. Soube que algumas obras vinham de séculos atrás.

À saída passou pela loja do museu e comprou um pequeno **souvenir**. Quando saiu percebeu que tinham passado **horas**. O tempo passava assim sem se dar conta.'
);

INSERT INTO reading_text_keywords (reading_text_id, position_index, color_index,
  keyword_tr, keyword_en, keyword_sv, keyword_de, keyword_es, keyword_fr, keyword_pt)
SELECT id, 0, 0, 'biletini', 'ticket', 'biljett', 'Eintrittskarte', 'entrada', 'billet', 'bilhete'
FROM reading_texts WHERE slug = 'travel-museum-visit';

INSERT INTO reading_text_keywords (reading_text_id, position_index, color_index,
  keyword_tr, keyword_en, keyword_sv, keyword_de, keyword_es, keyword_fr, keyword_pt)
SELECT id, 1, 2, 'sergi', 'exhibition', 'utställning', 'Ausstellung', 'exposición', 'exposition', 'exposição'
FROM reading_texts WHERE slug = 'travel-museum-visit';

INSERT INTO reading_text_keywords (reading_text_id, position_index, color_index,
  keyword_tr, keyword_en, keyword_sv, keyword_de, keyword_es, keyword_fr, keyword_pt)
SELECT id, 2, 4, 'açıklamaları', 'captions', 'texterna', 'Beschriftungen', 'descripciones', 'légendes', 'legendas'
FROM reading_texts WHERE slug = 'travel-museum-visit';

INSERT INTO reading_text_keywords (reading_text_id, position_index, color_index,
  keyword_tr, keyword_en, keyword_sv, keyword_de, keyword_es, keyword_fr, keyword_pt)
SELECT id, 3, 6, 'hatıra', 'souvenir', 'minne', 'Andenken', 'recuerdo', 'souvenir', 'souvenir'
FROM reading_texts WHERE slug = 'travel-museum-visit';

INSERT INTO reading_text_keywords (reading_text_id, position_index, color_index,
  keyword_tr, keyword_en, keyword_sv, keyword_de, keyword_es, keyword_fr, keyword_pt)
SELECT id, 4, 8, 'saatlerce', 'hours', 'timmar', 'Stunden', 'horas', 'heures', 'horas'
FROM reading_texts WHERE slug = 'travel-museum-visit';

-- ─────────────────────────────────────────────────────────────
-- TEXT 17: travel-local-market (travel, difficulty 1)
-- Keywords: pazar/market, tattı/tasted, lezzet/flavor, taze/fresh, sipariş/order
-- ─────────────────────────────────────────────────────────────

INSERT INTO reading_texts (
  slug, category, difficulty, is_premium, order_index, estimated_reading_seconds,
  title_tr, title_en, title_sv, title_de, title_es, title_fr, title_pt,
  body_tr, body_en, body_sv, body_de, body_es, body_fr, body_pt
) VALUES (
  'travel-local-market',
  'travel', 1, false, 17, 75,

  'Yerel Pazar', 'Local Market', 'Lokal Marknad', 'Lokaler Markt',
  'Mercado Local', 'Marché Local', 'Mercado Local',

  -- BODY TR (keywords: pazar=0, tattı/tasted=1, lezzet=2, taze=3, sipariş=4)
  'Lena tatilde gittiği şehrin sabah **pazarını** keşfetmeye çıktı. Her tezgah renkli meyveler ve el yapımı ürünlerle doluydu. Kalabalık ve canlı sesin içinde yürümek ona büyük zevk verdi.

Bir tezgahta yerel bir peynir **tattı**. Benzersiz **lezzetiyle** ağzında eridi. Satıcı ona bu peynirin **taze** üretildiğini söyledi ve nasıl yapıldığını anlattı.

Sonunda bir torbaya domates, zeytin ve peynir koydu. Oturduğu otele döndüğünde **sipariş** vermek yerine kendi kahvaltısını hazırladı. Sabahın en güzel anıydı.',

  -- BODY EN
  'Lena went out to discover the morning **market** of the city she was visiting on holiday. Every stall was full of colourful fruits and handmade products. Walking among the crowd and lively sounds gave her great pleasure.

At one stall she **tasted** a local cheese. It melted in her mouth with its unique **flavour**. The seller told her this cheese was produced **fresh** and explained how it was made.

In the end she put tomatoes, olives and cheese into a bag. When she returned to her hotel, instead of placing an **order** she prepared her own breakfast. It was the most beautiful moment of the morning.',

  -- BODY SV
  'Lena gick ut för att utforska morgon**marknaden** i den stad hon besökte på semester. Varje stånd var fyllt med färgrika frukter och handgjorda produkter. Att gå bland folkmassan och det livliga ljudet gav henne stort nöje.

Vid ett stånd **smakade** hon på en lokal ost. Den smälte i munnen med sin unika **smak**. Säljaren berättade att denna ost producerades **färsk** och förklarade hur den tillverkades.

Till slut lade hon tomater, oliver och ost i en påse. När hon återvände till sitt hotell, istället för att lägga en **beställning**, lagade hon sin egen frukost. Det var morgonens vackraste stund.',

  -- BODY DE
  'Lena machte sich auf, um den Morgen**markt** der Stadt zu entdecken, die sie im Urlaub besuchte. Jeder Stand war mit bunten Früchten und handgemachten Produkten gefüllt. Zwischen der Menge und den lebhaften Klängen zu laufen bereitete ihr große Freude.

An einem Stand **probierte** sie einen lokalen Käse. Er schmolz in ihrem Mund mit seinem einzigartigen **Geschmack**. Der Verkäufer erzählte ihr, dass dieser Käse **frisch** hergestellt wurde, und erklärte, wie er gemacht wurde.

Schließlich legte sie Tomaten, Oliven und Käse in eine Tasche. Als sie ins Hotel zurückkehrte, bestellte sie keine **Bestellung**, sondern bereitete ihr eigenes Frühstück zu. Es war der schönste Moment des Morgens.',

  -- BODY ES
  'Lena salió a descubrir el **mercado** matutino de la ciudad que visitaba en sus vacaciones. Cada puesto estaba lleno de frutas coloridas y productos artesanales. Caminar entre la multitud y los sonidos animados le dio un gran placer.

En un puesto **probó** un queso local. Se derritió en su boca con su **sabor** único. El vendedor le dijo que este queso se producía **fresco** y explicó cómo se hacía.

Por último metió tomates, aceitunas y queso en una bolsa. Cuando volvió a su hotel, en lugar de hacer un **pedido** preparó su propio desayuno. Fue el momento más hermoso de la mañana.',

  -- BODY FR
  'Lena sortit pour découvrir le **marché** du matin de la ville qu''elle visitait en vacances. Chaque étal était plein de fruits colorés et de produits artisanaux. Marcher parmi la foule et les sons animés lui procurait un grand plaisir.

À un étal elle **goûta** un fromage local. Il fondait dans sa bouche avec sa **saveur** unique. Le vendeur lui dit que ce fromage était produit **frais** et lui expliqua comment il était fabriqué.

Finalement elle mit des tomates, des olives et du fromage dans un sac. Quand elle rentra à son hôtel, au lieu de passer une **commande**, elle prépara son propre petit-déjeuner. C''était le plus beau moment de la matinée.',

  -- BODY PT
  'Lena saiu para descobrir o **mercado** matinal da cidade que visitava de férias. Cada banca estava cheia de frutas coloridas e produtos artesanais. Caminhar entre a multidão e os sons animados deu-lhe grande prazer.

Numa banca **provou** um queijo local. Derreteu-se na boca com o seu **sabor** único. O vendedor disse-lhe que este queijo era produzido **fresco** e explicou como era feito.

Por fim colocou tomates, azeitonas e queijo numa saca. Quando voltou ao hotel, em vez de fazer uma **encomenda**, preparou o seu próprio pequeno-almoço. Foi o momento mais bonito da manhã.'
);

INSERT INTO reading_text_keywords (reading_text_id, position_index, color_index,
  keyword_tr, keyword_en, keyword_sv, keyword_de, keyword_es, keyword_fr, keyword_pt)
SELECT id, 0, 0, 'pazar', 'market', 'marknaden', 'Markt', 'mercado', 'marché', 'mercado'
FROM reading_texts WHERE slug = 'travel-local-market';

INSERT INTO reading_text_keywords (reading_text_id, position_index, color_index,
  keyword_tr, keyword_en, keyword_sv, keyword_de, keyword_es, keyword_fr, keyword_pt)
SELECT id, 1, 2, 'tattı', 'tasted', 'smakade', 'probierte', 'probó', 'goûta', 'provou'
FROM reading_texts WHERE slug = 'travel-local-market';

INSERT INTO reading_text_keywords (reading_text_id, position_index, color_index,
  keyword_tr, keyword_en, keyword_sv, keyword_de, keyword_es, keyword_fr, keyword_pt)
SELECT id, 2, 4, 'lezzetiyle', 'flavour', 'smak', 'Geschmack', 'sabor', 'saveur', 'sabor'
FROM reading_texts WHERE slug = 'travel-local-market';

INSERT INTO reading_text_keywords (reading_text_id, position_index, color_index,
  keyword_tr, keyword_en, keyword_sv, keyword_de, keyword_es, keyword_fr, keyword_pt)
SELECT id, 3, 6, 'taze', 'fresh', 'färsk', 'frisch', 'fresco', 'frais', 'fresco'
FROM reading_texts WHERE slug = 'travel-local-market';

INSERT INTO reading_text_keywords (reading_text_id, position_index, color_index,
  keyword_tr, keyword_en, keyword_sv, keyword_de, keyword_es, keyword_fr, keyword_pt)
SELECT id, 4, 8, 'sipariş', 'order', 'beställning', 'Bestellung', 'pedido', 'commande', 'encomenda'
FROM reading_texts WHERE slug = 'travel-local-market';

-- ─────────────────────────────────────────────────────────────
-- TEXT 18: work-first-day (work, difficulty 1)
-- Keywords: başlıyor/starting, resepsiyon/reception, tanıştı/met, masa/desk, karmaşık/complicated
-- ─────────────────────────────────────────────────────────────

INSERT INTO reading_texts (
  slug, category, difficulty, is_premium, order_index, estimated_reading_seconds,
  title_tr, title_en, title_sv, title_de, title_es, title_fr, title_pt,
  body_tr, body_en, body_sv, body_de, body_es, body_fr, body_pt
) VALUES (
  'work-first-day',
  'work', 1, false, 18, 80,

  'İlk İş Günü', 'First Day at Work', 'Första Arbetsdagen', 'Erster Arbeitstag',
  'Primer Día de Trabajo', 'Premier Jour de Travail', 'Primeiro Dia de Trabalho',

  -- BODY TR (keywords: başlıyor=0, resepsiyon=1, tanıştı=2, masa=3, karmaşık=4)
  'Ali bugün yeni işine **başlıyor**. Sabah erken kalktı, giyindi ve heyecanla ofise gitti. Binaya girince önce **resepsiyona** giderek kendini tanıttı.

Bir çalışan onu ofis içinde gezdirdi. Birkaç meslektaşıyla **tanıştı**; herkes sıcaklıkla karşıladı. Sonra kendisine ayrılan **masaya** geçip bilgisayarı açtı.

Sisteme giriş yaparken bazı adımlar biraz **karmaşık** geldi. Ama bir iş arkadaşı hemen yardımcı olmayı teklif etti. İlk günün en önemli dersi: sormaktan çekinme.',

  -- BODY EN
  'Ali is **starting** his new job today. He got up early, got dressed and went to the office with excitement. On entering the building he first went to **reception** and introduced himself.

An employee took him on a tour of the office. He **met** a few colleagues; everyone welcomed him warmly. Then he moved to the **desk** assigned to him and opened the computer.

While logging into the system some steps felt a bit **complicated**. But a colleague immediately offered to help. The most important lesson of the first day: do not hesitate to ask.',

  -- BODY SV
  'Ali **börjar** på sitt nya jobb idag. Han steg upp tidigt, klädde på sig och gick till kontoret med spänning. När han gick in i byggnaden gick han först till **receptionen** och presenterade sig.

En medarbetare tog honom på en rundtur på kontoret. Han **träffade** några kollegor; alla välkomnade honom varmt. Sedan gick han till det **skrivbord** som tilldelats honom och öppnade datorn.

När han loggade in i systemet kändes vissa steg lite **komplicerade**. Men en kollega erbjöd sig genast att hjälpa till. Dagens viktigaste läxa: tveka inte att fråga.',

  -- BODY DE
  'Ali **beginnt** heute seinen neuen Job. Er stand früh auf, zog sich an und ging aufgeregt ins Büro. Als er das Gebäude betrat, ging er zuerst zum **Empfang** und stellte sich vor.

Ein Mitarbeiter führte ihn durch das Büro. Er **traf** ein paar Kollegen; alle begrüßten ihn herzlich. Dann ging er zu dem ihm zugewiesenen **Schreibtisch** und öffnete den Computer.

Beim Einloggen ins System fühlten sich einige Schritte etwas **kompliziert** an. Aber ein Kollege bot sofort seine Hilfe an. Die wichtigste Lektion des ersten Tages: Zögere nicht zu fragen.',

  -- BODY ES
  'Ali **comienza** su nuevo trabajo hoy. Se levantó temprano, se vistió y fue a la oficina con emoción. Al entrar en el edificio fue primero a **recepción** y se presentó.

Un empleado le dio un recorrido por la oficina. **Conoció** a algunos compañeros; todos le dieron una cálida bienvenida. Luego se dirigió al **escritorio** que le habían asignado y encendió el ordenador.

Al iniciar sesión en el sistema algunos pasos le parecieron un poco **complicados**. Pero un compañero ofreció inmediatamente su ayuda. La lección más importante del primer día: no dudes en preguntar.',

  -- BODY FR
  'Ali **commence** son nouveau travail aujourd''hui. Il s''est levé tôt, s''est habillé et est allé au bureau avec enthousiasme. En entrant dans l''immeuble, il est d''abord allé à la **réception** et s''est présenté.

Un employé lui a fait visiter le bureau. Il a **rencontré** quelques collègues ; tout le monde l''a chaleureusement accueilli. Ensuite il s''est installé au **bureau** qui lui avait été attribué et a ouvert l''ordinateur.

En se connectant au système certaines étapes lui ont semblé un peu **compliquées**. Mais un collègue a immédiatement proposé de l''aider. La leçon la plus importante de la première journée : n''hésitez pas à demander.',

  -- BODY PT
  'Ali está a **começar** o seu novo emprego hoje. Levantou-se cedo, vestiu-se e foi para o escritório com entusiasmo. Ao entrar no edifício foi primeiro à **receção** e apresentou-se.

Um funcionário levou-o numa visita ao escritório. **Conheceu** alguns colegas; todos o receberam calorosamente. Depois foi para a **secretária** que lhe tinha sido atribuída e abriu o computador.

Ao fazer login no sistema alguns passos pareceram um pouco **complicados**. Mas um colega imediatamente se ofereceu para ajudar. A lição mais importante do primeiro dia: não hesites em perguntar.'
);

INSERT INTO reading_text_keywords (reading_text_id, position_index, color_index,
  keyword_tr, keyword_en, keyword_sv, keyword_de, keyword_es, keyword_fr, keyword_pt)
SELECT id, 0, 0, 'başlıyor', 'starting', 'börjar', 'beginnt', 'comienza', 'commence', 'começar'
FROM reading_texts WHERE slug = 'work-first-day';

INSERT INTO reading_text_keywords (reading_text_id, position_index, color_index,
  keyword_tr, keyword_en, keyword_sv, keyword_de, keyword_es, keyword_fr, keyword_pt)
SELECT id, 1, 2, 'resepsiyona', 'reception', 'receptionen', 'Empfang', 'recepción', 'réception', 'receção'
FROM reading_texts WHERE slug = 'work-first-day';

INSERT INTO reading_text_keywords (reading_text_id, position_index, color_index,
  keyword_tr, keyword_en, keyword_sv, keyword_de, keyword_es, keyword_fr, keyword_pt)
SELECT id, 2, 4, 'tanıştı', 'met', 'träffade', 'traf', 'conoció', 'rencontré', 'conheceu'
FROM reading_texts WHERE slug = 'work-first-day';

INSERT INTO reading_text_keywords (reading_text_id, position_index, color_index,
  keyword_tr, keyword_en, keyword_sv, keyword_de, keyword_es, keyword_fr, keyword_pt)
SELECT id, 3, 6, 'masaya', 'desk', 'skrivbord', 'Schreibtisch', 'escritorio', 'bureau', 'secretária'
FROM reading_texts WHERE slug = 'work-first-day';

INSERT INTO reading_text_keywords (reading_text_id, position_index, color_index,
  keyword_tr, keyword_en, keyword_sv, keyword_de, keyword_es, keyword_fr, keyword_pt)
SELECT id, 4, 8, 'karmaşık', 'complicated', 'komplicerade', 'kompliziert', 'complicados', 'compliquées', 'complicados'
FROM reading_texts WHERE slug = 'work-first-day';

-- ─────────────────────────────────────────────────────────────
-- TEXT 19: work-team-meeting (work, difficulty 2)
-- Keywords: sunum/presentation, hazırlandı/prepared, tartıştılar/discussed, karar/decision, hedef/goal
-- ─────────────────────────────────────────────────────────────

INSERT INTO reading_texts (
  slug, category, difficulty, is_premium, order_index, estimated_reading_seconds,
  title_tr, title_en, title_sv, title_de, title_es, title_fr, title_pt,
  body_tr, body_en, body_sv, body_de, body_es, body_fr, body_pt
) VALUES (
  'work-team-meeting',
  'work', 2, false, 19, 85,

  'Ekip Toplantısı', 'Team Meeting', 'Teammöte', 'Teammeeting',
  'Reunión de Equipo', 'Réunion d''Équipe', 'Reunião de Equipa',

  -- BODY TR (keywords: sunum=0, hazırlandı=1, tartıştılar=2, karar=3, hedef=4)
  'Priya bu sabah önemli bir **sunum** yapacaktı. Akşamdan beri üzerinde çalıştı ve slaytlarını dikkatlice **hazırladı**. Toplantı odasına girdiğinde takım arkadaşları onu bekliyordu.

Sunum on beş dakika sürdü. Priya rakamları ve grafikleri açıkladı. Ardından ekip yeni stratejiyi **tartıştı**; herkes farklı bir bakış açısı getirdi.

Toplantı sonunda ortak bir **karara** varıldı. Priya not aldı ve herkese teşekkür etti. Gerçek bir ekip çalışmasıyla önemli bir **hedefe** bir adım daha yaklaşmışlardı.',

  -- BODY EN
  'Priya was going to give an important **presentation** this morning. She had been working on it since the evening and carefully **prepared** her slides. When she entered the meeting room her teammates were waiting for her.

The presentation lasted fifteen minutes. Priya explained the figures and charts. Then the team **discussed** the new strategy; everyone brought a different perspective.

At the end of the meeting a joint **decision** was reached. Priya took notes and thanked everyone. Through real teamwork they had taken one more step closer to an important **goal**.',

  -- BODY SV
  'Priya skulle hålla en viktig **presentation** i morse. Hon hade jobbat med den sedan kvällen och noggrant **förberett** sina bilder. När hon gick in i mötesrummet väntade hennes lagkamrater.

Presentationen varade i femton minuter. Priya förklarade siffrorna och diagrammen. Sedan **diskuterade** teamet den nya strategin; alla kom med ett annat perspektiv.

I slutet av mötet nåddes ett gemensamt **beslut**. Priya tog anteckningar och tackade alla. Genom verkligt lagarbete hade de tagit ytterligare ett steg mot ett viktigt **mål**.',

  -- BODY DE
  'Priya hielt heute Morgen eine wichtige **Präsentation**. Sie hatte seit dem Abend daran gearbeitet und ihre Folien sorgfältig **vorbereitet**. Als sie den Besprechungsraum betrat, warteten ihre Teamkollegen.

Die Präsentation dauerte fünfzehn Minuten. Priya erklärte die Zahlen und Diagramme. Dann **diskutierte** das Team die neue Strategie; jeder brachte eine andere Perspektive ein.

Am Ende des Meetings wurde eine gemeinsame **Entscheidung** getroffen. Priya machte Notizen und dankte jedem. Durch echte Teamarbeit hatten sie dem wichtigen **Ziel** einen weiteren Schritt näher gebracht.',

  -- BODY ES
  'Priya iba a hacer una **presentación** importante esta mañana. Había estado trabajando en ella desde la tarde y cuidadosamente **preparó** sus diapositivas. Cuando entró en la sala de reuniones sus compañeros de equipo la estaban esperando.

La presentación duró quince minutos. Priya explicó las cifras y los gráficos. Luego el equipo **discutió** la nueva estrategia; todos aportaron una perspectiva diferente.

Al final de la reunión se llegó a una **decisión** conjunta. Priya tomó notas y agradeció a todos. A través del verdadero trabajo en equipo habían dado un paso más hacia un **objetivo** importante.',

  -- BODY FR
  'Priya allait faire une **présentation** importante ce matin. Elle y avait travaillé depuis la veille et avait soigneusement **préparé** ses diapositives. Quand elle entra dans la salle de réunion, ses coéquipiers l''attendaient.

La présentation a duré quinze minutes. Priya a expliqué les chiffres et les graphiques. Ensuite l''équipe a **discuté** de la nouvelle stratégie ; chacun a apporté un point de vue différent.

À la fin de la réunion, une **décision** commune a été prise. Priya a pris des notes et a remercié tout le monde. Grâce au vrai travail d''équipe, ils avaient fait un pas de plus vers un **objectif** important.',

  -- BODY PT
  'Priya ia fazer uma **apresentação** importante esta manhã. Tinha estado a trabalhar nela desde a tarde e cuidadosamente **preparou** os seus diapositivos. Quando entrou na sala de reuniões os seus colegas de equipa estavam à espera.

A apresentação durou quinze minutos. Priya explicou os números e os gráficos. Depois a equipa **discutiu** a nova estratégia; todos trouxeram uma perspectiva diferente.

No final da reunião chegou-se a uma **decisão** conjunta. Priya fez anotações e agradeceu a todos. Através do verdadeiro trabalho em equipa tinham dado mais um passo em direção a um **objetivo** importante.'
);

INSERT INTO reading_text_keywords (reading_text_id, position_index, color_index,
  keyword_tr, keyword_en, keyword_sv, keyword_de, keyword_es, keyword_fr, keyword_pt)
SELECT id, 0, 0, 'sunum', 'presentation', 'presentation', 'Präsentation', 'presentación', 'présentation', 'apresentação'
FROM reading_texts WHERE slug = 'work-team-meeting';

INSERT INTO reading_text_keywords (reading_text_id, position_index, color_index,
  keyword_tr, keyword_en, keyword_sv, keyword_de, keyword_es, keyword_fr, keyword_pt)
SELECT id, 1, 2, 'hazırladı', 'prepared', 'förberett', 'vorbereitet', 'preparó', 'préparé', 'preparou'
FROM reading_texts WHERE slug = 'work-team-meeting';

INSERT INTO reading_text_keywords (reading_text_id, position_index, color_index,
  keyword_tr, keyword_en, keyword_sv, keyword_de, keyword_es, keyword_fr, keyword_pt)
SELECT id, 2, 4, 'tartıştı', 'discussed', 'diskuterade', 'diskutierte', 'discutió', 'discuté', 'discutiu'
FROM reading_texts WHERE slug = 'work-team-meeting';

INSERT INTO reading_text_keywords (reading_text_id, position_index, color_index,
  keyword_tr, keyword_en, keyword_sv, keyword_de, keyword_es, keyword_fr, keyword_pt)
SELECT id, 3, 6, 'karara', 'decision', 'beslut', 'Entscheidung', 'decisión', 'décision', 'decisão'
FROM reading_texts WHERE slug = 'work-team-meeting';

INSERT INTO reading_text_keywords (reading_text_id, position_index, color_index,
  keyword_tr, keyword_en, keyword_sv, keyword_de, keyword_es, keyword_fr, keyword_pt)
SELECT id, 4, 8, 'hedefe', 'goal', 'mål', 'Ziel', 'objetivo', 'objectif', 'objetivo'
FROM reading_texts WHERE slug = 'work-team-meeting';

-- ─────────────────────────────────────────────────────────────
-- TEXT 20: work-deadline (work, difficulty 2)
-- Keywords: teslim/deadline, gönderdi/sent, rahatlama/relief, çıkış/exit, ritüel/ritual
-- ─────────────────────────────────────────────────────────────

INSERT INTO reading_texts (
  slug, category, difficulty, is_premium, order_index, estimated_reading_seconds,
  title_tr, title_en, title_sv, title_de, title_es, title_fr, title_pt,
  body_tr, body_en, body_sv, body_de, body_es, body_fr, body_pt
) VALUES (
  'work-deadline',
  'work', 2, false, 20, 85,

  'Son Teslim Günü', 'Deadline Day', 'Deadline-Dag', 'Abgabetag',
  'Día de Entrega', 'Jour de Remise', 'Dia de Entrega',

  -- BODY TR (keywords: teslim=0, gönderdi=1, rahatlama=2, çıkış=3, ritüel=4)
  'Bugün projenin **teslim** günüydü. Marco sabahtan beri bilgisayar başında, son düzeltmeleri yapıyordu. Saat öğleye geldiğinde raporu son kez gözden geçirdi.

Her şey hazır görünüyordu. Derin bir nefes aldı ve raporu e-postayla müdürüne **gönderdi**. Ekrana bakıp onayı bekledi; birkaç dakika sonra "Harika görünüyor" mesajı geldi.

Bir **rahatlama** dalgası tüm vücudunu kapladı. Bilgisayarı kapattı ve **çıkış** yaptı. Ofisten çıkarken kendine küçük bir ödül almak, onun her büyük teslimattan sonraki **ritüeliydi**.',

  -- BODY EN
  'Today was the **deadline** for the project. Marco had been at his computer since morning, making final corrections. When noon arrived he reviewed the report one last time.

Everything seemed ready. He took a deep breath and **sent** the report by email to his manager. He looked at the screen and waited for approval; a few minutes later the message "Looks great" arrived.

A wave of **relief** washed over his whole body. He closed the computer and **logged out**. Treating himself to a small reward when leaving the office was his **ritual** after every big submission.',

  -- BODY SV
  'Idag var det **deadline** för projektet. Marco hade suttit vid datorn sedan morgonen och gjort de sista korrigeringarna. När middagen närmade sig gick han igenom rapporten en sista gång.

Allt verkade klart. Han tog ett djupt andetag och **skickade** rapporten via e-post till sin chef. Han tittade på skärmen och väntade på godkännande; några minuter senare kom meddelandet "Ser bra ut".

En våg av **lättnad** sköljde över hela kroppen. Han stängde datorn och **loggade ut**. Att unna sig en liten belöning när han lämnade kontoret var hans **ritual** efter varje stor inlämning.',

  -- BODY DE
  'Heute war der **Abgabe**termin für das Projekt. Marco saß seit dem Morgen am Computer und machte letzte Korrekturen. Als der Mittag nahte, sah er den Bericht ein letztes Mal durch.

Alles schien bereit. Er atmete tief ein und **schickte** den Bericht per E-Mail an seinen Vorgesetzten. Er schaute auf den Bildschirm und wartete auf die Genehmigung; einige Minuten später kam die Nachricht "Sieht gut aus".

Eine Welle der **Erleichterung** überflutete seinen ganzen Körper. Er schloss den Computer und **meldete sich ab**. Sich beim Verlassen des Büros eine kleine Belohnung zu gönnen war sein **Ritual** nach jeder großen Abgabe.',

  -- BODY ES
  'Hoy era el día de **entrega** del proyecto. Marco llevaba desde la mañana frente al ordenador haciendo las correcciones finales. Cuando se acercó el mediodía repasó el informe por última vez.

Todo parecía listo. Respiró hondo y **envió** el informe por correo electrónico a su jefe. Miró la pantalla y esperó la aprobación; unos minutos después llegó el mensaje "Tiene muy buena pinta".

Una ola de **alivio** recorrió todo su cuerpo. Cerró el ordenador y **cerró sesión**. Darse un pequeño premio al salir de la oficina era su **ritual** después de cada entrega importante.',

  -- BODY FR
  'Aujourd''hui était le jour de la **remise** du projet. Marco était devant son ordinateur depuis le matin à faire les dernières corrections. Quand midi approchait, il a relu le rapport une dernière fois.

Tout semblait prêt. Il a pris une grande inspiration et a **envoyé** le rapport par e-mail à son responsable. Il a regardé l''écran et attendu l''approbation ; quelques minutes plus tard le message "Ça a l''air super" est arrivé.

Une vague de **soulagement** a envahi tout son corps. Il a fermé l''ordinateur et s''est **déconnecté**. Se faire un petit cadeau en quittant le bureau était son **rituel** après chaque grande remise.',

  -- BODY PT
  'Hoje era o dia de **entrega** do projeto. Marco estava ao computador desde a manhã a fazer as correções finais. Quando o meio-dia se aproximou reviu o relatório pela última vez.

Tudo parecia pronto. Respirou fundo e **enviou** o relatório por e-mail ao seu chefe. Olhou para o ecrã e esperou pela aprovação; alguns minutos depois chegou a mensagem "Parece ótimo".

Uma onda de **alívio** percorreu todo o seu corpo. Fechou o computador e **terminou a sessão**. Dar a si próprio um pequeno prémio ao sair do escritório era o seu **ritual** após cada grande entrega.'
);

INSERT INTO reading_text_keywords (reading_text_id, position_index, color_index,
  keyword_tr, keyword_en, keyword_sv, keyword_de, keyword_es, keyword_fr, keyword_pt)
SELECT id, 0, 0, 'teslim', 'deadline', 'deadline', 'Abgabe', 'entrega', 'remise', 'entrega'
FROM reading_texts WHERE slug = 'work-deadline';

INSERT INTO reading_text_keywords (reading_text_id, position_index, color_index,
  keyword_tr, keyword_en, keyword_sv, keyword_de, keyword_es, keyword_fr, keyword_pt)
SELECT id, 1, 2, 'gönderdi', 'sent', 'skickade', 'schickte', 'envió', 'envoyé', 'enviou'
FROM reading_texts WHERE slug = 'work-deadline';

INSERT INTO reading_text_keywords (reading_text_id, position_index, color_index,
  keyword_tr, keyword_en, keyword_sv, keyword_de, keyword_es, keyword_fr, keyword_pt)
SELECT id, 2, 4, 'rahatlama', 'relief', 'lättnad', 'Erleichterung', 'alivio', 'soulagement', 'alívio'
FROM reading_texts WHERE slug = 'work-deadline';

INSERT INTO reading_text_keywords (reading_text_id, position_index, color_index,
  keyword_tr, keyword_en, keyword_sv, keyword_de, keyword_es, keyword_fr, keyword_pt)
SELECT id, 3, 6, 'çıkış', 'logged out', 'loggade ut', 'meldete sich ab', 'cerró sesión', 'déconnecté', 'terminou a sessão'
FROM reading_texts WHERE slug = 'work-deadline';

INSERT INTO reading_text_keywords (reading_text_id, position_index, color_index,
  keyword_tr, keyword_en, keyword_sv, keyword_de, keyword_es, keyword_fr, keyword_pt)
SELECT id, 4, 8, 'ritüeliydi', 'ritual', 'ritual', 'Ritual', 'ritual', 'rituel', 'ritual'
FROM reading_texts WHERE slug = 'work-deadline';
