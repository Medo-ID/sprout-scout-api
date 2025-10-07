import { UserSchema } from "@schemas/user.schema";

class UsersRepository {
  public async findAll() {}

  public async findById(id: string) {}

  public async findByEmail(email: string) {}

  public async insert(data: UserSchema) {}

  public async update(id: string, data: Partial<UserSchema>) {}

  public async delete(id: string) {}
}
