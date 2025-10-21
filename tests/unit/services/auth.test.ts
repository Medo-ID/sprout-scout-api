import { AuthProviderRepository } from "@/repositories/auth-provider";
import { UsersRepository } from "@/repositories/user";
import { AuthService } from "@/services/auth";

jest.mock("bcryptjs", () => ({
  hash: jest.fn().mockResolvedValue("hashed"),
}));
jest.mock("../../../src/utils/auth-helper", () => ({
  generateTokens: jest.fn().mockResolvedValue({
    accessToken: "access",
    refreshToken: "refresh",
  }),
}));

describe("Authentication -> register user locally", () => {
  let authService: AuthService;
  let mockUserRepo: jest.Mocked<UsersRepository>;
  let mockAuthRepo: jest.Mocked<AuthProviderRepository>;

  beforeEach(() => {
    mockUserRepo = {
      findByEmail: jest.fn(),
      insert: jest.fn(),
    } as any;
    mockAuthRepo = {
      insert: jest.fn(),
    } as any;
    authService = new AuthService(mockUserRepo, mockAuthRepo);
  });

  it("should register a new user successfully", async () => {
    mockUserRepo.findByEmail.mockResolvedValue(undefined);
    mockUserRepo.insert.mockResolvedValue({ id: "1", email: "a@b.com" } as any);
    mockAuthRepo.insert.mockResolvedValue({ user_id: "1" } as any);
    const result = await authService.registerLocal("salah", "a@b.com", "pass");
    expect(result.user.email).toBe("a@b.com");
    expect(mockUserRepo.insert).toHaveBeenCalled();
    expect(mockAuthRepo.insert).toHaveBeenCalled();
  });

  it("should throw if email already registered", async () => {
    mockUserRepo.findByEmail.mockResolvedValue({
      id: "1",
      email: "a@b.com",
    } as any);
    await expect(
      authService.registerLocal("salah", "a@b.com", "pass")
    ).rejects.toThrow("Email already registered");
  });
});
