-- Basic schema for DACMS
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  full_name TEXT NOT NULL,
  gender VARCHAR(16),
  dob DATE,
  gov_id VARCHAR(128),
  email VARCHAR(255) UNIQUE,
  password_hash TEXT,
  role VARCHAR(32) DEFAULT 'communityMember',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS committees (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS budgets (
  id SERIAL PRIMARY KEY,
  committee_id INTEGER REFERENCES committees(id),
  amount NUMERIC,
  document_url TEXT,
  status VARCHAR(32) DEFAULT 'pending',
  initiated_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  committee_id INTEGER REFERENCES committees(id),
  description TEXT,
  status VARCHAR(32) DEFAULT 'pending',
  start_date DATE,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS otps (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  code VARCHAR(8) NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS project_media (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  uploader_id INTEGER REFERENCES users(id),
  url TEXT,
  public_id TEXT,
  type VARCHAR(32),
  created_at TIMESTAMP DEFAULT NOW()
);
