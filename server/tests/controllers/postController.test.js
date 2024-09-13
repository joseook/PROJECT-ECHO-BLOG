import request from 'supertest';
import express from 'express';
import bodyParser from 'body-parser';
import { createPost, getAllPost, getPostagensPorAutor, getPostById, updatePost, deletePost, uploadImage } from '../../src/controller/postController.js';
import prisma from '../../src/utils/connect.js';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

jest.mock('../../src/utils/connect.js', () => ({
  post: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
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

beforeEach(async () => {
  jest.clearAllMocks();
});

afterAll(async () => {
  await prisma.$disconnect();
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

test('Deve fazer upload de imagem para uma postagem', async () => {
  const validPostId = uuidv4();
  prisma.post.findUnique.mockResolvedValue({ id: validPostId, titulo: 'Post Existente' });

  const response = await request(app)
    .post(`/posts/${validPostId}/image`)
    .attach('imagem', path.resolve(__dirname, 'fixtures/test-image.jpg'));

  expect(response.status).toBe(200);
  expect(response.body).toHaveProperty('imagem', expect.stringContaining('/uploads/images/'));
});
