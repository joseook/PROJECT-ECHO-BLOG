import request from 'supertest';
import express from 'express';
import bodyParser from 'body-parser';
import { getCommentsForPost, createCommentsForPost, editComment, deleteComment } from '../../src/controller/commentsController.js';
import prisma from '../../src/utils/connect.js';
import { v4 as uuidv4 } from 'uuid';
import { execSync } from 'child_process';

jest.mock('../../src/utils/connect.js', () => ({
  post: {
    findUnique: jest.fn(),
  },
  comments: {
    findMany: jest.fn(),
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  $disconnect: jest.fn(),
}));

const app = express();
app.use(bodyParser.json());

app.get('/comments/:postagemId', getCommentsForPost);
app.post('/comments', createCommentsForPost);
app.put('/comments/:comentarioId', editComment);
app.delete('/comments/:comentarioId', deleteComment);

const resetTestDB = () => {
  execSync('npx prisma migrate reset --preview-feature --force', { stdio: 'inherit' });
};

beforeAll(async () => {
  resetTestDB();
});

afterAll(async () => {
  await prisma.$disconnect();
});


test('Deve listar comentários de uma postagem', async () => {
  const postagemId = uuidv4();
  prisma.comments.findMany.mockResolvedValue([
    { id: uuidv4(), conteudo: 'Comentário 1', postagemId, usuarioId: uuidv4() },
    { id: uuidv4(), conteudo: 'Comentário 2', postagemId, usuarioId: uuidv4() }
  ]);

  const response = await request(app).get(`/comments/${postagemId}`);
  expect(response.status).toBe(200);
  expect(response.body.length).toBe(2);
});

test('Deve criar um comentário para uma postagem', async () => {
  const postagemId = uuidv4();
  const usuarioId = uuidv4();

  prisma.post.findUnique.mockResolvedValue({ id: postagemId });
  prisma.comments.create.mockResolvedValue({
    id: uuidv4(),
    conteudo: 'Novo comentário',
    postagemId,
    usuarioId,
  });

  const response = await request(app)
    .post('/comments')
    .send({ conteudo: 'Novo comentário', usuarioId, postagemId });

  expect(response.status).toBe(201);
  expect(response.body.conteudo).toBe('Novo comentário');
});

test('Deve editar um comentário existente', async () => {
  const comentarioId = uuidv4();
  prisma.comments.findUnique.mockResolvedValue({ id: comentarioId, conteudo: 'Comentário antigo' });

  prisma.comments.update.mockResolvedValue({
    id: comentarioId,
    conteudo: 'Comentário atualizado',
  });

  const response = await request(app)
    .put(`/comments/${comentarioId}`)
    .send({ conteudo: 'Comentário atualizado' });

  expect(response.status).toBe(200);
  expect(response.body.conteudo).toBe('Comentário atualizado');
});

test('Deve excluir um comentário', async () => {
  const comentarioId = uuidv4();
  prisma.comments.findUnique.mockResolvedValue({ id: comentarioId });

  const response = await request(app).delete(`/comments/${comentarioId}`);
  expect(response.status).toBe(204);
});
