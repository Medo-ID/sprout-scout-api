import dotenv from "dotenv";
import {
  ExternalPlant,
  ExternalPlantDetail,
} from "@/libs/types/external-api.types";

dotenv.config();

const API_KEY = process.env.EXTERNAL_API_KEY;

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
