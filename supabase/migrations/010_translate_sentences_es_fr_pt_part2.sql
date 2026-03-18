-- 010_translate_sentences_es_fr_pt_part2.sql
-- ES / FR / PT translations for categories 4-7 (sort_order 91-120, 121-150, 151-180, 271-300)

-- ─── CATEGORY 4 — Travel (sort_order 91-120) ─────────────────────────────────

UPDATE sentences SET
  text_es = '¿A qué hora puedo hacer el **check-in** en el hotel?',
  text_fr = 'À quelle heure puis-je **m''enregistrer** à l''hôtel ?',
  text_pt = 'A que horas posso fazer o **check-in** no hotel?',
  keywords_es = '["check-in"]'::jsonb,
  keywords_fr = '["m''enregistrer"]'::jsonb,
  keywords_pt = '["check-in"]'::jsonb
WHERE sort_order = 91;

UPDATE sentences SET
  text_es = 'El horario de **salida** es al mediodía.',
  text_fr = 'L''heure du **départ** est midi.',
  text_pt = 'O horário de **check-out** é ao meio-dia.',
  keywords_es = '["salida"]'::jsonb,
  keywords_fr = '["départ"]'::jsonb,
  keywords_pt = '["check-out"]'::jsonb
WHERE sort_order = 92;

UPDATE sentences SET
  text_es = '¿**Cuánto tiempo lleva** llegar allí?',
  text_fr = '**Combien de temps faut-il** pour y arriver ?',
  text_pt = '**Quanto tempo leva** para chegar lá?',
  keywords_es = '["cuánto tiempo lleva"]'::jsonb,
  keywords_fr = '["combien de temps faut-il"]'::jsonb,
  keywords_pt = '["quanto tempo leva"]'::jsonb
WHERE sort_order = 93;

UPDATE sentences SET
  text_es = '¿**Está lejos de aquí**?',
  text_fr = '**Est-ce loin d''ici** ?',
  text_pt = '**Fica longe daqui**?',
  keywords_es = '["está lejos de aquí"]'::jsonb,
  keywords_fr = '["est-ce loin d''ici"]'::jsonb,
  keywords_pt = '["fica longe daqui"]'::jsonb
WHERE sort_order = 94;

UPDATE sentences SET
  text_es = 'Por favor **asegúrate** de no perder tu pasaporte.',
  text_fr = 'Veille à **t''assurer** de ne pas perdre ton passeport.',
  text_pt = 'Por favor **certifique-se** de não perder seu passaporte.',
  keywords_es = '["asegúrate"]'::jsonb,
  keywords_fr = '["t''assurer"]'::jsonb,
  keywords_pt = '["certifique-se"]'::jsonb
WHERE sort_order = 95;

UPDATE sentences SET
  text_es = 'Comprar el billete **con antelación** es más barato.',
  text_fr = 'Acheter le billet **à l''avance** est moins cher.',
  text_pt = 'Comprar o bilhete **com antecedência** é mais barato.',
  keywords_es = '["con antelación"]'::jsonb,
  keywords_fr = '["à l''avance"]'::jsonb,
  keywords_pt = '["com antecedência"]'::jsonb
WHERE sort_order = 96;

UPDATE sentences SET
  text_es = '¿Cómo puedo **desplazarme** por la ciudad?',
  text_fr = 'Comment puis-je **me déplacer** dans la ville ?',
  text_pt = 'Como posso **me locomover** pela cidade?',
  keywords_es = '["desplazarme"]'::jsonb,
  keywords_fr = '["me déplacer"]'::jsonb,
  keywords_pt = '["me locomover"]'::jsonb
WHERE sort_order = 97;

UPDATE sentences SET
  text_es = 'No hay problema **mientras** tengas visado.',
  text_fr = 'Il n''y a pas de problème **tant que** tu as un visa.',
  text_pt = 'Não há problema **desde que** você tenha visto.',
  keywords_es = '["mientras"]'::jsonb,
  keywords_fr = '["tant que"]'::jsonb,
  keywords_pt = '["desde que"]'::jsonb
WHERE sort_order = 98;

UPDATE sentences SET
  text_es = '¿**Me podría dar** una habitación doble, por favor?',
  text_fr = '**Puis-je avoir** une chambre double, s''il vous plaît ?',
  text_pt = '**Poderia me dar** um quarto duplo, por favor?',
  keywords_es = '["me podría dar"]'::jsonb,
  keywords_fr = '["puis-je avoir"]'::jsonb,
  keywords_pt = '["poderia me dar"]'::jsonb
WHERE sort_order = 99;

UPDATE sentences SET
  text_es = '¿Hay algún buen restaurante cerca, **por casualidad**?',
  text_fr = 'Y a-t-il un bon restaurant à proximité, **par hasard** ?',
  text_pt = 'Há algum bom restaurante por aqui, **por acaso**?',
  keywords_es = '["por casualidad"]'::jsonb,
  keywords_fr = '["par hasard"]'::jsonb,
  keywords_pt = '["por acaso"]'::jsonb
WHERE sort_order = 100;

UPDATE sentences SET
  text_es = 'Estoy **buscando** el centro histórico, ¿puede ayudarme?',
  text_fr = 'Je **cherche** le centre historique, pouvez-vous m''aider ?',
  text_pt = 'Estou **procurando** o centro histórico, pode me ajudar?',
  keywords_es = '["buscando"]'::jsonb,
  keywords_fr = '["cherche"]'::jsonb,
  keywords_pt = '["procurando"]'::jsonb
WHERE sort_order = 101;

UPDATE sentences SET
  text_es = '¿**Vale la pena** visitar este museo?',
  text_fr = 'Ce musée **vaut-il le coup** ?',
  text_pt = 'Este museu **vale a pena**?',
  keywords_es = '["vale la pena"]'::jsonb,
  keywords_fr = '["vaut le coup"]'::jsonb,
  keywords_pt = '["vale a pena"]'::jsonb
WHERE sort_order = 102;

UPDATE sentences SET
  text_es = 'Por favor, **infórmame** sobre mi reserva.',
  text_fr = 'Veuillez **me tenir au courant** de ma réservation.',
  text_pt = 'Por favor, **me avise** sobre a minha reserva.',
  keywords_es = '["infórmame"]'::jsonb,
  keywords_fr = '["me tenir au courant"]'::jsonb,
  keywords_pt = '["me avise"]'::jsonb
WHERE sort_order = 103;

UPDATE sentences SET
  text_es = '¿La terminal está **de camino**?',
  text_fr = 'La gare est-elle **sur le chemin** ?',
  text_pt = 'O terminal fica **no caminho**?',
  keywords_es = '["de camino"]'::jsonb,
  keywords_fr = '["sur le chemin"]'::jsonb,
  keywords_pt = '["no caminho"]'::jsonb
WHERE sort_order = 104;

UPDATE sentences SET
  text_es = 'Voy **con retraso** a mi vuelo.',
  text_fr = 'Je suis **en retard** pour mon vol.',
  text_pt = 'Estou **atrasado** para o meu voo.',
  keywords_es = '["con retraso"]'::jsonb,
  keywords_fr = '["en retard"]'::jsonb,
  keywords_pt = '["atrasado"]'::jsonb
WHERE sort_order = 105;

UPDATE sentences SET
  text_es = 'Estoy **listo**, podemos ir.',
  text_fr = 'Je suis **prêt**, on peut y aller.',
  text_pt = 'Estou **pronto**, podemos ir.',
  keywords_es = '["listo"]'::jsonb,
  keywords_fr = '["prêt"]'::jsonb,
  keywords_pt = '["pronto"]'::jsonb
WHERE sort_order = 106;

UPDATE sentences SET
  text_es = '**Salimos** mañana temprano por la mañana.',
  text_fr = 'Nous **partons** tôt demain matin.',
  text_pt = '**Partimos** cedo amanhã de manhã.',
  keywords_es = '["salimos"]'::jsonb,
  keywords_fr = '["partons"]'::jsonb,
  keywords_pt = '["partimos"]'::jsonb
WHERE sort_order = 107;

UPDATE sentences SET
  text_es = '¿Puedes **dejarnos** en el aeropuerto?',
  text_fr = 'Peux-tu nous **déposer** à l''aéroport ?',
  text_pt = 'Você pode nos **deixar** no aeroporto?',
  keywords_es = '["dejarnos"]'::jsonb,
  keywords_fr = '["déposer"]'::jsonb,
  keywords_pt = '["deixar"]'::jsonb
WHERE sort_order = 108;

UPDATE sentences SET
  text_es = 'Tomé el tren equivocado y **me perdí**.',
  text_fr = 'J''ai pris le mauvais train et **je me suis perdu**.',
  text_pt = 'Peguei o trem errado e **me perdi**.',
  keywords_es = '["me perdí"]'::jsonb,
  keywords_fr = '["je me suis perdu"]'::jsonb,
  keywords_pt = '["me perdi"]'::jsonb
WHERE sort_order = 109;

UPDATE sentences SET
  text_es = 'Necesitamos **tomar el último tren**.',
  text_fr = 'Nous devons **prendre le dernier train**.',
  text_pt = 'Precisamos **pegar o último trem**.',
  keywords_es = '["tomar el último tren"]'::jsonb,
  keywords_fr = '["prendre le dernier train"]'::jsonb,
  keywords_pt = '["pegar o último trem"]'::jsonb
WHERE sort_order = 110;

UPDATE sentences SET
  text_es = '¿Puedes **recogernos** en el aeropuerto?',
  text_fr = 'Peux-tu **venir nous chercher** à l''aéroport ?',
  text_pt = 'Você pode **nos buscar** no aeroporto?',
  keywords_es = '["recogernos"]'::jsonb,
  keywords_fr = '["venir nous chercher"]'::jsonb,
  keywords_pt = '["nos buscar"]'::jsonb
WHERE sort_order = 111;

UPDATE sentences SET
  text_es = 'Las condiciones meteorológicas **acortaron el viaje**.',
  text_fr = 'Les conditions météorologiques **ont écourté le voyage**.',
  text_pt = 'As condições climáticas **encurtaram a viagem**.',
  keywords_es = '["acortaron el viaje"]'::jsonb,
  keywords_fr = '["ont écourté le voyage"]'::jsonb,
  keywords_pt = '["encurtaram a viagem"]'::jsonb
WHERE sort_order = 112;

UPDATE sentences SET
  text_es = '¿Hay **alguna posibilidad** de descuento?',
  text_fr = 'Y a-t-il **une chance** d''avoir une réduction ?',
  text_pt = 'Há **alguma chance** de desconto?',
  keywords_es = '["alguna posibilidad"]'::jsonb,
  keywords_fr = '["une chance"]'::jsonb,
  keywords_pt = '["alguma chance"]'::jsonb
WHERE sort_order = 113;

UPDATE sentences SET
  text_es = 'Necesitamos **volver** hoy.',
  text_fr = 'Nous devons **rentrer** aujourd''hui.',
  text_pt = 'Precisamos **voltar** hoje.',
  keywords_es = '["volver"]'::jsonb,
  keywords_fr = '["rentrer"]'::jsonb,
  keywords_pt = '["voltar"]'::jsonb
WHERE sort_order = 114;

UPDATE sentences SET
  text_es = 'La guía nos **mostró la ciudad**.',
  text_fr = 'Le guide nous a **fait visiter** la ville.',
  text_pt = 'O guia nos **mostrou a cidade**.',
  keywords_es = '["mostró la ciudad"]'::jsonb,
  keywords_fr = '["fait visiter"]'::jsonb,
  keywords_pt = '["mostrou a cidade"]'::jsonb
WHERE sort_order = 115;

UPDATE sentences SET
  text_es = 'Mañana vamos a **hacer turismo**.',
  text_fr = 'Demain nous allons **visiter des sites touristiques**.',
  text_pt = 'Amanhã vamos **fazer turismo**.',
  keywords_es = '["hacer turismo"]'::jsonb,
  keywords_fr = '["visiter des sites touristiques"]'::jsonb,
  keywords_pt = '["fazer turismo"]'::jsonb
WHERE sort_order = 116;

UPDATE sentences SET
  text_es = '¿El desayuno está **incluido** en el precio del hotel?',
  text_fr = 'Le petit-déjeuner est-il **inclus** dans le prix de l''hôtel ?',
  text_pt = 'O café da manhã está **incluído** no preço do hotel?',
  keywords_es = '["incluido"]'::jsonb,
  keywords_fr = '["inclus"]'::jsonb,
  keywords_pt = '["incluído"]'::jsonb
WHERE sort_order = 117;

UPDATE sentences SET
  text_es = 'Vayamos **directamente** a la terminal sin perder tiempo.',
  text_fr = 'Allons **directement** au terminal sans perdre de temps.',
  text_pt = 'Vamos **direto** ao terminal sem perder tempo.',
  keywords_es = '["directamente"]'::jsonb,
  keywords_fr = '["directement"]'::jsonb,
  keywords_pt = '["direto"]'::jsonb
WHERE sort_order = 118;

UPDATE sentences SET
  text_es = 'Necesitamos **pasar por** el control de pasaportes.',
  text_fr = 'Nous devons **passer par** le contrôle des passeports.',
  text_pt = 'Precisamos **passar pelo** controle de passaportes.',
  keywords_es = '["pasar por"]'::jsonb,
  keywords_fr = '["passer par"]'::jsonb,
  keywords_pt = '["passar pelo"]'::jsonb
WHERE sort_order = 119;

UPDATE sentences SET
  text_es = 'El guía turístico nos **explicó** la zona.',
  text_fr = 'Le guide touristique nous a **présenté** la région.',
  text_pt = 'O guia turístico nos **explicou** a região.',
  keywords_es = '["explicó"]'::jsonb,
  keywords_fr = '["présenté"]'::jsonb,
  keywords_pt = '["explicou"]'::jsonb
WHERE sort_order = 120;

-- ─── CATEGORY 5 — Academic (sort_order 121-150) ──────────────────────────────

UPDATE sentences SET
  text_es = '**Además del** cambio climático, la contaminación del aire también es un problema grave.',
  text_fr = '**En plus du** changement climatique, la pollution de l''air est aussi un problème grave.',
  text_pt = '**Além das** mudanças climáticas, a poluição do ar também é um problema grave.',
  keywords_es = '["además del"]'::jsonb,
  keywords_fr = '["en plus du"]'::jsonb,
  keywords_pt = '["além das"]'::jsonb
WHERE sort_order = 121;

UPDATE sentences SET
  text_es = 'La investigación fue insuficiente; **como resultado**, el proyecto fracasó.',
  text_fr = 'La recherche était insuffisante ; **par conséquent**, le projet a échoué.',
  text_pt = 'A pesquisa foi insuficiente; **como resultado**, o projeto fracassou.',
  keywords_es = '["como resultado"]'::jsonb,
  keywords_fr = '["par conséquent"]'::jsonb,
  keywords_pt = '["como resultado"]'::jsonb
WHERE sort_order = 122;

UPDATE sentences SET
  text_es = 'Este enfoque es práctico; **por otro lado**, es caro.',
  text_fr = 'Cette approche est pratique ; **d''un autre côté**, elle est coûteuse.',
  text_pt = 'Esta abordagem é prática; **por outro lado**, é cara.',
  keywords_es = '["por otro lado"]'::jsonb,
  keywords_fr = '["d''un autre côté"]'::jsonb,
  keywords_pt = '["por outro lado"]'::jsonb
WHERE sort_order = 123;

UPDATE sentences SET
  text_es = '**En conclusión**, este método es más eficiente.',
  text_fr = '**En conclusion**, cette méthode est plus efficace.',
  text_pt = '**Em conclusão**, este método é mais eficiente.',
  keywords_es = '["en conclusión"]'::jsonb,
  keywords_fr = '["en conclusion"]'::jsonb,
  keywords_pt = '["em conclusão"]'::jsonb
WHERE sort_order = 124;

UPDATE sentences SET
  text_es = 'Esta hipótesis está **basada en** los datos.',
  text_fr = 'Cette hypothèse est **fondée sur** les données.',
  text_pt = 'Esta hipótese está **baseada nos** dados.',
  keywords_es = '["basada en"]'::jsonb,
  keywords_fr = '["fondée sur"]'::jsonb,
  keywords_pt = '["baseada nos"]'::jsonb
WHERE sort_order = 125;

UPDATE sentences SET
  text_es = '**En cuanto a** la eficiencia, este método es mejor.',
  text_fr = '**En termes d''**efficacité, cette méthode est meilleure.',
  text_pt = '**Em termos de** eficiência, este método é melhor.',
  keywords_es = '["en cuanto a"]'::jsonb,
  keywords_fr = '["en termes de"]'::jsonb,
  keywords_pt = '["em termos de"]'::jsonb
WHERE sort_order = 126;

UPDATE sentences SET
  text_es = '**Según** la investigación, el sueño afecta la salud.',
  text_fr = '**Selon** la recherche, le sommeil affecte la santé.',
  text_pt = '**De acordo com** a pesquisa, o sono afeta a saúde.',
  keywords_es = '["según"]'::jsonb,
  keywords_fr = '["selon"]'::jsonb,
  keywords_pt = '["de acordo com"]'::jsonb
WHERE sort_order = 127;

UPDATE sentences SET
  text_es = '**En otras palabras**, necesitamos cambiar nuestra estrategia.',
  text_fr = '**En d''autres termes**, nous devons changer notre stratégie.',
  text_pt = '**Em outras palavras**, precisamos mudar nossa estratégia.',
  keywords_es = '["en otras palabras"]'::jsonb,
  keywords_fr = '["en d''autres termes"]'::jsonb,
  keywords_pt = '["em outras palavras"]'::jsonb
WHERE sort_order = 128;

UPDATE sentences SET
  text_es = '**En resumen**, los hallazgos son prometedores.',
  text_fr = '**En résumé**, les résultats sont prometteurs.',
  text_pt = '**Em resumo**, os resultados são promissores.',
  keywords_es = '["en resumen"]'::jsonb,
  keywords_fr = '["en résumé"]'::jsonb,
  keywords_pt = '["em resumo"]'::jsonb
WHERE sort_order = 129;

UPDATE sentences SET
  text_es = '**Por ejemplo**, el sistema inmunológico responde al estrés.',
  text_fr = '**Par exemple**, le système immunitaire réagit au stress.',
  text_pt = '**Por exemplo**, o sistema imunológico responde ao estresse.',
  keywords_es = '["por ejemplo"]'::jsonb,
  keywords_fr = '["par exemple"]'::jsonb,
  keywords_pt = '["por exemplo"]'::jsonb
WHERE sort_order = 130;

UPDATE sentences SET
  text_es = '¿Estos datos **tienen sentido** para ti?',
  text_fr = 'Ces données ont-elles **du sens** pour toi ?',
  text_pt = 'Esses dados **fazem sentido** para você?',
  keywords_es = '["tienen sentido"]'::jsonb,
  keywords_fr = '["du sens"]'::jsonb,
  keywords_pt = '["fazem sentido"]'::jsonb
WHERE sort_order = 131;

UPDATE sentences SET
  text_es = '**Que yo sepa**, este método aún no ha sido probado.',
  text_fr = '**Pour autant que je sache**, cette méthode n''a pas encore été testée.',
  text_pt = '**Até onde eu sei**, esse método ainda não foi testado.',
  keywords_es = '["que yo sepa"]'::jsonb,
  keywords_fr = '["pour autant que je sache"]'::jsonb,
  keywords_pt = '["até onde eu sei"]'::jsonb
WHERE sort_order = 132;

UPDATE sentences SET
  text_es = 'El autor **señala** varios problemas críticos.',
  text_fr = 'L''auteur **soulève** plusieurs problèmes critiques.',
  text_pt = 'O autor **aponta** vários problemas críticos.',
  keywords_es = '["señala"]'::jsonb,
  keywords_fr = '["soulève"]'::jsonb,
  keywords_pt = '["aponta"]'::jsonb
WHERE sort_order = 133;

UPDATE sentences SET
  text_es = 'Este artículo **se refiere a** estudios anteriores.',
  text_fr = 'Cet article **fait référence à** des études précédentes.',
  text_pt = 'Este artigo **faz referência a** estudos anteriores.',
  keywords_es = '["se refiere a"]'::jsonb,
  keywords_fr = '["fait référence à"]'::jsonb,
  keywords_pt = '["faz referência a"]'::jsonb
WHERE sort_order = 134;

UPDATE sentences SET
  text_es = 'Debemos **tener en cuenta** el contexto al decidir.',
  text_fr = 'Nous devons **tenir compte du** contexte lors de la décision.',
  text_pt = 'Devemos **levar em conta** o contexto ao decidir.',
  keywords_es = '["tener en cuenta"]'::jsonb,
  keywords_fr = '["tenir compte du"]'::jsonb,
  keywords_pt = '["levar em conta"]'::jsonb
WHERE sort_order = 135;

UPDATE sentences SET
  text_es = 'Se tomaron medidas a corto plazo **en lugar de** soluciones a largo plazo.',
  text_fr = 'Des mesures à court terme ont été prises **plutôt que** des solutions à long terme.',
  text_pt = 'Medidas de curto prazo foram tomadas **em vez de** soluções de longo prazo.',
  keywords_es = '["en lugar de"]'::jsonb,
  keywords_fr = '["plutôt que"]'::jsonb,
  keywords_pt = '["em vez de"]'::jsonb
WHERE sort_order = 136;

UPDATE sentences SET
  text_es = '**Independientemente del** resultado, continuamos nuestra investigación.',
  text_fr = '**Indépendamment du** résultat, nous avons poursuivi notre recherche.',
  text_pt = '**Independentemente do** resultado, continuamos nossa pesquisa.',
  keywords_es = '["independientemente del"]'::jsonb,
  keywords_fr = '["indépendamment du"]'::jsonb,
  keywords_pt = '["independentemente do"]'::jsonb
WHERE sort_order = 137;

UPDATE sentences SET
  text_es = 'El experimento es válido **siempre que** se cumplan las condiciones.',
  text_fr = 'L''expérience est valide **à condition que** les conditions soient remplies.',
  text_pt = 'O experimento é válido **desde que** as condições sejam atendidas.',
  keywords_es = '["siempre que"]'::jsonb,
  keywords_fr = '["à condition que"]'::jsonb,
  keywords_pt = '["desde que"]'::jsonb
WHERE sort_order = 138;

UPDATE sentences SET
  text_es = 'Este hallazgo **arroja luz sobre** el tema.',
  text_fr = 'Cette découverte **éclaire** la question.',
  text_pt = 'Esta descoberta **lança luz sobre** o problema.',
  keywords_es = '["arroja luz sobre"]'::jsonb,
  keywords_fr = '["éclaire"]'::jsonb,
  keywords_pt = '["lança luz sobre"]'::jsonb
WHERE sort_order = 139;

UPDATE sentences SET
  text_es = '**Vale la pena señalar** que los métodos son discutibles.',
  text_fr = '**Il convient de noter** que les méthodes sont discutables.',
  text_pt = '**Vale ressaltar** que os métodos são discutíveis.',
  keywords_es = '["vale la pena señalar"]'::jsonb,
  keywords_fr = '["il convient de noter"]'::jsonb,
  keywords_pt = '["vale ressaltar"]'::jsonb
WHERE sort_order = 140;

UPDATE sentences SET
  text_es = 'Este estudio se examina **con respecto a** la ética.',
  text_fr = 'Cette étude est examinée **par rapport à** l''éthique.',
  text_pt = 'Este estudo é analisado **com relação à** ética.',
  keywords_es = '["con respecto a"]'::jsonb,
  keywords_fr = '["par rapport à"]'::jsonb,
  keywords_pt = '["com relação à"]'::jsonb
WHERE sort_order = 141;

UPDATE sentences SET
  text_es = 'El estudio **llama la atención sobre** las lagunas existentes.',
  text_fr = 'L''étude **attire l''attention sur** les lacunes existantes.',
  text_pt = 'O estudo **chama atenção para** as lacunas existentes.',
  keywords_es = '["llama la atención sobre"]'::jsonb,
  keywords_fr = '["attire l''attention sur"]'::jsonb,
  keywords_pt = '["chama atenção para"]'::jsonb
WHERE sort_order = 142;

UPDATE sentences SET
  text_es = '**A diferencia del** enfoque anterior, este método es más eficiente.',
  text_fr = '**Contrairement à** l''approche précédente, cette méthode est plus efficace.',
  text_pt = '**Em contraste com** a abordagem anterior, este método é mais eficiente.',
  keywords_es = '["a diferencia del"]'::jsonb,
  keywords_fr = '["contrairement à"]'::jsonb,
  keywords_pt = '["em contraste com"]'::jsonb
WHERE sort_order = 143;

UPDATE sentences SET
  text_es = '**Debido al** retraso del proyecto, se superó el presupuesto.',
  text_fr = '**En raison du** retard du projet, le budget a été dépassé.',
  text_pt = '**Devido ao** atraso do projeto, o orçamento foi ultrapassado.',
  keywords_es = '["debido al"]'::jsonb,
  keywords_fr = '["en raison du"]'::jsonb,
  keywords_pt = '["devido ao"]'::jsonb
WHERE sort_order = 144;

UPDATE sentences SET
  text_es = 'Los altos costes **llevaron a** una caída de la inversión.',
  text_fr = 'Les coûts élevés **ont entraîné** une baisse des investissements.',
  text_pt = 'Os altos custos **levaram a** uma queda nos investimentos.',
  keywords_es = '["llevaron a"]'::jsonb,
  keywords_fr = '["ont entraîné"]'::jsonb,
  keywords_pt = '["levaram a"]'::jsonb
WHERE sort_order = 145;

UPDATE sentences SET
  text_es = '**Llevaron a cabo** una extensa investigación de campo.',
  text_fr = 'Ils ont **mené** une vaste recherche de terrain.',
  text_pt = 'Eles **realizaram** uma extensa pesquisa de campo.',
  keywords_es = '["llevaron a cabo"]'::jsonb,
  keywords_fr = '["mené"]'::jsonb,
  keywords_pt = '["realizaram"]'::jsonb
WHERE sort_order = 146;

UPDATE sentences SET
  text_es = 'Los expertos finalmente **llegaron a una conclusión**.',
  text_fr = 'Les experts ont finalement **abouti à une conclusion**.',
  text_pt = 'Os especialistas finalmente **chegaram a uma conclusão**.',
  keywords_es = '["llegaron a una conclusión"]'::jsonb,
  keywords_fr = '["abouti à une conclusion"]'::jsonb,
  keywords_pt = '["chegaram a uma conclusão"]'::jsonb
WHERE sort_order = 147;

UPDATE sentences SET
  text_es = 'Este fenómeno se explica **en gran medida** por factores económicos.',
  text_fr = 'Ce phénomène s''explique **dans une large mesure** par des facteurs économiques.',
  text_pt = 'Este fenômeno é explicado **em grande parte** por fatores econômicos.',
  keywords_es = '["en gran medida"]'::jsonb,
  keywords_fr = '["dans une large mesure"]'::jsonb,
  keywords_pt = '["em grande parte"]'::jsonb
WHERE sort_order = 148;

UPDATE sentences SET
  text_es = 'La investigación y la docencia se desarrollan **al mismo tiempo**.',
  text_fr = 'La recherche et l''enseignement sont menés **en même temps**.',
  text_pt = 'A pesquisa e o ensino são realizados **ao mesmo tempo**.',
  keywords_es = '["al mismo tiempo"]'::jsonb,
  keywords_fr = '["en même temps"]'::jsonb,
  keywords_pt = '["ao mesmo tempo"]'::jsonb
WHERE sort_order = 149;

UPDATE sentences SET
  text_es = '**Presentaron** una nueva teoría.',
  text_fr = 'Ils ont **proposé** une nouvelle théorie.',
  text_pt = 'Eles **apresentaram** uma nova teoria.',
  keywords_es = '["presentaron"]'::jsonb,
  keywords_fr = '["proposé"]'::jsonb,
  keywords_pt = '["apresentaram"]'::jsonb
WHERE sort_order = 150;

-- ─── CATEGORY 6 — Idioms (sort_order 151-180) ────────────────────────────────

UPDATE sentences SET
  text_es = 'Duele pero **aguanto el tipo** y sigo adelante.',
  text_fr = 'Ça fait mal mais je **serre les dents** et je continue.',
  text_pt = 'Dói, mas estou **aguentando firme** e continuando.',
  keywords_es = '["aguanto el tipo"]'::jsonb,
  keywords_fr = '["serre les dents"]'::jsonb,
  keywords_pt = '["aguentando firme"]'::jsonb
WHERE sort_order = 151;

UPDATE sentences SET
  text_es = 'Es tan tímido que cuesta incluso **romper el hielo** en las reuniones.',
  text_fr = 'Il est si timide qu''il est difficile même de **briser la glace** en réunion.',
  text_pt = 'Ele é tão tímido que é difícil até **quebrar o gelo** nas reuniões.',
  keywords_es = '["romper el hielo"]'::jsonb,
  keywords_fr = '["briser la glace"]'::jsonb,
  keywords_pt = '["quebrar o gelo"]'::jsonb
WHERE sort_order = 152;

UPDATE sentences SET
  text_es = 'Me **entró el miedo** justo antes de salir al escenario.',
  text_fr = 'J''ai eu **la trouille** juste avant de monter sur scène.',
  text_pt = 'Fiquei **com frio na barriga** bem antes de subir ao palco.',
  keywords_es = '["entró el miedo"]'::jsonb,
  keywords_fr = '["la trouille"]'::jsonb,
  keywords_pt = '["com frio na barriga"]'::jsonb
WHERE sort_order = 153;

UPDATE sentences SET
  text_es = 'Realmente **diste en el clavo** — ese es exactamente el problema.',
  text_fr = 'Tu as vraiment **mis le doigt dessus** — c''est exactement le problème.',
  text_pt = 'Você realmente **acertou na mosca** — esse é exatamente o problema.',
  keywords_es = '["diste en el clavo"]'::jsonb,
  keywords_fr = '["mis le doigt dessus"]'::jsonb,
  keywords_pt = '["acertou na mosca"]'::jsonb
WHERE sort_order = 154;

UPDATE sentences SET
  text_es = 'Ten cuidado — acabas de **descubrir el pastel**.',
  text_fr = 'Fais attention — tu viens de **vendre la mèche**.',
  text_pt = 'Cuidado — você acabou de **entregar o jogo**.',
  keywords_es = '["descubrir el pastel"]'::jsonb,
  keywords_fr = '["vendre la mèche"]'::jsonb,
  keywords_pt = '["entregar o jogo"]'::jsonb
WHERE sort_order = 155;

UPDATE sentences SET
  text_es = 'Nunca **estamos de acuerdo** en este tema.',
  text_fr = 'Nous ne sommes jamais **sur la même longueur d''onde** sur ce sujet.',
  text_pt = 'Nunca **concordamos** nesse assunto.',
  keywords_es = '["estamos de acuerdo"]'::jsonb,
  keywords_fr = '["sur la même longueur d''onde"]'::jsonb,
  keywords_pt = '["concordamos"]'::jsonb
WHERE sort_order = 156;

UPDATE sentences SET
  text_es = 'Este problema es solo **la punta del iceberg**.',
  text_fr = 'Ce problème n''est que **la partie visible de l''iceberg**.',
  text_pt = 'Este problema é apenas **a ponta do iceberg**.',
  keywords_es = '["la punta del iceberg"]'::jsonb,
  keywords_fr = '["la partie visible de l''iceberg"]'::jsonb,
  keywords_pt = '["a ponta do iceberg"]'::jsonb
WHERE sort_order = 157;

UPDATE sentences SET
  text_es = 'Reveló el secreto — **se fue de la lengua**.',
  text_fr = 'Il a révélé le secret — il a **tout déballé**.',
  text_pt = 'Ele revelou o segredo — **abriu o bico**.',
  keywords_es = '["se fue de la lengua"]'::jsonb,
  keywords_fr = '["tout déballé"]'::jsonb,
  keywords_pt = '["abriu o bico"]'::jsonb
WHERE sort_order = 158;

UPDATE sentences SET
  text_es = 'Conozco este nombre de algún lugar — me **suena**.',
  text_fr = 'Je connais ce nom de quelque part — ça me **dit quelque chose**.',
  text_pt = 'Conheço esse nome de algum lugar — me **parece familiar**.',
  keywords_es = '["suena"]'::jsonb,
  keywords_fr = '["dit quelque chose"]'::jsonb,
  keywords_pt = '["parece familiar"]'::jsonb
WHERE sort_order = 159;

UPDATE sentences SET
  text_es = '**Cruza los dedos** — espero que ganemos.',
  text_fr = '**Croise les doigts** — j''espère qu''on gagne.',
  text_pt = '**Cruza os dedos** — espero que a gente ganhe.',
  keywords_es = '["cruza los dedos"]'::jsonb,
  keywords_fr = '["croise les doigts"]'::jsonb,
  keywords_pt = '["cruza os dedos"]'::jsonb
WHERE sort_order = 160;

UPDATE sentences SET
  text_es = 'Vamos al cine **de vez en cuando**.',
  text_fr = 'On va au cinéma **de temps en temps**.',
  text_pt = 'A gente vai ao cinema **de vez em quando**.',
  keywords_es = '["de vez en cuando"]'::jsonb,
  keywords_fr = '["de temps en temps"]'::jsonb,
  keywords_pt = '["de vez em quando"]'::jsonb
WHERE sort_order = 161;

UPDATE sentences SET
  text_es = 'Esa oferta llegó **de la nada**.',
  text_fr = 'Cette offre est arrivée **à l''improviste**.',
  text_pt = 'Essa oferta chegou **do nada**.',
  keywords_es = '["de la nada"]'::jsonb,
  keywords_fr = '["à l''improviste"]'::jsonb,
  keywords_pt = '["do nada"]'::jsonb
WHERE sort_order = 162;

UPDATE sentences SET
  text_es = '**De repente**, todo cambió.',
  text_fr = '**Tout d''un coup**, tout a changé.',
  text_pt = '**De repente**, tudo mudou.',
  keywords_es = '["de repente"]'::jsonb,
  keywords_fr = '["tout d''un coup"]'::jsonb,
  keywords_pt = '["de repente"]'::jsonb
WHERE sort_order = 163;

UPDATE sentences SET
  text_es = 'Este coche **costó un ojo de la cara**.',
  text_fr = 'Cette voiture **a coûté les yeux de la tête**.',
  text_pt = 'Esse carro **custou os olhos da cara**.',
  keywords_es = '["costó un ojo de la cara"]'::jsonb,
  keywords_fr = '["a coûté les yeux de la tête"]'::jsonb,
  keywords_pt = '["custou os olhos da cara"]'::jsonb
WHERE sort_order = 164;

UPDATE sentences SET
  text_es = 'Doy paseos por el parque **de vez en cuando**.',
  text_fr = 'Je me promène dans le parc **de temps à autre**.',
  text_pt = 'Dou caminhadas no parque **de vez em quando**.',
  keywords_es = '["de vez en cuando"]'::jsonb,
  keywords_fr = '["de temps à autre"]'::jsonb,
  keywords_pt = '["de vez em quando"]'::jsonb
WHERE sort_order = 165;

UPDATE sentences SET
  text_es = 'Este examen fue **pan comido** para mí.',
  text_fr = 'Cet examen a été **du gâteau** pour moi.',
  text_pt = 'Essa prova foi **mamão com açúcar** para mim.',
  keywords_es = '["pan comido"]'::jsonb,
  keywords_fr = '["du gâteau"]'::jsonb,
  keywords_pt = '["mamão com açúcar"]'::jsonb
WHERE sort_order = 166;

UPDATE sentences SET
  text_es = 'Hoy me siento **un poco mal**.',
  text_fr = 'Je me sens **patraque** aujourd''hui.',
  text_pt = 'Hoje estou me sentindo **meio mal**.',
  keywords_es = '["un poco mal"]'::jsonb,
  keywords_fr = '["patraque"]'::jsonb,
  keywords_pt = '["meio mal"]'::jsonb
WHERE sort_order = 167;

UPDATE sentences SET
  text_es = 'Vale la pena **intentarlo** una vez.',
  text_fr = 'Ça vaut la peine d''**essayer** une fois.',
  text_pt = 'Vale a pena **tentar** uma vez.',
  keywords_es = '["intentarlo"]'::jsonb,
  keywords_fr = '["essayer"]'::jsonb,
  keywords_pt = '["tentar"]'::jsonb
WHERE sort_order = 168;

UPDATE sentences SET
  text_es = 'Todavía estoy **indeciso** al respecto.',
  text_fr = 'Je suis encore **indécis** à ce sujet.',
  text_pt = 'Ainda estou **em cima do muro** sobre isso.',
  keywords_es = '["indeciso"]'::jsonb,
  keywords_fr = '["indécis"]'::jsonb,
  keywords_pt = '["em cima do muro"]'::jsonb
WHERE sort_order = 169;

UPDATE sentences SET
  text_es = 'Con ese comportamiento **quemaste los puentes**.',
  text_fr = 'Avec ce comportement tu as **brûlé tes ponts**.',
  text_pt = 'Com esse comportamento você **queimou as pontes**.',
  keywords_es = '["quemaste los puentes"]'::jsonb,
  keywords_fr = '["brûlé tes ponts"]'::jsonb,
  keywords_pt = '["queimou as pontes"]'::jsonb
WHERE sort_order = 170;

UPDATE sentences SET
  text_es = '**Perdiste el tren** — el avión ya se fue.',
  text_fr = 'Tu as **raté le coche** — l''avion est déjà parti.',
  text_pt = 'Você **perdeu o bonde** — o avião já foi.',
  keywords_es = '["perdiste el tren"]'::jsonb,
  keywords_fr = '["raté le coche"]'::jsonb,
  keywords_pt = '["perdeu o bonde"]'::jsonb
WHERE sort_order = 171;

UPDATE sentences SET
  text_es = 'Solo me está **tomando el pelo**, no lo tomes en serio.',
  text_fr = 'Il me **fait marcher**, ne le prends pas au sérieux.',
  text_pt = 'Ele está só **me tirando sarro**, não leve a sério.',
  keywords_es = '["tomando el pelo"]'::jsonb,
  keywords_fr = '["fait marcher"]'::jsonb,
  keywords_pt = '["me tirando sarro"]'::jsonb
WHERE sort_order = 172;

UPDATE sentences SET
  text_es = 'La situación se **fue de las manos**.',
  text_fr = 'La situation a **dégénéré**.',
  text_pt = 'A situação **fugiu do controle**.',
  keywords_es = '["fue de las manos"]'::jsonb,
  keywords_fr = '["dégénéré"]'::jsonb,
  keywords_pt = '["fugiu do controle"]'::jsonb
WHERE sort_order = 173;

UPDATE sentences SET
  text_es = 'Necesitas **leer entre líneas** el mensaje.',
  text_fr = 'Tu dois **lire entre les lignes** du message.',
  text_pt = 'Você precisa **ler nas entrelinhas** da mensagem.',
  keywords_es = '["leer entre líneas"]'::jsonb,
  keywords_fr = '["lire entre les lignes"]'::jsonb,
  keywords_pt = '["ler nas entrelinhas"]'::jsonb
WHERE sort_order = 174;

UPDATE sentences SET
  text_es = 'Ahora **la pelota está en tu tejado** — tú decides.',
  text_fr = '**C''est à toi de jouer** maintenant — décide.',
  text_pt = 'Agora **a bola está no seu campo** — você decide.',
  keywords_es = '["la pelota está en tu tejado"]'::jsonb,
  keywords_fr = '["c''est à toi de jouer"]'::jsonb,
  keywords_pt = '["a bola está no seu campo"]'::jsonb
WHERE sort_order = 175;

UPDATE sentences SET
  text_es = 'Estás **abarcando más de lo que puedes** con estas responsabilidades.',
  text_fr = 'Tu **vois trop grand** avec toutes ces responsabilités.',
  text_pt = 'Você está **se comprometendo além da conta** com essas responsabilidades.',
  keywords_es = '["abarcando más de lo que puedes"]'::jsonb,
  keywords_fr = '["vois trop grand"]'::jsonb,
  keywords_pt = '["se comprometendo além da conta"]'::jsonb
WHERE sort_order = 176;

UPDATE sentences SET
  text_es = '**Las obras valen más que las palabras**.',
  text_fr = '**Les actes valent mieux que les mots**.',
  text_pt = '**Ações falam mais alto que palavras**.',
  keywords_es = '["las obras valen más que las palabras"]'::jsonb,
  keywords_fr = '["les actes valent mieux que les mots"]'::jsonb,
  keywords_pt = '["ações falam mais alto que palavras"]'::jsonb
WHERE sort_order = 177;

UPDATE sentences SET
  text_es = 'No lo dice directamente; está **dando rodeos**.',
  text_fr = 'Il ne le dit pas directement ; il **tourne autour du pot**.',
  text_pt = 'Ele não está dizendo diretamente; está **enrolando**.',
  keywords_es = '["dando rodeos"]'::jsonb,
  keywords_fr = '["tourne autour du pot"]'::jsonb,
  keywords_pt = '["enrolando"]'::jsonb
WHERE sort_order = 178;

UPDATE sentences SET
  text_es = 'Unirse a la discusión sería **echar leña al fuego**.',
  text_fr = 'Rejoindre la dispute serait **jeter de l''huile sur le feu**.',
  text_pt = 'Entrar na discussão seria **jogar lenha na fogueira**.',
  keywords_es = '["echar leña al fuego"]'::jsonb,
  keywords_fr = '["jeter de l''huile sur le feu"]'::jsonb,
  keywords_pt = '["jogar lenha na fogueira"]'::jsonb
WHERE sort_order = 179;

UPDATE sentences SET
  text_es = 'Todos lo saben pero nadie habla de ello — **el elefante en la habitación**.',
  text_fr = 'Tout le monde le sait mais personne n''en parle — **l''éléphant dans la pièce**.',
  text_pt = 'Todo mundo sabe mas ninguém fala sobre isso — **o elefante na sala**.',
  keywords_es = '["el elefante en la habitación"]'::jsonb,
  keywords_fr = '["l''éléphant dans la pièce"]'::jsonb,
  keywords_pt = '["o elefante na sala"]'::jsonb
WHERE sort_order = 180;

-- ─── CATEGORY 7 — Grammar Patterns (sort_order 271-300) ──────────────────────

UPDATE sentences SET
  text_es = '**Solía** correr cada mañana.',
  text_fr = 'J''**avais l''habitude de** courir chaque matin.',
  text_pt = 'Eu **costumava** correr toda manhã.',
  keywords_es = '["solía"]'::jsonb,
  keywords_fr = '["avais l''habitude de"]'::jsonb,
  keywords_pt = '["costumava"]'::jsonb
WHERE sort_order = 271;

UPDATE sentences SET
  text_es = 'Estaba **a punto de** salir cuando sonó el teléfono.',
  text_fr = 'J''étais **sur le point de** partir quand le téléphone a sonné.',
  text_pt = 'Eu estava **prestes a** sair quando o telefone tocou.',
  keywords_es = '["a punto de"]'::jsonb,
  keywords_fr = '["sur le point de"]'::jsonb,
  keywords_pt = '["prestes a"]'::jsonb
WHERE sort_order = 272;

UPDATE sentences SET
  text_es = 'Te llamaré **en cuanto** llegue a casa.',
  text_fr = 'Je t''appellerai **dès que** je rentrerai à la maison.',
  text_pt = 'Vou te ligar **assim que** chegar em casa.',
  keywords_es = '["en cuanto"]'::jsonb,
  keywords_fr = '["dès que"]'::jsonb,
  keywords_pt = '["assim que"]'::jsonb
WHERE sort_order = 273;

UPDATE sentences SET
  text_es = '**Aunque** estaba cansada, siguió trabajando.',
  text_fr = '**Même si** elle était fatiguée, elle a continué à travailler.',
  text_pt = '**Mesmo que** estivesse cansada, ela continuou trabalhando.',
  keywords_es = '["aunque"]'::jsonb,
  keywords_fr = '["même si"]'::jsonb,
  keywords_pt = '["mesmo que"]'::jsonb
WHERE sort_order = 274;

UPDATE sentences SET
  text_es = 'Puedes quedarte aquí **mientras** estés en silencio.',
  text_fr = 'Tu peux rester ici **tant que** tu es tranquille.',
  text_pt = 'Você pode ficar aqui **desde que** fique quieto.',
  keywords_es = '["mientras"]'::jsonb,
  keywords_fr = '["tant que"]'::jsonb,
  keywords_pt = '["desde que"]'::jsonb
WHERE sort_order = 275;

UPDATE sentences SET
  text_es = '**Preferiría** quedarme en casa que ir allí.',
  text_fr = 'Je **préférerais** rester chez moi plutôt qu''y aller.',
  text_pt = '**Prefiro** ficar em casa a ir lá.',
  keywords_es = '["preferiría"]'::jsonb,
  keywords_fr = '["préférerais"]'::jsonb,
  keywords_pt = '["prefiro"]'::jsonb
WHERE sort_order = 276;

UPDATE sentences SET
  text_es = '**Más te vale** salir antes de llegar tarde.',
  text_fr = 'Tu **ferais mieux de** partir avant d''être en retard.',
  text_pt = 'É **melhor você** sair antes de se atrasar.',
  keywords_es = '["más te vale"]'::jsonb,
  keywords_fr = '["ferais mieux de"]'::jsonb,
  keywords_pt = '["melhor você"]'::jsonb
WHERE sort_order = 277;

UPDATE sentences SET
  text_es = '**Ojalá** hubiera empezado antes.',
  text_fr = 'J''**aurais aimé** commencer plus tôt.',
  text_pt = '**Queria ter** começado mais cedo.',
  keywords_es = '["ojalá"]'::jsonb,
  keywords_fr = '["aurais aimé"]'::jsonb,
  keywords_pt = '["queria ter"]'::jsonb
WHERE sort_order = 278;

UPDATE sentences SET
  text_es = '**Es hora de** irse a casa.',
  text_fr = 'C''**est l''heure de** rentrer à la maison.',
  text_pt = '**É hora de** ir para casa.',
  keywords_es = '["es hora de"]'::jsonb,
  keywords_fr = '["est l''heure de"]'::jsonb,
  keywords_pt = '["é hora de"]'::jsonb
WHERE sort_order = 279;

UPDATE sentences SET
  text_es = '**Necesito** estudiar mucho para aprobar el examen.',
  text_fr = '**J''ai besoin de** beaucoup étudier pour réussir l''examen.',
  text_pt = '**Preciso** estudar muito para passar no exame.',
  keywords_es = '["necesito"]'::jsonb,
  keywords_fr = '["j''ai besoin de"]'::jsonb,
  keywords_pt = '["preciso"]'::jsonb
WHERE sort_order = 280;

UPDATE sentences SET
  text_es = '**No solo** habla inglés, **sino también** francés.',
  text_fr = 'Elle ne parle **pas seulement** anglais, **mais aussi** français.',
  text_pt = 'Ela **não só** fala inglês, **mas também** francês.',
  keywords_es = '["no solo sino también"]'::jsonb,
  keywords_fr = '["pas seulement mais aussi"]'::jsonb,
  keywords_pt = '["não só mas também"]'::jsonb
WHERE sort_order = 281;

UPDATE sentences SET
  text_es = 'Estaba **tan** cansado **que** no podía ni levantarme.',
  text_fr = 'J''étais **tellement** fatigué **que** je ne pouvais même pas me lever.',
  text_pt = 'Estava **tão** cansado **que** não conseguia nem me levantar.',
  keywords_es = '["tan que"]'::jsonb,
  keywords_fr = '["tellement que"]'::jsonb,
  keywords_pt = '["tão que"]'::jsonb
WHERE sort_order = 282;

UPDATE sentences SET
  text_es = 'Las personas **tienden a** cometer errores bajo estrés.',
  text_fr = 'Les gens **ont tendance à** faire des erreurs sous pression.',
  text_pt = 'As pessoas **tendem a** cometer erros sob estresse.',
  keywords_es = '["tienden a"]'::jsonb,
  keywords_fr = '["ont tendance à"]'::jsonb,
  keywords_pt = '["tendem a"]'::jsonb
WHERE sort_order = 283;

UPDATE sentences SET
  text_es = 'La reunión **debería** empezar a las 10.',
  text_fr = 'La réunion **est censée** commencer à 10 heures.',
  text_pt = 'A reunião **deveria** começar às 10.',
  keywords_es = '["debería"]'::jsonb,
  keywords_fr = '["est censée"]'::jsonb,
  keywords_pt = '["deveria"]'::jsonb
WHERE sort_order = 284;

UPDATE sentences SET
  text_es = '**Me gustaría** hablar contigo un momento.',
  text_fr = '**J''aimerais** te parler un instant.',
  text_pt = '**Gostaria de** conversar com você um momento.',
  keywords_es = '["me gustaría"]'::jsonb,
  keywords_fr = '["j''aimerais"]'::jsonb,
  keywords_pt = '["gostaria de"]'::jsonb
WHERE sort_order = 285;

UPDATE sentences SET
  text_es = '**Pase lo que pase**, no me rendiré.',
  text_fr = '**Quoi qu''il arrive**, je n''abandonnerai pas.',
  text_pt = '**Não importa o que aconteça**, não vou desistir.',
  keywords_es = '["pase lo que pase"]'::jsonb,
  keywords_fr = '["quoi qu''il arrive"]'::jsonb,
  keywords_pt = '["não importa o que aconteça"]'::jsonb
WHERE sort_order = 286;

UPDATE sentences SET
  text_es = 'Llevo una llave de repuesto **por si acaso** pierdo la mía.',
  text_fr = 'Je porte une clé de rechange **au cas où** je perdrais la mienne.',
  text_pt = 'Carrego uma chave reserva **caso** perca a minha.',
  keywords_es = '["por si acaso"]'::jsonb,
  keywords_fr = '["au cas où"]'::jsonb,
  keywords_pt = '["caso"]'::jsonb
WHERE sort_order = 287;

UPDATE sentences SET
  text_es = 'Puedes tener éxito **con tal de que** trabajes lo suficiente.',
  text_fr = 'Tu peux réussir **à condition de** travailler suffisamment.',
  text_pt = 'Você pode ter sucesso **desde que** se esforce o suficiente.',
  keywords_es = '["con tal de que"]'::jsonb,
  keywords_fr = '["à condition de"]'::jsonb,
  keywords_pt = '["desde que"]'::jsonb
WHERE sort_order = 288;

UPDATE sentences SET
  text_es = 'No puedes entrar en la sala **a menos que** tengas permiso.',
  text_fr = 'Tu ne peux pas entrer dans la pièce **à moins d''**avoir la permission.',
  text_pt = 'Você não pode entrar na sala **a menos que** tenha permissão.',
  keywords_es = '["a menos que"]'::jsonb,
  keywords_fr = '["à moins de"]'::jsonb,
  keywords_pt = '["a menos que"]'::jsonb
WHERE sort_order = 289;

UPDATE sentences SET
  text_es = 'Ella **tanto** trabaja **como** va a la escuela.',
  text_fr = 'Elle **à la fois** travaille **et** va à l''école.',
  text_pt = 'Ela **tanto** trabalha **quanto** vai à escola.',
  keywords_es = '["tanto como"]'::jsonb,
  keywords_fr = '["à la fois"]'::jsonb,
  keywords_pt = '["tanto quanto"]'::jsonb
WHERE sort_order = 290;

UPDATE sentences SET
  text_es = '**Ni** él **ni** yo asistimos a esa reunión.',
  text_fr = '**Ni** lui **ni** moi n''avons assisté à cette réunion.',
  text_pt = '**Nem** ele **nem** eu participamos dessa reunião.',
  keywords_es = '["ni ni"]'::jsonb,
  keywords_fr = '["ni ni"]'::jsonb,
  keywords_pt = '["nem nem"]'::jsonb
WHERE sort_order = 291;

UPDATE sentences SET
  text_es = '**Cuando** llegó a casa, todos ya dormían.',
  text_fr = '**Au moment où** elle est rentrée, tout le monde dormait déjà.',
  text_pt = '**Quando** ela chegou em casa, todos já dormiam.',
  keywords_es = '["cuando"]'::jsonb,
  keywords_fr = '["au moment où"]'::jsonb,
  keywords_pt = '["quando"]'::jsonb
WHERE sort_order = 292;

UPDATE sentences SET
  text_es = '**¿Y si** no pudieras pagar la cuenta?',
  text_fr = '**Et si** tu ne pouvais pas payer l''addition ?',
  text_pt = '**E se** você não pudesse pagar a conta?',
  keywords_es = '["y si"]'::jsonb,
  keywords_fr = '["et si"]'::jsonb,
  keywords_pt = '["e se"]'::jsonb
WHERE sort_order = 293;

UPDATE sentences SET
  text_es = '**Cuanto más** practicas, **mejor** te vuelves.',
  text_fr = '**Plus** tu pratiques, **mieux** tu t''en sors.',
  text_pt = '**Quanto mais** você pratica, **melhor** você fica.',
  keywords_es = '["cuanto más mejor"]'::jsonb,
  keywords_fr = '["plus mieux"]'::jsonb,
  keywords_pt = '["quanto mais melhor"]'::jsonb
WHERE sort_order = 294;

UPDATE sentences SET
  text_es = '**Ya es hora** de que resolvamos este problema.',
  text_fr = 'Il **est grand temps** qu''on résolve ce problème.',
  text_pt = '**Já é hora** de resolvermos este problema.',
  keywords_es = '["ya es hora"]'::jsonb,
  keywords_fr = '["est grand temps"]'::jsonb,
  keywords_pt = '["já é hora"]'::jsonb
WHERE sort_order = 295;

UPDATE sentences SET
  text_es = 'Habló **como si** nada hubiera pasado.',
  text_fr = 'Il a parlé **comme si** rien ne s''était passé.',
  text_pt = 'Ele falou **como se** nada tivesse acontecido.',
  keywords_es = '["como si"]'::jsonb,
  keywords_fr = '["comme si"]'::jsonb,
  keywords_pt = '["como se"]'::jsonb
WHERE sort_order = 296;

UPDATE sentences SET
  text_es = 'Aceptaré el proyecto **con la condición de que** se entregue a tiempo.',
  text_fr = 'J''accepterai le projet **à condition qu''**il soit livré à temps.',
  text_pt = 'Vou aceitar o projeto **com a condição de que** seja entregue no prazo.',
  keywords_es = '["con la condición de que"]'::jsonb,
  keywords_fr = '["à condition que"]'::jsonb,
  keywords_pt = '["com a condição de que"]'::jsonb
WHERE sort_order = 297;

UPDATE sentences SET
  text_es = 'No diría nada **hasta** haberte avisado.',
  text_fr = 'Je ne dirais rien **avant de** t''avoir prévenu.',
  text_pt = 'Não diria nada **até** ter te avisado.',
  keywords_es = '["hasta"]'::jsonb,
  keywords_fr = '["avant de"]'::jsonb,
  keywords_pt = '["até"]'::jsonb
WHERE sort_order = 298;

UPDATE sentences SET
  text_es = '**Si no fuera por** el examen, no estudiaría tanto.',
  text_fr = '**Si ce n''était pas** l''examen, je n''étudierais pas autant.',
  text_pt = '**Se não fosse** o exame, eu não estudaria tanto.',
  keywords_es = '["si no fuera por"]'::jsonb,
  keywords_fr = '["si ce n''était pas"]'::jsonb,
  keywords_pt = '["se não fosse"]'::jsonb
WHERE sort_order = 299;

UPDATE sentences SET
  text_es = 'Uso ejemplos **para** entender mejor.',
  text_fr = 'J''utilise des exemples **afin de** mieux comprendre.',
  text_pt = 'Uso exemplos **a fim de** entender melhor.',
  keywords_es = '["para"]'::jsonb,
  keywords_fr = '["afin de"]'::jsonb,
  keywords_pt = '["a fim de"]'::jsonb
WHERE sort_order = 300;
