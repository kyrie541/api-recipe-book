import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Recipe } from './recipe.entity';
import { RecipeService } from './recipe.service';
import { S3Service } from './s3.service';
import { RecipeController } from './recipe.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [TypeOrmModule.forFeature([Recipe]), ConfigModule],
  providers: [RecipeService, S3Service],
  controllers: [RecipeController],
})
export class RecipeModule {}
