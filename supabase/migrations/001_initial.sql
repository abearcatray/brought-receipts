-- Work Wins Log — Initial Schema
-- Run this in Supabase SQL Editor or via supabase db push

CREATE TABLE entries (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  description  TEXT,
  date_of_work DATE NOT NULL DEFAULT CURRENT_DATE,
  project      TEXT,
  impact       TEXT,
  visibility   TEXT NOT NULL DEFAULT 'private' CHECK (visibility IN ('private', 'manager')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE entry_links (
  id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id UUID NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
  url      TEXT NOT NULL,
  label    TEXT
);

CREATE TABLE entry_files (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id          UUID NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
  storage_path      TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  mime_type         TEXT,
  file_size         BIGINT
);

CREATE TABLE entry_tags (
  entry_id UUID NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
  tag      TEXT NOT NULL,
  PRIMARY KEY (entry_id, tag)
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER entries_updated_at
  BEFORE UPDATE ON entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Row Level Security
ALTER TABLE entries    ENABLE ROW LEVEL SECURITY;
ALTER TABLE entry_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE entry_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE entry_tags  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users own entries"    ON entries    USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "users own links"      ON entry_links USING (entry_id IN (SELECT id FROM entries WHERE user_id = auth.uid()));
CREATE POLICY "users own files"      ON entry_files USING (entry_id IN (SELECT id FROM entries WHERE user_id = auth.uid()));
CREATE POLICY "users own tags"       ON entry_tags  USING (entry_id IN (SELECT id FROM entries WHERE user_id = auth.uid()));

-- Storage bucket setup (run after creating the "wins" bucket in Supabase dashboard):
-- Bucket name: wins | Public: false | Max file size: 10MB | Allowed types: image/*, application/pdf

CREATE POLICY "users upload own files" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'wins' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "users read own files" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'wins' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "users delete own files" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'wins' AND (storage.foldername(name))[1] = auth.uid()::text);
