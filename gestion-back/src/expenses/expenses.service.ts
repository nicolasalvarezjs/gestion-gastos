import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, PipelineStage } from 'mongoose';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { ExpensesQueryDto } from './dto/expenses-query.dto';
import { Expense, ExpenseDocument } from './expenses.schema';
import {
  BreakdownItem,
  CategorySummary,
  DailyTrendPoint,
  InsightItem,
  MonthlySummary
} from './expenses.types';
import { CategoriesService } from '../categories/categories.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class ExpensesService {
  constructor(
    @InjectModel(Expense.name) private readonly expenseModel: Model<ExpenseDocument>,
    private readonly usersService: UsersService,
    private readonly categoriesService: CategoriesService
  ) {}

  async create(mainPhone: string, dto: CreateExpenseDto): Promise<Expense> {
    const normalizedCategory = await this.categoriesService.assertCategoryExists(
      mainPhone,
      dto.category
    );

    const created = new this.expenseModel({
      ...dto,
      category: normalizedCategory,
      date: new Date(dto.date)
    });
    return created.save();
  }

  async createMany(mainPhone: string, dtos: CreateExpenseDto[]): Promise<Expense[]> {
    const familyPhones = await this.usersService.getFamilyPhones(mainPhone);

    const prepared = await Promise.all(
      dtos.map(async (dto) => {
        if (!familyPhones.includes(dto.phone)) {
          throw new BadRequestException('Expense phone is not part of this family.');
        }

        const normalizedCategory = await this.categoriesService.assertCategoryExists(
          mainPhone,
          dto.category
        );

        return {
          ...dto,
          category: normalizedCategory,
          date: new Date(dto.date)
        };
      })
    );

    return this.expenseModel.insertMany(prepared);
  }

  async findAll(mainPhone: string, query: ExpensesQueryDto): Promise<Expense[]> {
    const filter = await this.buildFamilyDateFilter(mainPhone, query.start, query.end);
    return this.expenseModel.find(filter).sort({ date: -1 }).exec();
  }

  async findRecent(mainPhone: string, query: ExpensesQueryDto): Promise<Expense[]> {
    const filter = await this.buildFamilyDateFilter(mainPhone, query.start, query.end);
    const limit = Number(query.limit ?? 10);
    return this.expenseModel.find(filter).sort({ date: -1 }).limit(limit).exec();
  }

  async getByCategory(mainPhone: string, query: ExpensesQueryDto): Promise<CategorySummary[]> {
    const pipeline: PipelineStage[] = [];
    const match = await this.buildFamilyDateFilter(mainPhone, query.start, query.end);
    if (Object.keys(match).length > 0) {
      pipeline.push({ $match: match });
    }
    pipeline.push({
      $group: {
        _id: '$category',
        total: { $sum: '$amount' }
      }
    });
    pipeline.push({ $sort: { total: -1 } });

    const result = await this.expenseModel.aggregate(pipeline).exec();
    const totalSum = result.reduce((sum, item) => sum + item.total, 0) || 1;

    return result.map((item) => ({
      category: item._id,
      total: item.total,
      percentage: Math.round((item.total / totalSum) * 100)
    }));
  }

  async getDailyTrend(mainPhone: string, query: ExpensesQueryDto): Promise<DailyTrendPoint[]> {
    const pipeline: PipelineStage[] = [];
    const match = await this.buildFamilyDateFilter(mainPhone, query.start, query.end);
    if (Object.keys(match).length > 0) {
      pipeline.push({ $match: match });
    }
    pipeline.push({
      $group: {
        _id: { $dayOfMonth: '$date' },
        amount: { $sum: '$amount' }
      }
    });
    pipeline.push({ $sort: { _id: 1 } });

    const result = await this.expenseModel.aggregate(pipeline).exec();
    return result.map((item) => ({ day: item._id, amount: item.amount }));
  }

  async getBreakdown(mainPhone: string, query: ExpensesQueryDto): Promise<BreakdownItem[]> {
    const filter = await this.buildFamilyDateFilter(mainPhone, query.start, query.end);
    const limit = Number(query.limit ?? 4);
    const expenses = await this.expenseModel.find(filter).sort({ date: -1 }).limit(limit).exec();
    return expenses.map((expense) => ({
      date: expense.date.toDateString(),
      merchant: expense.description,
      subCategory: expense.category,
      amount: expense.amount
    }));
  }

  async getMonthlySummary(mainPhone: string, query: ExpensesQueryDto): Promise<MonthlySummary> {
    const { start, end } = this.resolveCurrentRange(query.start, query.end);
    const previous = this.getPreviousRange(start, end);

    const [currentTotal, previousTotal] = await Promise.all([
      this.sumRange(mainPhone, start, end),
      this.sumRange(mainPhone, previous.start, previous.end)
    ]);

    const delta = currentTotal - previousTotal;
    const deltaPercent = previousTotal === 0 ? 0 : Math.round((delta / previousTotal) * 100);

    return {
      currentTotal,
      previousTotal,
      delta,
      deltaPercent,
      periodStart: start.toISOString(),
      periodEnd: end.toISOString(),
      previousPeriodStart: previous.start.toISOString(),
      previousPeriodEnd: previous.end.toISOString()
    };
  }

  async getInsights(mainPhone: string): Promise<InsightItem[]> {
    const familyPhones = await this.usersService.getFamilyPhones(mainPhone);
    const expenses = await this.expenseModel
      .find({ phone: { $in: familyPhones } })
      .sort({ date: -1 })
      .limit(200)
      .exec();

    const total = expenses.reduce((sum, item) => sum + item.amount, 0);
    const count = expenses.length;
    const avg = count === 0 ? 0 : total / count;
    const topExpense = expenses[0];

    return [
      {
        title: 'Promedio por gasto',
        text: `Promedio actual: $${avg.toFixed(2)} por transacción registrada.`,
        icon: 'payments',
        colorClass: 'card-icon--blue'
      },
      {
        title: 'Último gasto registrado',
        text: topExpense
          ? `${topExpense.description} por $${topExpense.amount.toFixed(2)}.`
          : 'Todavía no hay gastos registrados para esta familia.',
        icon: 'receipt_long',
        colorClass: 'card-icon--purple'
      },
      {
        title: 'Total familiar',
        text: `Total acumulado en el período cargado: $${total.toFixed(2)}.`,
        icon: 'analytics',
        colorClass: 'card-icon--green'
      }
    ];
  }

  async assertExpensePhoneBelongsToFamily(mainPhone: string, expensePhone: string): Promise<void> {
    const familyPhones = await this.usersService.getFamilyPhones(mainPhone);
    if (!familyPhones.includes(expensePhone)) {
      throw new BadRequestException('Expense phone is not part of this family.');
    }
  }

  private buildDateFilter(start?: string, end?: string): FilterQuery<ExpenseDocument> {
    if (!start && !end) {
      return {};
    }
    const dateFilter: Record<string, Date> = {};
    if (start) {
      dateFilter.$gte = new Date(start);
    }
    if (end) {
      dateFilter.$lte = new Date(end);
    }
    return { date: dateFilter };
  }

  private async buildFamilyDateFilter(
    mainPhone: string,
    start?: string,
    end?: string
  ): Promise<FilterQuery<ExpenseDocument>> {
    const familyPhones = await this.usersService.getFamilyPhones(mainPhone);
    const dateFilter = this.buildDateFilter(start, end);
    return {
      ...dateFilter,
      phone: { $in: familyPhones }
    };
  }

  private resolveCurrentRange(start?: string, end?: string): { start: Date; end: Date } {
    if (start && end) {
      return { start: new Date(start), end: new Date(end) };
    }
    const now = new Date();
    const currentStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    return { start: currentStart, end: currentEnd };
  }

  private getPreviousRange(start: Date, end: Date): { start: Date; end: Date } {
    const rangeMs = end.getTime() - start.getTime();
    const previousEnd = new Date(start.getTime() - 1);
    const previousStart = new Date(previousEnd.getTime() - rangeMs);
    return { start: previousStart, end: previousEnd };
  }

  private async sumRange(mainPhone: string, start: Date, end: Date): Promise<number> {
    const familyPhones = await this.usersService.getFamilyPhones(mainPhone);
    const result = await this.expenseModel
      .aggregate([
        {
          $match: {
            phone: { $in: familyPhones },
            date: { $gte: start, $lte: end }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' }
          }
        }
      ])
      .exec();

    return result[0]?.total ?? 0;
  }
}
