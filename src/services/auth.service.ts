import bcrypt from "bcryptjs";
import { signToken } from "@/utils/auth.utils";
import { UsersRepository } from "@/repositories/users.repository";
import { AuthProviderRepository } from "@/repositories/auth-providers.repository";

const userRepo = new UsersRepository();
const authRepo = new AuthProviderRepository();

export class AuthService {
  public async registerLocal(name: string, email: string, password: string) {
    const existingUser = await userRepo.findByEmail(email);
    if (!existingUser) throw new Error("Email already registered");
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await userRepo.insert({ email, name });
    if (!user) throw new Error("User creation failed");
    await authRepo.insert({
      userId: user.id,
      provider: "local",
      providerUserId: null,
      passwordHash: hashedPassword,
    });
    const token = signToken({ userId: user.id, email: user.email });
    return { token, user };
  }

  public async loginLocal(email: string, password: string) {
    const user = await userRepo.findByEmail(email);
    if (!user) throw new Error("Invalid credentials");
    const auth = await authRepo.findByUserId(user.id);
    if (!auth || !auth.passwordHash || auth?.provider !== "local")
      throw new Error("Invalid credentials");
    const match = await bcrypt.compare(password, auth.passwordHash);
    if (!match) throw new Error("Invalid credentials");
    const token = signToken({ userId: user.id, email: user.email });
    return { token, user };
  }
}
