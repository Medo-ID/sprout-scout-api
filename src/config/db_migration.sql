-- Enable UUID extension (only needs to be run once per database)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  picture_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Auth providers
CREATE TABLE auth_providers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('local', 'google')),
  provider_user_id TEXT,
  password_hash TEXT,
  UNIQUE (provider, provider_user_id)
);

-- 3. Gardens (user grouping for plants)
CREATE TABLE gardens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Plants (base reference library)
CREATE TABLE plants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  common_name TEXT NOT NULL,
  family TEXT,
  cultivar TEXT,
  species_epithet TEXT,
  genus TEXT,
  watering_frequency_days INT NOT NULL CHECK (watering_frequency_days > 0),
  sunlight TEXT[],
  external_api_id INT UNIQUE,
  is_custom BOOLEAN DEFAULT FALSE,
  custom_watering_frequency_days INT CHECK (
    (isCustom = TRUE AND customWateringFrequencyDays > 0)
    OR (isCustom = FALSE)
  ),
  default_image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. User’s specific plants
CREATE TABLE user_plants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE,
  plant_id UUID REFERENCES plants(id) ON DELETE CASCADE,
  planted_at DATE DEFAULT CURRENT_DATE
);

-- 6. Watering logs
CREATE TABLE watering_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_plant_id UUID REFERENCES user_plants(id) ON DELETE CASCADE,
  watered_at TIMESTAMPTZ DEFAULT NOW(),
  note TEXT
);

-- 7. Garden tasks
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  due_date DATE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'done'))
);

-- Indexes
CREATE INDEX idx_plants_name ON plants (LOWER(name));
CREATE INDEX idx_plants_external_api_id ON plants (external_api_id);
CREATE INDEX idx_user_plants_garden ON user_plants (garden_id);
CREATE INDEX idx_watering_logs_user_plant ON watering_logs (user_plant_id, watered_at DESC);
