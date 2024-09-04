import express from "express";
import cors from "cors";
import postRoutes from './src/routes/postRoutes.js';
import authorRoutes from './src/routes/authorRoutes.js'

const PORT = process.env.PORT || 9090;
const app = express();

import "dotenv/config";

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


app.use('/postagens', postRoutes);
app.use('/app', authorRoutes)

app.use("*", (req, res) => {
  res.status(404).json({ message: "Rota não existe." });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});