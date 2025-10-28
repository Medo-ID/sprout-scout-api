import { PlantSchema } from "../libs/schemas/plant.schema";
import { ExternalPlant } from "../libs/types/external-api";
import { Plant } from "../libs/types/plant";
import { PlantRepository } from "../repositories/plant";
import { ExternalPlantService } from "./external-api";
export class PlantsService {
  constructor(
    private plantRepo = new PlantRepository(),
    private externalApiService = new ExternalPlantService()
  ) {}
  private async restructApiPlantData(
    data: ExternalPlant
  ): Promise<PlantSchema | undefined> {
    const details = await this.externalApiService.getSpeciesDetails(data.id);
    if (details) {
      const wateringValue = details.watering_general_benchmark.value;
      const match = wateringValue.match(/(\d+)(?:\s*-\s*(d+))?/);
      const wateringFrequencyDays = match && Number(match[1]);
      if (wateringFrequencyDays) {
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
  }

  public async searchForPlants(
    query: string
  ): Promise<(Plant | ExternalPlant)[]> {
    try {
      const databasePlants = await this.plantRepo.searchByName(query);
      if (databasePlants.length > 0) {
        return databasePlants;
      }
      const plants = await this.externalApiService.searchSpecies(query);
      return plants || [];
    } catch (error) {
      console.error("Error searching for plants:", error);
      return [];
    }
  }

  public async savePlants(plantsData: ExternalPlant[]): Promise<string[]> {
    const plantIds: string[] = [];
    for (const plantData of plantsData) {
      const isExistsInDatabase = await this.plantRepo.findByExternalApiId(
        plantData.id
      );
      if (!isExistsInDatabase) {
        const data = await this.restructApiPlantData(plantData);
        if (data) {
          try {
            const result = await this.plantRepo.insert(data);
            result && plantIds.push(result.id);
          } catch (error) {}
        }
      }
    }
    return plantIds;
  }
}
