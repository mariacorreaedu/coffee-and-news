import express from 'express';
import cors from 'cors';
import dotenv from "dotenv";

dotenv.config();

const app = express()

app.use(cors()),
// recebe json -> manda para rota como obj js -> injeta esse obj no req.body
app.use(express.json())

app.get("/", (req, res) => {
   res.json({
      message: "Api Coffee and News"
   });
});

app.listen(process.env.PORT, () => {
   console.log(`Servidor rodando na porta ${process.env.PORT}`)
});


