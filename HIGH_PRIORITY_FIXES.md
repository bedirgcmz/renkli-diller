# High Priority Release Fixes

## 1. Auth / account switch stale state reset
Fixed.
How: `signOut`, `deleteAccount` ve `SIGNED_OUT` tarafında sentence, progress, leaderboard, achievements, reading, games ve settings store'ları temizlendi; böylece hesap değişiminde eski kullanıcının cache/state verisi yeni oturuma sızmıyor.

## 2. Password recovery completion flow
Fixed.
How: Deep link ile gelen `auth/reset-password` recovery session'ı artık store üzerinde işaretleniyor ve app kullanıcıyı doğrudan yeni şifre belirleme ekranına alıyor; şifre güncellendiğinde recovery state temizleniyor.

## 3. Premium preset content leakage in study modes
Fixed.
How: `Learn`, `Quiz`, `Build Sentence` ve `Auto Mode` preset yüklemeleri artık aktif kullanıcının `isPremium` durumunu açıkça geçiriyor; free kullanıcılar premium preset havuzuna düşmüyor.

## 4. Quiz / Auto Mode release safety gaps
Fixed.
How: Multiple choice modunda yeterli distractor yoksa boş session yerine güvenli empty-state gösteriliyor; `Auto Mode` streak/study session kaydı da artık sadece gerçekten tamamlanan session sonunda yazılıyor.

## 5. Dialog silent failure / replay routing
Fixed.
How: Dialog start sırasında boş veya bozuk scenario setleri reject ediliyor, setup ekranında sessiz kalmak yerine hata gösteriliyor, play ekranında sonsuz spinner yerine fallback state var ve learned replay artık doğrudan doğru nested route'a gidiyor.

## 6. AI Translator user-scoped safety
Fixed.
How: AI trial sayaç/cache anahtarları kullanıcıya özel hale getirildi; ayrıca translator save akışındaki shared `categories` tablosuna global kayıt açan yeni kategori üretimi kaldırıldı ve save sadece mevcut kategoriler üzerinden güvenli bırakıldı.

## 7. Games user filter logic
Fixed.
How: Game pool builder artık `user_sentences` tarafında yanlış `status` alanı yerine `state` kullanıyor, aktif dil çiftini filtreliyor ve user filter'larda anlamsız keyword-to-keyword eşleşmesi yerine gerçek source/target sentence çiftlerinden item üretiyor.

## 8. Notification default / schedule mismatch
Fixed.
How: Varsayılan notification ayarı opt-in olacak şekilde güvenli hale getirildi, settings yüklenirken schedule state pasif biçimde tekrar senkronize ediliyor ve kullanıcı manuel açtığında izin + schedule tek bir güvenli helper üzerinden çalışıyor.

## 9. Edit sentence null crash guard
Fixed.
How: Düzenlenen cümle store'da artık yoksa ekran render başlamadan `null` dönüyor; böylece `sentence.is_preset` erişimindeki olası crash kapanmış oldu.
