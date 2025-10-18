import bcrypt from "bcryptjs";
import { UsersRepository } from "../repositories/user";
import { AuthProviderRepository } from "../repositories/auth-provider";
import { generateTokens, signToken } from "../utils/auth-helper";

const userRepo = new UsersRepository();
const authRepo = new AuthProviderRepository();

export class AuthService {
  public async registerLocal(name: string, email: string, password: string) {
    const existingUser = await userRepo.findByEmail(email);
    if (existingUser) throw new Error("Email already registered");
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await userRepo.insert({ email, name });
    if (!user) throw new Error("User creation failed");
    const { accessToken, refreshToken } = await generateTokens({
      userId: user.id,
      email: user.email,
    });
    const authDetail = await authRepo.insert({
      user_id: user.id,
      provider: "local",
      provider_user_id: null,
      password_hash: hashedPassword,
      refresh_token: refreshToken,
    });
    if (!authDetail) throw new Error("Auth creation failed");
    return { accessToken, user };
  }
  // TODO: REMOVE THE OLD signToken() FUNCTION WITH THE NEW generateTokens()
  // AND ADD REFRESH  TOKEN LOGIC
  public async loginLocal(email: string, password: string) {
    const user = await userRepo.findByEmail(email);
    if (!user || user.email !== email) throw new Error("Invalid credentials1");
    const auth = await authRepo.findByUserId(user.id);
    console.log("auth:", auth);
    if (!auth || !auth.password_hash || auth.provider !== "local")
      throw new Error("Invalid credentials");
    const match = await bcrypt.compare(password, auth.password_hash);
    if (!match) throw new Error("Invalid credentials2");
    const token = signToken({ userId: user.id, email: user.email });
    return { token, user };
  }
  // TODO: FINISH IMPLEMENTING REFRESH TOKEN LOGIC
  public async refreshAccessToken() {}
  // FINISH IMPLEMENTING LOGOUT LOGIC
  public async logout() {}
}
