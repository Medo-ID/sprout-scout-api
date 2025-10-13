import { PlantRepository } from "@/repositories/plants.repository";
import { ExternalPlantService } from "./external-api.service";
import { ExternalPlant } from "@/libs/types/external-api.types";
import { PlantSchema } from "@/libs/schemas/plants.schema";
import { Plant } from "@/libs/types/plant.types";

const plantsRepo = new PlantRepository();
const externalApiService = new ExternalPlantService();

export class PlantsService {
  private async restructApiPlantData(
    data: ExternalPlant
  ): Promise<PlantSchema | undefined> {
    const details = await externalApiService.getSpeciesDetails(data.id);
    const wateringValue = details.watering_general_benchmark.value;
    const match = wateringValue.match(/(\d+)(?:\s*-\s*(d+))?/);
    const wateringFrequencyDays = match && Number(match[1]);
    if (details && wateringFrequencyDays) {
      return {
        common_name: data.common_name,
        watering_frequency_days: wateringFrequencyDays,
        sunlight: details.sunlight,
        external_api_id: data.id,
        is_custom: false,
        custom_watering_frequency_days: null,
        family: data.family,
        cultivar: data.cultivar,
        species_epithet: data.species_epithet,
        genus: data.genus,
        default_image: data.default_image.regular_url,
      };
    }
  }

  public async searchForPlants(
    query: string
  ): Promise<Plant[] | ExternalPlant[] | undefined> {
    const databasePlants = await plantsRepo.searchByName(query);
    if (databasePlants.length > 0) {
      return databasePlants;
    }
    const plants = await externalApiService.searchSpecies(query);
    return plants;
  }
  // TODO: Re design the logic behind the user -> plant business logic
  public async savePlants(plantsData: ExternalPlant[]): Promise<string[]> {
    const plantIds: string[] = [];
    for (const plantData of plantsData) {
      const isExistsInDatabase = await plantsRepo.findByExternalApiId(
        plantData.id
      );
      if (!isExistsInDatabase) {
        const data = await this.restructApiPlantData(plantData);
        const result = data && (await plantsRepo.insert(data));
        result && plantIds.push(result.id);
      }
    }
    return plantIds;
  }

  // async addPlants() {}

  // async createCustomPlants(data: PlantSchema) {}

  // async updateCustomPlant(data: Partial<PlantSchema>) {}

  // async deleteCustomPlant(ids: string[]) {}
}
