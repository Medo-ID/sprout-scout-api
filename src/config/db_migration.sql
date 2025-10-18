CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  picture_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS auth_providers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('local', 'google')),
  provider_user_id TEXT,
  password_hash TEXT,
  refresh_token TEXT,
  UNIQUE (provider, provider_user_id)
);

CREATE TABLE IF NOT EXISTS gardens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS plants (
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
    (is_custom = TRUE AND custom_watering_frequency_days > 0)
    OR (is_custom = FALSE)
  ),
  default_image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_plants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE,
  plant_id UUID REFERENCES plants(id) ON DELETE CASCADE,
  planted_at DATE DEFAULT CURRENT_DATE
);

CREATE TABLE IF NOT EXISTS watering_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_plant_id UUID REFERENCES user_plants(id) ON DELETE CASCADE,
  watered_at TIMESTAMPTZ DEFAULT NOW(),
  note TEXT
);

CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  due_date DATE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'done'))
);

CREATE INDEX IF NOT EXISTS idx_plants_common_name ON plants (LOWER(common_name));
CREATE INDEX IF NOT EXISTS idx_plants_external_api_id ON plants (external_api_id);
CREATE INDEX IF NOT EXISTS idx_user_plants_garden ON user_plants (garden_id);
CREATE INDEX IF NOT EXISTS idx_watering_logs_user_plant ON watering_logs (user_plant_id, watered_at DESC);
