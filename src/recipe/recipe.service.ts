import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { Recipe } from './recipe.entity';
import { User } from '../user/user.entity';
import { S3Service } from './s3.service';

@Injectable()
export class RecipeService {
  constructor(
    @InjectRepository(Recipe)
    private readonly recipeRepository: Repository<Recipe>,
    private readonly s3Service: S3Service,
  ) {}

  async findAllByUserPaginated(
    user: User,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ recipes: Recipe[]; total: number }> {
    const [recipes, total] = await this.recipeRepository.findAndCount({
      where: { user },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    if (!recipes) {
      return { recipes: [], total: 0 };
    }

    return { recipes, total };
  }

  async findOneByUser(id: number, user: User): Promise<Recipe> {
    const recipe = await this.recipeRepository.findOne({ where: { id, user } });
    if (!recipe) throw new NotFoundException('Recipe not found');
    return recipe;
  }

  async create(
    data: Partial<Recipe>,
    user: User,
    file?: Express.Multer.File,
  ): Promise<Recipe> {
    let imageUrl: string | null = null;

    // Upload new image if provided
    if (file) {
      imageUrl = await this.s3Service.uploadFile(file);
    }

    // for copy public recipe image logic
    const urlPattern = /^(https?:\/\/[^\s]+)$/i;
    if (typeof data.image == 'string' && urlPattern.test(data.image)) {
      imageUrl = data.image;
    }

    const recipe = this.recipeRepository.create({
      ...data,
      image: imageUrl ?? undefined,
      user,
    });

    return this.recipeRepository.save(recipe);
  }

  async update(
    id: number,
    data: Partial<Recipe>,
    user: User,
    file?: Express.Multer.File,
  ): Promise<Recipe> {
    const recipe = await this.findOneByUser(id, user);

    if (!recipe) {
      throw new NotFoundException('Recipe not found');
    }

    // Delete old image if new image is provided

    if (file && recipe.image) {
      const oldImageKey = this.s3Service.getKeyFromUrl(recipe.image);
      if (typeof oldImageKey == 'string') {
        await this.s3Service.deleteFile(oldImageKey);
      }
    }

    // Upload new image if provided
    if (file) {
      recipe.image = await this.s3Service.uploadFile(file);
    }

    Object.assign(recipe, data);
    return this.recipeRepository.save(recipe);
  }

  async delete(id: number, user: User): Promise<void> {
    const recipe = await this.findOneByUser(id, user);

    if (!recipe) {
      throw new NotFoundException('Recipe not found');
    }

    // Delete the image if it exists

    if (recipe.image) {
      const imageKey = this.s3Service.getKeyFromUrl(recipe.image);
      if (typeof imageKey == 'string') {
        await this.s3Service.deleteFile(imageKey);
      }
    }

    await this.recipeRepository.remove(recipe);
  }
}
