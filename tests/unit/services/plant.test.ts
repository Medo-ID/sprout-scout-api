import { PlantRepository } from "@/repositories/plant";
import { ExternalPlantService } from "@/services/external-api";
import { PlantsService } from "@/services/plant";

describe("Plant Service", () => {
  const mockPlantData = {
    id: 123,
    common_name: "Full Example",
    scientific_name: ["Fullus exampleus"],
    family: "Exampleaceae",
    hybrid: "",
    authority: "L.",
    subspecies: "subsp. example",
    cultivar: "Examplecultivar",
    variety: "var. exemplar",
    species_epithet: "exampleus",
    genus: "Fullus",
    default_image: { regular_url: "https://example.com/image2.jpg" },
  };

  const mockExternalData = {
    id: 123,
    watering:
      "Water moderately; keep soil evenly moist but avoid waterlogging.",
    watering_general_benchmark: {
      value: '"7-10"',
      unit: "days",
    },
    sunlight: ["partial shade", "bright indirect"],
    maintenance: "Low — trim dead leaves and occasional feed in spring.",
    growth_rate: "moderate",
    care_level: "easy",
    medicinal: false,
    description:
      "A compact, resilient houseplant with glossy leaves and small clusters of white flowers. Good for beginners.",
  };

  let plantService: PlantsService;
  let mockPlantRepo: jest.Mocked<PlantRepository>;
  let mockExternalApiService: jest.Mocked<ExternalPlantService>;

  beforeEach(() => {
    jest.resetAllMocks();
    mockPlantRepo = {
      insert: jest.fn(),
      searchByName: jest.fn(),
      findByExternalApiId: jest.fn(),
    } as any;
    mockExternalApiService = {
      searchSpecies: jest.fn(),
      getSpeciesDetails: jest.fn(),
    } as any;
    plantService = new PlantsService(mockPlantRepo, mockExternalApiService);
  });

  describe("restructApiPlantData", () => {
    it("should return plant data with watering and sunlight instructions", async () => {
      mockExternalApiService.getSpeciesDetails.mockResolvedValueOnce(
        mockExternalData
      );
      const result = await (plantService as any).restructApiPlantData(
        mockPlantData
      );
      expect(mockExternalApiService.getSpeciesDetails).toHaveBeenCalledWith(
        123
      );
      expect(result).toBeDefined();
      expect(result).toMatchObject({
        common_name: mockPlantData.common_name,
        watering_frequency_days: 7,
        sunlight: mockExternalData.sunlight,
        external_api_id: mockPlantData.id,
        is_custom: false,
        custom_watering_frequency_days: null,
        family: mockPlantData.family,
        cultivar: mockPlantData.cultivar,
        species_epithet: mockPlantData.species_epithet,
        genus: mockPlantData.genus,
        default_image: mockPlantData.default_image.regular_url,
      });
    });
  });

  it("should return undefined when plant details is invalid", async () => {
    mockExternalApiService.getSpeciesDetails.mockResolvedValueOnce(undefined);
    const result = await (plantService as any).restructApiPlantData(
      mockPlantData
    );
    expect(result).toBeUndefined();
  });

  it("should return undefined when watering text has no numeric value", async () => {
    const badDetail = {
      ...mockExternalData,
      watering_general_benchmark: { value: "no numbers", unit: "days" },
    };
    mockExternalApiService.getSpeciesDetails.mockResolvedValueOnce(badDetail);
    const result = await (plantService as any).restructApiPlantData(
      mockPlantData
    );
    expect(mockExternalApiService.getSpeciesDetails).toHaveBeenCalledWith(123);
    expect(result).toBeUndefined();
  });
});
