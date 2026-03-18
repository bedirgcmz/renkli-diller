-- 009_translate_sentences_es_fr_pt_part1.sql
-- ES / FR / PT çevirileri — Kategori 1-3 (90 cümle)
-- sort_order 1-30 → Category 1 (Günlük Konuşma)
-- sort_order 31-60 → Category 2 (İş İngilizcesi)
-- sort_order 61-90 → Category 3 (Phrasal Verbs)

-- ─── CATEGORY 1 — Günlük Konuşma ─────────────────────────────────────────────

UPDATE sentences SET
  text_es = '**Por cierto**, ¿mañana tienes libre?',
  text_fr = '**Au fait**, tu es libre demain ?',
  text_pt = '**Por sinal**, você está livre amanhã?',
  keywords_es = '["por cierto"]'::jsonb,
  keywords_fr = '["au fait"]'::jsonb,
  keywords_pt = '["por sinal"]'::jsonb
WHERE sort_order = 1;

UPDATE sentences SET
  text_es = '**O sea**, ¿de verdad estás diciendo eso?',
  text_fr = '**Je veux dire**, tu dis vraiment ça ?',
  text_pt = '**Quer dizer**, você está dizendo isso de verdade?',
  keywords_es = '["o sea"]'::jsonb,
  keywords_fr = '["je veux dire"]'::jsonb,
  keywords_pt = '["quer dizer"]'::jsonb
WHERE sort_order = 2;

UPDATE sentences SET
  text_es = '**Sabes qué**, esto es exactamente lo que necesitaba.',
  text_fr = '**Tu sais quoi**, c''est exactement ce dont j''avais besoin.',
  text_pt = '**Sabe o que é**, isso é exatamente o que eu precisava.',
  keywords_es = '["sabes qué"]'::jsonb,
  keywords_fr = '["tu sais quoi"]'::jsonb,
  keywords_pt = '["sabe o que é"]'::jsonb
WHERE sort_order = 3;

UPDATE sentences SET
  text_es = '**Para ser sincero**, no disfruté mucho esta película.',
  text_fr = '**Pour être honnête**, je n''ai pas vraiment apprécié ce film.',
  text_pt = '**Para ser honesto**, não curti muito esse filme.',
  keywords_es = '["para ser sincero"]'::jsonb,
  keywords_fr = '["pour être honnête"]'::jsonb,
  keywords_pt = '["para ser honesto"]'::jsonb
WHERE sort_order = 4;

UPDATE sentences SET
  text_es = '**Ante todo**, quiero daros las gracias.',
  text_fr = '**Tout d''abord**, je veux vous dire merci.',
  text_pt = '**Antes de tudo**, quero dizer obrigado.',
  keywords_es = '["ante todo"]'::jsonb,
  keywords_fr = '["tout d''abord"]'::jsonb,
  keywords_pt = '["antes de tudo"]'::jsonb
WHERE sort_order = 5;

UPDATE sentences SET
  text_es = 'Aunque no pudieras venir, podrías haber mandado **al menos** un mensaje.',
  text_fr = 'Même si tu ne pouvais pas venir, tu aurais **au moins** pu envoyer un message.',
  text_pt = 'Mesmo que não pudesse vir, você poderia **pelo menos** ter mandado uma mensagem.',
  keywords_es = '["al menos"]'::jsonb,
  keywords_fr = '["au moins"]'::jsonb,
  keywords_pt = '["pelo menos"]'::jsonb
WHERE sort_order = 6;

UPDATE sentences SET
  text_es = 'Ocupémonos de esto **ahora mismo**.',
  text_fr = 'Occupons-nous de ça **tout de suite**.',
  text_pt = 'Vamos resolver isso **agora mesmo**.',
  keywords_es = '["ahora mismo"]'::jsonb,
  keywords_fr = '["tout de suite"]'::jsonb,
  keywords_pt = '["agora mesmo"]'::jsonb
WHERE sort_order = 7;

UPDATE sentences SET
  text_es = '**Claro que sí**, puedo ayudarte con eso.',
  text_fr = 'Je peux **bien sûr** t''aider avec ça.',
  text_pt = 'Posso **com certeza** te ajudar com isso.',
  keywords_es = '["claro que sí"]'::jsonb,
  keywords_fr = '["bien sûr"]'::jsonb,
  keywords_pt = '["com certeza"]'::jsonb
WHERE sort_order = 8;

UPDATE sentences SET
  text_es = '¿Te estoy molestando? — **¡Para nada**!',
  text_fr = 'Je te dérange ? — **Pas du tout** !',
  text_pt = 'Estou te incomodando? — **De jeito nenhum**!',
  keywords_es = '["para nada"]'::jsonb,
  keywords_fr = '["pas du tout"]'::jsonb,
  keywords_pt = '["de jeito nenhum"]'::jsonb
WHERE sort_order = 9;

UPDATE sentences SET
  text_es = '**Por supuesto** que te ayudaré, solo pregunta.',
  text_fr = '**Bien sûr** que je t''aiderai, demande.',
  text_pt = '**Claro** que vou te ajudar, é só pedir.',
  keywords_es = '["por supuesto"]'::jsonb,
  keywords_fr = '["bien sûr"]'::jsonb,
  keywords_pt = '["claro"]'::jsonb
WHERE sort_order = 10;

UPDATE sentences SET
  text_es = '**Al fin y al cabo**, todo el mundo comete errores.',
  text_fr = '**Après tout**, tout le monde fait des erreurs.',
  text_pt = '**Afinal de contas**, todo mundo comete erros.',
  keywords_es = '["al fin y al cabo"]'::jsonb,
  keywords_fr = '["après tout"]'::jsonb,
  keywords_pt = '["afinal de contas"]'::jsonb
WHERE sort_order = 11;

UPDATE sentences SET
  text_es = '**¿Cómo es que** puedes aprender tan rápido?',
  text_fr = '**Comment se fait-il** que tu apprennes si vite ?',
  text_pt = '**Como assim** você consegue aprender tão rápido?',
  keywords_es = '["cómo es que"]'::jsonb,
  keywords_fr = '["comment se fait-il"]'::jsonb,
  keywords_pt = '["como assim"]'::jsonb
WHERE sort_order = 12;

UPDATE sentences SET
  text_es = '**¿Y tú**, qué piensas?',
  text_fr = '**Et toi**, qu''est-ce que tu en penses ?',
  text_pt = '**E você**, o que acha?',
  keywords_es = '["y tú"]'::jsonb,
  keywords_fr = '["et toi"]'::jsonb,
  keywords_pt = '["e você"]'::jsonb
WHERE sort_order = 13;

UPDATE sentences SET
  text_es = '**En cuanto a mí**, prefiero quedarme en casa.',
  text_fr = '**Quant à moi**, je préfère rester à la maison.',
  text_pt = '**Quanto a mim**, prefiro ficar em casa.',
  keywords_es = '["en cuanto a mí"]'::jsonb,
  keywords_fr = '["quant à moi"]'::jsonb,
  keywords_pt = '["quanto a mim"]'::jsonb
WHERE sort_order = 14;

UPDATE sentences SET
  text_es = '¿Puedo preguntar algo? — **Adelante**.',
  text_fr = 'Je peux poser une question ? — **Vas-y** !',
  text_pt = 'Posso perguntar algo? — **Pode falar**!',
  keywords_es = '["adelante"]'::jsonb,
  keywords_fr = '["vas-y"]'::jsonb,
  keywords_pt = '["pode falar"]'::jsonb
WHERE sort_order = 15;

UPDATE sentences SET
  text_es = 'Llego tarde, lo siento. — **No importa**, está bien.',
  text_fr = 'Je suis en retard, désolé. — **Ça ne fait rien**, c''est bon.',
  text_pt = 'Estou atrasado, desculpa. — **Não tem problema**, tudo bem.',
  keywords_es = '["no importa"]'::jsonb,
  keywords_fr = '["ça ne fait rien"]'::jsonb,
  keywords_pt = '["não tem problema"]'::jsonb
WHERE sort_order = 16;

UPDATE sentences SET
  text_es = '**Espera**, ¿dónde está mi teléfono?',
  text_fr = '**Attends**, où est mon téléphone ?',
  text_pt = '**Espera aí**, cadê meu celular?',
  keywords_es = '["espera"]'::jsonb,
  keywords_fr = '["attends"]'::jsonb,
  keywords_pt = '["espera aí"]'::jsonb
WHERE sort_order = 17;

UPDATE sentences SET
  text_es = '**Tómate tu tiempo**, todos te estamos esperando.',
  text_fr = '**Prends ton temps**, on t''attend tous.',
  text_pt = '**Sem pressa**, estamos todos esperando.',
  keywords_es = '["tómate tu tiempo"]'::jsonb,
  keywords_fr = '["prends ton temps"]'::jsonb,
  keywords_pt = '["sem pressa"]'::jsonb
WHERE sort_order = 18;

UPDATE sentences SET
  text_es = '**En realidad**, quería decirte algo.',
  text_fr = '**En fait**, je voulais te dire quelque chose.',
  text_pt = '**Na verdade**, estava querendo te falar uma coisa.',
  keywords_es = '["en realidad"]'::jsonb,
  keywords_fr = '["en fait"]'::jsonb,
  keywords_pt = '["na verdade"]'::jsonb
WHERE sort_order = 19;

UPDATE sentences SET
  text_es = 'Parece difícil, pero **en realidad** es bastante fácil.',
  text_fr = 'Ça a l''air difficile, mais **en réalité** c''est assez facile.',
  text_pt = 'Parece difícil, mas **na prática** é bem fácil.',
  keywords_es = '["en realidad"]'::jsonb,
  keywords_fr = '["en réalité"]'::jsonb,
  keywords_pt = '["na prática"]'::jsonb
WHERE sort_order = 20;

UPDATE sentences SET
  text_es = 'Esta situación es **un poco** rara, ¿no?',
  text_fr = 'Cette situation est **un peu** bizarre, non ?',
  text_pt = 'Essa situação é **meio** estranha, não é?',
  keywords_es = '["un poco"]'::jsonb,
  keywords_fr = '["un peu"]'::jsonb,
  keywords_pt = '["meio"]'::jsonb
WHERE sort_order = 21;

UPDATE sentences SET
  text_es = '**Con razón** estás cansado, trabajaste todo el día.',
  text_fr = '**Ce n''est pas étonnant** que tu sois fatigué, tu as travaillé toute la journée.',
  text_pt = '**Não é à toa** que você está cansado, trabalhou o dia todo.',
  keywords_es = '["con razón"]'::jsonb,
  keywords_fr = '["ce n''est pas étonnant"]'::jsonb,
  keywords_pt = '["não é à toa"]'::jsonb
WHERE sort_order = 22;

UPDATE sentences SET
  text_es = '¿Adónde vamos? — **Como tú quieras**, elige.',
  text_fr = 'On va où ? — **C''est à toi de décider**, tu choisis.',
  text_pt = 'Para onde vamos? — **É com você**, você escolhe.',
  keywords_es = '["como tú quieras"]'::jsonb,
  keywords_fr = '["c''est à toi de décider"]'::jsonb,
  keywords_pt = '["é com você"]'::jsonb
WHERE sort_order = 23;

UPDATE sentences SET
  text_es = '**Cuánto tiempo sin verte**, ¿cómo estás?',
  text_fr = '**Ça fait longtemps** ! Comment tu vas ?',
  text_pt = '**Quanto tempo**! Como você está?',
  keywords_es = '["cuánto tiempo sin verte"]'::jsonb,
  keywords_fr = '["ça fait longtemps"]'::jsonb,
  keywords_pt = '["quanto tempo"]'::jsonb
WHERE sort_order = 24;

UPDATE sentences SET
  text_es = 'Lo siento, tardé mucho. — **No es para tanto**, no te preocupes.',
  text_fr = 'Désolé d''avoir mis du temps. — **C''est pas grave**, t''en fais pas.',
  text_pt = 'Desculpe a demora. — **Não tem nada não**, pode deixar.',
  keywords_es = '["no es para tanto"]'::jsonb,
  keywords_fr = '["c''est pas grave"]'::jsonb,
  keywords_pt = '["não tem nada não"]'::jsonb
WHERE sort_order = 25;

UPDATE sentences SET
  text_es = 'Lleva un paraguas, **por si acaso**.',
  text_fr = 'Prends un parapluie, **au cas où**.',
  text_pt = 'Leva um guarda-chuva, **por via das dúvidas**.',
  keywords_es = '["por si acaso"]'::jsonb,
  keywords_fr = '["au cas où"]'::jsonb,
  keywords_pt = '["por via das dúvidas"]'::jsonb
WHERE sort_order = 26;

UPDATE sentences SET
  text_es = 'Es caro, **además** está muy lejos.',
  text_fr = 'C''est cher, **en plus** c''est très loin.',
  text_pt = 'É caro, **além disso** fica muito longe.',
  keywords_es = '["además"]'::jsonb,
  keywords_fr = '["en plus"]'::jsonb,
  keywords_pt = '["além disso"]'::jsonb
WHERE sort_order = 27;

UPDATE sentences SET
  text_es = '**De todas formas**, volvamos al tema.',
  text_fr = '**De toute façon**, revenons au sujet.',
  text_pt = '**Enfim**, voltemos ao assunto.',
  keywords_es = '["de todas formas"]'::jsonb,
  keywords_fr = '["de toute façon"]'::jsonb,
  keywords_pt = '["enfim"]'::jsonb
WHERE sort_order = 28;

UPDATE sentences SET
  text_es = '**Supongo** que tienes razón, tengo que pensarlo.',
  text_fr = '**Je suppose** que tu as raison, j''ai besoin d''y réfléchir.',
  text_pt = '**Acho que** você tem razão, preciso pensar nisso.',
  keywords_es = '["supongo"]'::jsonb,
  keywords_fr = '["je suppose"]'::jsonb,
  keywords_pt = '["acho que"]'::jsonb
WHERE sort_order = 29;

UPDATE sentences SET
  text_es = '**¿Qué quieres decir** exactamente? No entendí.',
  text_fr = '**Qu''est-ce que tu veux dire** exactement ? Je n''ai pas compris.',
  text_pt = '**O que você quer dizer** exatamente? Não entendi.',
  keywords_es = '["qué quieres decir"]'::jsonb,
  keywords_fr = '["qu''est-ce que tu veux dire"]'::jsonb,
  keywords_pt = '["o que você quer dizer"]'::jsonb
WHERE sort_order = 30;

-- ─── CATEGORY 2 — İş İngilizcesi ─────────────────────────────────────────────

UPDATE sentences SET
  text_es = 'Lo voy a revisar y **me pondré en contacto contigo**.',
  text_fr = 'Je vais me renseigner et je **reviens vers toi**.',
  text_pt = 'Vou verificar e **entro em contato contigo**.',
  keywords_es = '["me pondré en contacto contigo"]'::jsonb,
  keywords_fr = '["reviens vers toi"]'::jsonb,
  keywords_pt = '["entro em contato contigo"]'::jsonb
WHERE sort_order = 31;

UPDATE sentences SET
  text_es = 'Necesito **hacer seguimiento** de este asunto.',
  text_fr = 'Je dois **assurer le suivi** de cette question.',
  text_pt = 'Preciso **acompanhar** esse assunto.',
  keywords_es = '["hacer seguimiento"]'::jsonb,
  keywords_fr = '["assurer le suivi"]'::jsonb,
  keywords_pt = '["acompanhar"]'::jsonb
WHERE sort_order = 32;

UPDATE sentences SET
  text_es = '**Conectemos** la próxima semana.',
  text_fr = '**Faisons le point** la semaine prochaine.',
  text_pt = 'Vamos **nos falar** na semana que vem.',
  keywords_es = '["conectemos"]'::jsonb,
  keywords_fr = '["faisons le point"]'::jsonb,
  keywords_pt = '["nos falar"]'::jsonb
WHERE sort_order = 33;

UPDATE sentences SET
  text_es = 'Por favor **ten en cuenta** esto mientras lo haces.',
  text_fr = 'Garde bien **à l''esprit** cela pendant que tu le fais.',
  text_pt = 'Por favor **tenha em mente** isso enquanto faz.',
  keywords_es = '["ten en cuenta"]'::jsonb,
  keywords_fr = '["à l''esprit"]'::jsonb,
  keywords_pt = '["tenha em mente"]'::jsonb
WHERE sort_order = 34;

UPDATE sentences SET
  text_es = '¿Puedes enviar el informe **lo antes posible**?',
  text_fr = 'Tu peux envoyer le rapport **dès que possible** ?',
  text_pt = 'Você pode enviar o relatório **o mais rápido possível**?',
  keywords_es = '["lo antes posible"]'::jsonb,
  keywords_fr = '["dès que possible"]'::jsonb,
  keywords_pt = '["o mais rápido possível"]'::jsonb
WHERE sort_order = 35;

UPDATE sentences SET
  text_es = '**Avancemos** con el proyecto.',
  text_fr = '**Avançons** avec le projet.',
  text_pt = 'Vamos **avançar** com o projeto.',
  keywords_es = '["avancemos"]'::jsonb,
  keywords_fr = '["avançons"]'::jsonb,
  keywords_pt = '["avançar"]'::jsonb
WHERE sort_order = 36;

UPDATE sentences SET
  text_es = 'Necesito **ponerme en contacto** con el cliente.',
  text_fr = 'Je dois **contacter** le client.',
  text_pt = 'Preciso **entrar em contato** com o cliente.',
  keywords_es = '["ponerme en contacto"]'::jsonb,
  keywords_fr = '["contacter"]'::jsonb,
  keywords_pt = '["entrar em contato"]'::jsonb
WHERE sort_order = 37;

UPDATE sentences SET
  text_es = 'Voy a **investigar** este problema.',
  text_fr = 'Je vais **examiner** ce problème.',
  text_pt = 'Vou **analisar** esse problema.',
  keywords_es = '["investigar"]'::jsonb,
  keywords_fr = '["examiner"]'::jsonb,
  keywords_pt = '["analisar"]'::jsonb
WHERE sort_order = 38;

UPDATE sentences SET
  text_es = '**Cerremos** la reunión ya.',
  text_fr = '**Concluons** la réunion maintenant.',
  text_pt = 'Vamos **encerrar** a reunião agora.',
  keywords_es = '["cerremos"]'::jsonb,
  keywords_fr = '["concluons"]'::jsonb,
  keywords_pt = '["encerrar"]'::jsonb
WHERE sort_order = 39;

UPDATE sentences SET
  text_es = 'Necesitamos **encontrar** una nueva solución.',
  text_fr = 'On doit **trouver** une nouvelle solution.',
  text_pt = 'Precisamos **criar** uma nova solução.',
  keywords_es = '["encontrar"]'::jsonb,
  keywords_fr = '["trouver"]'::jsonb,
  keywords_pt = '["criar"]'::jsonb
WHERE sort_order = 40;

UPDATE sentences SET
  text_es = 'Yo me **encargaré** de este asunto.',
  text_fr = 'Je vais **m''occuper** de ce problème.',
  text_pt = 'Vou **cuidar** desse assunto.',
  keywords_es = '["encargaré"]'::jsonb,
  keywords_fr = '["m''occuper"]'::jsonb,
  keywords_pt = '["cuidar"]'::jsonb
WHERE sort_order = 41;

UPDATE sentences SET
  text_es = 'Déjame **revisar** el estado del informe.',
  text_fr = 'Laisse-moi **vérifier** l''état du rapport.',
  text_pt = 'Deixa eu **verificar** o andamento do relatório.',
  keywords_es = '["revisar"]'::jsonb,
  keywords_fr = '["vérifier"]'::jsonb,
  keywords_pt = '["verificar"]'::jsonb
WHERE sort_order = 42;

UPDATE sentences SET
  text_es = '**Repasemos** la presentación juntos.',
  text_fr = '**Revoyons** la présentation ensemble.',
  text_pt = 'Vamos **revisar** a apresentação juntos.',
  keywords_es = '["repasemos"]'::jsonb,
  keywords_fr = '["revoyons"]'::jsonb,
  keywords_pt = '["revisar"]'::jsonb
WHERE sort_order = 43;

UPDATE sentences SET
  text_es = '¿Cómo vamos a **manejar** este problema?',
  text_fr = 'Comment allons-nous **gérer** ce problème ?',
  text_pt = 'Como vamos **lidar** com esse problema?',
  keywords_es = '["manejar"]'::jsonb,
  keywords_fr = '["gérer"]'::jsonb,
  keywords_pt = '["lidar"]'::jsonb
WHERE sort_order = 44;

UPDATE sentences SET
  text_es = 'Deberíamos **plantear** el tema del presupuesto en la reunión.',
  text_fr = 'On devrait **aborder** le sujet du budget en réunion.',
  text_pt = 'Devemos **levantar** o assunto do orçamento na reunião.',
  keywords_es = '["plantear"]'::jsonb,
  keywords_fr = '["aborder"]'::jsonb,
  keywords_pt = '["levantar"]'::jsonb
WHERE sort_order = 45;

UPDATE sentences SET
  text_es = '**Realizaremos** la investigación esta semana.',
  text_fr = 'On va **mener** les recherches cette semaine.',
  text_pt = 'Vamos **realizar** a pesquisa esta semana.',
  keywords_es = '["realizaremos"]'::jsonb,
  keywords_fr = '["mener"]'::jsonb,
  keywords_pt = '["realizar"]'::jsonb
WHERE sort_order = 46;

UPDATE sentences SET
  text_es = 'Te mantendré **al tanto**.',
  text_fr = 'Je te tiendrai **au courant**.',
  text_pt = 'Vou te deixar **por dentro** de tudo.',
  keywords_es = '["al tanto"]'::jsonb,
  keywords_fr = '["au courant"]'::jsonb,
  keywords_pt = '["por dentro"]'::jsonb
WHERE sort_order = 47;

UPDATE sentences SET
  text_es = '¿Estamos todos **de acuerdo** en esto?',
  text_fr = 'On est tous **sur la même longueur d''onde** là-dessus ?',
  text_pt = 'Estamos todos **alinhados** sobre isso?',
  keywords_es = '["de acuerdo"]'::jsonb,
  keywords_fr = '["sur la même longueur d''onde"]'::jsonb,
  keywords_pt = '["alinhados"]'::jsonb
WHERE sort_order = 48;

UPDATE sentences SET
  text_es = 'Solo un **aviso previo**: el sistema estará en mantenimiento.',
  text_fr = 'Juste **pour vous prévenir** : le système sera en maintenance.',
  text_pt = 'Só um **aviso**: o sistema ficará fora do ar para manutenção.',
  keywords_es = '["aviso previo"]'::jsonb,
  keywords_fr = '["pour vous prévenir"]'::jsonb,
  keywords_pt = '["aviso"]'::jsonb
WHERE sort_order = 49;

UPDATE sentences SET
  text_es = 'Deberías **liderar** este proyecto.',
  text_fr = 'Tu devrais **prendre les rênes** de ce projet.',
  text_pt = 'Você deveria **liderar** esse projeto.',
  keywords_es = '["liderar"]'::jsonb,
  keywords_fr = '["prendre les rênes"]'::jsonb,
  keywords_pt = '["liderar"]'::jsonb
WHERE sort_order = 50;

UPDATE sentences SET
  text_es = '**Lancemos** oficialmente el nuevo trimestre.',
  text_fr = '**Lançons** officiellement le nouveau trimestre.',
  text_pt = 'Vamos **dar o pontapé inicial** no novo trimestre.',
  keywords_es = '["lancemos"]'::jsonb,
  keywords_fr = '["lançons"]'::jsonb,
  keywords_pt = '["dar o pontapé inicial"]'::jsonb
WHERE sort_order = 51;

UPDATE sentences SET
  text_es = '¿Puedes **dar tu visto bueno** al acuerdo?',
  text_fr = 'Tu peux **valider** l''accord ?',
  text_pt = 'Você pode **aprovar** o contrato?',
  keywords_es = '["dar tu visto bueno"]'::jsonb,
  keywords_fr = '["valider"]'::jsonb,
  keywords_pt = '["aprovar"]'::jsonb
WHERE sort_order = 52;

UPDATE sentences SET
  text_es = '¿Puedes **ponerme al día**?',
  text_fr = 'Tu peux me **mettre au courant** ?',
  text_pt = 'Você pode me **atualizar**?',
  keywords_es = '["ponerme al día"]'::jsonb,
  keywords_fr = '["mettre au courant"]'::jsonb,
  keywords_pt = '["atualizar"]'::jsonb
WHERE sort_order = 53;

UPDATE sentences SET
  text_es = '**A partir de ahora**, se compartirán informes semanales.',
  text_fr = '**Dorénavant**, des rapports hebdomadaires seront partagés.',
  text_pt = '**Daqui para frente**, relatórios semanais serão compartilhados.',
  keywords_es = '["a partir de ahora"]'::jsonb,
  keywords_fr = '["dorénavant"]'::jsonb,
  keywords_pt = '["daqui para frente"]'::jsonb
WHERE sort_order = 54;

UPDATE sentences SET
  text_es = 'Agendemos una llamada **cuando puedas**.',
  text_fr = 'Fixons un appel **dès que tu es disponible**.',
  text_pt = 'Vamos marcar uma ligação **assim que você tiver disponibilidade**.',
  keywords_es = '["cuando puedas"]'::jsonb,
  keywords_fr = '["dès que tu es disponible"]'::jsonb,
  keywords_pt = '["assim que você tiver disponibilidade"]'::jsonb
WHERE sort_order = 55;

UPDATE sentences SET
  text_es = 'Necesitamos **configurar** el nuevo sistema.',
  text_fr = 'On doit **mettre en place** le nouveau système.',
  text_pt = 'Precisamos **configurar** o novo sistema.',
  keywords_es = '["configurar"]'::jsonb,
  keywords_fr = '["mettre en place"]'::jsonb,
  keywords_pt = '["configurar"]'::jsonb
WHERE sort_order = 56;

UPDATE sentences SET
  text_es = 'Necesito **entregar esto** en dos días.',
  text_fr = 'Je dois **boucler ça** en deux jours.',
  text_pt = 'Preciso **resolver isso** em dois dias.',
  keywords_es = '["entregar esto"]'::jsonb,
  keywords_fr = '["boucler ça"]'::jsonb,
  keywords_pt = '["resolver isso"]'::jsonb
WHERE sort_order = 57;

UPDATE sentences SET
  text_es = 'Necesitamos **descubrir** por qué está tardando tanto.',
  text_fr = 'On doit **comprendre** pourquoi ça prend autant de temps.',
  text_pt = 'Precisamos **descobrir** por que isso está demorando tanto.',
  keywords_es = '["descubrir"]'::jsonb,
  keywords_fr = '["comprendre"]'::jsonb,
  keywords_pt = '["descobrir"]'::jsonb
WHERE sort_order = 58;

UPDATE sentences SET
  text_es = 'Primero tengo que **consultarlo con** el gerente.',
  text_fr = 'Je dois d''abord **soumettre ça** au manager.',
  text_pt = 'Preciso primeiro **passar isso pelo** gerente.',
  keywords_es = '["consultarlo con"]'::jsonb,
  keywords_fr = '["soumettre ça"]'::jsonb,
  keywords_pt = '["passar isso pelo"]'::jsonb
WHERE sort_order = 59;

UPDATE sentences SET
  text_es = '**Preparemos** la presentación juntos.',
  text_fr = '**Préparons** la présentation ensemble.',
  text_pt = 'Vamos **montar** a apresentação.',
  keywords_es = '["preparemos"]'::jsonb,
  keywords_fr = '["préparons"]'::jsonb,
  keywords_pt = '["montar"]'::jsonb
WHERE sort_order = 60;

-- ─── CATEGORY 3 — Phrasal Verbs ───────────────────────────────────────────────

UPDATE sentences SET
  text_es = 'Nunca te **rindas**, ¡tú puedes!',
  text_fr = 'N''**abandonne** jamais, tu peux le faire !',
  text_pt = 'Nunca **desista**, você consegue!',
  keywords_es = '["rindas"]'::jsonb,
  keywords_fr = '["abandonne"]'::jsonb,
  keywords_pt = '["desista"]'::jsonb
WHERE sort_order = 61;

UPDATE sentences SET
  text_es = 'Me **quedé sin** dinero, necesito encontrar un cajero.',
  text_fr = 'Je me suis retrouvé **à court de** monnaie, je dois trouver un distributeur.',
  text_pt = '**Fiquei sem** dinheiro, preciso encontrar um caixa eletrônico.',
  keywords_es = '["quedé sin"]'::jsonb,
  keywords_fr = '["à court de"]'::jsonb,
  keywords_pt = '["fiquei sem"]'::jsonb
WHERE sort_order = 62;

UPDATE sentences SET
  text_es = 'Te **voy a buscar** al aeropuerto.',
  text_fr = 'Je viendrai te **chercher** à l''aéroport.',
  text_pt = 'Vou te **buscar** no aeroporto.',
  keywords_es = '["voy a buscar"]'::jsonb,
  keywords_fr = '["chercher"]'::jsonb,
  keywords_pt = '["buscar"]'::jsonb
WHERE sort_order = 63;

UPDATE sentences SET
  text_es = 'Estoy muy **emocionado por** estas vacaciones.',
  text_fr = 'J''ai vraiment **hâte** de ces vacances.',
  text_pt = 'Estou muito **ansioso para** essas férias.',
  keywords_es = '["emocionado por"]'::jsonb,
  keywords_fr = '["hâte"]'::jsonb,
  keywords_pt = '["ansioso para"]'::jsonb
WHERE sort_order = 64;

UPDATE sentences SET
  text_es = 'Me **topé con** un artículo interesante en internet.',
  text_fr = 'Je suis **tombé sur** un article intéressant en ligne.',
  text_pt = '**Me deparei com** um artigo interessante na internet.',
  keywords_es = '["topé con"]'::jsonb,
  keywords_fr = '["tombé sur"]'::jsonb,
  keywords_pt = '["me deparei com"]'::jsonb
WHERE sort_order = 65;

UPDATE sentences SET
  text_es = 'Mi coche **se averió** en la carretera.',
  text_fr = 'Ma voiture est **tombée en panne** sur la route.',
  text_pt = 'Meu carro **quebrou** na estrada.',
  keywords_es = '["se averió"]'::jsonb,
  keywords_fr = '["tombée en panne"]'::jsonb,
  keywords_pt = '["quebrou"]'::jsonb
WHERE sort_order = 66;

UPDATE sentences SET
  text_es = 'Es difícil **mantenerse al día** con todas las noticias.',
  text_fr = 'Il est difficile de **suivre** toutes les actualités.',
  text_pt = 'É difícil **se atualizar** com todas as notícias.',
  keywords_es = '["mantenerse al día"]'::jsonb,
  keywords_fr = '["suivre"]'::jsonb,
  keywords_pt = '["se atualizar"]'::jsonb
WHERE sort_order = 67;

UPDATE sentences SET
  text_es = '**Busqué** el significado de esta palabra en el diccionario.',
  text_fr = 'J''ai **cherché** le sens de ce mot dans le dictionnaire.',
  text_pt = '**Procurei** o significado dessa palavra no dicionário.',
  keywords_es = '["busqué"]'::jsonb,
  keywords_fr = '["cherché"]'::jsonb,
  keywords_pt = '["procurei"]'::jsonb
WHERE sort_order = 68;

UPDATE sentences SET
  text_es = '**Aplazamos** las vacaciones una semana.',
  text_fr = 'On a **repoussé** les vacances d''une semaine.',
  text_pt = '**Adiamos** as férias por uma semana.',
  keywords_es = '["aplazamos"]'::jsonb,
  keywords_fr = '["repoussé"]'::jsonb,
  keywords_pt = '["adiamos"]'::jsonb
WHERE sort_order = 69;

UPDATE sentences SET
  text_es = 'Ella **rechazó** la oferta de trabajo.',
  text_fr = 'Elle a **refusé** l''offre d''emploi.',
  text_pt = 'Ela **recusou** a oferta de emprego.',
  keywords_es = '["rechazó"]'::jsonb,
  keywords_fr = '["refusé"]'::jsonb,
  keywords_pt = '["recusou"]'::jsonb
WHERE sort_order = 70;

UPDATE sentences SET
  text_es = 'Ella ha **pasado por** muchas cosas difíciles en la vida.',
  text_fr = 'Elle a **traversé** beaucoup de choses difficiles dans sa vie.',
  text_pt = 'Ela **passou por** muitas coisas difíceis na vida.',
  keywords_es = '["pasado por"]'::jsonb,
  keywords_fr = '["traversé"]'::jsonb,
  keywords_pt = '["passou por"]'::jsonb
WHERE sort_order = 71;

UPDATE sentences SET
  text_es = 'Planeaba irme a casa pero **terminé** quedándome en el parque.',
  text_fr = 'Je prévoyais de rentrer mais j''ai **fini par** rester dans le parc.',
  text_pt = 'Eu planejava ir pra casa, mas **acabei** ficando no parque.',
  keywords_es = '["terminé"]'::jsonb,
  keywords_fr = '["fini par"]'::jsonb,
  keywords_pt = '["acabei"]'::jsonb
WHERE sort_order = 72;

UPDATE sentences SET
  text_es = 'Es difícil **estar al tanto de** las últimas tendencias.',
  text_fr = 'Il est difficile de **suivre** les dernières tendances.',
  text_pt = 'É difícil **acompanhar** as últimas tendências.',
  keywords_es = '["estar al tanto de"]'::jsonb,
  keywords_fr = '["suivre"]'::jsonb,
  keywords_pt = '["acompanhar"]'::jsonb
WHERE sort_order = 73;

UPDATE sentences SET
  text_es = 'Esta semana estoy **cuidando** a mi hermano pequeño.',
  text_fr = 'Je **garde** mon petit frère cette semaine.',
  text_pt = 'Estou **cuidando** do meu irmão mais novo esta semana.',
  keywords_es = '["cuidando"]'::jsonb,
  keywords_fr = '["garde"]'::jsonb,
  keywords_pt = '["cuidando"]'::jsonb
WHERE sort_order = 74;

UPDATE sentences SET
  text_es = 'Necesitamos **resolver** este problema de alguna manera.',
  text_fr = 'On doit **régler** ce problème d''une façon ou d''une autre.',
  text_pt = 'Precisamos **resolver** esse problema de algum jeito.',
  keywords_es = '["resolver"]'::jsonb,
  keywords_fr = '["régler"]'::jsonb,
  keywords_pt = '["resolver"]'::jsonb
WHERE sort_order = 75;

UPDATE sentences SET
  text_es = 'Me **encontré con** un viejo amigo en el supermercado.',
  text_fr = 'Je suis **tombé sur** un vieil ami au supermarché.',
  text_pt = '**Encontrei por acaso** um velho amigo no supermercado.',
  keywords_es = '["encontré con"]'::jsonb,
  keywords_fr = '["tombé sur"]'::jsonb,
  keywords_pt = '["encontrei por acaso"]'::jsonb
WHERE sort_order = 76;

UPDATE sentences SET
  text_es = 'Al final todo **salió bien**.',
  text_fr = 'Tout s''est **arrangé** à la fin.',
  text_pt = 'No final, tudo **deu certo**.',
  keywords_es = '["salió bien"]'::jsonb,
  keywords_fr = '["arrangé"]'::jsonb,
  keywords_pt = '["deu certo"]'::jsonb
WHERE sort_order = 77;

UPDATE sentences SET
  text_es = 'Estoy intentando **reducir** el azúcar.',
  text_fr = 'J''essaie de **réduire** ma consommation de sucre.',
  text_pt = 'Estou tentando **diminuir** o açúcar.',
  keywords_es = '["reducir"]'::jsonb,
  keywords_fr = '["réduire"]'::jsonb,
  keywords_pt = '["diminuir"]'::jsonb
WHERE sort_order = 78;

UPDATE sentences SET
  text_es = '**Me llevo bien** con mis nuevos compañeros.',
  text_fr = 'Je **m''entends bien** avec mes nouveaux collègues.',
  text_pt = '**Me dou bem** com meus novos colegas.',
  keywords_es = '["me llevo bien"]'::jsonb,
  keywords_fr = '["m''entends bien"]'::jsonb,
  keywords_pt = '["me dou bem"]'::jsonb
WHERE sort_order = 79;

UPDATE sentences SET
  text_es = 'Que llegara tan tarde realmente me **decepcionó**.',
  text_fr = 'Qu''il arrive si tard m''a vraiment **déçu**.',
  text_pt = 'Ele chegar tão tarde realmente me **decepcionou**.',
  keywords_es = '["decepcionó"]'::jsonb,
  keywords_fr = '["déçu"]'::jsonb,
  keywords_pt = '["decepcionou"]'::jsonb
WHERE sort_order = 80;

UPDATE sentences SET
  text_es = 'Me llevó tiempo **acostumbrarme** al clima de esta ciudad.',
  text_fr = 'Il m''a fallu du temps pour **m''habituer** au climat de cette ville.',
  text_pt = 'Levei um tempo para **me acostumar** com o clima desta cidade.',
  keywords_es = '["acostumbrarme"]'::jsonb,
  keywords_fr = '["m''habituer"]'::jsonb,
  keywords_pt = '["me acostumar"]'::jsonb
WHERE sort_order = 81;

UPDATE sentences SET
  text_es = 'Ya no puedo **aguantar** tanto ruido.',
  text_fr = 'Je ne peux plus **supporter** autant de bruit.',
  text_pt = 'Não consigo mais **aguentar** tanto barulho.',
  keywords_es = '["aguantar"]'::jsonb,
  keywords_fr = '["supporter"]'::jsonb,
  keywords_pt = '["aguentar"]'::jsonb
WHERE sort_order = 82;

UPDATE sentences SET
  text_es = 'Esta app **despegó** de la noche a la mañana.',
  text_fr = 'Cette appli a **décollé** du jour au lendemain.',
  text_pt = 'Esse app **decolou** da noite para o dia.',
  keywords_es = '["despegó"]'::jsonb,
  keywords_fr = '["décollé"]'::jsonb,
  keywords_pt = '["decolou"]'::jsonb
WHERE sort_order = 83;

UPDATE sentences SET
  text_es = '**Ten cuidado con** las carreteras heladas en el camino.',
  text_fr = '**Fais attention aux** routes verglacées sur le chemin.',
  text_pt = '**Fique atento às** estradas com gelo no caminho.',
  keywords_es = '["ten cuidado con"]'::jsonb,
  keywords_fr = '["fais attention aux"]'::jsonb,
  keywords_pt = '["fique atento às"]'::jsonb
WHERE sort_order = 84;

UPDATE sentences SET
  text_es = 'Creo que **inventaste** esta historia.',
  text_fr = 'Je pense que tu as **inventé** cette histoire.',
  text_pt = 'Acho que você **inventou** essa história.',
  keywords_es = '["inventaste"]'::jsonb,
  keywords_fr = '["inventé"]'::jsonb,
  keywords_pt = '["inventou"]'::jsonb
WHERE sort_order = 85;

UPDATE sentences SET
  text_es = 'Se **desmayó** de agotamiento durante la presentación.',
  text_fr = 'Il s''est **évanoui** d''épuisement pendant la présentation.',
  text_pt = 'Ele **desmaiou** de exaustão durante a apresentação.',
  keywords_es = '["desmayó"]'::jsonb,
  keywords_fr = '["évanoui"]'::jsonb,
  keywords_pt = '["desmaiou"]'::jsonb
WHERE sort_order = 86;

UPDATE sentences SET
  text_es = 'Un invitado inesperado **apareció**.',
  text_fr = 'Un invité inattendu **s''est pointé**.',
  text_pt = 'Um convidado inesperado **apareceu**.',
  keywords_es = '["apareció"]'::jsonb,
  keywords_fr = '["s''est pointé"]'::jsonb,
  keywords_pt = '["apareceu"]'::jsonb
WHERE sort_order = 87;

UPDATE sentences SET
  text_es = '**Reprimió** sus emociones y no dijo nada.',
  text_fr = 'Il a **retenu** ses émotions et n''a rien dit.',
  text_pt = 'Ele **conteve** as emoções e não disse nada.',
  keywords_es = '["reprimió"]'::jsonb,
  keywords_fr = '["retenu"]'::jsonb,
  keywords_pt = '["conteve"]'::jsonb
WHERE sort_order = 88;

UPDATE sentences SET
  text_es = 'A pesar de las dificultades, debemos **seguir adelante**.',
  text_fr = 'Malgré les difficultés, nous devons **continuer**.',
  text_pt = 'Apesar das dificuldades, precisamos **seguir em frente**.',
  keywords_es = '["seguir adelante"]'::jsonb,
  keywords_fr = '["continuer"]'::jsonb,
  keywords_pt = '["seguir em frente"]'::jsonb
WHERE sort_order = 89;

UPDATE sentences SET
  text_es = 'Bajo presión todo empezó a **desmoronarse**.',
  text_fr = 'Sous la pression, tout a commencé à **s''effondrer**.',
  text_pt = 'Sob pressão tudo começou a **desmoronar**.',
  keywords_es = '["desmoronarse"]'::jsonb,
  keywords_fr = '["s''effondrer"]'::jsonb,
  keywords_pt = '["desmoronar"]'::jsonb
WHERE sort_order = 90;
