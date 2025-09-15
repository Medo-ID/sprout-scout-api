import request from "supertest";
import { testPool, testPlantsTable } from "../../config/test-database";

beforeAll(async () => {
  await testPlantsTable();
});

describe("Test Plants API", () => {
  test("Post Method: Insert into plants table", async () => {
    await testPool.query(`INSERT `);
  });
});
