import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category, CategoryDocument } from './category.schema';

@Injectable()
export class CategoriesService {
  constructor(@InjectModel(Category.name) private readonly categoryModel: Model<CategoryDocument>) {}

  async create(mainPhone: string, dto: CreateCategoryDto): Promise<CategoryDocument> {
    const normalizedName = this.normalizeName(dto.name);
    await this.assertUniqueName(mainPhone, normalizedName);
    const created = new this.categoryModel({
      mainPhone,
      name: normalizedName,
      description: dto.description?.trim() ?? ''
    });
    return created.save();
  }

  async findAll(mainPhone: string): Promise<CategoryDocument[]> {
    return this.categoryModel.find({ mainPhone }).sort({ name: 1 }).exec();
  }

  async findOne(mainPhone: string, id: string): Promise<CategoryDocument> {
    const category = await this.categoryModel.findOne({ _id: id, mainPhone }).exec();
    if (!category) {
      throw new NotFoundException('Category not found.');
    }
    return category;
  }

  async update(mainPhone: string, id: string, dto: UpdateCategoryDto): Promise<CategoryDocument> {
    const existing = await this.findOne(mainPhone, id);

    if (dto.name) {
      const normalizedName = this.normalizeName(dto.name);
      if (normalizedName !== existing.name.trim().toLowerCase()) {
        await this.assertUniqueName(mainPhone, normalizedName);
        existing.name = normalizedName;
      }
    }

    if (dto.description !== undefined) {
      existing.description = dto.description.trim();
    }

    return existing.save();
  }

  async assertCategoryExists(mainPhone: string, name: string): Promise<string> {
    const normalizedName = this.normalizeName(name);
    const exists = await this.categoryModel.findOne({ mainPhone, name: normalizedName }).exec();
    if (!exists) {
      throw new BadRequestException('Category does not exist for this family.');
    }
    return normalizedName;
  }

  async remove(mainPhone: string, id: string): Promise<{ deleted: true }> {
    const result = await this.categoryModel.deleteOne({ _id: id, mainPhone }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException('Category not found.');
    }
    return { deleted: true };
  }

  private async assertUniqueName(mainPhone: string, name: string): Promise<void> {
    const normalized = this.normalizeName(name);
    if (!normalized) {
      throw new BadRequestException('Category name is required.');
    }

    const existing = await this.categoryModel.findOne({ mainPhone, name: normalized }).exec();

    if (existing) {
      throw new BadRequestException('Category name already exists for this family.');
    }
  }

  private normalizeName(value: string): string {
    return value.trim().toLowerCase();
  }
}
