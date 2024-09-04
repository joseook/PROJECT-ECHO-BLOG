
export const validatePost = (req, res, next) => {
  const { titulo, conteudo, autor } =
    req.body;

  if (
    !titulo ||
    !conteudo ||
    !autor 
  ) {
    return res
      .status(400)
      .json({ message: "Todos os campos são obrigatórios!" });
  }


  next();
};