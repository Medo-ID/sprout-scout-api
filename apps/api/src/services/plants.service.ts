import { PlantSchema } from "@schemas/plants.schema";
import { PlantRepository } from "../repositories/plants.repository";
import { ExternalPlant, ExternalPlantService } from "./external-api.service";

const plantsRepo = new PlantRepository();
const externalApiService = new ExternalPlantService();

interface ApiData {
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

export class PlantsService {
  async searchForPlants(query: string): Promise<ExternalPlant[] | undefined> {
    const plants = await externalApiService.searchSpecies(query);
    return plants;
  }

  async savePlants(plantsData: ApiData[]) {
    for (const plantData of plantsData) {
      const isExistsInDatabase = await plantsRepo.findByExternalApiId(
        plantData.id
      );
      if (!isExistsInDatabase) {
        await plantsRepo.insert();
      }
    }
  }

  async addPlants() {}

  async createCustomPlants(data: PlantSchema) {}

  async updateCustomPlant(data: Partial<PlantSchema>) {}

  async deleteCustomPlant(ids: string[]) {}
}
