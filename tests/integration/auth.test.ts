import request from "supertest";
import { app } from "../../src/app";
import {
  closeTestDB,
  initializeTestDB,
  resetUserAuthDB,
} from "../../src/config/database";

const userData = {
  name: "test name",
  email: "a@b.com",
  password: "A123456a@",
  confirmPassword: "A123456a@",
};

beforeAll(async () => await initializeTestDB());
afterEach(async () => await resetUserAuthDB());
afterAll(async () => await closeTestDB());

describe("Auth Controller Integration", () => {
  describe("register", () => {
    it("registers user and returns access token and user", async () => {
      const response = await request(app)
        .post("/api/v1/auth/register")
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.headers["content-type"]).toMatch(/json/);
      expect(response.body.accessToken).toBeDefined();
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe(userData.email);
      expect(response.headers["set-cookie"]).toEqual(
        expect.arrayContaining([expect.stringContaining("refreshToken=")])
      );
    });

    it("returns 400 with invalid input when validation fails", async () => {
      const res = await request(app).post("/api/v1/auth/register").send({
        name: null,
        email: "a@b.com",
        password: null,
        confirmPassword: "A123456a@",
      });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Invalid input");
      expect(res.body.errors).toBeDefined();
    });

    it("returns 401 if email already registered", async () => {
      await request(app).post("/api/v1/auth/register").send(userData);
      const res = await request(app)
        .post("/api/v1/auth/register")
        .send(userData);

      expect(res.status).toBe(401);
      expect(res.body.message).toBe("Email already registered");
    });
  });

  describe("login", () => {
    beforeEach(async () => {
      await request(app).post("/api/v1/auth/register").send(userData);
    });

    it("logs in successfully and returns access token and user", async () => {
      const res = await request(app).post("/api/v1/auth/login").send({
        email: userData.email,
        password: userData.password,
      });

      expect(res.status).toBe(200);
      expect(res.body.accessToken).toBeDefined();
      expect(res.body.user).toBeDefined();
      expect(res.body.user.email).toBe(userData.email);
      expect(res.headers["set-cookie"]).toEqual(
        expect.arrayContaining([expect.stringContaining("refreshToken=")])
      );
    });

    it("returns 400 with invalid input when validation fails", async () => {
      const res = await request(app).post("/api/v1/auth/login").send({
        email: userData.email,
        password: null,
      });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Invalid input");
    });

    it("returns 400 with invalid credentials", async () => {
      const res = await request(app).post("/api/v1/auth/login").send({
        email: "notfound@b.com",
        password: userData.password,
      });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Invalid credentials");
    });
  });

  describe("refresh", () => {
    it("returns new access token if refresh token is valid", async () => {
      const regRes = await request(app)
        .post("/api/v1/auth/register")
        .send(userData);
      const cookie = regRes.headers["set-cookie"][0];
      const res = await request(app)
        .post("/api/v1/auth/refresh")
        .set("Cookie", cookie)
        .expect(200);
      expect(res.body.accessToken).toBeDefined();
      expect(res.headers["set-cookie"]).toEqual(
        expect.arrayContaining([expect.stringContaining("refreshToken=")])
      );
    });

    it("returns 500 if refresh token is missing or invalid", async () => {
      const res = await request(app).post("/api/v1/auth/refresh");

      expect(res.status).toBe(500);
      expect(res.body.message).toBeDefined();
    });
  });

  describe("logout", () => {
    it("logs out user and clears cookie", async () => {
      // Register and login to get refresh token cookie
      const regRes = await request(app)
        .post("/api/v1/auth/register")
        .send(userData);
      const cookie = regRes.headers["set-cookie"][0];

      const res = await request(app)
        .post("/api/v1/auth/logout")
        .set("Cookie", cookie);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Logged out successfully");
      expect(res.headers["set-cookie"]).toEqual(
        expect.arrayContaining([expect.stringContaining("refreshToken=;")])
      );
    });

    it("returns 500 if logout fails (no token)", async () => {
      const res = await request(app).post("/api/v1/auth/logout");

      expect(res.status).toBe(500);
      expect(res.body.message).toBeDefined();
    });
  });
});
