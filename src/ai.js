
import OpenAI from "openai";

export function createAI() {
  const key = process.env.OPENAI_API_KEY;

  if (!key) {
    throw new Error("Chave da IA não configurada.");
  }

  return new OpenAI({
    apiKey: key
  });
}

export async function askNexus(question) {
  const ai = createAI();

  const response = await ai.responses.create({
    model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
    instructions: `
      Você é o NEXUS AI.
      Personalidade: inteligente, estratégico,
      criativo, profissional e divertido.
      Responda sempre em português brasileiro.
      Ajude a criar sites, jogos e projetos.
    `,
    input: question
  });

  return response.output_text;
}
