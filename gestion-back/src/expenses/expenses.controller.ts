import { BadRequestException, Body, Controller, Get, Post, Query, Request } from '@nestjs/common';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { CreateExpensesDto } from './dto/create-expenses.dto';
import { ExpensesQueryDto } from './dto/expenses-query.dto';
import { ExpensesService } from './expenses.service';
import { UsersService } from '../users/users.service';
import {
  BreakdownItem,
  CategorySummary,
  DailyTrendPoint,
  InsightItem,
  MonthlySummary
} from './expenses.types';

interface RequestUser {
  user?: {
    mainPhone: string;
  };
}

@Controller('expenses')
export class ExpensesController {
  constructor(
    private readonly expensesService: ExpensesService,
    private readonly usersService: UsersService
  ) {}

  private async resolveMainPhone(req: RequestUser, phone?: string): Promise<string> {
    if (req.user?.mainPhone) {
      return req.user.mainPhone;
    }
    if (!phone) {
      throw new BadRequestException('Phone is required when no token is provided.');
    }
    return this.usersService.resolveMainPhone(phone);
  }

  @Post()
  async create(@Request() req: RequestUser, @Body() dto: CreateExpenseDto) {
    const mainPhone = await this.resolveMainPhone(req, dto.phone);
    await this.expensesService.assertExpensePhoneBelongsToFamily(mainPhone, dto.phone);
    return this.expensesService.create(mainPhone, dto);
  }

  @Post('bulk')
  async createMany(@Request() req: RequestUser, @Body() dto: CreateExpensesDto) {
    const mainPhone = await this.resolveMainPhone(req, dto.phone);
    return this.expensesService.createMany(mainPhone, dto);
  }

  @Get()
  async getAll(@Request() req: RequestUser, @Query() query: ExpensesQueryDto) {
    const mainPhone = await this.resolveMainPhone(req, query.phone);
    return this.expensesService.findAll(mainPhone, query);
  }

  @Get('recent')
  async getRecent(@Request() req: RequestUser, @Query() query: ExpensesQueryDto) {
    const mainPhone = await this.resolveMainPhone(req, query.phone);
    return this.expensesService.findRecent(mainPhone, query);
  }

  @Get('by-category')
  async getByCategory(@Request() req: RequestUser, @Query() query: ExpensesQueryDto): Promise<CategorySummary[]> {
    const mainPhone = await this.resolveMainPhone(req, query.phone);
    return this.expensesService.getByCategory(mainPhone, query);
  }

  @Get('daily-trend')
  async getDailyTrend(@Request() req: RequestUser, @Query() query: ExpensesQueryDto): Promise<DailyTrendPoint[]> {
    const mainPhone = await this.resolveMainPhone(req, query.phone);
    return this.expensesService.getDailyTrend(mainPhone, query);
  }

  @Get('breakdown')
  async getBreakdown(@Request() req: RequestUser, @Query() query: ExpensesQueryDto): Promise<BreakdownItem[]> {
    const mainPhone = await this.resolveMainPhone(req, query.phone);
    return this.expensesService.getBreakdown(mainPhone, query);
  }

  @Get('monthly-summary')
  async getMonthlySummary(@Request() req: RequestUser, @Query() query: ExpensesQueryDto): Promise<MonthlySummary> {
    const mainPhone = await this.resolveMainPhone(req, query.phone);
    return this.expensesService.getMonthlySummary(mainPhone, query);
  }

  @Get('insights')
  getInsights(@Request() req: RequestUser): Promise<InsightItem[]> {
    return this.resolveMainPhone(req).then((mainPhone) => this.expensesService.getInsights(mainPhone));
  }
}
