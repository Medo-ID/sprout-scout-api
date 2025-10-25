import { ExternalPlantService } from "../../../src/services/external-api";

global.fetch = jest.fn();

describe("ExternalPlantService", () => {
  let externalPlantApi: ExternalPlantService;

  beforeEach(() => {
    externalPlantApi = new ExternalPlantService();
    (fetch as jest.Mock).mockClear();
  });

  describe("searchSpecies", () => {
    it("should fetch data successfully", async () => {
      const mockData = [{ id: 2, common_name: "Full Example" }];
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockData),
      });
      const response = await externalPlantApi.searchSpecies("full example");
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("species-list?key=")
      );
      expect(response).toEqual(mockData);
    });

    it("should throw an error for a non-ok response", async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
      });
      await expect(externalPlantApi.searchSpecies("query")).rejects.toThrow(
        "HTTP error! status: 404"
      );
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("species-list?key=")
      );
    });

    it("should handle network errors", async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error("network error"));
      await expect(externalPlantApi.searchSpecies("query")).rejects.toThrow(
        "network error"
      );
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("species-list?key=")
      );
    });
  });

  describe("getSpeciesDetails", () => {
    it("should fetch data successfully", async () => {
      const mockDetails = {
        id: 2,
        wateringFrequency: { value: "7", unit: "Days" },
      };
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockDetails),
      });
      const response = await externalPlantApi.getSpeciesDetails(2);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/species/details/2")
      );
      expect(response).toEqual(mockDetails);
    });
  });
});
