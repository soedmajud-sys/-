import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

// Middleware for parsing JSON with ample capacity for base64 uploads
app.use(express.json({ limit: "15mb" }));

// Lazy initializer for Gemini Client
let googleGenAI: GoogleGenAI | null = null;

function getGeminiSDK(): GoogleGenAI {
  if (!googleGenAI) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY is not defined in the environment secrets.");
    }
    googleGenAI = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return googleGenAI;
}

// REST API Endpoints

/**
 * Health check endpoint
 */
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

/**
 * AI Request Enhancer - converts conversational Arabic request descriptions into ultra-polished,
 * formal administrative Arabic prose designed for official office communications.
 */
app.post("/api/requests/improve-style", async (req, res) => {
  try {
    const { title, description, category } = req.body;

    if (!description || description.trim().length === 0) {
      return res.status(400).json({ error: "الرجاء إدخال نص الطلب لتحسين صياغته." });
    }

    const ai = getGeminiSDK();
    
    const prompt = `
      أنت تعمل كخبير صياغة إدارية في "المكتب الوطني".
      مهمتك هي إعادة كتابة وصياغة الطلب التالي الوارد من أحد المواطنين/العملاء بطريقة رسمية، أنيقة، واضحة وخالية من الأخطاء اللغوية.
      استخدم لغة إدارية بليغة تعبر عن الاحترام والمهنية العالية.
      
      معطيات الطلب:
      - تصنيف الخدمة: ${category || "خدمات عامة"}
      - عنوان الموضوع: ${title || "بدون عنوان"}
      - صياغة المواطن غير الرسمية: "${description}"

      التعليمات:
      1. ابدأ بتحية إدارية بليغة تليق بـ "المكتب الوطني".
      2. أعد صياغة متن الطلب بوضوح مع إبراز المشكلة أو الخدمة المطلوبة بأدب وتفصيل.
      3. اختتم الطلب بعبارات تقدير وتمني رسمية لائقة.
      4. أخرج فقط النص العربي المعاد صياغته جاهزاً لكي ينسخه المستخدم مباشرة. لا تضف أي نصوص توضيحية أو مقدمات من قبلك خارج نطاق الطلب المعاد صياغته.
    `;

    const result = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    const enhancedText = result.text || "";
    res.json({ success: true, enhancedText: enhancedText.trim() });
  } catch (error: any) {
    console.error("Error in improve-style:", error);
    res.status(500).json({ 
      error: "تعذر تحسين صياغة النص حالياً بواسطة الذكاء الاصطناعي.", 
      details: error.message 
    });
  }
});

/**
 * AI Request Analyzer - performs intelligent semantic categorization, urgency rating, summary extraction,
 * auto-draft generated official response, check for missing items, and lists of corrective next steps.
 */
app.post("/api/requests/analyze", async (req, res) => {
  try {
    const { applicantName, category, title, description, fileName } = req.body;

    if (!description || !title) {
      return res.status(400).json({ error: "الرجاء تزويد موضوع الطلب وتفاصيله لتحليله." });
    }

    const ai = getGeminiSDK();

    const analysisPrompt = `
      أنت نظام الذكاء الاصطناعي التابع لـ "المكتب الوطني" لاستقبال وتصنيف والرد الأولي على طلبات الخدمات الإلكترونية.
      قم بتحليل الطلب التالي بعناية واستخلص البيانات المطلوبة في البنية المحددة.

      بيانات الطلب المقدم:
      - اسم مقدم الطلب: ${applicantName || "مجهول"}
      - التصنيف المبدئي المختار: ${category || "عام"}
      - عنوان الطلب: ${title}
      - تفاصيل ونص الطلب: "${description}"
      - اسم المستند أو الملف المرفق (إن وجد): "${fileName || "لا يوجد"}"

      مهمتك:
      1. تقييم مدى ملاءمة الطلب للتصنيف المحدد أو التوصية الفضلى لتصنيف دقيق.
      2. تحديد درجة الأولوية والاستعجال للطلب (low للمنخفض، medium للمتوسط، high للعالي/العاجل) مع ذكر سبب منطقي وإداري مقنع لهذا التقييم باللغة العربية الرسمية.
      3. كتابة ملخص مكثف وواضح للطلب في سطر أو سطرين باللغة العربية كمرجع سريع لمسؤولي المكتب.
      4. صياغة رد أولي رسمي متكامل وموجه لمقدم الطلب باسم إدارة المكتب الوطني، يرحب به، ويشكره على تقديم طلبه، ويشرح الخطوات التالية أو الإجراء المتوقع بلغة مهنية راقية جداً.
      5. فحص الطلب لتحديد ما إذا كان هناك أي مستندات أو أوراق أو تفاصيل مفقودة قد يحتاجها المكتب الوطني لاعتماد هذا النوع من الطلبات، وتزويدنا بها في مصفوفة 'missingDetails'.
      6. تقديم درجة ثقة (confidenceScore) تتراوح بين 0 و 1 بناءً على وضوح وتكامل الطلب.
    `;

    const result = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: analysisPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: { 
              type: Type.STRING, 
              description: "Normalized semantic category key (e.g. 'admin', 'licensing', 'finance', 'hr', 'support')" 
            },
            categoryInArabic: { 
              type: Type.STRING, 
              description: "The name of the recommended category in official Arabic" 
            },
            urgency: { 
              type: Type.STRING, 
              description: "Urgency evaluation rating: 'low', 'medium', or 'high'" 
            },
            urgencyReason: { 
              type: Type.STRING, 
              description: "The reasoning behind the urgency assignment drafted in Arabic" 
            },
            summary: { 
              type: Type.STRING, 
              description: "A professional, ultra-concise summary of the request in Arabic" 
            },
            suggestedResponse: { 
              type: Type.STRING, 
              description: "A comprehensive, formal draft response acknowledging the applicant and outlining exact steps in Arabic" 
            },
            missingDetails: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Array of documents, certificates, or details that might be missing or useful for this request type"
            },
            confidenceScore: { 
              type: Type.NUMBER, 
              description: "Analysis confidence index from 0.0 to 1.0 based on request quality" 
            }
          },
          required: [
            "category", 
            "categoryInArabic", 
            "urgency", 
            "urgencyReason", 
            "summary", 
            "suggestedResponse", 
            "missingDetails", 
            "confidenceScore"
          ]
        }
      }
    });

    const textResponse = result.text || "{}";
    const structuredAnalysis = JSON.parse(textResponse.trim());

    res.json({ success: true, analysis: structuredAnalysis });
  } catch (error: any) {
    console.error("Error in analyze-request:", error);
    res.status(500).json({ 
      error: "حدث خطأ أثناء إجراء تحليل الذكاء الاصطناعي للطلب.", 
      details: error.message 
    });
  }
});

// Configure Vite integration or static file rendering

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Development Mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    
    app.use(vite.middlewares);
    console.log("Started in DEVELOPMENT mode - Vite middleware mounted.");
  } else {
    // Production Mode
    const distPath = path.join(process.cwd(), "dist");
    
    // Serve client build package static assets
    app.use(express.static(distPath));
    
    // Handing SPA client side router
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Started in PRODUCTION mode - Static folder served:", distPath);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`National Office Service Requests Server listening on port ${PORT}`);
    console.log(`Local Access: http://localhost:${PORT}`);
  });
}

startServer();
