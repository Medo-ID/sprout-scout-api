export interface Plant {
  id: string;
  common_name: string;
  family: string | null;
  cultivar: string | null;
  species_epithet: string | null;
  genus: string | null;
  watering_frequency_days: number;
  sunlight: string[] | null;
  external_api_id: string | null;
  is_custom: boolean;
  custom_watering_frequency_days: number | null;
  default_image: string | undefined;
  created_at: Date;
}
