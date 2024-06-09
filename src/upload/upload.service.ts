import { Injectable } from '@nestjs/common';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { s3Client } from './s3-client';
import * as dotenv from 'dotenv';
import * as sharp from 'sharp';
import { PrismaService } from '../prisma/prisma.service';
import { Todo, Prisma } from '@prisma/client';

dotenv.config(); // Загружаем переменные окружения

@Injectable()
export class UploadService {
  // private s3Client: s3Client;
  private bucket: string;

  constructor(private readonly prisma: PrismaService) {
    // this.s3Client = new s3Client({ region: 'your-region' });
    this.bucket = process.env.S3_BUCKET;
    }

  async create(data: Prisma.TodoCreateInput): Promise<Todo> {
    return this.prisma.todo.create({
      data: {
        title: data.title,
        description: data.description,
        isCompleted: data.isCompleted ?? false,
        imageUrl: data.imageUrl,
      },
    });
  }

  async uploadFile(file: Express.Multer.File, title:string ): Promise<string> {

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
      console.log(imageUrl)
      //Сохраняем URL и title в базу данных
      await this.prisma.todo.create({
        data: {
          title: title,
          imageUrl: imageUrl,
        },
      });

      return imageUrl;
    } catch (error) {
      throw new Error(`Ошибка при загрузке файла: ${error.message}`);
    }
  }

    //constructor(private prisma: PrismaService) {}

  // async create(data: Prisma.TodoCreateInput): Promise<Todo> {
  //   return this.prisma.todo.create({ data });
  // }

  async findAll(): Promise<Todo[]> {
    return this.prisma.todo.findMany();
  }

  async findOne(id: number): Promise<Todo | null> {
    return this.prisma.todo.findUnique({ where: { id } });
  }

  async update(id: number, data: Prisma.TodoUpdateInput): Promise<Todo> {
    return this.prisma.todo.update({ where: { id }, data });
  }

  async remove(id: number): Promise<Todo> {
    return this.prisma.todo.delete({ where: { id } });
  }
  
}



