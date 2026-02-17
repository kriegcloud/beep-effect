-- Schema dump for testing purposes

CREATE TABLE
  file_folders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    user_id UUID NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now (),
    updated_at TIMESTAMPTZ DEFAULT now ()
  );

CREATE TABLE
  files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    user_id UUID NOT NULL,
    folder_id UUID REFERENCES file_folders (id) ON DELETE CASCADE,
    uploadthing_key TEXT NOT NULL UNIQUE,
    uploadthing_url TEXT NOT NULL,
    name TEXT NOT NULL,
    size TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    uploaded_by_user_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now (),
    updated_at TIMESTAMPTZ DEFAULT now ()
  );

CREATE INDEX idx_files_user_id ON files (user_id);
CREATE INDEX idx_files_folder_id ON files (folder_id);
CREATE INDEX idx_files_uploadthing_key ON files (uploadthing_key);
CREATE INDEX idx_file_folders_user_id ON file_folders (user_id);
