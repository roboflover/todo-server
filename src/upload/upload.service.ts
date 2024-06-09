import { Injectable } from '@nestjs/common';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { s3Client } from './s3-client';
import * as dotenv from 'dotenv';
import * as sharp from 'sharp';
import { PrismaService } from '../prisma/prisma.service';

dotenv.config(); // Загружаем переменные окружения

@Injectable()
export class UploadService {
  private readonly bucket: string;

  constructor(private readonly prisma: PrismaService) {
    this.bucket = process.env.S3_BUCKET;
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    // Получаем последний номер из базы данных
    const lastImage = await this.prisma.todo.findFirst({
      orderBy: { id: 'desc' },
    });
    const newId = lastImage ? lastImage.id + 1 : 1;
    const newFileName = `image-${newId}.jpg`;
    // Изменяем размер изображения с помощью sharp
    const resizedBuffer = await sharp(file.buffer)
      .resize(800, 600) // Измените размеры по вашему усмотрению
      .toBuffer();

    const params = {
      Bucket: this.bucket,
      Key: newFileName,
      Body: resizedBuffer,
      ContentType: file.mimetype,
    };

    try {
      await s3Client.send(new PutObjectCommand(params));
      const imageUrl = `https://storage.yandexcloud.net/${this.bucket}/${newFileName}`;
      
      // Сохраняем URL в базу данных
      await this.prisma.todo.create({
        data: {
          title: `Image ${newId}`,
          imageUrl: imageUrl,
        },
      });
      return imageUrl;
    } catch (error) {
      throw new Error(`Ошибка при загрузке файла: ${error.message}`);
    }
  }
}
