import { Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { TodoService } from 'src/todo/todo.service';
import { UploadController } from './upload.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [  PrismaModule ],
  providers: [UploadService, TodoService ],
  controllers: [UploadController],
})
export class UploadModule {}

