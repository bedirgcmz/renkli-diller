-- 011_translate_sentences_es_fr_pt_part3.sql
-- ES / FR / PT translations for categories 8-9 (sort_order 301-360)
-- Category 10 (Social & Modern) has no seed file and therefore no rows to translate.

-- ─── CATEGORY 8 — Technology (sort_order 301-330) ────────────────────────────

UPDATE sentences SET
  text_es = '**Inicia sesión** en tu cuenta.',
  text_fr = '**Connecte-toi** à ton compte.',
  text_pt = '**Faça login** na sua conta.',
  keywords_es = '["inicia sesión"]'::jsonb,
  keywords_fr = '["connecte-toi"]'::jsonb,
  keywords_pt = '["faça login"]'::jsonb
WHERE sort_order = 301;

UPDATE sentences SET
  text_es = '**Regístrate** para crear una cuenta nueva.',
  text_fr = '**Inscris-toi** pour créer un compte.',
  text_pt = '**Cadastre-se** para uma nova conta.',
  keywords_es = '["regístrate"]'::jsonb,
  keywords_fr = '["inscris-toi"]'::jsonb,
  keywords_pt = '["cadastre-se"]'::jsonb
WHERE sort_order = 302;

UPDATE sentences SET
  text_es = '**Haz una copia de seguridad** de tus archivos regularmente.',
  text_fr = '**Sauvegarde** tes fichiers régulièrement.',
  text_pt = '**Faça backup** dos seus arquivos regularmente.',
  keywords_es = '["copia de seguridad"]'::jsonb,
  keywords_fr = '["sauvegarde"]'::jsonb,
  keywords_pt = '["backup"]'::jsonb
WHERE sort_order = 303;

UPDATE sentences SET
  text_es = '**Cierra sesión** cuando termines.',
  text_fr = '**Déconnecte-toi** quand tu as fini.',
  text_pt = '**Faça logout** quando terminar.',
  keywords_es = '["cierra sesión"]'::jsonb,
  keywords_fr = '["déconnecte-toi"]'::jsonb,
  keywords_pt = '["logout"]'::jsonb
WHERE sort_order = 304;

UPDATE sentences SET
  text_es = '**Conecta** el cargador.',
  text_fr = '**Branche** le chargeur.',
  text_pt = '**Conecte** o carregador.',
  keywords_es = '["conecta"]'::jsonb,
  keywords_fr = '["branche"]'::jsonb,
  keywords_pt = '["conecte"]'::jsonb
WHERE sort_order = 305;

UPDATE sentences SET
  text_es = '**Descarga** la aplicación de la App Store.',
  text_fr = '**Télécharge** l''appli depuis l''App Store.',
  text_pt = '**Baixe** o aplicativo da App Store.',
  keywords_es = '["descarga"]'::jsonb,
  keywords_fr = '["télécharge"]'::jsonb,
  keywords_pt = '["baixe"]'::jsonb
WHERE sort_order = 306;

UPDATE sentences SET
  text_es = '**Sube** la foto a la nube.',
  text_fr = '**Envoie** la photo sur le cloud.',
  text_pt = '**Envie** a foto para a nuvem.',
  keywords_es = '["sube"]'::jsonb,
  keywords_fr = '["envoie"]'::jsonb,
  keywords_pt = '["envie"]'::jsonb
WHERE sort_order = 307;

UPDATE sentences SET
  text_es = '**Comparte** esa publicación con tu amigo.',
  text_fr = '**Partage** cette publication avec ton ami.',
  text_pt = '**Compartilhe** essa publicação com seu amigo.',
  keywords_es = '["comparte"]'::jsonb,
  keywords_fr = '["partage"]'::jsonb,
  keywords_pt = '["compartilhe"]'::jsonb
WHERE sort_order = 308;

UPDATE sentences SET
  text_es = '**Desplázate** hacia abajo en el feed.',
  text_fr = '**Fais défiler** le fil d''actualité.',
  text_pt = '**Role** o feed para baixo.',
  keywords_es = '["desplázate"]'::jsonb,
  keywords_fr = '["fais défiler"]'::jsonb,
  keywords_pt = '["role"]'::jsonb
WHERE sort_order = 309;

UPDATE sentences SET
  text_es = '**Toca** la notificación para leerla.',
  text_fr = '**Appuie sur** la notification pour la lire.',
  text_pt = '**Toque** na notificação para lê-la.',
  keywords_es = '["toca"]'::jsonb,
  keywords_fr = '["appuie sur"]'::jsonb,
  keywords_pt = '["toque"]'::jsonb
WHERE sort_order = 310;

UPDATE sentences SET
  text_es = 'Ese vídeo se **hizo viral** de la noche a la mañana.',
  text_fr = 'Cette vidéo est **devenue virale** du jour au lendemain.',
  text_pt = 'Esse vídeo **viralizou** da noite para o dia.',
  keywords_es = '["hizo viral"]'::jsonb,
  keywords_fr = '["devenue virale"]'::jsonb,
  keywords_pt = '["viralizou"]'::jsonb
WHERE sort_order = 311;

UPDATE sentences SET
  text_es = 'El almacenamiento de mi teléfono está **a punto de agotarse**.',
  text_fr = 'La mémoire de mon téléphone est **sur le point de saturer**.',
  text_pt = 'O armazenamento do meu celular está **prestes a acabar**.',
  keywords_es = '["a punto de agotarse"]'::jsonb,
  keywords_fr = '["sur le point de saturer"]'::jsonb,
  keywords_pt = '["prestes a acabar"]'::jsonb
WHERE sort_order = 312;

UPDATE sentences SET
  text_es = '**Configuré** la nueva impresora en mi ordenador.',
  text_fr = 'J''ai **configuré** la nouvelle imprimante sur mon ordinateur.',
  text_pt = '**Configurei** a nova impressora no meu computador.',
  keywords_es = '["configuré"]'::jsonb,
  keywords_fr = '["configuré"]'::jsonb,
  keywords_pt = '["configurei"]'::jsonb
WHERE sort_order = 313;

UPDATE sentences SET
  text_es = '**Actualiza** la aplicación para solucionar problemas de seguridad.',
  text_fr = '**Mets à jour** l''appli pour corriger les failles de sécurité.',
  text_pt = '**Atualize** o aplicativo para corrigir problemas de segurança.',
  keywords_es = '["actualiza"]'::jsonb,
  keywords_fr = '["mets à jour"]'::jsonb,
  keywords_pt = '["atualize"]'::jsonb
WHERE sort_order = 314;

UPDATE sentences SET
  text_es = 'Me **cambié al** iPhone desde Android.',
  text_fr = 'J''ai **basculé vers** l''iPhone depuis Android.',
  text_pt = '**Mudei para** o iPhone saindo do Android.',
  keywords_es = '["cambié al"]'::jsonb,
  keywords_fr = '["basculé vers"]'::jsonb,
  keywords_pt = '["mudei para"]'::jsonb
WHERE sort_order = 315;

UPDATE sentences SET
  text_es = '**Sincroniza** tu calendario con el teléfono.',
  text_fr = '**Synchronise** ton agenda avec ton téléphone.',
  text_pt = '**Sincronize** seu calendário com o celular.',
  keywords_es = '["sincroniza"]'::jsonb,
  keywords_fr = '["synchronise"]'::jsonb,
  keywords_pt = '["sincronize"]'::jsonb
WHERE sort_order = 316;

UPDATE sentences SET
  text_es = 'La aplicación sigue **fallando**, necesito reinstalarla.',
  text_fr = 'L''appli **plante** sans arrêt, je dois la réinstaller.',
  text_pt = 'O aplicativo fica **travando**, preciso reinstalá-lo.',
  keywords_es = '["fallando"]'::jsonb,
  keywords_fr = '["plante"]'::jsonb,
  keywords_pt = '["travando"]'::jsonb
WHERE sort_order = 317;

UPDATE sentences SET
  text_es = 'Activa la **autenticación de dos factores** para proteger tu cuenta.',
  text_fr = 'Active la **double authentification** pour protéger ton compte.',
  text_pt = 'Ative a **autenticação de dois fatores** para proteger sua conta.',
  keywords_es = '["autenticación de dos factores"]'::jsonb,
  keywords_fr = '["double authentification"]'::jsonb,
  keywords_pt = '["autenticação de dois fatores"]'::jsonb
WHERE sort_order = 318;

UPDATE sentences SET
  text_es = '**Conecta** el dispositivo a la red Wi-Fi.',
  text_fr = '**Connecte** l''appareil au réseau Wi-Fi.',
  text_pt = '**Conecte** o dispositivo à rede Wi-Fi.',
  keywords_es = '["conecta"]'::jsonb,
  keywords_fr = '["connecte"]'::jsonb,
  keywords_pt = '["conecte"]'::jsonb
WHERE sort_order = 319;

UPDATE sentences SET
  text_es = 'Tu contraseña **debe** tener al menos 8 caracteres.',
  text_fr = 'Ton mot de passe **doit** avoir au moins 8 caractères.',
  text_pt = 'Sua senha **precisa** ter pelo menos 8 caracteres.',
  keywords_es = '["debe"]'::jsonb,
  keywords_fr = '["doit"]'::jsonb,
  keywords_pt = '["precisa"]'::jsonb
WHERE sort_order = 320;

UPDATE sentences SET
  text_es = 'Me di cuenta de que el sistema **fue hackeado**.',
  text_fr = 'J''ai remarqué que le système **s''est fait pirater**.',
  text_pt = 'Percebi que o sistema **foi hackeado**.',
  keywords_es = '["fue hackeado"]'::jsonb,
  keywords_fr = '["s''est fait pirater"]'::jsonb,
  keywords_pt = '["foi hackeado"]'::jsonb
WHERE sort_order = 321;

UPDATE sentences SET
  text_es = 'No hagas clic en enlaces de correo falsos — podría ser un **ataque de phishing**.',
  text_fr = 'Ne clique pas sur les faux liens d''e-mails — ça pourrait être une **attaque de phishing**.',
  text_pt = 'Não clique em links de e-mail falsos — pode ser um **ataque de phishing**.',
  keywords_es = '["ataque de phishing"]'::jsonb,
  keywords_fr = '["attaque de phishing"]'::jsonb,
  keywords_pt = '["ataque de phishing"]'::jsonb
WHERE sort_order = 322;

UPDATE sentences SET
  text_es = '**Desbloqueé** esa cuenta y pude seguirla de nuevo.',
  text_fr = 'J''ai **débloqué** ce compte et j''ai pu le suivre à nouveau.',
  text_pt = '**Desbloqueei** essa conta e pude seguir novamente.',
  keywords_es = '["desbloqueé"]'::jsonb,
  keywords_fr = '["débloqué"]'::jsonb,
  keywords_pt = '["desbloqueei"]'::jsonb
WHERE sort_order = 323;

UPDATE sentences SET
  text_es = 'Los mensajes son seguros porque están **cifrados de extremo a extremo**.',
  text_fr = 'Les messages sont sécurisés car ils sont **chiffrés de bout en bout**.',
  text_pt = 'As mensagens são seguras porque estão **criptografadas de ponta a ponta**.',
  keywords_es = '["cifrados de extremo a extremo"]'::jsonb,
  keywords_fr = '["chiffrés de bout en bout"]'::jsonb,
  keywords_pt = '["criptografadas de ponta a ponta"]'::jsonb
WHERE sort_order = 324;

UPDATE sentences SET
  text_es = 'Guardo todos mis documentos en la **nube**.',
  text_fr = 'Je conserve tous mes documents dans le **cloud**.',
  text_pt = 'Guardo todos os meus documentos no **armazenamento em nuvem**.',
  keywords_es = '["nube"]'::jsonb,
  keywords_fr = '["cloud"]'::jsonb,
  keywords_pt = '["armazenamento em nuvem"]'::jsonb
WHERE sort_order = 325;

UPDATE sentences SET
  text_es = 'El **algoritmo** de redes sociales recomienda contenido según tus intereses.',
  text_fr = 'L''**algorithme** des réseaux sociaux recommande du contenu selon tes intérêts.',
  text_pt = 'O **algoritmo** das redes sociais recomenda conteúdo com base nos seus interesses.',
  keywords_es = '["algoritmo"]'::jsonb,
  keywords_fr = '["algorithme"]'::jsonb,
  keywords_pt = '["algoritmo"]'::jsonb
WHERE sort_order = 326;

UPDATE sentences SET
  text_es = 'La conexión es lenta porque el **ancho de banda** es limitado.',
  text_fr = 'La connexion est lente car la **bande passante** est limitée.',
  text_pt = 'A conexão está lenta porque a **largura de banda** é limitada.',
  keywords_es = '["ancho de banda"]'::jsonb,
  keywords_fr = '["bande passante"]'::jsonb,
  keywords_pt = '["largura de banda"]'::jsonb
WHERE sort_order = 327;

UPDATE sentences SET
  text_es = 'Estoy intentando **diagnosticar** el sistema para encontrar la causa.',
  text_fr = 'J''essaie de **dépanner** le système pour trouver la cause.',
  text_pt = 'Estou tentando **solucionar** o problema do sistema para encontrar a causa.',
  keywords_es = '["diagnosticar"]'::jsonb,
  keywords_fr = '["dépanner"]'::jsonb,
  keywords_pt = '["solucionar"]'::jsonb
WHERE sort_order = 328;

UPDATE sentences SET
  text_es = 'Es importante establecer un límite de **tiempo de pantalla** para los niños.',
  text_fr = 'Il est important de fixer une limite de **temps d''écran** pour les enfants.',
  text_pt = 'É importante definir um limite de **tempo de tela** para as crianças.',
  keywords_es = '["tiempo de pantalla"]'::jsonb,
  keywords_fr = '["temps d''écran"]'::jsonb,
  keywords_pt = '["tempo de tela"]'::jsonb
WHERE sort_order = 329;

UPDATE sentences SET
  text_es = 'Decidí hacer un **detox digital** durante una semana para despejar la mente.',
  text_fr = 'J''ai décidé de faire un **détox numérique** pendant une semaine pour me vider la tête.',
  text_pt = 'Decidi fazer um **detox digital** por uma semana para clarear a cabeça.',
  keywords_es = '["detox digital"]'::jsonb,
  keywords_fr = '["détox numérique"]'::jsonb,
  keywords_pt = '["detox digital"]'::jsonb
WHERE sort_order = 330;

-- ─── CATEGORY 9 — Health (sort_order 331-360) ────────────────────────────────

UPDATE sentences SET
  text_es = 'Hoy **no me encuentro bien**.',
  text_fr = 'Je me sens **patraque** aujourd''hui.',
  text_pt = 'Hoje estou **indisposto**.',
  keywords_es = '["no me encuentro bien"]'::jsonb,
  keywords_fr = '["patraque"]'::jsonb,
  keywords_pt = '["indisposto"]'::jsonb
WHERE sort_order = 331;

UPDATE sentences SET
  text_es = 'La semana pasada **cogí un resfriado**.',
  text_fr = 'La semaine dernière j''ai **attrapé un rhume**.',
  text_pt = 'Semana passada **peguei um resfriado**.',
  keywords_es = '["cogí un resfriado"]'::jsonb,
  keywords_fr = '["attrapé un rhume"]'::jsonb,
  keywords_pt = '["peguei um resfriado"]'::jsonb
WHERE sort_order = 332;

UPDATE sentences SET
  text_es = 'Llevo todo el día con **dolor de cabeza**.',
  text_fr = 'J''ai **mal à la tête** toute la journée.',
  text_pt = 'Estou com **dor de cabeça** o dia todo.',
  keywords_es = '["dolor de cabeza"]'::jsonb,
  keywords_fr = '["mal à la tête"]'::jsonb,
  keywords_pt = '["dor de cabeça"]'::jsonb
WHERE sort_order = 333;

UPDATE sentences SET
  text_es = 'Según el médico, tengo una **fiebre** leve.',
  text_fr = 'Selon le médecin, j''ai une légère **fièvre**.',
  text_pt = 'Segundo o médico, estou com uma **febre** leve.',
  keywords_es = '["fiebre"]'::jsonb,
  keywords_fr = '["fièvre"]'::jsonb,
  keywords_pt = '["febre"]'::jsonb
WHERE sort_order = 334;

UPDATE sentences SET
  text_es = 'Deberías **ir al médico** de inmediato.',
  text_fr = 'Tu devrais **consulter un médecin** tout de suite.',
  text_pt = 'Você deveria **consultar um médico** imediatamente.',
  keywords_es = '["ir al médico"]'::jsonb,
  keywords_fr = '["consulter un médecin"]'::jsonb,
  keywords_pt = '["consultar um médico"]'::jsonb
WHERE sort_order = 335;

UPDATE sentences SET
  text_es = 'Espero que te **mejores** en unos días.',
  text_fr = 'J''espère que tu **iras mieux** dans quelques jours.',
  text_pt = 'Espero que você **melhore** em alguns dias.',
  keywords_es = '["mejores"]'::jsonb,
  keywords_fr = '["iras mieux"]'::jsonb,
  keywords_pt = '["melhore"]'::jsonb
WHERE sort_order = 336;

UPDATE sentences SET
  text_es = '**Cuídate** y mejórate pronto.',
  text_fr = '**Prends soin de toi** et rétablis-toi vite.',
  text_pt = '**Cuide-se** e melhore logo.',
  keywords_es = '["cuídate"]'::jsonb,
  keywords_fr = '["prends soin de toi"]'::jsonb,
  keywords_pt = '["cuide-se"]'::jsonb
WHERE sort_order = 337;

UPDATE sentences SET
  text_es = 'Me **mareo** cuando me levanto.',
  text_fr = 'J''ai le **vertige** quand je me lève.',
  text_pt = '**Fico tonto** quando me levanto.',
  keywords_es = '["mareo"]'::jsonb,
  keywords_fr = '["vertige"]'::jsonb,
  keywords_pt = '["fico tonto"]'::jsonb
WHERE sort_order = 338;

UPDATE sentences SET
  text_es = 'Tengo **dolor de garganta** y dificultad para tragar.',
  text_fr = 'J''ai **mal à la gorge** et du mal à avaler.',
  text_pt = 'Estou com **dor de garganta** e dificuldade para engolir.',
  keywords_es = '["dolor de garganta"]'::jsonb,
  keywords_fr = '["mal à la gorge"]'::jsonb,
  keywords_pt = '["dor de garganta"]'::jsonb
WHERE sort_order = 339;

UPDATE sentences SET
  text_es = 'Descansa y bebe mucha agua, **te sentirás mejor**.',
  text_fr = 'Repose-toi et bois beaucoup d''eau, tu **te sentiras mieux**.',
  text_pt = 'Descanse e beba bastante água, você vai **se sentir melhor**.',
  keywords_es = '["te sentirás mejor"]'::jsonb,
  keywords_fr = '["te sentiras mieux"]'::jsonb,
  keywords_pt = '["se sentir melhor"]'::jsonb
WHERE sort_order = 340;

UPDATE sentences SET
  text_es = '**Me agarró** la gripe y llevo varios días en cama.',
  text_fr = 'J''ai **attrapé** la grippe et je suis cloué au lit depuis des jours.',
  text_pt = '**Peguei** gripe e estou na cama há dias.',
  keywords_es = '["me agarró"]'::jsonb,
  keywords_fr = '["attrapé"]'::jsonb,
  keywords_pt = '["peguei"]'::jsonb
WHERE sort_order = 341;

UPDATE sentences SET
  text_es = 'Me llevó unas semanas **recuperarme** de la operación.',
  text_fr = 'Il m''a fallu quelques semaines pour **me remettre** de l''opération.',
  text_pt = 'Levei algumas semanas para **me recuperar** da cirurgia.',
  keywords_es = '["recuperarme"]'::jsonb,
  keywords_fr = '["me remettre"]'::jsonb,
  keywords_pt = '["me recuperar"]'::jsonb
WHERE sort_order = 342;

UPDATE sentences SET
  text_es = 'Tardé seis meses en **recuperarme del** accidente.',
  text_fr = 'Il m''a fallu six mois pour **me remettre de** l''accident.',
  text_pt = 'Levei seis meses para **me recuperar do** acidente.',
  keywords_es = '["recuperarme del"]'::jsonb,
  keywords_fr = '["me remettre de"]'::jsonb,
  keywords_pt = '["me recuperar do"]'::jsonb
WHERE sort_order = 343;

UPDATE sentences SET
  text_es = '**Soy alérgico a** los frutos secos y no puedo comerlos.',
  text_fr = 'Je **suis allergique aux** noix et je ne peux pas les manger.',
  text_pt = '**Sou alérgico a** nozes e não consigo comê-las.',
  keywords_es = '["soy alérgico a"]'::jsonb,
  keywords_fr = '["suis allergique aux"]'::jsonb,
  keywords_pt = '["sou alérgico a"]'::jsonb
WHERE sort_order = 344;

UPDATE sentences SET
  text_es = 'El mes pasado hice mi **revisión** anual.',
  text_fr = 'J''ai eu mon **bilan de santé** annuel le mois dernier.',
  text_pt = 'Fiz meu **check-up** anual no mês passado.',
  keywords_es = '["revisión"]'::jsonb,
  keywords_fr = '["bilan de santé"]'::jsonb,
  keywords_pt = '["check-up"]'::jsonb
WHERE sort_order = 345;

UPDATE sentences SET
  text_es = 'Necesito **reducir** el azúcar para estar más sano.',
  text_fr = 'Je dois **réduire** ma consommation de sucre pour être en meilleure santé.',
  text_pt = 'Preciso **reduzir** o açúcar para ser mais saudável.',
  keywords_es = '["reducir"]'::jsonb,
  keywords_fr = '["réduire"]'::jsonb,
  keywords_pt = '["reduzir"]'::jsonb
WHERE sort_order = 346;

UPDATE sentences SET
  text_es = 'Me **mantengo en forma** haciendo ejercicio al menos tres veces por semana.',
  text_fr = 'Je **reste en forme** en faisant du sport au moins trois fois par semaine.',
  text_pt = '**Fico em forma** praticando exercícios pelo menos três vezes por semana.',
  keywords_es = '["mantengo en forma"]'::jsonb,
  keywords_fr = '["reste en forme"]'::jsonb,
  keywords_pt = '["fico em forma"]'::jsonb
WHERE sort_order = 347;

UPDATE sentences SET
  text_es = 'Intento **mantenerme en forma** caminando regularmente.',
  text_fr = 'J''essaie de **rester en forme** en marchant régulièrement.',
  text_pt = 'Tento **manter a forma** caminhando regularmente.',
  keywords_es = '["mantenerme en forma"]'::jsonb,
  keywords_fr = '["rester en forme"]'::jsonb,
  keywords_pt = '["manter a forma"]'::jsonb
WHERE sort_order = 348;

UPDATE sentences SET
  text_es = '**Hago una dieta** baja en carbohidratos para perder peso.',
  text_fr = 'Je **suis un régime** pauvre en glucides pour maigrir.',
  text_pt = '**Sigo uma dieta** pobre em carboidratos para perder peso.',
  keywords_es = '["hago una dieta"]'::jsonb,
  keywords_fr = '["suis un régime"]'::jsonb,
  keywords_pt = '["sigo uma dieta"]'::jsonb
WHERE sort_order = 349;

UPDATE sentences SET
  text_es = '**Dejé de fumar** por mi salud.',
  text_fr = 'J''ai **arrêté de fumer** pour ma santé.',
  text_pt = '**Larguei o cigarro** pela minha saúde.',
  keywords_es = '["dejé de fumar"]'::jsonb,
  keywords_fr = '["arrêté de fumer"]'::jsonb,
  keywords_pt = '["larguei o cigarro"]'::jsonb
WHERE sort_order = 350;

UPDATE sentences SET
  text_es = 'Este medicamento puede tener algunos **efectos secundarios**, ten cuidado.',
  text_fr = 'Ce médicament peut avoir des **effets secondaires**, fais attention.',
  text_pt = 'Este medicamento pode ter alguns **efeitos colaterais**, tome cuidado.',
  keywords_es = '["efectos secundarios"]'::jsonb,
  keywords_fr = '["effets secondaires"]'::jsonb,
  keywords_pt = '["efeitos colaterais"]'::jsonb
WHERE sort_order = 351;

UPDATE sentences SET
  text_es = 'El médico me **recetó** analgésicos.',
  text_fr = 'Le médecin m''a **prescrit** des analgésiques.',
  text_pt = 'O médico me **receitou** analgésicos.',
  keywords_es = '["recetó"]'::jsonb,
  keywords_fr = '["prescrit"]'::jsonb,
  keywords_pt = '["receitou"]'::jsonb
WHERE sort_order = 352;

UPDATE sentences SET
  text_es = 'Necesita **operarse** para solucionar el problema de la rodilla.',
  text_fr = 'Il doit **passer sur le billard** pour régler le problème de genou.',
  text_pt = 'Ele precisa **passar por uma cirurgia** para resolver o problema no joelho.',
  keywords_es = '["operarse"]'::jsonb,
  keywords_fr = '["passer sur le billard"]'::jsonb,
  keywords_pt = '["passar por uma cirurgia"]'::jsonb
WHERE sort_order = 353;

UPDATE sentences SET
  text_es = 'Estaba mejorando pero luego tuvo una **recaída**.',
  text_fr = 'Il allait mieux mais a ensuite eu une **rechute**.',
  text_pt = 'Ele estava melhorando, mas depois teve uma **recaída**.',
  keywords_es = '["recaída"]'::jsonb,
  keywords_fr = '["rechute"]'::jsonb,
  keywords_pt = '["recaída"]'::jsonb
WHERE sort_order = 354;

UPDATE sentences SET
  text_es = 'Los **cuidados preventivos** ayudan a detectar enfermedades de forma temprana.',
  text_fr = 'La **médecine préventive** aide à détecter les maladies tôt.',
  text_pt = 'Os **cuidados preventivos** ajudam a detectar doenças precocemente.',
  keywords_es = '["cuidados preventivos"]'::jsonb,
  keywords_fr = '["médecine préventive"]'::jsonb,
  keywords_pt = '["cuidados preventivos"]'::jsonb
WHERE sort_order = 355;

UPDATE sentences SET
  text_es = 'La **salud mental** es tan importante como la salud física.',
  text_fr = 'La **santé mentale** est tout aussi importante que la santé physique.',
  text_pt = 'A **saúde mental** é tão importante quanto a saúde física.',
  keywords_es = '["salud mental"]'::jsonb,
  keywords_fr = '["santé mentale"]'::jsonb,
  keywords_pt = '["saúde mental"]'::jsonb
WHERE sort_order = 356;

UPDATE sentences SET
  text_es = 'El sueño regular fortalece el **sistema inmunológico**.',
  text_fr = 'Le sommeil régulier renforce le **système immunitaire**.',
  text_pt = 'O sono regular fortalece o **sistema imunológico**.',
  keywords_es = '["sistema inmunológico"]'::jsonb,
  keywords_fr = '["système immunitaire"]'::jsonb,
  keywords_pt = '["sistema imunológico"]'::jsonb
WHERE sort_order = 357;

UPDATE sentences SET
  text_es = 'Las **enfermedades crónicas** como la diabetes requieren un tratamiento continuo.',
  text_fr = 'Les **maladies chroniques** comme le diabète nécessitent un traitement continu.',
  text_pt = '**Condições crônicas** como o diabetes requerem tratamento contínuo.',
  keywords_es = '["enfermedades crónicas"]'::jsonb,
  keywords_fr = '["maladies chroniques"]'::jsonb,
  keywords_pt = '["condições crônicas"]'::jsonb
WHERE sort_order = 358;

UPDATE sentences SET
  text_es = 'Después de trabajar demasiado me encontré completamente **quemado**.',
  text_fr = 'À force de trop travailler, je me suis retrouvé complètement **épuisé**.',
  text_pt = 'Depois de trabalhar demais, me encontrei completamente **esgotado**.',
  keywords_es = '["quemado"]'::jsonb,
  keywords_fr = '["épuisé"]'::jsonb,
  keywords_pt = '["esgotado"]'::jsonb
WHERE sort_order = 359;

UPDATE sentences SET
  text_es = 'Consulté a otro médico para una **segunda opinión**.',
  text_fr = 'J''ai consulté un autre médecin pour avoir un **deuxième avis**.',
  text_pt = 'Consultei outro médico para obter uma **segunda opinião**.',
  keywords_es = '["segunda opinión"]'::jsonb,
  keywords_fr = '["deuxième avis"]'::jsonb,
  keywords_pt = '["segunda opinião"]'::jsonb
WHERE sort_order = 360;
