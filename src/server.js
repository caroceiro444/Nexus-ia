
import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import OpenAI from "openai";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(helmet({
  contentSecurityPolicy: false
}));

app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "../public")));

app.use("/api", rateLimit({
  windowMs: 60 * 1000,
  limit: 20
}));

app.post("/api/generate", async (req, res) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return res.status(503).json({
        error: "A IA ainda não foi configurada no servidor."
      });
    }

    const prompt = String(req.body.prompt || "").trim();

    if (!prompt || prompt.length > 5000) {
      return res.status(400).json({
        error: "Descrição inválida ou muito longa."
      });
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    const result = await openai.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
      instructions: "Você é o NEXUS BUILDER. Gere projetos web funcionais. Responda somente JSON válido com as propriedades html, css e js. Não use Markdown. Não inclua scripts externos.",
      input: prompt
    });

    const text = result.output_text;
    const project = JSON.parse(text);

    if (
      typeof project.html !== "string" ||
      typeof project.css !== "string" ||
      typeof project.js !== "string"
    ) {
      throw new Error("Formato de projeto inválido.");
    }

    res.json(project);

  } catch (error) {
    console.error("Erro no Builder:", error.message);

    res.status(500).json({
      error: "Não foi possível gerar o projeto."
    });
  }
});

app.listen(PORT, () => {
  console.log(`NEXUS AI rodando na porta ${PORT}`);
});
