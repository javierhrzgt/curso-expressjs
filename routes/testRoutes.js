import express from "express";
const router = express.Router();

router.get("/", (req, res) => {
  res.send(`
    <h1>Curso Express.js v3</h1>
    <p>Esto es una aplicación node.js con express.js</p>
    <p>API de usuarios disponible en /users</p>
    `);
});

router.get("/search", (req, res) => {
  const terms = req.query.term || "No especificado";
  const category = req.query.category || "Todas";

  res.send(`
    <h2>Resultados de búsqueda:</h2>
    <p>Término: ${terms}</p>
    <p>Categoría: ${category}</p>
    `);
});

router.post("/form", (req, res) => {
  const name = req.body.name || "Anonymous";
  const email = req.body.email || "Not provided";

  res.json({
    message: "Datos recibidos",
    data: {
      name,
      email,
    },
  });
});

router.post("/api/data", (req, res) => {
  const data = req.body;

  if (!data || Object.keys(data).length === 0) {
    return res.status(400).json({ error: "No se recibieron datos" });
  }

  res.status(201).json({
    message: "Datos JSON recibidos",
    data,
  });
});

router.get('/error',(req,res,next)=>{
  next(new Error('Error intencional.'))
})

export default router;