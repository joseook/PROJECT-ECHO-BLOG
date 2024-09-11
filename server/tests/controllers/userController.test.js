import request from 'supertest';
import express from 'express';
import bodyParser from 'body-parser';
import { registerUser, loginUser, updateUserProfile, listUsers, deleteUser, updateUserRole } from '../../src/controller/userController.js';
import prisma from '../../src/utils/connect.js';

const app = express();
app.use(bodyParser.json());


app.post('/app/usuario/registro', registerUser);
app.post('/app/usuario/login', loginUser);
app.put('/app/usuario/:id', updateUserProfile);
app.get('/app/adm/dashboard', listUsers);
app.delete('/app/usuario/:id', deleteUser);
app.patch('/app/adm/:id/papel', updateUserRole);

beforeEach(async () => {
  await prisma.user.deleteMany({});
});

afterAll(async () => {
  await prisma.$disconnect();
});

test('Deve criar um usuário com sucesso', async () => {
  const response = await request(app)
    .post('/app/usuario/registro')
    .send({
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: 'password123',
      role: 'autor'
    });

  expect(response.status).toBe(201);
  expect(response.body).toHaveProperty('id');
  expect(response.body.name).toBe('John Doe');
});

test('Deve retornar erro ao criar usuário com e-mail já existente', async () => {
  await request(app)
    .post('/app/usuario/registro')
    .send({
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: 'password123',
      role: 'autor'
    });

  const response = await request(app)
    .post('/app/usuario/registro')
    .send({
      name: 'Jane Doe',
      email: 'john.doe@example.com',
      password: 'password123',
      role: 'leitor'
    });

  expect(response.status).toBe(400);
  expect(response.body.message).toBe('E-mail já está em uso.');
});

