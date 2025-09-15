-- Enable UUID extension (only needs to be run once per database)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE plants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  common_name TEXT NOT NULL,
  scientific_name TEXT,
  watering_interval_days INT,   -- default from API
  sunlight TEXT,
  care_instructions TEXT,
  external_api_id TEXT UNIQUE,  -- to avoid duplicates
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  picture_url TEXT,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE auth_providers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,          -- 'local' | 'google'
  provider_user_id TEXT,           -- google_id, etc.
  password_hash TEXT,              -- only for 'local'
  UNIQUE (provider, provider_user_id)
);

CREATE TABLE user_plants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  plant_id UUID REFERENCES plants(id), -- always references cached plant
  nickname TEXT,                       -- e.g., "Balcony Basil"
  custom_watering_interval_days INT,   -- override if user wants
  last_watered_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now()
);
