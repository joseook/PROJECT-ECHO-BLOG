import request from 'supertest';
import express from 'express';
import bodyParser from 'body-parser';
import { createPost, getAllPost, getPostagensPorAutor, getPostById, updatePost, deletePost, uploadImage } from '../../src/controller/postController.js';
import prisma from '../../src/utils/connect.js';

const app = express();
app.use(bodyParser.json());

app.post('/posts', createPost);
app.get('/posts', getAllPost);
app.get('/posts/author', getPostagensPorAutor);
app.get('/posts/:id', getPostById);
app.put('/posts/:id', updatePost);
app.delete('/posts/:id', deletePost);
app.post('/posts/:id/image', uploadImage);

beforeEach(async () => {
  await prisma.post.deleteMany({});
});

afterAll(async () => {
  await prisma.$disconnect();
});

test('Deve criar uma postagem com sucesso', async () => {
  const response = await request(app)
    .post('/posts')
    .send({
      titulo: 'Novo Post',
      conteudo: 'Este é o conteúdo do post.',
      authorId: 'some-valid-uuid',
      published: true
    });

  expect(response.status).toBe(201);
  expect(response.body).toHaveProperty('id');
  expect(response.body.titulo).toBe('Novo Post');
});

test('Deve retornar erro ao criar postagem com dados inválidos', async () => {
  const response = await request(app)
    .post('/posts')
    .send({
      titulo: 'Short',
      conteudo: 'Short content',
      authorId: 'some-valid-uuid'
    });

  expect(response.status).toBe(400);
  expect(response.body.message).toBe('Erro ao criar a postagem.');
});


