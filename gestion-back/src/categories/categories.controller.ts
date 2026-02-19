import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post, Query, Request } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { UsersService } from '../users/users.service';

interface RequestUser {
  user?: {
    mainPhone: string;
  };
}

@Controller('categories')
export class CategoriesController {
  constructor(
    private readonly categoriesService: CategoriesService,
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
  async create(
    @Request() req: RequestUser,
    @Body() dto: CreateCategoryDto,
    @Query('phone') phone?: string
  ) {
    const mainPhone = await this.resolveMainPhone(req, phone ?? dto.phone);
    return this.categoriesService.create(mainPhone, dto);
  }

  @Get()
  async findAll(@Request() req: RequestUser, @Query('phone') phone?: string) {
    const mainPhone = await this.resolveMainPhone(req, phone);
    return this.categoriesService.findAll(mainPhone);
  }

  @Get(':id')
  async findOne(
    @Request() req: RequestUser,
    @Param('id') id: string,
    @Query('phone') phone?: string
  ) {
    const mainPhone = await this.resolveMainPhone(req, phone);
    return this.categoriesService.findOne(mainPhone, id);
  }

  @Patch(':id')
  async update(
    @Request() req: RequestUser,
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
    @Query('phone') phone?: string
  ) {
    const mainPhone = await this.resolveMainPhone(req, phone ?? dto.phone);
    return this.categoriesService.update(mainPhone, id, dto);
  }

  @Delete(':id')
  async remove(
    @Request() req: RequestUser,
    @Param('id') id: string,
    @Query('phone') phone?: string
  ) {
    const mainPhone = await this.resolveMainPhone(req, phone);
    return this.categoriesService.remove(mainPhone, id);
  }
}
