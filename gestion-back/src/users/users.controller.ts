import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AddSecondaryPhoneDto } from './dto/add-secondary-phone.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Post(':mainPhone/secondary')
  async addSecondary(@Param('mainPhone') mainPhone: string, @Body() dto: AddSecondaryPhoneDto) {
    return this.usersService.addSecondary(mainPhone, dto);
  }

  @Get(':mainPhone')
  async getUser(@Param('mainPhone') mainPhone: string) {
    return this.usersService.getByMainPhone(mainPhone);
  }
}
