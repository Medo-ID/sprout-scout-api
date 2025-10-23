import { ExternalPlant, ExternalPlantDetail } from "@/libs/types/external-api";
import dotenv from "dotenv";

dotenv.config();

const API_KEY = process.env.EXTERNAL_API_KEY;

export class ExternalPlantService {
  constructor(private fetcher = fetch, private apiKey = API_KEY) {}

  async searchSpecies(query: string): Promise<ExternalPlant[] | undefined> {
    const response = await this.fetcher(
      `https://perenual.com/api/v2/species-list?key=${this.apiKey}&q=${query}`
    );
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  }

  async getSpeciesDetails(
    externalId: number
  ): Promise<ExternalPlantDetail | undefined> {
    const response = await this.fetcher(
      `https://perenual.com/api/v2/species/details/${externalId}?key=${this.apiKey}`
    );
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  }
}
