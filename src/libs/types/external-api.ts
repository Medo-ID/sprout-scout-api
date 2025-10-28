export interface ExternalPlant {
  id: number;
  common_name: string;
  scientific_name: string[];
  family: string;
  hybrid: string;
  authority: string | null;
  subspecies: string | null;
  cultivar: string | undefined;
  variety: string | undefined;
  species_epithet: string | undefined;
  genus: string | undefined;
  default_image: {
    regular_url: string | undefined;
  };
}

export interface ExternalPlantDetail extends Partial<ExternalPlant> {
  id: number;
  watering?: string;
  watering_general_benchmark: {
    value: string;
    unit: string;
  };
  sunlight: string[];
  maintenance?: string;
  growth_rate?: string;
  care_level?: string;
  medicinal?: boolean;
  description?: string;
}
