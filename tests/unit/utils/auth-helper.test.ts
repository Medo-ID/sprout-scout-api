jest.mock("jsonwebtoken", () => ({
  sign: jest.fn(),
  verify: jest.fn(),
}));

import jwt from "jsonwebtoken";
import {
  generateTokens,
  verifyAccessToken,
  verifyRefreshToken,
} from "@/utils/auth-helper";

const mockedJWT = jwt as unknown as {
  sign: jest.Mock;
  verify: jest.Mock;
};

describe("Authentications service helpers", () => {
  const payload = { userId: "u1", email: "a@b.com" };
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe("generateTokens", () => {
    it("should call jwt.sign twice and return access & refresh tokens", () => {
      mockedJWT.sign.mockReturnValueOnce("access-token");
      mockedJWT.sign.mockReturnValueOnce("refresh-token");
      const tokens = generateTokens(payload);
      expect(mockedJWT.sign).toHaveBeenCalledTimes(2);
      expect(tokens).toEqual({
        accessToken: "access-token",
        refreshToken: "refresh-token",
      });
    });
  });

  describe("VerifyAccessToken", () => {
    it("should verify and return decoded payload when token valid", () => {
      mockedJWT.verify.mockReturnValue(payload);
      const decoded = verifyAccessToken("access-token");
      expect(mockedJWT.verify).toHaveBeenCalledWith(
        "access-token",
        expect.any(String)
      );
      expect(decoded).toEqual(payload);
    });

    it("should return null when jwt.verify throws", () => {
      mockedJWT.verify.mockImplementation(() => {
        throw new Error("invalid token");
      });
      const decoded = verifyAccessToken("bad-token");
      expect(mockedJWT.verify).toHaveBeenCalled();
      expect(decoded).toBeNull();
    });
  });

  describe("Verify refresh token", () => {
    it("should verify and return decoded payload when token valid", () => {
      mockedJWT.verify.mockReturnValue(payload);
      const decoded = verifyRefreshToken("refresh-token");
      expect(mockedJWT.verify).toHaveBeenCalledWith(
        "refresh-token",
        expect.any(String)
      );
      expect(decoded).toEqual(payload);
    });

    it("should return null when jwt.verify throws", () => {
      mockedJWT.verify.mockImplementation(() => {
        throw new Error("invalid token");
      });
      const decoded = verifyRefreshToken("bad-token");
      expect(mockedJWT.verify).toHaveBeenCalled();
      expect(decoded).toBeNull();
    });
  });
});
