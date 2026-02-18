import { Body, Controller, Delete, Get, Param, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

interface RequestUser {
  user: {
    mainPhone: string;
  };
}

@Controller('categories')
@UseGuards(JwtAuthGuard)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  create(@Request() req: RequestUser, @Body() dto: CreateCategoryDto) {
    return this.categoriesService.create(req.user.mainPhone, dto);
  }

  @Get()
  findAll(@Request() req: RequestUser) {
    return this.categoriesService.findAll(req.user.mainPhone);
  }

  @Get(':id')
  findOne(@Request() req: RequestUser, @Param('id') id: string) {
    return this.categoriesService.findOne(req.user.mainPhone, id);
  }

  @Patch(':id')
  update(@Request() req: RequestUser, @Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.categoriesService.update(req.user.mainPhone, id, dto);
  }

  @Delete(':id')
  remove(@Request() req: RequestUser, @Param('id') id: string) {
    return this.categoriesService.remove(req.user.mainPhone, id);
  }
}
