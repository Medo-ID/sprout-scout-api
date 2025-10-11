export interface ExternalPlant {
  id: number;
  common_name: string;
  scientific_name: string[];
  family: string;
  hybrid: string;
  authority: string | null;
  subspecies: string | null;
  cultivar: string | null;
  variety: string | null;
  pecies_epithet: string | null;
  genus: string | null;
  default_image: string | null;
}

export interface ExternalPlantDetail {
  id: number;
  watering: string;
  watering_general_benchmark: {
    value: string;
    unit: string;
  };
  sunlight: string[];
  maintenance: string;
  growth_rate: string;
  care_level: string;
  medicinal: boolean;
  description: string;
}
