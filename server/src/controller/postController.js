import prisma from "../utils/connect.js";
import { z } from "zod";

const tituloSchema = z.string()
    .min(4, "O titulo deve conter pelo menos 4 caracterers. Tente novamente!.");

const conteudoSchema = z.string()
    .min(10, "O conteúdo deve conter pelo menos 10 caracteres. Tente novamente!.")

const getSchema = z.object({
    id: z.string().uuid()
})

export const getAllPost = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit, 10) || 10;
        const offset = parseInt(req.query.offset, 10) || 0;

        console.log(`Capturando tarefas com limit=${limit} e offset=${offset}`);

        const { count, rows } = await prisma.postagem.find({
            limit,
            offset
        });

        console.log(`Achou ${count} tarefas`);
        console.log(rows);

        const posts = rows.map(row => {
            const posts = row.get(); // Converte a instância para um objeto JavaScript puro
            delete task.id; // Remove o campo `id`
            posts.postagem = capitalizeFirstLetter(task.postagem);
            return posts;
        });

        const totalPaginas = Math.ceil(count / limit);
        res.json({
            totalItems: count,
            totalPages: totalPaginas,
            currentPage: totalPaginas === 0 ? null : Math.floor(offset / limit) + 1,
            tasks: posts
        });

    } catch (error) {
        console.error(error)
        res.status(500).json({message: "Erro ao listar as tarefas!."})
    }
}