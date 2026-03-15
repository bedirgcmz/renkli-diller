-- profiles: kullanıcı kendi profilini okur/günceller
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- categories: herkes okuyabilir
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can read categories" ON categories FOR SELECT USING (true);

-- sentences: herkes okuyabilir
ALTER TABLE sentences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can read sentences" ON sentences FOR SELECT USING (true);

-- user_sentences: sadece kendi cümleleri
ALTER TABLE user_sentences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own sentences" ON user_sentences FOR ALL USING (auth.uid() = user_id);

-- user_progress: sadece kendi ilerlemesi
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own progress" ON user_progress FOR ALL USING (auth.uid() = user_id);

-- daily_stats: sadece kendi istatistikleri
ALTER TABLE daily_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own stats" ON daily_stats FOR ALL USING (auth.uid() = user_id);

-- quiz_results: sadece kendi sonuçları
ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own quiz results" ON quiz_results FOR ALL USING (auth.uid() = user_id);
