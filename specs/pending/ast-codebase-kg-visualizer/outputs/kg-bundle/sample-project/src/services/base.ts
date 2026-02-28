import { Entity } from "../models/types";

export interface Repository<T extends Entity> {
  findById(id: string): Promise<T | null>;
  findAll(): Promise<T[]>;
  create(data: Omit<T, "id" | "createdAt" | "updatedAt">): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
}

export abstract class BaseService<T extends Entity> {
  constructor(protected readonly repo: Repository<T>) {}

  async getById(id: string): Promise<T | null> {
    return this.repo.findById(id);
  }

  async getAll(): Promise<T[]> {
    return this.repo.findAll();
  }
}
