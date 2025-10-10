import dotenv from "dotenv";

dotenv.config();

const API_KEY = process.env.EXTERNAL_API_KEY;

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

export class ExternalPlantService {
  async searchSpecies(query: string): Promise<ExternalPlant[]> {
    const response = await fetch(
      `https://perenual.com/api/v2/species-list?key=${API_KEY}&q=${query}`
    );
    const data = await response.json();
    return data;
  }

  async getSpeciesDetails(externalId: number): Promise<ExternalPlantDetail> {
    const response = await fetch(
      `https://perenual.com/api/v2/species/details/${externalId}?key=${API_KEY}`
    );
    const data = await response.json();
    return data;
  }
}
