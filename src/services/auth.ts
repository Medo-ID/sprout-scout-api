import bcrypt from "bcryptjs";
import { AuthProviderRepository } from "../repositories/auth-provider";
import { UsersRepository } from "../repositories/user";
import { generateTokens, verifyRefreshToken } from "../utils/auth-helper";
import { pool } from "../config/database";

export class AuthService {
  constructor(
    private userRepo = new UsersRepository(),
    private authRepo = new AuthProviderRepository()
  ) {}

  public async registerLocal(name: string, email: string, password: string) {
    const existingUser = await this.userRepo.findByEmail(email);
    if (existingUser) throw new Error("Email already registered");
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await this.userRepo.insert({ email, name });
    if (!user) throw new Error("User creation failed");
    const { accessToken, refreshToken } = generateTokens({
      userId: user.id,
      email: user.email,
    });
    const authDetail = await this.authRepo.insert({
      user_id: user.id,
      provider: "local",
      provider_user_id: null,
      password_hash: hashedPassword,
      refresh_token: refreshToken,
    });
    if (!authDetail) throw new Error("Auth creation failed");
    return { accessToken, refreshToken, user };
  }

  public async loginLocal(email: string, password: string) {
    const user = await this.userRepo.findByEmail(email);
    if (!user || user.email !== email) throw new Error("Invalid credentials");
    const auth = await this.authRepo.findByUserId(user.id);
    if (!auth || !auth.password_hash || auth.provider !== "local")
      throw new Error("Invalid credentials");
    const match = await bcrypt.compare(password, auth.password_hash);
    if (!match) throw new Error("Invalid credentials");
    const { accessToken, refreshToken } = generateTokens({
      userId: user.id,
      email: user.email,
    });
    const result = await this.authRepo.setRefeshToken(user.id, refreshToken);
    if (!result)
      console.warn("Warning: Failed to set refresh token for user", user.id);
    return { accessToken, refreshToken, user };
  }

  public async refreshAccessToken(token: string) {
    if (!token) throw new Error("No Token provided");
    const decoded = verifyRefreshToken<{ userId: string; email: string }>(
      token
    );
    if (!decoded) throw new Error("Invalid token");
    const isValid = await this.authRepo.refreshTokenValidation(
      decoded.userId,
      token
    );
    if (!isValid) throw new Error("Invalid refresh token");
    const { accessToken, refreshToken } = generateTokens({
      userId: decoded.userId,
      email: decoded.email,
    });
    await this.authRepo.setRefeshToken(decoded.userId, refreshToken);
    return { accessToken, refreshToken };
  }

  public async logout(token: string): Promise<boolean> {
    if (!token) throw new Error("Missing token");
    const decoded = verifyRefreshToken<{ userId: string; email: string }>(
      token
    );
    if (!decoded) throw new Error("Invalid token");
    const result = await this.authRepo.setRefeshToken(decoded.userId, null);
    return result;
  }
}
