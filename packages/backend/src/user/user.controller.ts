import { Body, Controller, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';

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
}
