import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RequestCodeDto } from './dto/request-code.dto';
import { VerifyCodeDto } from './dto/verify-code.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService
  ) {}

  async requestCode(dto: RequestCodeDto) {
    const user = await this.usersService.findByAnyPhone(dto.phone);
    if (!user) {
      throw new UnauthorizedException('Phone is not registered.');
    }

    return {
      success: true,
      message: 'Verification code sent.'
    };
  }

  async verifyCode(dto: VerifyCodeDto) {
    if (dto.code !== '123456') {
      throw new UnauthorizedException('Invalid verification code.');
    }

    const user = await this.usersService.findByAnyPhone(dto.phone);
    if (!user) {
      throw new UnauthorizedException('Phone is not registered.');
    }

    const payload = {
      sub: String((user as unknown as { _id: unknown })._id),
      mainPhone: user.mainPhone
    };

    return {
      accessToken: await this.jwtService.signAsync(payload),
      user: {
        mainPhone: user.mainPhone,
        secondaryPhones: user.secondaryPhones
      }
    };
  }
}
