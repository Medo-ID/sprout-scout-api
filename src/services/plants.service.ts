import { PlantRepository } from "@/repositories/plants.repository";
import { ExternalPlantService } from "./external-api.service";
import { ExternalPlant } from "@/libs/types/external-api.types";
import { PlantSchema } from "@/libs/schemas/plants.schema";

const plantsRepo = new PlantRepository();
const externalApiService = new ExternalPlantService();

export class PlantsService {
  async searchForPlants(query: string): Promise<ExternalPlant[] | undefined> {
    const plants = await externalApiService.searchSpecies(query);
    return plants;
  }

  async savePlants(plantsData: ExternalPlant[]) {
    for (const plantData of plantsData) {
      const isExistsInDatabase = await plantsRepo.findByExternalApiId(
        plantData.id
      );
      if (!isExistsInDatabase) {
        // TODO:
        // before passing the data we need to process it and prepare it for insertion
        // create a plant object that holds the needed data with proper types for insert method
        // await plantsRepo.insert(plantData);
      }
    }
  }

  async addPlants() {}

  async createCustomPlants(data: PlantSchema) {}

  async updateCustomPlant(data: Partial<PlantSchema>) {}

  async deleteCustomPlant(ids: string[]) {}
}
