import { Body, Controller, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { CreatePlaidTokenDto } from 'src/user/dto/create-plaid-token.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('signup')
  signup(@Body() data: SignupDto) {
    return this.userService.signup(data);
  }

  @Post('login')
  login(@Body() data: LoginDto) {
    return this.userService.login(data);
  }

  @Post('create-plaid-token')
  createPlaidToken(@Body() data: CreatePlaidTokenDto) {
    return this.userService.createPlaidToken(data);
  }

  @Post('exchange-public-token')
  exchangePublicToken(@Body() data: any) {
    return this.userService.exchangePublicToken(data);
  }
}
