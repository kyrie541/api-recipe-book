import { Injectable, BadRequestException } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class S3Service {
  private s3: AWS.S3;
  private bucketName: string;

  constructor() {
    this.s3 = new AWS.S3({
      region: process.env.AWS_REGION,
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    });
    this.bucketName = process.env.AWS_S3_BUCKET_NAME as string;
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const key = `${uuidv4()}-${file.originalname}`;
    const params = {
      Bucket: this.bucketName,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read',
    };

    await this.s3.upload(params).promise();
    return `https://${this.bucketName}.s3.amazonaws.com/${key}`;
  }

  async deleteFile(key: string): Promise<void> {
    const params = {
      Bucket: this.bucketName,
      Key: key,
    };

    await this.s3.deleteObject(params).promise();
  }

  getKeyFromUrl(url: string): string {
    const regex = new RegExp(
      `https://${this.bucketName}.s3.amazonaws.com/(.*)`,
    );
    const match = url.match(regex);
    if (match && match[1]) {
      return match[1];
    }
    throw new BadRequestException('Invalid S3 URL');
  }
}
