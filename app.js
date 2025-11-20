require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const PORT = process.env.PORT || 3000;
console.log(PORT);

app.get("/", (req, res) => {
  res.send(`
    <h1>Curso Express.js v3</h1>
    <p>Esto es una aplicación node.js con express.js<p>
    <p>Corre en el puerto: ${PORT}</p>
    `);
});

app.get('/users/:id',(req,res) =>{
  const userId = req.params.id;
  res.send(`Mostrar information del usuario con ID: ${userId}`)
})

app.get('/search',(req,res) =>{
  const terms = req.query.term || 'No especificado';
  const category = req.query.category || 'Todas';

  res.send(`
    <h2>Resultados de búsqueda:</h2>
    <p>Termino: ${terms}</p>
    <p>Categoría: ${category}</p>
    `)
})

app.listen(PORT, () => {
  console.log(`Servidor: http://localhost:${PORT}`);
});
