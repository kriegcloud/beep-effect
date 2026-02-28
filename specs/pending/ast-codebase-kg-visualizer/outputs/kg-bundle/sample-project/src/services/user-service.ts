import { User } from "../models/types";
import { BaseService, Repository } from "./base";
import { Validator } from "../utils/validator";
import { generateId } from "../utils/helpers";

export class UserService extends BaseService<User> {
  constructor(repo: Repository<User>) {
    super(repo);
  }

  async createUser(
    email: string,
    name: string,
    role: User["role"] = "client"
  ): Promise<User> {
    const validation = new Validator()
      .required(email, "email")
      .email(email, "email")
      .required(name, "name")
      .minLength(name, 2, "name")
      .result();

    if (!validation.valid) {
      throw new Error(
        `Validation failed: ${validation.errors.join(", ")}`
      );
    }

    const existing = await this.findByEmail(email);
    if (existing) {
      throw new Error(`User with email ${email} already exists`);
    }

    return this.repo.create({ email, name, role });
  }

  async findByEmail(email: string): Promise<User | null> {
    const users = await this.repo.findAll();
    return users.find((u) => u.email === email) ?? null;
  }

  async updateRole(userId: string, role: User["role"]): Promise<User> {
    return this.repo.update(userId, { role } as Partial<User>);
  }
}
