import express from "express";
import cors from "cors";
import conn from "./src/utils/connect.js";
import postRoutes from './src/routes/postRoutes.js'; // Importe as rotas de postagens

const PORT = process.env.PORT || 9090;
const app = express();

import "dotenv/config";

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


app.use('/postagens', postRoutes);

app.use("*", (req, res) => {
  res.status(404).json({ message: "Rota não existe." });
});

conn
  .sync()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Servidor rodando em http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Erro ao conectar com o banco de dados:", error);
  });
