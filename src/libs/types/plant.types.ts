export interface Plant {
  id: string;
  name: string;
  watering_frequency_days: number;
  sunlight: string | null;
  care_instructions: string | null;
  external_api_id: string | null;
  is_custom: boolean;
  custom_watering_frequency_days: number | null;
  created_at: Date;
}
