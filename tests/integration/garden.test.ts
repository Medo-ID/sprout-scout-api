import request from "supertest";
import { app } from "../../src/app";
import {
  closeTestDB,
  initializeTestDB,
  resetUserAuthDB,
  resetGardenDB,
} from "../../src/config/database";

const userData = {
  name: "test gardener",
  email: "gardener@test.com",
  password: "GreenThumb1!",
  confirmPassword: "GreenThumb1!",
};

let gardenData = {
  name: "My Test Garden",
  location: "Backyard",
  user_id: "",
};

describe("Garden Controller Integration", () => {
  let accessToken: string;
  let userId: string;

  beforeAll(async () => await initializeTestDB());
  beforeEach(async () => {
    await resetUserAuthDB();
    await resetGardenDB();
  });
  afterAll(async () => await closeTestDB());

  // Register and get tokens before each test
  beforeEach(async () => {
    const response = await request(app)
      .post("/api/v1/auth/register")
      .send(userData);

    accessToken = response.body.accessToken;
    userId = response.body.user.id;
    gardenData.user_id = userId;
  });

  describe("Create Garden", () => {
    it("creates a new garden successfully", async () => {
      const response = await request(app)
        .post("/api/v1/gardens")
        .set("Authorization", `Bearer ${accessToken}`)
        .send(gardenData);

      expect(response.status).toBe(201);
      expect(response.body.message).toBe("Garden created!");
      expect(response.body.data).toBeDefined();
      expect(response.body.data.name).toBe(gardenData.name);
      expect(response.body.data.location).toBe(gardenData.location);
      expect(response.body.data.user_id).toBe(userId);
    });

    it("returns 400 with invalid input", async () => {
      const response = await request(app)
        .post("/api/v1/gardens")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          name: "x", // too short
          user_id: userId,
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Invalid input");
      expect(response.body.errors).toBeDefined();
    });
  });

  describe("Get User Gardens", () => {
    it("retrieves all gardens for a user", async () => {
      // Create a garden first
      await request(app)
        .post("/api/v1/gardens")
        .set("Authorization", `Bearer ${accessToken}`)
        .send(gardenData);

      const response = await request(app)
        .get(`/api/v1/gardens/users/${userId}`)
        .set("Authorization", `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("user's gardens data");
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0].name).toBe(gardenData.name);
    });

    it("returns appropriate response for user with no gardens", async () => {
      const response = await request(app)
        .get(`/api/v1/gardens/users/${userId}`)
        .set("Authorization", `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(0);
    });
  });

  describe("Get Specific Garden", () => {
    let gardenId: string;

    beforeEach(async () => {
      const createResponse = await request(app)
        .post("/api/v1/gardens")
        .set("Authorization", `Bearer ${accessToken}`)
        .send(gardenData);
      gardenId = createResponse.body.data.id;
    });

    it("retrieves a specific garden", async () => {
      const response = await request(app)
        .get(`/api/v1/gardens/${gardenId}/users/${userId}`)
        .set("Authorization", `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("garden data");
      expect(response.body.data).toBeDefined();
      expect(response.body.data.id).toBe(gardenId);
      expect(response.body.data.name).toBe(gardenData.name);
    });

    it("returns 404 for non-existent garden", async () => {
      const response = await request(app)
        .get(`/api/v1/gardens/nonexistent-id/users/${userId}`)
        .set("Authorization", `Bearer ${accessToken}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("gardens not found");
    });
  });

  describe("Update Garden", () => {
    let gardenId: string;

    beforeEach(async () => {
      const createResponse = await request(app)
        .post("/api/v1/gardens")
        .set("Authorization", `Bearer ${accessToken}`)
        .send(gardenData);
      gardenId = createResponse.body.data.id;
    });

    it("updates a garden successfully", async () => {
      const updateData = {
        name: "Updated Garden Name",
        location: "Front Yard",
      };

      const response = await request(app)
        .put(`/api/v1/gardens/${gardenId}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Garden updated!");
      expect(response.body.data.name).toBe(updateData.name);
      expect(response.body.data.location).toBe(updateData.location);
    });

    it("returns 404 for non-existent garden", async () => {
      const response = await request(app)
        .put("/api/v1/gardens/nonexistent-id")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ name: "New Name" });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Garden not found");
    });
  });

  describe("Delete Garden", () => {
    let gardenId: string;

    beforeEach(async () => {
      const createResponse = await request(app)
        .post("/api/v1/gardens")
        .set("Authorization", `Bearer ${accessToken}`)
        .send(gardenData);
      gardenId = createResponse.body.data.id;
    });

    it("deletes a garden successfully", async () => {
      const response = await request(app)
        .delete(`/api/v1/gardens/${gardenId}`)
        .set("Authorization", `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Garden deleted!");
      expect(response.body.gardenId).toBe(gardenId);

      // Verify garden is really deleted
      const verifyResponse = await request(app)
        .get(`/api/v1/gardens/${gardenId}/users/${userId}`)
        .set("Authorization", `Bearer ${accessToken}`);
      expect(verifyResponse.status).toBe(404);
    });

    it("returns 404 for non-existent garden", async () => {
      const response = await request(app)
        .delete("/api/v1/gardens/nonexistent-id")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Garden not found");
    });
  });
});
