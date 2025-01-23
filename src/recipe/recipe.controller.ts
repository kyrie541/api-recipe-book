import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('recipe')
export class RecipeController {
  @Get()
  getPrivateData() {
    return { message: 'Private content' };
  }
}