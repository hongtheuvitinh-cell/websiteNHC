-- Create tables for the school website

-- News table
CREATE TABLE news (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  summary TEXT,
  content TEXT,
  date DATE DEFAULT CURRENT_DATE,
  category TEXT,
  image_url TEXT,
  detail_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admissions table
CREATE TABLE admissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  summary TEXT,
  content TEXT,
  deadline DATE,
  year INTEGER,
  document_url TEXT,
  detail_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Features table
CREATE TABLE features (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT,
  order_num INTEGER DEFAULT 0,
  detail_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Youth Union table
CREATE TABLE youth_union (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  summary TEXT,
  content TEXT,
  date DATE DEFAULT CURRENT_DATE,
  image_url TEXT,
  detail_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Departments table
CREATE TABLE departments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT,
  description TEXT,
  detail_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Personnel table
CREATE TABLE personnel (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  dept_id UUID REFERENCES departments(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  position TEXT,
  bio TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activities table
CREATE TABLE activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  dept_id UUID REFERENCES departments(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  date DATE DEFAULT CURRENT_DATE,
  summary TEXT,
  description TEXT,
  image_url TEXT,
  document_url TEXT,
  content TEXT,
  detail_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dept Documents table
CREATE TABLE dept_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  dept_id UUID REFERENCES departments(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Achievements table
CREATE TABLE achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  student_name TEXT,
  class TEXT,
  year TEXT,
  award TEXT,
  image_url TEXT,
  type TEXT,
  description TEXT,
  detail_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Schedules table
CREATE TABLE schedules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  week TEXT,
  date_range TEXT,
  content TEXT,
  file_url TEXT,
  start_date DATE,
  end_date DATE,
  detail_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Gallery table
CREATE TABLE gallery (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  image_url TEXT,
  category TEXT,
  description TEXT,
  detail_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Static Content tables
CREATE TABLE home_content (
  id TEXT PRIMARY KEY,
  banner_title TEXT,
  banner_description TEXT,
  banner_image TEXT,
  render_type TEXT DEFAULT 'standard',
  html_content TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE about_content (
  id TEXT PRIMARY KEY,
  main_text TEXT,
  history TEXT,
  core_values TEXT,
  render_type TEXT DEFAULT 'standard',
  html_content TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE admissions_content (
  id TEXT PRIMARY KEY,
  render_type TEXT DEFAULT 'standard',
  html_content TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE news_content (
  id TEXT PRIMARY KEY,
  render_type TEXT DEFAULT 'standard',
  html_content TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE school_info (
  id TEXT PRIMARY KEY,
  name TEXT,
  slogan TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  render_type TEXT DEFAULT 'standard',
  html_content TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert initial data for static content
INSERT INTO home_content (id) VALUES ('main');
INSERT INTO about_content (id) VALUES ('main');
INSERT INTO admissions_content (id) VALUES ('main');
INSERT INTO news_content (id) VALUES ('main');
INSERT INTO school_info (id) VALUES ('main');

-- Enable Row Level Security (RLS)
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE admissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE features ENABLE ROW LEVEL SECURITY;
ALTER TABLE youth_union ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE personnel ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE dept_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE home_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE about_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE admissions_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_info ENABLE ROW LEVEL SECURITY;

-- Create policies (Allow public read, authenticated write)
-- Note: Replace 'trieuhaminh@gmail.com' with your admin email if needed
CREATE POLICY "Public read access" ON news FOR SELECT USING (true);
CREATE POLICY "Admin write access" ON news FOR ALL USING (auth.jwt() ->> 'email' = 'trieuhaminh@gmail.com');

CREATE POLICY "Public read access" ON admissions FOR SELECT USING (true);
CREATE POLICY "Admin write access" ON admissions FOR ALL USING (auth.jwt() ->> 'email' = 'trieuhaminh@gmail.com');

CREATE POLICY "Public read access" ON features FOR SELECT USING (true);
CREATE POLICY "Admin write access" ON features FOR ALL USING (auth.jwt() ->> 'email' = 'trieuhaminh@gmail.com');

CREATE POLICY "Public read access" ON youth_union FOR SELECT USING (true);
CREATE POLICY "Admin write access" ON youth_union FOR ALL USING (auth.jwt() ->> 'email' = 'trieuhaminh@gmail.com');

CREATE POLICY "Public read access" ON departments FOR SELECT USING (true);
CREATE POLICY "Admin write access" ON departments FOR ALL USING (auth.jwt() ->> 'email' = 'trieuhaminh@gmail.com');

CREATE POLICY "Public read access" ON personnel FOR SELECT USING (true);
CREATE POLICY "Admin write access" ON personnel FOR ALL USING (auth.jwt() ->> 'email' = 'trieuhaminh@gmail.com');

CREATE POLICY "Public read access" ON activities FOR SELECT USING (true);
CREATE POLICY "Admin write access" ON activities FOR ALL USING (auth.jwt() ->> 'email' = 'trieuhaminh@gmail.com');

CREATE POLICY "Public read access" ON dept_documents FOR SELECT USING (true);
CREATE POLICY "Admin write access" ON dept_documents FOR ALL USING (auth.jwt() ->> 'email' = 'trieuhaminh@gmail.com');

CREATE POLICY "Public read access" ON achievements FOR SELECT USING (true);
CREATE POLICY "Admin write access" ON achievements FOR ALL USING (auth.jwt() ->> 'email' = 'trieuhaminh@gmail.com');

CREATE POLICY "Public read access" ON schedules FOR SELECT USING (true);
CREATE POLICY "Admin write access" ON schedules FOR ALL USING (auth.jwt() ->> 'email' = 'trieuhaminh@gmail.com');

CREATE POLICY "Public read access" ON gallery FOR SELECT USING (true);
CREATE POLICY "Admin write access" ON gallery FOR ALL USING (auth.jwt() ->> 'email' = 'trieuhaminh@gmail.com');

CREATE POLICY "Public read access" ON home_content FOR SELECT USING (true);
CREATE POLICY "Admin write access" ON home_content FOR ALL USING (auth.jwt() ->> 'email' = 'trieuhaminh@gmail.com');

CREATE POLICY "Public read access" ON about_content FOR SELECT USING (true);
CREATE POLICY "Admin write access" ON about_content FOR ALL USING (auth.jwt() ->> 'email' = 'trieuhaminh@gmail.com');

CREATE POLICY "Public read access" ON admissions_content FOR SELECT USING (true);
CREATE POLICY "Admin write access" ON admissions_content FOR ALL USING (auth.jwt() ->> 'email' = 'trieuhaminh@gmail.com');

CREATE POLICY "Public read access" ON news_content FOR SELECT USING (true);
CREATE POLICY "Admin write access" ON news_content FOR ALL USING (auth.jwt() ->> 'email' = 'trieuhaminh@gmail.com');

CREATE POLICY "Public read access" ON school_info FOR SELECT USING (true);
CREATE POLICY "Admin write access" ON school_info FOR ALL USING (auth.jwt() ->> 'email' = 'trieuhaminh@gmail.com');
