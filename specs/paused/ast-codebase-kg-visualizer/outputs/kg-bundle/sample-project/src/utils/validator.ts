import { validateEmail } from "./helpers";

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export class Validator {
  private errors: string[] = [];

  required(value: unknown, field: string): this {
    if (value === null || value === undefined || value === "") {
      this.errors.push(`${field} is required`);
    }
    return this;
  }

  email(value: string, field: string): this {
    if (!validateEmail(value)) {
      this.errors.push(`${field} must be a valid email`);
    }
    return this;
  }

  minLength(value: string, min: number, field: string): this {
    if (value.length < min) {
      this.errors.push(`${field} must be at least ${min} characters`);
    }
    return this;
  }

  positive(value: number, field: string): this {
    if (value <= 0) {
      this.errors.push(`${field} must be positive`);
    }
    return this;
  }

  result(): ValidationResult {
    return {
      valid: this.errors.length === 0,
      errors: [...this.errors],
    };
  }
}
