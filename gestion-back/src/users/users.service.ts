import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AddSecondaryPhoneDto } from './dto/add-secondary-phone.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { User, UserDocument } from './user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>) {}

  async create(dto: CreateUserDto): Promise<User> {
    await this.assertPhoneAvailable(dto.phone);
    const created = new this.userModel({ mainPhone: dto.phone, secondaryPhones: [] });
    return created.save();
  }

  async addSecondary(mainPhone: string, dto: AddSecondaryPhoneDto): Promise<User> {
    const user = await this.userModel.findOne({ mainPhone }).exec();
    if (!user) {
      throw new NotFoundException('Main phone not found.');
    }

    if (dto.phone === mainPhone) {
      throw new BadRequestException('Secondary phone cannot be the same as main phone.');
    }

    await this.assertPhoneAvailable(dto.phone);
    user.secondaryPhones.push(dto.phone);
    return user.save();
  }

  async findByAnyPhone(phone: string): Promise<User | null> {
    return this.userModel
      .findOne({
        $or: [{ mainPhone: phone }, { secondaryPhones: phone }]
      })
      .exec();
  }

  async getByMainPhone(mainPhone: string): Promise<User> {
    const user = await this.userModel.findOne({ mainPhone }).exec();
    if (!user) {
      throw new NotFoundException('User not found.');
    }
    return user;
  }

  async getFamilyPhones(mainPhone: string): Promise<string[]> {
    const user = await this.getByMainPhone(mainPhone);
    return [user.mainPhone, ...user.secondaryPhones];
  }

  private async assertPhoneAvailable(phone: string): Promise<void> {
    const existing = await this.findByAnyPhone(phone);
    if (existing) {
      throw new BadRequestException('Phone is already assigned to a user family.');
    }
  }
}
