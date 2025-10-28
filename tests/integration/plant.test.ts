import request from "supertest";
import { app } from "../../src/app";
import {
  closeTestDB,
  initializeTestDB,
  resetUserAuthDB,
  resetPlantDB,
} from "../../src/config/database";
import { ExternalPlant } from "../../src/libs/types/external-api";

const userData = {
  name: "test plant lover",
  email: "plantlover@test.com",
  password: "GreenThumb1!",
  confirmPassword: "GreenThumb1!",
};

const samplePlant: ExternalPlant = {
  id: 1,
  common_name: "Snake Plant",
  scientific_name: ["Sansevieria trifasciata"],
  family: "Asparagaceae",
  hybrid: "",
  authority: null,
  subspecies: null,
  cultivar: undefined,
  variety: undefined,
  species_epithet: undefined,
  genus: "Sansevieria",
  default_image: {
    regular_url: "http://example.com/snake-plant.jpg",
  },
};

describe("Plant Controller Integration", () => {
  let accessToken: string;
  let userId: string;

  beforeAll(async () => await initializeTestDB());
  beforeEach(async () => {
    await resetUserAuthDB();
    await resetPlantDB();
  });
  afterAll(async () => await closeTestDB());

  // Register and get tokens before each test
  beforeEach(async () => {
    const response = await request(app)
      .post("/api/v1/auth/register")
      .send(userData);

    accessToken = response.body.accessToken;
    userId = response.body.user.id;
  });

  describe("Search Plants", () => {
    it("searches for plants successfully", async () => {
      const response = await request(app)
        .post("/api/v1/plants/search")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ query: "snake plant" });

      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it("handles search with no results", async () => {
      const response = await request(app)
        .post("/api/v1/plants/search")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ query: "nonexistentplantxyz" });

      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(0);
    });
  });

  describe("Save Plants", () => {
    it("saves plants successfully", async () => {
      const response = await request(app)
        .post("/api/v1/plants/save")
        .set("Authorization", `Bearer ${accessToken}`)
        .send([samplePlant]);

      expect(response.status).toBe(201);
      expect(response.body.message).toBe("ok");
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it("handles empty plant list", async () => {
      const response = await request(app)
        .post("/api/v1/plants/save")
        .set("Authorization", `Bearer ${accessToken}`)
        .send([]);

      expect(response.status).toBe(201);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(0);
    });

    it("handles invalid plant data", async () => {
      const invalidPlant = {
        id: 2,
        common_name: "Invalid Plant",
        // missing required fields
      };

      const response = await request(app)
        .post("/api/v1/plants/save")
        .set("Authorization", `Bearer ${accessToken}`)
        .send([invalidPlant]);

      expect(response.status).toBe(400);
      expect(response.body.message).toBeTruthy();
      expect(response.body.errors).toBeDefined();
    });
  });
});
