import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Todo, Prisma } from '@prisma/client';
import { CreateTodoDto } from './dto/create-todo.dto';

interface BatchPayload {
  count: number;
}

@Injectable()
export class TodoService {

  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.TodoCreateInput): Promise<Todo> {
    return this.prisma.todo.create({ data });
  }

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
