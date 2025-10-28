import { AuthProviderRepository } from "../../../src/repositories/auth-provider";

// Mock the pool from src/config/database
jest.mock("../../../src/config/database", () => ({
  pool: {
    query: jest.fn(),
  },
}));

import { pool } from "../../../src/config/database";

const repo = new AuthProviderRepository();

describe("AuthProviderRepository.setRefeshToken", () => {
  afterEach(() => {
    (pool.query as jest.Mock).mockReset();
  });

  it("should update refresh token when a string token is provided", async () => {
    (pool.query as jest.Mock).mockResolvedValue({ rowCount: 1 });

    const result = await repo.setRefeshToken("user-id-1", "sometoken");

    expect(pool.query).toHaveBeenCalledWith(
      "UPDATE auth_providers SET refresh_token = $1 WHERE user_id = $2 RETURNING *",
      ["sometoken", "user-id-1"]
    );
    expect(result).toBe(true);
  });

  it("should allow null token (used for logout) and return true when rowCount > 0", async () => {
    (pool.query as jest.Mock).mockResolvedValue({ rowCount: 1 });

    const result = await repo.setRefeshToken("user-id-2", null);

    expect(pool.query).toHaveBeenCalledWith(
      "UPDATE auth_providers SET refresh_token = $1 WHERE user_id = $2 RETURNING *",
      [null, "user-id-2"]
    );
    expect(result).toBe(true);
  });

  it("returns false when the update affects no rows", async () => {
    (pool.query as jest.Mock).mockResolvedValue({ rowCount: 0 });

    const result = await repo.setRefeshToken("user-id-3", null);

    expect(result).toBe(false);
  });
});
