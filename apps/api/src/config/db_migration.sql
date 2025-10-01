-- Enable UUID extension (only needs to be run once per database)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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

CREATE TABLE plants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  common_name TEXT NOT NULL,
  scientific_name TEXT,
  watering_interval_days INT NOT NULL CHECK (watering_frequency_days > 0),
  sunlight TEXT,
  care_instructions TEXT,
  external_api_id TEXT UNIQUE,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE gardens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  location TEXT,
  created_at TIMESTAMP DEFAULT now()
)

CREATE TABLE user_plants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE,
  plant_id UUID REFERENCES plants(id) ON DELETE CASCADE,
  nickname TEXT,
  custom_watering_interval_days INT,
  last_watered_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_plants_name ON plants (lower(name));
CREATE INDEX idx_plants_external_api_id ON plants (external_api_id);
CREATE INDEX idx_user_plants_garden ON user_plants (garden_id);
CREATE INDEX idx_watering_log_user_plant ON watering_log (user_plant_id, watered_at DESC);
