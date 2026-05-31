import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import fs from "fs";

// Initialize data storage
const DB_FILE = path.resolve(process.cwd(), "data.json");
let catalog: any[] = [];
let referenceData: any[] = [
  { id: '1', name: 'Глюкоза', formula: 'C₆H₁₂O₆', description: 'Альдегидоспирт и важнейший моносахарид. Ключевой источник энергии в живых организмах. Окисляется с реакцией «серебряного зеркала».' },
  { id: '2', name: 'Сахароза', formula: 'C₁₂H₂₂O₁₁', description: 'Дисахарид, состоящий из остатков глюкозы и фруктозы. Известна как обычный пищевой сахар. Самый сладкий углевод в быту.' },
  { id: '3', name: 'Натуральный каучук', formula: '(C₅H₈)ₙ', description: 'Полимер изопрена, получаемый из сока гевеи бразильской. В процессе вулканизации серой превращается в прочную резину.' },
  { id: '4', name: 'Метанол', formula: 'CH₃OH', description: 'Сильнейший яд! Одноатомный спирт, вызывающий слепоту и летальный исход при употреблении даже в малых дозах.' },
  { id: '5', name: 'Глицерин', formula: 'C₃H₅(OH)₃', description: 'Трехатомный спирт с характерным сладким вкусом. Применяется в медицине, косметике и производстве динамита.' },
  { id: '6', name: 'Белки', formula: 'Биополимеры', description: 'Цепочки аминокислот, соединенных пептидными связями. Основа структуры и метаболизма любой живой клетки.' }
];
let studentResults: any[] = [];

try {
  if (fs.existsSync(DB_FILE)) {
    const data = JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
    catalog = data.catalog || catalog;
    referenceData = data.referenceData || referenceData;
    studentResults = data.studentResults || studentResults;
  }
} catch (e) {
  console.error("Failed to load db file", e);
}

function saveData() {
  fs.writeFileSync(DB_FILE, JSON.stringify({ catalog, referenceData, studentResults }));
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- API Routes ---
  
  app.get("/api/state", (req, res) => {
    res.json({ catalog, referenceData, studentResults });
  });

  app.post("/api/catalog", (req, res) => {
    catalog = req.body;
    saveData();
    res.json({ success: true, catalog });
  });

  app.post("/api/reference", (req, res) => {
    referenceData = req.body;
    saveData();
    res.json({ success: true, referenceData });
  });

  app.post("/api/results", (req, res) => {
    studentResults.push(req.body);
    saveData();
    res.json({ success: true, studentResults });
  });

  app.post("/api/generate-hints", async (req, res) => {
    try {
      const { topicName } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY is not set." });
      }

      const ai = new GoogleGenAI({ apiKey });
      const prompt = `Ты — эксперт по органической химии. Составь 3 тестовых вопроса (загадки) для школьников по теме "${topicName}". 
Ответь ТОЛЬКО в формате JSON-массива объектов. Без markdown-обрамления.
Формат каждого объекта:
{
  "q": "Текст загадки или вопроса",
  "a": "Правильный химический термин/вещество",
  "options": ["Правильный ответ", "Неправильный 1", "Неправильный 2", "Неправильный 3"]
}`;
      
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      });

      let text = response.text || "[]";
      // Clean up potential markdown formatting if model still adds it
      text = text.replace(/^```json/g, "").replace(/^```/g, "").replace(/```$/g, "").trim();
      
      const questions = JSON.parse(text);
      
      // Assign unique IDs to the generated questions
      const withIds = questions.map((q: any) => ({
        ...q,
        id: Date.now() + Math.random()
      }));

      res.json({ questions: withIds });
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: e.message || "Ошибка генерации вопросов." });
    }
  });

  app.post("/api/generate-illustration", async (req, res) => {
    try {
      const { name } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY is not set." });
      }

      const ai = new GoogleGenAI({ apiKey, httpOptions: { headers: { 'User-Agent': 'aistudio-build' } } });
      const prompt = `A realistic dark premium photo of ${name} in nature or everyday life. Dark background, moody lighting, highly detailed.`;
      
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-image",
        contents: {
          parts: [{ text: prompt }]
        },
        config: {
          imageConfig: {
            aspectRatio: "1:1"
          }
        }
      });

      let imageUrl = null;
      if (response.candidates && response.candidates[0] && response.candidates[0].content && response.candidates[0].content.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            imageUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
            break;
          }
        }
      }

      if (imageUrl) {
        res.json({ imageUrl });
      } else {
         res.status(500).json({ error: "Не удалось сгенерировать изображение." });
      }
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: e.message || "Ошибка генерации иллюстрации" });
    }
  });

  // --- Vite / Static Middleware ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
