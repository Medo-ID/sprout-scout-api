import { PlantRepository } from "../../../src/repositories/plant";
import { ExternalPlantService } from "../../../src/services/external-api";
import { PlantsService } from "../../../src/services/plant";

describe("Plant Service", () => {
  const dbPlant = {
    id: "uuid-example",
    common_name: "Full Example",
    family: "Exampleaceae",
    cultivar: "Examplecultivar",
    species_epithet: "exampleus",
    genus: "Fullus",
    watering_frequency_days: 7,
    sunlight: ["partial shade", "bright indirect"],
    external_api_id: "123",
    is_custom: false,
    custom_watering_frequency_days: null,
    default_image: "https://example.com/image2.jpg",
    created_at: new Date(),
  };
  const mockExternalPlant = {
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
  const mockExternalDetails = {
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
        mockExternalDetails
      );
      const result = await (plantService as any).restructApiPlantData(
        mockExternalPlant
      );
      expect(mockExternalApiService.getSpeciesDetails).toHaveBeenCalledWith(
        123
      );
      expect(result).toBeDefined();
      expect(result).toMatchObject({
        common_name: mockExternalPlant.common_name,
        watering_frequency_days: 7,
        sunlight: mockExternalDetails.sunlight,
        external_api_id: mockExternalPlant.id,
        is_custom: false,
        custom_watering_frequency_days: null,
        family: mockExternalPlant.family,
        cultivar: mockExternalPlant.cultivar,
        species_epithet: mockExternalPlant.species_epithet,
        genus: mockExternalPlant.genus,
        default_image: mockExternalPlant.default_image.regular_url,
      });
    });

    it("should return undefined when plant details is invalid", async () => {
      mockExternalApiService.getSpeciesDetails.mockResolvedValueOnce(undefined);
      const result = await (plantService as any).restructApiPlantData(
        mockExternalPlant
      );
      expect(result).toBeUndefined();
    });

    it("should return undefined when watering text has no numeric value", async () => {
      const badDetail = {
        ...mockExternalDetails,
        watering_general_benchmark: { value: "no numbers", unit: "days" },
      };
      mockExternalApiService.getSpeciesDetails.mockResolvedValueOnce(badDetail);
      const result = await (plantService as any).restructApiPlantData(
        mockExternalPlant
      );
      expect(mockExternalApiService.getSpeciesDetails).toHaveBeenCalledWith(
        123
      );
      expect(result).toBeUndefined();
    });
  });

  describe("searchForPlants", () => {
    it("should return plants that match a giving query from database", async () => {
      mockPlantRepo.searchByName.mockResolvedValueOnce([dbPlant]);
      const result = await plantService.searchForPlants("full example");
      expect(mockPlantRepo.searchByName).toHaveBeenCalledTimes(1);
      expect(mockPlantRepo.searchByName).toHaveBeenCalledWith("full example");
      expect(result).toBeDefined();
      expect(result).toMatchObject([dbPlant]);
    });

    it("should return plants that match a giving query from api call", async () => {
      mockPlantRepo.searchByName.mockResolvedValueOnce([]);
      mockExternalApiService.searchSpecies.mockResolvedValueOnce([
        mockExternalPlant,
      ]);
      const result = await plantService.searchForPlants("full example");
      expect(mockPlantRepo.searchByName).toHaveBeenCalledTimes(1);
      expect(mockPlantRepo.searchByName).toHaveBeenCalledWith("full example");
      expect(mockExternalApiService.searchSpecies).toHaveBeenCalledTimes(1);
      expect(mockExternalApiService.searchSpecies).toHaveBeenCalledWith(
        "full example"
      );
      expect(result).toBeDefined();
      expect(result).toMatchObject([mockExternalPlant]);
    });

    it("should return undefined when both searchs fails", async () => {
      mockPlantRepo.searchByName.mockResolvedValueOnce([]);
      mockExternalApiService.searchSpecies.mockResolvedValueOnce(undefined);
      const result = await plantService.searchForPlants("bad example");
      expect(mockPlantRepo.searchByName).toHaveBeenCalledTimes(1);
      expect(mockPlantRepo.searchByName).toHaveBeenCalledWith("bad example");
      expect(mockExternalApiService.searchSpecies).toHaveBeenCalledTimes(1);
      expect(mockExternalApiService.searchSpecies).toHaveBeenCalledWith(
        "bad example"
      );
      expect(result).toBeUndefined();
    });
  });

  describe("savePlants", () => {
    const plantA = mockExternalPlant;
    const plantB = { ...mockExternalPlant, id: 124 };
    const plantC = { ...mockExternalPlant, id: 125 };
    const badDetails = {
      ...mockExternalDetails,
      watering_general_benchmark: {
        value: "bad format",
        unit: "days",
      },
    };

    it("should insert one new plant and returns its id", async () => {
      mockPlantRepo.findByExternalApiId.mockResolvedValueOnce(undefined);
      mockExternalApiService.getSpeciesDetails.mockResolvedValueOnce(
        mockExternalDetails
      );
      mockPlantRepo.insert.mockResolvedValueOnce(dbPlant);
      const result = await plantService.savePlants([mockExternalPlant]);
      expect(mockPlantRepo.findByExternalApiId).toHaveBeenCalledWith(
        mockExternalPlant.id
      );
      expect(mockExternalApiService.getSpeciesDetails).toHaveBeenCalledWith(
        mockExternalPlant.id
      );
      expect(mockPlantRepo.insert).toHaveBeenCalledTimes(1);
      expect(result).toEqual(["uuid-example"]);
    });

    it("should skip plants that already exist in DB", async () => {
      mockPlantRepo.findByExternalApiId.mockResolvedValueOnce(dbPlant);
      const result = await plantService.savePlants([mockExternalPlant]);
      expect(mockPlantRepo.findByExternalApiId).toHaveBeenCalledWith(
        mockExternalPlant.id
      );
      expect(mockExternalApiService.getSpeciesDetails).not.toHaveBeenCalled();
      expect(mockPlantRepo.insert).not.toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it("should processe multiple plants: inserts new, skips existing and handles malformed details", async () => {
      // -> insert
      mockPlantRepo.findByExternalApiId.mockResolvedValueOnce(undefined);
      mockExternalApiService.getSpeciesDetails.mockResolvedValueOnce(
        mockExternalDetails
      );
      mockPlantRepo.insert.mockResolvedValueOnce({
        ...dbPlant,
        external_api_id: String(plantB.id),
      });
      // -> skip
      mockPlantRepo.findByExternalApiId.mockResolvedValueOnce(dbPlant);
      // -> restruct returns undefined so no insert
      mockPlantRepo.findByExternalApiId.mockResolvedValueOnce(undefined);
      mockExternalApiService.getSpeciesDetails.mockResolvedValueOnce(
        badDetails
      );
      mockPlantRepo.insert.mockResolvedValueOnce(undefined);
      const result = await plantService.savePlants([plantA, plantB, plantC]);
      expect(mockPlantRepo.findByExternalApiId).toHaveBeenCalledTimes(3);
      expect(mockPlantRepo.insert).toHaveBeenCalledTimes(1);
      expect(result).toEqual([dbPlant.id]);
    });

    it("should continue processing when one insert fails and returns successful ids only", async () => {
      mockPlantRepo.findByExternalApiId.mockResolvedValueOnce(undefined);
      mockExternalApiService.getSpeciesDetails.mockResolvedValueOnce(
        mockExternalDetails
      );
      mockPlantRepo.insert.mockResolvedValueOnce(dbPlant);

      mockPlantRepo.findByExternalApiId.mockResolvedValueOnce(undefined);
      mockExternalApiService.getSpeciesDetails.mockResolvedValueOnce(
        mockExternalDetails
      );
      mockPlantRepo.insert.mockImplementationOnce(() => {
        throw new Error("DB Error creating new plant");
      });

      const result = await plantService.savePlants([plantA, plantB]);
      expect(mockPlantRepo.findByExternalApiId).toHaveBeenCalledTimes(2);
      expect(mockExternalApiService.getSpeciesDetails).toHaveBeenCalledTimes(2);
      expect(mockPlantRepo.insert).toHaveBeenCalledTimes(2);
      expect(result).toEqual([dbPlant.id]);
    });
  });
});
