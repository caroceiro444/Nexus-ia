
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

// CONEXÃO COM A IA
function getAI() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("IA não configurada no servidor.");
  }

  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
}

// CHAT DO NEXUS AI
app.post("/api/chat", async (req, res) => {
  try {
    const messages = req.body.messages;

    if (
      !Array.isArray(messages) ||
      messages.length === 0 ||
      messages.length > 20
    ) {
      return res.status(400).json({
        error: "Histórico de conversa inválido."
      });
    }

    const validMessages = messages.every(message =>
      message &&
      ["user", "assistant"].includes(message.role) &&
      typeof message.content === "string" &&
      message.content.trim().length > 0 &&
      message.content.length <= 4000
    );

    if (!validMessages || messages[messages.length - 1].role !== "user") {
      return res.status(400).json({
        error: "Mensagens inválidas."
      });
    }

    const ai = getAI();

    const result = await ai.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
      instructions: `
        Você é o NEXUS AI.
        Sua personalidade é inteligente, criativa,
        estratégica, profissional e divertida.
        Responda em português brasileiro.
        Ajude a criar sites, jogos e projetos.
        Explique programação de forma simples.
        Seja honesto sobre suas capacidades.
      `,
      input: messages.map(message => ({
        role: message.role,
        content: message.content
      }))
    });

    res.json({
      reply: result.output_text || "Não consegui gerar uma resposta."
    });

  } catch (error) {
    console.error("Erro no chat:", error.message);

    res.status(
      error.message.includes("não configurada") ? 503 : 500
    ).json({
      error: "Não foi possível conectar ao NEXUS AI."
    });
  }
});

// GERADOR DE SITES
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

    const ai = getAI();

    const result = await ai.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
      instructions: "Você é o NEXUS BUILDER. Gere projetos web funcionais. Responda somente JSON válido com as propriedades html, css e js. Não use Markdown. Não inclua scripts externos.",
      input: prompt
    });

    const project = JSON.parse(result.output_text);

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
