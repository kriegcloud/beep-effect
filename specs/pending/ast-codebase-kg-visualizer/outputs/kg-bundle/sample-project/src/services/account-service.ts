import { Account, Transaction, Holding } from "../models/types";
import { BaseService, Repository } from "./base";
import { UserService } from "./user-service";
import { Validator } from "../utils/validator";
import {
  formatCurrency,
  calculatePortfolioValue,
} from "../utils/helpers";

export class AccountService extends BaseService<Account> {
  constructor(
    repo: Repository<Account>,
    private readonly userService: UserService,
    private readonly txRepo: Repository<Transaction>
  ) {
    super(repo);
  }

  async createAccount(
    userId: string,
    currency: Account["currency"] = "USD"
  ): Promise<Account> {
    const user = await this.userService.getById(userId);
    if (!user) {
      throw new Error(`User ${userId} not found`);
    }

    return this.repo.create({
      userId,
      balance: 0,
      currency,
      holdings: [],
    } as Omit<Account, "id" | "createdAt" | "updatedAt">);
  }

  async deposit(accountId: string, amount: number): Promise<Account> {
    const validation = new Validator()
      .positive(amount, "amount")
      .result();

    if (!validation.valid) {
      throw new Error(validation.errors.join(", "));
    }

    const account = await this.repo.findById(accountId);
    if (!account) throw new Error(`Account ${accountId} not found`);

    const updated = await this.repo.update(accountId, {
      balance: account.balance + amount,
    } as Partial<Account>);

    await this.recordTransaction(accountId, "deposit", amount);

    return updated;
  }

  async withdraw(accountId: string, amount: number): Promise<Account> {
    const account = await this.repo.findById(accountId);
    if (!account) throw new Error(`Account ${accountId} not found`);

    if (account.balance < amount) {
      const formatted = formatCurrency(account.balance, account.currency);
      throw new Error(`Insufficient funds. Balance: ${formatted}`);
    }

    const updated = await this.repo.update(accountId, {
      balance: account.balance - amount,
    } as Partial<Account>);

    await this.recordTransaction(accountId, "withdrawal", amount);

    return updated;
  }

  async getPortfolioValue(accountId: string): Promise<string> {
    const account = await this.repo.findById(accountId);
    if (!account) throw new Error(`Account ${accountId} not found`);

    const value = calculatePortfolioValue(account.holdings);
    return formatCurrency(value, account.currency);
  }

  private async recordTransaction(
    accountId: string,
    type: Transaction["type"],
    amount: number
  ): Promise<Transaction> {
    return this.txRepo.create({
      accountId,
      type,
      amount,
      description: `${type} of ${amount}`,
    } as Omit<Transaction, "id" | "createdAt" | "updatedAt">);
  }
}
