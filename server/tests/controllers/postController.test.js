import request from 'supertest';
import express from 'express';
import bodyParser from 'body-parser';
import { createPost, getAllPost, getPostagensPorAutor, getPostById, updatePost, deletePost, uploadImage } from '../../src/controller/postController.js';
import prisma from '../../src/utils/connect.js';
import { v4 as uuidv4 } from 'uuid';

import { execSync } from 'child_process';

jest.mock('../../src/utils/connect.js', () => ({
  post: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  $disconnect: jest.fn()
}));

const app = express();
app.use(bodyParser.json());

app.post('/posts', createPost);
app.get('/posts', getAllPost);
app.get('/posts/author', getPostagensPorAutor);
app.get('/posts/:id', getPostById);
app.put('/posts/:id', updatePost);
app.delete('/posts/:id', deletePost);
app.post('/posts/:id/image', uploadImage);

const resetTestDB = () => {
  execSync('npx prisma migrate reset --preview-feature --force', { stdio: 'inherit' });
};

beforeAll(async () => {
  resetTestDB();
});

afterAll(async () => {
  await prisma.$disconnect();
});

test('Deve listar todas as postagens com paginação', async () => {
  prisma.post.findMany.mockResolvedValue([
    { id: uuidv4(), titulo: 'Post 1', conteudo: 'Conteúdo do post 1', authorId: uuidv4() },
    { id: uuidv4(), titulo: 'Post 2', conteudo: 'Conteúdo do post 2', authorId: uuidv4() }
  ]);

  prisma.post.count.mockResolvedValue(2);

  const response = await request(app).get('/posts?page=1&limit=10');
  expect(response.status).toBe(200);
  expect(response.body.totalItems).toBe(2);
  expect(response.body.postagens.length).toBe(2);
});

test('Deve buscar postagens por autor', async () => {
  const authorId = uuidv4();
  prisma.post.findMany.mockResolvedValue([
    { id: uuidv4(), titulo: 'Post 1', conteudo: 'Conteúdo do post 1', authorId },
  ]);

  const response = await request(app).get(`/posts/author?autor=${authorId}`);
  expect(response.status).toBe(200);
  expect(response.body.length).toBe(1);
  expect(response.body[0].authorId).toBe(authorId);
});

test('Deve criar uma postagem com sucesso', async () => {
  const authorId = uuidv4();
  prisma.post.create.mockResolvedValue({
    id: uuidv4(),
    titulo: 'Novo Post',
    conteudo: 'Este é o conteúdo do post.',
    authorId,
    published: true,
  });

  const response = await request(app)
    .post('/posts')
    .send({
      titulo: 'Novo Post',
      conteudo: 'Este é o conteúdo do post.',
      authorId,
      published: true,
    });

  expect(response.status).toBe(201);
  expect(response.body).toHaveProperty('id');
  expect(response.body.titulo).toBe('Novo Post');
});

test('Deve retornar erro ao criar postagem com dados inválidos', async () => {
  prisma.post.create.mockRejectedValue(new Error('Erro ao criar a postagem.'));

  const response = await request(app)
    .post('/posts')
    .send({
      titulo: 'Short',
      conteudo: 'Short content',
      authorId: uuidv4(),
    });

  expect(response.status).toBe(400);
  expect(response.body.message).toBe('Erro ao criar a postagem.');
});

test('Deve retornar uma postagem pelo ID', async () => {
  const validPostId = uuidv4();
  prisma.post.findUnique.mockResolvedValue({
    id: validPostId,
    titulo: 'Novo Post',
    conteudo: 'Conteúdo do post',
    authorId: uuidv4(),
  });

  const response = await request(app).get(`/posts/${validPostId}`);
  expect(response.status).toBe(200);
  expect(response.body).toHaveProperty('id', validPostId);
});

test('Deve atualizar uma postagem', async () => {
  const postId = uuidv4();
  prisma.post.update.mockResolvedValue({
    id: postId,
    titulo: 'Post Atualizado',
    conteudo: 'Conteúdo atualizado',
  });

  const response = await request(app)
    .put(`/posts/${postId}`)
    .send({ titulo: 'Post Atualizado', conteudo: 'Conteúdo atualizado' });

  expect(response.status).toBe(200);
  expect(response.body.titulo).toBe('Post Atualizado');
});

test('Deve excluir uma postagem', async () => {
  const postId = uuidv4();
  prisma.post.delete.mockResolvedValue({ id: postId });

  const response = await request(app).delete(`/posts/${postId}`);
  expect(response.status).toBe(200);
  expect(response.body.message).toBe('Postagem excluída com sucesso.');
});
