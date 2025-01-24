import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseInterceptors,
  UploadedFile,
  Req,
  Query,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { RecipeService } from './recipe.service';
import { Recipe } from './recipe.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from '../user/user.entity';

export interface AuthenticatedRequest extends Request {
  user: User; // Add the `user` property to the Request type
}

@UseGuards(JwtAuthGuard)
@Controller('recipes')
export class RecipeController {
  constructor(private readonly recipeService: RecipeService) {}

  @Get()
  async findAll(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<{ recipes: Recipe[]; total: number }> {
    const user = req.user; // Authenticated user

    const pageNumber = parseInt(page, 10) || 1; // Default to page 1
    const pageLimit = parseInt(limit, 10) || 10; // Default to 10 items per page

    return this.recipeService.findAllByUserPaginated(
      user,
      pageNumber,
      pageLimit,
    );
  }

  @Get(':id')
  async findOne(
    @Param('id') id: number,
    @Req() req: AuthenticatedRequest,
  ): Promise<Recipe> {
    const user = req.user; // Authenticated user
    return this.recipeService.findOneByUser(id, user);
  }

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @Body() data: Partial<Recipe>,
    @Req() req: AuthenticatedRequest,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<Recipe> {
    const user = req.user; // Authenticated user
    return this.recipeService.create(data, user, file);
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('image'))
  async update(
    @Param('id') id: number,
    @Body() data: Partial<Recipe>,
    @Req() req: AuthenticatedRequest,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<Recipe> {
    const user = req.user; // Authenticated user
    return this.recipeService.update(id, data, user, file);
  }

  @Delete(':id')
  async delete(
    @Param('id') id: number,
    @Req() req: AuthenticatedRequest,
  ): Promise<void> {
    const user = req.user; // Authenticated user
    return this.recipeService.delete(id, user);
  }
}
