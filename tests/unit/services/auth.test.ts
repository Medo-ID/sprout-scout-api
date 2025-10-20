import { AuthService } from "../../../src/services/auth";
import { UsersRepository } from "../../../src/repositories/user";
import { AuthProviderRepository } from "../../../src/repositories/auth-provider";

jest.mock("../../../src/repositories/user");
jest.mock("../../../src/repositories/auth-provider");

describe("Authentication service -> Local Registration ", () => {
  let service: jest.Mocked<AuthService>;
  let userRepo: jest.Mocked<UsersRepository>;
  let authRepo: jest.Mocked<AuthProviderRepository>;

  beforeEach(() => {});
});
