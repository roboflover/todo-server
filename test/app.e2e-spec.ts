import { Test, TestingModule } from '@nestjs/testing';
import { TodoController } from './../src/todo/todo.controller';
import { TodoService } from './../src/todo/todo.service';
import { Prisma } from '@prisma/client';

describe('TodoController', () => {
  let todoController: TodoController;
  let todoService: TodoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TodoController],
      providers: [
        {
          provide: TodoService,
          useValue: {
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    todoController = module.get<TodoController>(TodoController);
    todoService = module.get<TodoService>(TodoService);
  });

  describe('update', () => {
    it('should update isCompleted from true to false', async () => {
      const id = '1';
      const updateTodoDto: Prisma.TodoUpdateInput = { isCompleted: false };
      
      const result = {
        id: 1,
        title: "Sample Title",
        description: "Sample Description",
        isCompleted: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      jest.spyOn(todoService, 'update').mockResolvedValue(result);

      expect(await todoController.update(id, updateTodoDto)).toBe(result);
      expect(todoService.update).toHaveBeenCalledWith(+id, updateTodoDto);
    });

    it('should update isCompleted from false to true', async () => {
      const id = '2';
      const updateTodoDto: Prisma.TodoUpdateInput = { isCompleted: true };

      const result = {
        id: 2,
        title: "Sample Title",
        description: "Sample Description",
        isCompleted: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      jest.spyOn(todoService, 'update').mockResolvedValue(result);

      expect(await todoController.update(id, updateTodoDto)).toBe(result);
      expect(todoService.update).toHaveBeenCalledWith(+id, updateTodoDto);
    });
  });
});
