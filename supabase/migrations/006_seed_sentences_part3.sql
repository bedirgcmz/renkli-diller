-- Seed sentences for categories 8-10 (90 sentences total)
-- Category 8: Teknoloji (30 sentences, is_free: false)
-- Category 9: Sağlık (30 sentences, is_free: false)
-- Category 10: Sosyal ve Güncel (30 sentences, is_free: false)

-- Category 8: Beginner (10 sentences)
INSERT INTO sentences (category_id, text_tr, text_en, text_sv, text_de, keywords_tr, keywords_en, keywords_sv, keywords_de, difficulty, is_free, sort_order) VALUES
(8, 'Hesabına *gir*.', '*Log in* to your account.', '*Logga in* på ditt konto.', '*Einloggen* in dein Konto.', '["gir", "log in", "logga in", "einloggen"]', '["log in", "log in", "logga in", "einloggen"]', '["logga in", "log in", "logga in", "einloggen"]', '["einloggen", "log in", "logga in", "einloggen"]', 'beginner', false, 211),
(8, 'Yeni hesap aç.', '*Sign up* for a new account.', '*Registrera dig* för ett nytt konto.', '*Registrieren* für ein neues Konto.', '["aç", "sign up", "registrera dig", "registrieren"]', '["sign up", "sign up", "registrera dig", "registrieren"]', '["registrera dig", "sign up", "registrera dig", "registrieren"]', '["registrieren", "sign up", "registrera dig", "registrieren"]', 'beginner', false, 212),
(8, 'Dosyaları *yedekle*.', '*Back up* your files.', '*Säkerhetskopiera* dina filer.', '*Sichern* deine Dateien.', '["yedekle", "back up", "säkerhetskopiera", "sichern"]', '["back up", "back up", "säkerhetskopiera", "sichern"]', '["säkerhetskopiera", "back up", "säkerhetskopiera", "sichern"]', '["sichern", "back up", "säkerhetskopiera", "sichern"]', 'beginner', false, 213),
(8, 'Şifreyi unutma.', 'Don''t forget your password.', 'Glöm inte ditt lösenord.', 'Vergiss nicht dein Passwort.', '[]', '[]', '[]', '[]', 'beginner', false, 214),
(8, 'Uygulamayı indir.', 'Download the app.', 'Ladda ner appen.', 'Lade die App herunter.', '[]', '[]', '[]', '[]', 'beginner', false, 215),
(8, 'Ekranı kapat.', 'Turn off the screen.', 'Stäng av skärmen.', 'Schalte den Bildschirm aus.', '[]', '[]', '[]', '[]', 'beginner', false, 216),
(8, 'Ses seviyesini artır.', 'Increase the volume.', 'Öka volymen.', 'Erhöhe die Lautstärke.', '[]', '[]', '[]', '[]', 'beginner', false, 217),
(8, 'Fotoğraf çek.', 'Take a photo.', 'Ta ett foto.', 'Mache ein Foto.', '[]', '[]', '[]', '[]', 'beginner', false, 218),
(8, 'Mesaj gönder.', 'Send a message.', 'Skicka ett meddelande.', 'Sende eine Nachricht.', '[]', '[]', '[]', '[]', 'beginner', false, 219),
(8, 'Bildirimleri kapat.', 'Turn off notifications.', 'Stäng av aviseringar.', 'Schalte Benachrichtigungen aus.', '[]', '[]', '[]', '[]', 'beginner', false, 220);

-- Category 8: Intermediate (10 sentences)
INSERT INTO sentences (category_id, text_tr, text_en, text_sv, text_de, keywords_tr, keywords_en, keywords_sv, keywords_de, difficulty, is_free, sort_order) VALUES
(8, 'Depolama alanı *tüken*.', '*Run out of* storage space.', '*Ta slut på* lagringsutrymme.', '*Ausgehen* an Speicherplatz.', '["tüken", "run out of", "ta slut på", "ausgehen"]', '["run out of", "run out of", "ta slut på", "ausgehen"]', '["ta slut på", "run out of", "ta slut på", "ausgehen"]', '["ausgehen", "run out of", "ta slut på", "ausgehen"]', 'intermediate', false, 221),
(8, 'Yazılımı *güncelle*.', '*Update* the software.', '*Uppdatera* programvaran.', '*Aktualisieren* die Software.', '["güncelle", "update", "uppdatera", "aktualisieren"]', '["update", "update", "uppdatera", "aktualisieren"]', '["uppdatera", "update", "uppdatera", "aktualisieren"]', '["aktualisieren", "update", "uppdatera", "aktualisieren"]', 'intermediate', false, 222),
(8, 'Bilgisayarı *kapat*.', '*Shut down* the computer.', '*Stäng av* datorn.', '*Herunterfahren* den Computer.', '["kapat", "shut down", "stäng av", "herunterfahren"]', '["shut down", "shut down", "stäng av", "herunterfahren"]', '["stäng av", "shut down", "stäng av", "herunterfahren"]', '["herunterfahren", "shut down", "stäng av", "herunterfahren"]', 'intermediate', false, 223),
(8, 'Yeni cihazı *kur*.', '*Set up* the new device.', '*Konfigurera* den nya enheten.', '*Einrichten* das neue Gerät.', '["kur", "set up", "konfigurera", "einrichten"]', '["set up", "set up", "konfigurera", "einrichten"]', '["konfigurera", "set up", "konfigurera", "einrichten"]', '["einrichten", "set up", "konfigurera", "einrichten"]', 'intermediate', false, 224),
(8, 'Veriyi *aktar*.', '*Transfer* the data.', '*Överföra* data.', '*Übertragen* die Daten.', '["aktar", "transfer", "överföra", "übertragen"]', '["transfer", "transfer", "överföra", "übertragen"]', '["överföra", "transfer", "överföra", "übertragen"]', '["übertragen", "transfer", "överföra", "übertragen"]', 'intermediate', false, 225),
(8, 'Ağ bağlantısı kesildi.', 'The network connection is lost.', 'Nätverksanslutningen är förlorad.', 'Die Netzwerkverbindung ist verloren.', '[]', '[]', '[]', '[]', 'intermediate', false, 226),
(8, 'Pil ile *kaydır*.', '*Scroll* with the arrow.', '*Rulla* med pilen.', '*Scrollen* mit dem Pfeil.', '["kaydır", "scroll", "rulla", "scrollen"]', '["scroll", "scroll", "rulla", "scrollen"]', '["rulla", "scroll", "rulla", "scrollen"]', '["scrollen", "scroll", "rulla", "scrollen"]', 'intermediate', false, 227),
(8, 'Dosyayı *aç*.', '*Open* the file.', '*Öppna* filen.', '*Öffnen* die Datei.', '["aç", "open", "öppna", "öffnen"]', '["open", "open", "öppna", "öffnen"]', '["öppna", "open", "öppna", "öffnen"]', '["öffnen", "open", "öppna", "öffnen"]', 'intermediate', false, 228),
(8, 'Güvenlik duvarını etkinleştir.', 'Enable the firewall.', 'Aktivera brandväggen.', 'Aktiviere die Firewall.', '[]', '[]', '[]', '[]', 'intermediate', false, 229),
(8, 'Bulut depolamaya yükle.', 'Upload to cloud storage.', 'Ladda upp till molnlagring.', 'Hochladen in die Cloud-Speicher.', '[]', '[]', '[]', '[]', 'intermediate', false, 230);

-- Category 8: Advanced (10 sentences)
INSERT INTO sentences (category_id, text_tr, text_en, text_sv, text_de, keywords_tr, keywords_en, keywords_sv, keywords_de, difficulty, is_free, sort_order) VALUES
(8, 'Yapay zeka algoritması geliştirildi.', 'AI algorithm is developed.', 'AI-algoritm utvecklades.', 'KI-Algorithmus wurde entwickelt.', '[]', '[]', '[]', '[]', 'advanced', false, 231),
(8, 'Veri tabanını *optimize et*.', '*Optimize* the database.', '*Optimera* databasen.', '*Optimieren* die Datenbank.', '["optimize et", "optimize", "optimera", "optimieren"]', '["optimize", "optimize", "optimera", "optimieren"]', '["optimera", "optimize", "optimera", "optimieren"]', '["optimieren", "optimize", "optimera", "optimieren"]', 'advanced', false, 232),
(8, 'Siber güvenlik protokolü uygulandı.', 'Cybersecurity protocol is implemented.', 'Cybersäkerhetsprotokoll infördes.', 'Cybersicherheitsprotokoll wurde implementiert.', '[]', '[]', '[]', '[]', 'advanced', false, 233),
(8, 'Makine öğrenmesi modeli eğitildi.', 'Machine learning model is trained.', 'Maskininlärningsmodell tränades.', 'Maschinenlernmodell wurde trainiert.', '[]', '[]', '[]', '[]', 'advanced', false, 234),
(8, 'Blockchain teknolojisi kullanıldı.', 'Blockchain technology is used.', 'Blockchain-teknologi användes.', 'Blockchain-Technologie wurde verwendet.', '[]', '[]', '[]', '[]', 'advanced', false, 235),
(8, 'Veri madenciliği yapıldı.', 'Data mining is conducted.', 'Data mining genomfördes.', 'Data Mining wurde durchgeführt.', '[]', '[]', '[]', '[]', 'advanced', false, 236),
(8, 'İnternet of Things cihazları bağlandı.', 'IoT devices are connected.', 'IoT-enheter anslöts.', 'IoT-Geräte wurden verbunden.', '[]', '[]', '[]', '[]', 'advanced', false, 237),
(8, 'Gelişmiş analitik uygulandı.', 'Advanced analytics is applied.', 'Avancerad analys tillämpades.', 'Erweiterte Analytik wurde angewendet.', '[]', '[]', '[]', '[]', 'advanced', false, 238),
(8, 'Sanal gerçeklik deneyimi oluşturuldu.', 'Virtual reality experience is created.', 'Virtuell verklighetsupplevelse skapades.', 'Virtuelle Realitätserfahrung wurde erstellt.', '[]', '[]', '[]', '[]', 'advanced', false, 239),
(8, 'Otomatik yedekleme sistemi kuruldu.', 'Automatic backup system is set up.', 'Automatiskt säkerhetskopieringssystem installerades.', 'Automatisches Backup-System wurde eingerichtet.', '[]', '[]', '[]', '[]', 'advanced', false, 240);

-- Category 9: Beginner (10 sentences)
INSERT INTO sentences (category_id, text_tr, text_en, text_sv, text_de, keywords_tr, keywords_en, keywords_sv, keywords_de, difficulty, is_free, sort_order) VALUES
(9, 'Doktor randevusu al.', '*Make an appointment* with the doctor.', '*Boka tid* hos läkaren.', '*Termin machen* beim Arzt.', '["randevusu al", "make an appointment", "boka tid", "termin machen"]', '["make an appointment", "make an appointment", "boka tid", "termin machen"]', '["boka tid", "make an appointment", "boka tid", "termin machen"]', '["termin machen", "make an appointment", "boka tid", "termin machen"]', 'beginner', false, 241),
(9, 'Baş ağrım var.', 'I have a headache.', 'Jag har huvudvärk.', 'Ich habe Kopfschmerzen.', '[]', '[]', '[]', '[]', 'beginner', false, 242),
(9, 'İlaç al.', 'Take medicine.', 'Ta medicin.', 'Nimm Medizin.', '[]', '[]', '[]', '[]', 'beginner', false, 243),
(9, 'Spor yap.', 'Do exercise.', 'Gör motion.', 'Mache Sport.', '[]', '[]', '[]', '[]', 'beginner', false, 244),
(9, 'Su iç.', 'Drink water.', 'Drick vatten.', 'Trinke Wasser.', '[]', '[]', '[]', '[]', 'beginner', false, 245),
(9, 'Uyku al.', 'Get sleep.', 'Få sömn.', 'Bekomme Schlaf.', '[]', '[]', '[]', '[]', 'beginner', false, 246),
(9, 'Meyve ye.', 'Eat fruit.', 'Ät frukt.', 'Iss Obst.', '[]', '[]', '[]', '[]', 'beginner', false, 247),
(9, 'Doktoru ara.', 'Call the doctor.', 'Ring läkaren.', 'Rufe den Arzt an.', '[]', '[]', '[]', '[]', 'beginner', false, 248),
(9, 'Ağrı kesici al.', 'Take painkiller.', 'Ta smärtstillande.', 'Nimm Schmerzmittel.', '[]', '[]', '[]', '[]', 'beginner', false, 249),
(9, 'Kan basıncını ölç.', 'Measure blood pressure.', 'Mät blodtryck.', 'Messe Blutdruck.', '[]', '[]', '[]', '[]', 'beginner', false, 250);

-- Category 9: Intermediate (10 sentences)
INSERT INTO sentences (category_id, text_tr, text_en, text_sv, text_de, keywords_tr, keywords_en, keywords_sv, keywords_de, difficulty, is_free, sort_order) VALUES
(9, 'Spor salonuna git.', '*Work out* at the gym.', '*Träna* på gymmet.', '*Trainieren* im Fitnessstudio.', '["git", "work out", "träna", "trainieren"]', '["work out", "work out", "träna", "trainieren"]', '["träna", "work out", "träna", "trainieren"]', '["trainieren", "work out", "träna", "trainieren"]', 'intermediate', false, 251),
(9, 'İlacın yan etkileri var.', 'The medicine has *side effects*.', 'Medicinen har *biverkningar*.', 'Das Medikament hat *Nebenwirkungen*.', '["yan etkileri", "side effects", "biverkningar", "nebenwirkungen"]', '["side effects", "side effects", "biverkningar", "nebenwirkungen"]', '["biverkningar", "side effects", "biverkningar", "nebenwirkungen"]', '["nebenwirkungen", "side effects", "biverkningar", "nebenwirkungen"]', 'intermediate', false, 252),
(9, 'İyileşiyorum.', 'I''m *getting better*.', 'Jag *mår bättre*.', 'Ich werde *besser*.', '["iyileşiyorum", "getting better", "mår bättre", "besser"]', '["getting better", "getting better", "mår bättre", "besser"]', '["mår bättre", "getting better", "mår bättre", "besser"]', '["besser", "getting better", "mår bättre", "besser"]', 'intermediate', false, 253),
(9, 'Kendine iyi *bak*.', '*Take care* of yourself.', '*Ta hand om* dig själv.', '*Kümmere dich* um dich selbst.', '["bak", "take care", "ta hand om", "kümmere dich"]', '["take care", "take care", "ta hand om", "kümmere dich"]', '["ta hand om", "take care", "ta hand om", "kümmere dich"]', '["kümmere dich", "take care", "ta hand om", "kümmere dich"]', 'intermediate', false, 254),
(9, 'Fıstığa alerjim var.', 'I''m *allergic to* peanuts.', 'Jag är *allergisk mot* jordnötter.', 'Ich bin *allergisch gegen* Erdnüsse.', '["alerjim var", "allergic to", "allergisk mot", "allergisch gegen"]', '["allergic to", "allergic to", "allergisk mot", "allergisch gegen"]', '["allergisk mot", "allergic to", "allergisk mot", "allergisch gegen"]', '["allergisch gegen", "allergic to", "allergisk mot", "allergisch gegen"]', 'intermediate', false, 255),
(9, 'Beslenme düzenine dikkat et.', 'Pay attention to your diet.', 'Var uppmärksam på din kost.', 'Achte auf deine Ernährung.', '[]', '[]', '[]', '[]', 'intermediate', false, 256),
(9, 'Doktor muayenesi yapıldı.', 'Medical examination is done.', 'Läkarundersökning gjordes.', 'Arztuntersuchung wurde gemacht.', '[]', '[]', '[]', '[]', 'intermediate', false, 257),
(9, 'Vitamin takviyesi al.', 'Take vitamin supplements.', 'Ta vitamintillskott.', 'Nimm Vitaminpräparate.', '[]', '[]', '[]', '[]', 'intermediate', false, 258),
(9, 'Stresten kaçın.', 'Avoid stress.', 'Undvik stress.', 'Vermeide Stress.', '[]', '[]', '[]', '[]', 'intermediate', false, 259),
(9, 'Düzenli kontrole git.', 'Go for regular check-ups.', 'Gå på regelbundna kontroller.', 'Gehe zu regelmäßigen Kontrollen.', '[]', '[]', '[]', '[]', 'intermediate', false, 260);

-- Category 9: Advanced (10 sentences)
INSERT INTO sentences (category_id, text_tr, text_en, text_sv, text_de, keywords_tr, keywords_en, keywords_sv, keywords_de, difficulty, is_free, sort_order) VALUES
(9, 'Kronik hastalık teşhisi konuldu.', 'Chronic disease diagnosis is made.', 'Kronisk sjukdomsdiagnos ställdes.', 'Chronische Krankheitsdiagnose wurde gestellt.', '[]', '[]', '[]', '[]', 'advanced', false, 261),
(9, 'Fizik tedavi uygulandı.', 'Physical therapy is applied.', 'Fysioterapi tillämpades.', 'Physiotherapie wurde angewendet.', '[]', '[]', '[]', '[]', 'advanced', false, 262),
(9, 'Psikolojik danışmanlık alındı.', 'Psychological counseling is received.', 'Psykologisk rådgivning togs.', 'Psychologische Beratung wurde erhalten.', '[]', '[]', '[]', '[]', 'advanced', false, 263),
(9, 'Cerrahi müdahale yapıldı.', 'Surgical intervention is performed.', 'Kirurgisk intervention utfördes.', 'Chirurgischer Eingriff wurde durchgeführt.', '[]', '[]', '[]', '[]', 'advanced', false, 264),
(9, 'Kardiyovasküler sistem kontrol edildi.', 'Cardiovascular system is checked.', 'Kardiovaskulära systemet kontrollerades.', 'Herz-Kreislauf-System wurde überprüft.', '[]', '[]', '[]', '[]', 'advanced', false, 265),
(9, 'Endokrin sistem dengesi sağlandı.', 'Endocrine system balance is achieved.', 'Endokrina systemets balans uppnåddes.', 'Endokrines System Gleichgewicht wurde erreicht.', '[]', '[]', '[]', '[]', 'advanced', false, 266),
(9, 'Nörolojik muayene yapıldı.', 'Neurological examination is conducted.', 'Neurologisk undersökning genomfördes.', 'Neurologische Untersuchung wurde durchgeführt.', '[]', '[]', '[]', '[]', 'advanced', false, 267),
(9, 'Onkolojik tedavi planlandı.', 'Oncological treatment is planned.', 'Onkologisk behandling planlades.', 'Onkologische Behandlung wurde geplant.', '[]', '[]', '[]', '[]', 'advanced', false, 268),
(9, 'İmmün sistem güçlendirildi.', 'Immune system is strengthened.', 'Immunsystemet stärktes.', 'Immunsystem wurde gestärkt.', '[]', '[]', '[]', '[]', 'advanced', false, 269),
(9, 'Genetik test yapıldı.', 'Genetic test is performed.', 'Genetisk test utfördes.', 'Genetischer Test wurde durchgeführt.', '[]', '[]', '[]', '[]', 'advanced', false, 270);

-- Category 10: Beginner (10 sentences)
INSERT INTO sentences (category_id, text_tr, text_en, text_sv, text_de, keywords_tr, keywords_en, keywords_sv, keywords_de, difficulty, is_free, sort_order) VALUES
(10, 'Sosyal medyada paylaş.', 'Share on social media.', 'Dela på sociala medier.', 'Teile in sozialen Medien.', '[]', '[]', '[]', '[]', 'beginner', false, 271),
(10, 'Haber oku.', 'Read the news.', 'Läs nyheterna.', 'Lese die Nachrichten.', '[]', '[]', '[]', '[]', 'beginner', false, 272),
(10, 'Arkadaşlarla buluş.', 'Meet with friends.', 'Träffa vänner.', 'Triff Freunde.', '[]', '[]', '[]', '[]', 'beginner', false, 273),
(10, 'Film izle.', 'Watch a movie.', 'Titta på en film.', 'Schaue einen Film.', '[]', '[]', '[]', '[]', 'beginner', false, 274),
(10, 'Müzik dinle.', 'Listen to music.', 'Lyssna på musik.', 'Höre Musik.', '[]', '[]', '[]', '[]', 'beginner', false, 275),
(10, 'Fotoğraf paylaş.', 'Share a photo.', 'Dela ett foto.', 'Teile ein Foto.', '[]', '[]', '[]', '[]', 'beginner', false, 276),
(10, 'Yorum yaz.', 'Write a comment.', 'Skriv en kommentar.', 'Schreibe einen Kommentar.', '[]', '[]', '[]', '[]', 'beginner', false, 277),
(10, 'Beğeni ver.', 'Give a like.', 'Ge en like.', 'Gib ein Like.', '[]', '[]', '[]', '[]', 'beginner', false, 278),
(10, 'Takip et.', 'Follow.', 'Följ.', 'Folge.', '[]', '[]', '[]', '[]', 'beginner', false, 279),
(10, 'Mesaj gönder.', 'Send a message.', 'Skicka ett meddelande.', 'Sende eine Nachricht.', '[]', '[]', '[]', '[]', 'beginner', false, 280);

-- Category 10: Intermediate (10 sentences)
INSERT INTO sentences (category_id, text_tr, text_en, text_sv, text_de, keywords_tr, keywords_en, keywords_sv, keywords_de, difficulty, is_free, sort_order) VALUES
(10, 'Video *viral ol*.', 'The video *goes viral*.', 'Videon *blir viral*.', 'Das Video *geht viral*.', '["viral ol", "goes viral", "blir viral", "geht viral"]', '["goes viral", "goes viral", "blir viral", "geht viral"]', '["blir viral", "goes viral", "blir viral", "geht viral"]', '["geht viral", "goes viral", "blir viral", "geht viral"]', 'intermediate', false, 281),
(10, 'Arkadaşlarla *yetiş*.', '*Catch up* with friends.', '*Hänga ikapp* med vänner.', '*Aufholen* mit Freunden.', '["yetiş", "catch up", "hänga ikapp", "aufholen"]', '["catch up", "catch up", "hänga ikapp", "aufholen"]', '["hänga ikapp", "catch up", "hänga ikapp", "aufholen"]', '["aufholen", "catch up", "hänga ikapp", "aufholen"]', 'intermediate', false, 282),
(10, 'Trendleri *takip et*.', '*Keep up* with trends.', '*Hålla sig uppdaterad* med trender.', '*Auf dem Laufenden bleiben* mit Trends.', '["takip et", "keep up", "hålla sig uppdaterad", "auf dem laufenden bleiben"]', '["keep up", "keep up", "hålla sig uppdaterad", "auf dem laufenden bleiben"]', '["hålla sig uppdaterad", "keep up", "hålla sig uppdaterad", "auf dem laufenden bleiben"]', '["auf dem laufenden bleiben", "keep up", "hålla sig uppdaterad", "auf dem laufenden bleiben"]', 'intermediate', false, 283),
(10, 'Dizi *izle*.', '*Binge watch* the series.', '*Binge-titta* på serien.', '*Binge-watching* die Serie.', '["izle", "binge watch", "binge-titta", "binge-watching"]', '["binge watch", "binge watch", "binge-titta", "binge-watching"]', '["binge-titta", "binge watch", "binge-titta", "binge-watching"]', '["binge-watching", "binge watch", "binge-titta", "binge-watching"]', 'intermediate', false, 284),
(10, 'Akışı *kaydır*.', '*Scroll through* the feed.', '*Scrolla genom* flödet.', '*Durchscrollen* den Feed.', '["kaydır", "scroll through", "scrolla genom", "durchscrollen"]', '["scroll through", "scroll through", "scrolla genom", "durchscrollen"]', '["scrolla genom", "scroll through", "scrolla genom", "durchscrollen"]', '["durchscrollen", "scroll through", "scrolla genom", "durchscrollen"]', 'intermediate', false, 285),
(10, 'Arkadaşlarla *takıl*.', '*Hang out* with friends.', '*Hänga* med vänner.', '*Abhängen* mit Freunden.', '["takıl", "hang out", "hänga", "abhängen"]', '["hang out", "hang out", "hänga", "abhängen"]', '["hänga", "hang out", "hänga", "abhängen"]', '["abhängen", "hang out", "hänga", "abhängen"]', 'intermediate', false, 286),
(10, 'Çevre sorunlarına dikkat et.', 'Pay attention to environmental issues.', 'Var uppmärksam på miljöfrågor.', 'Achte auf Umweltprobleme.', '[]', '[]', '[]', '[]', 'intermediate', false, 287),
(10, 'Kültürel etkinliklere katıl.', 'Participate in cultural events.', 'Delta i kulturella evenemang.', 'Nimm an kulturellen Veranstaltungen teil.', '[]', '[]', '[]', '[]', 'intermediate', false, 288),
(10, 'Güncel olayları takip et.', 'Follow current events.', 'Följ aktuella händelser.', 'Verfolge aktuelle Ereignisse.', '[]', '[]', '[]', '[]', 'intermediate', false, 289),
(10, 'Toplumsal sorunları tartış.', 'Discuss social issues.', 'Diskutera samhällsfrågor.', 'Diskutiere gesellschaftliche Probleme.', '[]', '[]', '[]', '[]', 'intermediate', false, 290);

-- Category 10: Advanced (10 sentences)
INSERT INTO sentences (category_id, text_tr, text_en, text_sv, text_de, keywords_tr, keywords_en, keywords_sv, keywords_de, difficulty, is_free, sort_order) VALUES
(10, 'Sürdürülebilir kalkınma hedefleri desteklendi.', 'Sustainable development goals are supported.', 'Hållbara utvecklingsmål stöds.', 'Nachhaltige Entwicklungsziele werden unterstützt.', '[]', '[]', '[]', '[]', 'advanced', false, 291),
(10, 'Küresel ısınma etkileri tartışıldı.', 'Global warming effects are discussed.', 'Global uppvärmningseffekter diskuterades.', 'Globale Erwärmungseffekte wurden diskutiert.', '[]', '[]', '[]', '[]', 'advanced', false, 292),
(10, 'Dijital dönüşüm stratejileri geliştirildi.', 'Digital transformation strategies are developed.', 'Digitala transformationsstrategier utvecklades.', 'Digitale Transformationsstrategien wurden entwickelt.', '[]', '[]', '[]', '[]', 'advanced', false, 293),
(10, 'Çeşitlilik ve kapsayıcılık politikaları uygulandı.', 'Diversity and inclusion policies are implemented.', 'Mångfalds- och inkluderingsstrategier infördes.', 'Vielfalts- und Inklusionspolitiken wurden implementiert.', '[]', '[]', '[]', '[]', 'advanced', false, 294),
(10, 'Sosyal medya algoritmaları analiz edildi.', 'Social media algorithms are analyzed.', 'Sociala mediealgoritmer analyserades.', 'Sozialen Medien Algorithmen wurden analysiert.', '[]', '[]', '[]', '[]', 'advanced', false, 295),
(10, 'Kültürel miras koruma projeleri başlatıldı.', 'Cultural heritage preservation projects are launched.', 'Kulturarvsskyddsprojekt inleddes.', 'Kulturerbe-Schutzprojekte wurden gestartet.', '[]', '[]', '[]', '[]', 'advanced', false, 296),
(10, 'Toplumsal cinsiyet eşitliği kampanyaları yürütüldü.', 'Gender equality campaigns are conducted.', 'Jämställdhetskampanjer genomfördes.', 'Gleichstellungskampagnen wurden durchgeführt.', '[]', '[]', '[]', '[]', 'advanced', false, 297),
(10, 'İklim değişikliği adaptasyon planları hazırlandı.', 'Climate change adaptation plans are prepared.', 'Klimatförändringsanpassningsplaner förbereddes.', 'Klimawandel-Anpassungspläne wurden vorbereitet.', '[]', '[]', '[]', '[]', 'advanced', false, 298),
(10, 'Eğitim teknolojileri entegre edildi.', 'Educational technologies are integrated.', 'Utbildningsteknologier integrerades.', 'Bildungstechnologien wurden integriert.', '[]', '[]', '[]', '[]', 'advanced', false, 299),
(10, 'Toplumsal bilinç yükseltme çalışmaları yapıldı.', 'Social awareness raising activities are conducted.', 'Sociala medvetandehöjande aktiviteter genomfördes.', 'Soziale Bewusstseinssteigerungsaktivitäten wurden durchgeführt.', '[]', '[]', '[]', '[]', 'advanced', false, 300);