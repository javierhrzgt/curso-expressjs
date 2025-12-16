import app from "#src/app"
const PORT = process.env.PORT || 3000

// Servidor
app.listen(PORT, () => {
  console.log(`Servidor: http://localhost:${PORT}`);
});