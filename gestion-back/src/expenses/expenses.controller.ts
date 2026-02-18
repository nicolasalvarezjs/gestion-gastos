import { Body, Controller, Get, Post, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { ExpensesQueryDto } from './dto/expenses-query.dto';
import { ExpensesService } from './expenses.service';
import {
  BreakdownItem,
  CategorySummary,
  DailyTrendPoint,
  InsightItem,
  MonthlySummary
} from './expenses.types';

interface RequestUser {
  user: {
    mainPhone: string;
  };
}

@Controller('expenses')
@UseGuards(JwtAuthGuard)
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  async create(@Request() req: RequestUser, @Body() dto: CreateExpenseDto) {
    await this.expensesService.assertExpensePhoneBelongsToFamily(req.user.mainPhone, dto.phone);
    return this.expensesService.create(req.user.mainPhone, dto);
  }

  @Get()
  async getAll(@Request() req: RequestUser, @Query() query: ExpensesQueryDto) {
    return this.expensesService.findAll(req.user.mainPhone, query);
  }

  @Get('recent')
  async getRecent(@Request() req: RequestUser, @Query() query: ExpensesQueryDto) {
    return this.expensesService.findRecent(req.user.mainPhone, query);
  }

  @Get('by-category')
  async getByCategory(@Request() req: RequestUser, @Query() query: ExpensesQueryDto): Promise<CategorySummary[]> {
    return this.expensesService.getByCategory(req.user.mainPhone, query);
  }

  @Get('daily-trend')
  async getDailyTrend(@Request() req: RequestUser, @Query() query: ExpensesQueryDto): Promise<DailyTrendPoint[]> {
    return this.expensesService.getDailyTrend(req.user.mainPhone, query);
  }

  @Get('breakdown')
  async getBreakdown(@Request() req: RequestUser, @Query() query: ExpensesQueryDto): Promise<BreakdownItem[]> {
    return this.expensesService.getBreakdown(req.user.mainPhone, query);
  }

  @Get('monthly-summary')
  async getMonthlySummary(@Request() req: RequestUser, @Query() query: ExpensesQueryDto): Promise<MonthlySummary> {
    return this.expensesService.getMonthlySummary(req.user.mainPhone, query);
  }

  @Get('insights')
  getInsights(@Request() req: RequestUser): Promise<InsightItem[]> {
    return this.expensesService.getInsights(req.user.mainPhone);
  }
}
