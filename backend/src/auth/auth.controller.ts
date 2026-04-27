import {
  Controller,
  Post,
  Body,
  Get,
  Request,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Public } from '../common/decorators/public.decorator';

type AuthenticatedRequest = Request & {
  user: {
    userId: string;
    email: string;
    fullName: string | null;
  };
};

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public() // Mark this endpoint as public
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public() // Mark this endpoint as public
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me') // Endpoint for getUser() in frontend
  getMe(@Request() req) {
    return req.user;
  }
}
