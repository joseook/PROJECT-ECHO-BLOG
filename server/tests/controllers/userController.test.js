import request from 'supertest';
import express from 'express';
import bodyParser from 'body-parser';
import { registerUser, loginUser, updateUserProfile, listUsers, deleteUser, updateUserRole } from '../../src/controller/userController.js';
import prisma from '../../src/utils/connect.js';
import { v4 as uuidv4 } from 'uuid';
import { execSync } from 'child_process';

jest.mock('../../src/utils/connect.js', () => ({
  user: {
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findMany: jest.fn(),
  },
  $disconnect: jest.fn()
}));

const app = express();
app.use(bodyParser.json());

app.post('/app/usuario/registro', registerUser);
app.post('/app/usuario/login', loginUser);
app.put('/app/usuario/:id', updateUserProfile);
app.get('/app/adm/dashboard', listUsers);
app.delete('/app/usuario/:id', deleteUser);
app.patch('/app/adm/:id/papel', updateUserRole);


const resetTestDB = () => {
  execSync('npx prisma migrate reset --preview-feature --force', { stdio: 'inherit' });
};

beforeAll(async () => {
  resetTestDB();
});


afterAll(async () => {
  await prisma.$disconnect();
});

test('Deve criar um usuário com sucesso', async () => {
  const userId = uuidv4();
  prisma.user.create.mockResolvedValue({
    id: userId,
    name: 'Carlos Wilton',
    email: 'carlos.wilton@example.com',
    role: 'autor',
  });

  const response = await request(app)
    .post('/app/usuario/registro')
    .send({
      name: 'Carlos Wilton',
      email: 'carlos.wilton@example.com',
      password: 'password123',
      role: 'autor',
    });

  expect(response.status).toBe(201);
  expect(response.body).toHaveProperty('id', userId);
  expect(response.body.name).toBe('Carlos Wilton');
});

test('Deve retornar erro ao criar usuário com e-mail já existente', async () => {
  prisma.user.create.mockRejectedValue(new Error('E-mail já está em uso.'));

  const response = await request(app)
    .post('/app/usuario/registro')
    .send({
      name: 'Jose Paulo Neto',
      email: 'jose1234@gmail.com',
      password: 'jose123456',
      role: 'administrador',
    });

  expect(response.status).toBe(400);
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
});
