import * as bcrypt from "bcryptjs";
import * as tokenHelpers from "@/utils/auth-helper";
import { AuthProvider } from "@/libs/types/auth-provider";
import { User } from "@/libs/types/user";
import { AuthProviderRepository } from "@/repositories/auth-provider";
import { UsersRepository } from "@/repositories/user";
import { AuthService } from "@/services/auth";

jest.mock("bcryptjs");
jest.mock("@/utils/auth-helper");

const mockedBcrypt = {
  hash: bcrypt.hash as unknown as jest.MockedFunction<any>,
  compare: bcrypt.compare as unknown as jest.MockedFunction<any>,
};
const mockedTokenHelpers = tokenHelpers as jest.Mocked<typeof tokenHelpers>;

describe("Authentication Service:", () => {
  const mockUserData: User = {
    id: "u1",
    email: "a@b.com",
    name: "salah",
    picture_url: null,
  };

  const mockAuthData: AuthProvider = {
    user_id: "u1",
    provider: "local",
    provider_user_id: null,
    password_hash: "hashPASS",
    refresh_token: "refresh",
  };

  let authService: AuthService;
  let mockUserRepo: jest.Mocked<UsersRepository>;
  let mockAuthRepo: jest.Mocked<AuthProviderRepository>;

  beforeEach(() => {
    jest.resetAllMocks();
    mockUserRepo = {
      findByEmail: jest.fn(),
      insert: jest.fn(),
    } as any;
    mockAuthRepo = {
      insert: jest.fn(),
      findByUserId: jest.fn(),
      setRefeshToken: jest.fn(),
      refreshTokenValidation: jest.fn(),
    } as any;
    authService = new AuthService(mockUserRepo, mockAuthRepo);
  });

  describe("Register user using registerLocal", () => {
    it("should register a new user successfully and return tokens", async () => {
      mockUserRepo.findByEmail.mockResolvedValue(undefined);
      mockUserRepo.insert.mockResolvedValue(mockUserData);
      mockedBcrypt.hash.mockResolvedValue("hashedPASS");
      mockedTokenHelpers.generateTokens.mockReturnValue({
        accessToken: "access",
        refreshToken: "refresh",
      });
      mockAuthRepo.insert.mockResolvedValue(mockAuthData);

      const result = await authService.registerLocal(
        "salah",
        "a@b.com",
        "pass"
      );

      expect(mockUserRepo.findByEmail).toHaveBeenCalledWith(mockUserData.email);
      expect(mockedBcrypt.hash).toHaveBeenCalledWith("pass", 12);
      expect(mockUserRepo.insert).toHaveBeenCalledWith({
        email: mockUserData.email,
        name: mockUserData.name,
      });
      expect(mockAuthRepo.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: mockUserData.id,
          password_hash: "hashedPASS",
        })
      );
      expect(result).toStrictEqual({
        accessToken: "access",
        refreshToken: "refresh",
        user: mockUserData,
      });
    });

    it("throws if email already registered", async () => {
      mockUserRepo.findByEmail.mockResolvedValue(mockUserData);

      await expect(
        authService.registerLocal("salah", mockUserData.email, "pass")
      ).rejects.toThrow("Email already registered");

      expect(mockUserRepo.insert).not.toHaveBeenCalled();
    });

    it("throws if user data is invalid", async () => {
      mockUserRepo.findByEmail.mockResolvedValue(undefined);
      mockUserRepo.insert.mockResolvedValue(undefined);

      await expect(
        authService.registerLocal("salah", "a@b.com", "pass")
      ).rejects.toThrow("User creation failed");

      expect(mockedTokenHelpers.generateTokens).not.toHaveBeenCalled();
    });

    it("throws if auth data is invalid", async () => {
      mockUserRepo.findByEmail.mockResolvedValue(undefined);
      mockUserRepo.insert.mockResolvedValue(mockUserData);
      mockedBcrypt.hash.mockResolvedValue("hashedPASS");
      mockedTokenHelpers.generateTokens.mockReturnValue({
        accessToken: "access",
        refreshToken: "refresh",
      });
      mockAuthRepo.insert.mockResolvedValue(undefined);

      await expect(
        authService.registerLocal("salah", mockUserData.email, "pass")
      ).rejects.toThrow(/Auth creation failed/);
    });
  });

  describe("Login user using localLogin", () => {
    it("should login user successfully and return tokens", async () => {
      mockUserRepo.findByEmail.mockResolvedValue(mockUserData);
      mockAuthRepo.findByUserId.mockResolvedValue(mockAuthData);
      mockedBcrypt.compare.mockResolvedValue(true);
      mockedTokenHelpers.generateTokens.mockReturnValue({
        accessToken: "a",
        refreshToken: "r",
      });
      mockAuthRepo.setRefeshToken.mockResolvedValue(true);

      const result = await authService.loginLocal("a@b.com", "pass");
      const user = result.user;
      expect(mockedBcrypt.compare).toHaveBeenCalledWith(
        "pass",
        mockAuthData.password_hash
      );
      expect(mockAuthRepo.setRefeshToken).toHaveBeenCalledWith(
        mockUserData.id,
        "r"
      );
      expect(result).toEqual({ accessToken: "a", refreshToken: "r", user });
    });

    it("throws when user not found", async () => {
      mockUserRepo.findByEmail.mockResolvedValue(undefined);
      await expect(authService.loginLocal("not@b.com", "pass")).rejects.toThrow(
        /Invalid credentials/
      );
    });

    it("throws when password mismatch", async () => {
      mockUserRepo.findByEmail.mockResolvedValue(mockUserData);
      mockAuthRepo.findByUserId.mockResolvedValue(mockAuthData);
      mockedBcrypt.compare.mockResolvedValue(false);
      await expect(
        authService.loginLocal("a@b.com", "notPass")
      ).rejects.toThrow(/Invalid credentials/);
    });
  });

  describe("Refresh user's token using refreshAccessToken", () => {
    it("should verifies refresh token and returns new tokens", async () => {
      mockedTokenHelpers.verifyRefreshToken.mockReturnValue({
        userId: mockUserData.id,
        email: mockUserData.email,
      });
      mockAuthRepo.refreshTokenValidation.mockResolvedValue(true);
      mockedTokenHelpers.generateTokens.mockReturnValue({
        accessToken: "a",
        refreshToken: "r",
      });
      mockAuthRepo.setRefeshToken.mockResolvedValue(true);

      const result = await authService.refreshAccessToken("refresh-token");

      expect(mockAuthRepo.refreshTokenValidation).toHaveBeenCalledWith(
        mockUserData.id,
        "refresh-token"
      );
      expect(mockAuthRepo.setRefeshToken).toHaveBeenCalledWith(
        mockUserData.id,
        "r"
      );
      expect(result).toEqual({ accessToken: "a", refreshToken: "r" });
    });

    it("throws when providing invalid token", async () => {
      mockedTokenHelpers.verifyRefreshToken.mockReturnValue(null);
      await expect(authService.refreshAccessToken("bad-token")).rejects.toThrow(
        /Invalid token/
      );
    });

    it("throws when refresh token is invalid", async () => {
      mockedTokenHelpers.verifyRefreshToken.mockReturnValue({
        userId: mockUserData.id,
        email: mockUserData.email,
      });
      mockAuthRepo.refreshTokenValidation.mockResolvedValue(false);
      await expect(authService.refreshAccessToken("bad-token")).rejects.toThrow(
        /Invalid refresh token/
      );
    });
  });

  describe("Logout user", () => {
    it("Verify token and logout user successfully", async () => {
      mockedTokenHelpers.verifyRefreshToken.mockReturnValue({
        userId: mockUserData.id,
        email: mockUserData.email,
      });
      mockAuthRepo.setRefeshToken.mockResolvedValue(true);
      const result = await authService.logout("refresh-token");
      expect(mockAuthRepo.setRefeshToken).toHaveBeenCalledWith("u1", null);
      expect(result).toBe(true);
    });

    it("throws when token is invalid", async () => {
      mockedTokenHelpers.verifyRefreshToken.mockReturnValue(null);
      expect(mockAuthRepo.setRefeshToken).not.toHaveBeenCalled();
      await expect(authService.logout("bad-token")).rejects.toThrow(
        /Invalid token/
      );
    });

    it("return false when set refresh token fails", async () => {
      mockedTokenHelpers.verifyRefreshToken.mockReturnValue({
        userId: mockUserData.id,
        email: mockUserData.email,
      });
      mockAuthRepo.setRefeshToken.mockResolvedValue(false);
      const result = await authService.logout("refresh-token");
      expect(result).toBe(false);
    });
  });
});
