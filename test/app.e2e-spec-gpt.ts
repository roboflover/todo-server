import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service'; // Импорт PrismaService для взаимодействия с базой данных

// Описание группы тестов для TodoController
describe('TodoController (e2e)', () => {
  let app: INestApplication; // Переменная для хранения экземпляра приложения
  let prisma: PrismaService; // Переменная для хранения экземпляра PrismaService

  // Выполняется перед всеми тестами в группе
  beforeAll(async () => {
    // Создание тестового модуля и компиляция его
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    // Создание экземпляра приложения и его инициализация
    app = moduleFixture.createNestApplication();
    await app.init();

    // Получение экземпляра PrismaService из тестового модуля
    prisma = moduleFixture.get<PrismaService>(PrismaService);
  });

  // Выполняется после всех тестов в группе
  afterAll(async () => {
    // Закрытие приложения
    await app.close();
  });

  // Тест для эндпоинта POST /todos
  it('/todos (POST)', async () => {
    const createTodoDto = { title: 'Test Todo', description: 'Test Description' }; // Данные для создания новой задачи
    const response = await request(app.getHttpServer()) // Выполнение HTTP POST-запроса к /todos
      .post('/todos')
      .send(createTodoDto)
      .expect(201); // Ожидание статуса ответа 201 (Created)

    // Проверка, что ответ содержит необходимые свойства и значения
    expect(response.body).toHaveProperty('id');
    expect(response.body.title).toEqual(createTodoDto.title);
    expect(response.body.description).toEqual(createTodoDto.description);
  });

  // Тест для эндпоинта GET /todos
  it('/todos (GET)', async () => {
    const response = await request(app.getHttpServer()) // Выполнение HTTP GET-запроса к /todos
      .get('/todos')
      .expect(200); // Ожидание статуса ответа 200 (OK)

    // Проверка, что ответ является массивом
    expect(Array.isArray(response.body)).toBe(true);
  });

  // Тест для эндпоинта GET /todos/:id
  it('/todos/:id (GET)', async () => {
    const todo = await prisma.todo.create({ // Создание новой задачи в базе данных через Prisma
      data: { title: 'Test Todo', description: 'Test Description' },
    });

    const response = await request(app.getHttpServer()) // Выполнение HTTP GET-запроса к /todos/:id
      .get(`/todos/${todo.id}`)
      .expect(200); // Ожидание статуса ответа 200 (OK)

    // Проверка, что ответ содержит правильные данные задачи
    expect(response.body.id).toEqual(todo.id);
    expect(response.body.title).toEqual(todo.title);
    expect(response.body.description).toEqual(todo.description);
  });

  // Тест для эндпоинта PATCH /todos/:id
  it('/todos/:id (PATCH)', async () => {
    const todo = await prisma.todo.create({ // Создание новой задачи в базе данных через Prisma
      data: { title: 'Test Todo', description: 'Test Description' },
    });

    const updateTodoDto = { title: 'Updated Title' }; // Данные для обновления задачи

    const response = await request(app.getHttpServer()) // Выполнение HTTP PATCH-запроса к /todos/:id
      .patch(`/todos/${todo.id}`)
      .send(updateTodoDto)
      .expect(200); // Ожидание статуса ответа 200 (OK)

    // Проверка, что ответ содержит обновленные данные задачи
    expect(response.body.id).toEqual(todo.id);
    expect(response.body.title).toEqual(updateTodoDto.title);
  });

  // Тест для эндпоинта DELETE /todos/:id
  it('/todos/:id (DELETE)', async () => {
    const todo = await prisma.todo.create({ // Создание новой задачи в базе данных через Prisma 
      data: { title: 'Test Todo', description: 'Test Description' },
    });

    await request(app.getHttpServer()) // Выполнение HTTP DELETE-запроса к /todos/:id
      .delete(`/todos/${todo.id}`)
      .expect(200); // Ожидание статуса ответа 200 (OK)

    const deletedTodo = await prisma.todo.findUnique({ where: { id: todo.id } }); // Проверка, что задача была удалена из базы данных
    expect(deletedTodo).toBeNull(); // Ожидание, что задача больше не существует в базе данных
  });
});