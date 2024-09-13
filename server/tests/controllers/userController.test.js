import request from 'supertest';
import express from 'express';
import bodyParser from 'body-parser';
import { registerUser, loginUser, updateUserProfile, listUsers, deleteUser, updateUserRole } from '../../src/controller/userController.js';
import prisma from '../../src/utils/connect.js';
import { v4 as uuidv4 } from 'uuid';

jest.mock('../../src/utils/connect.js', () => ({
  user: {
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findMany: jest.fn(),
  },
}));

const app = express();
app.use(bodyParser.json());

app.post('/app/usuario/registro', registerUser);
app.post('/app/usuario/login', loginUser);
app.put('/app/usuario/:id', updateUserProfile);
app.get('/app/adm/dashboard', listUsers);
app.delete('/app/usuario/:id', deleteUser);
app.patch('/app/adm/:id/papel', updateUserRole);

beforeEach(async () => {
  jest.clearAllMocks();
});

afterAll(async () => {
  await prisma.$disconnect();
});

test('Deve criar um usuário com sucesso', async () => {
  const userId = uuidv4();
  prisma.user.create.mockResolvedValue({
    id: userId,
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'autor',
  });

  const response = await request(app)
    .post('/app/usuario/registro')
    .send({
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: 'password123',
      role: 'autor',
    });

  expect(response.status).toBe(201);
  expect(response.body).toHaveProperty('id', userId);
  expect(response.body.name).toBe('John Doe');
});

test('Deve retornar erro ao criar usuário com e-mail já existente', async () => {
  prisma.user.create.mockRejectedValue(new Error('E-mail já está em uso.'));

  const response = await request(app)
    .post('/app/usuario/registro')
    .send({
      name: 'Jane Doe',
      email: 'john.doe@example.com',
      password: 'password123',
      role: 'leitor',
    });

  expect(response.status).toBe(400);
  expect(response.body.message).toBe('E-mail já está em uso.');
});

test('Deve atualizar o perfil do usuário', async () => {
  const userId = uuidv4();
  prisma.user.update.mockResolvedValue({
    id: userId,
    name: 'Novo Nome',
    email: 'novo.email@example.com',
  });

  const response = await request(app)
    .put(`/app/usuario/${userId}`)
    .send({ name: 'Novo Nome', email: 'novo.email@example.com' });

  expect(response.status).toBe(200);
  expect(response.body.name).toBe('Novo Nome');
});

test('Deve retornar 401 se o token de autenticação estiver ausente', async () => {
  const response = await request(app).get('/app/adm/dashboard');
  expect(response.status).toBe(401);
  expect(response.body.message).toBe('Token não fornecido');
});
