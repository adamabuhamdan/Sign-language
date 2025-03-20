
import express from "express";
import cors from "cors";
import axios from "axios";
import dotenv from "dotenv";
import NodeCache from "node-cache"; // استيراد مكتبة التخزين المؤقت
import { connectDB, Category, Image } from "./db.js"; // استيراد وظيفة الاتصال والنماذج

dotenv.config(); // تحميل متغيرات البيئة

const app = express();
app.use(cors());
app.use(express.json());

// تهيئة التخزين المؤقت
const cache = new NodeCache({ stdTTL: 600 }); // تخزين النتائج لمدة 10 دقائق

// الاتصال بقاعدة البيانات
connectDB(); // استدعاء وظيفة الاتصال

// نقطة النهاية لجلب الفئات
app.get("/categories", async (req, res) => {
  try {
    const categories = await Category.find({});
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: "حدث خطأ أثناء جلب الفئات" });
  }
});

// نقطة النهاية لجلب الصور بناءً على الفئة
app.get("/images/:categoryValue", async (req, res) => {
  try {
    const { categoryValue } = req.params;
    const images = await Image.find({ categoryValue });
    res.json(images);
  } catch (error) {
    res.status(500).json({ error: "حدث خطأ أثناء جلب الصور" });
  }
});

// نقطة النهاية لإنشاء الجملة باستخدام OpenRouter.ai
app.post("/generate-sentence", async (req, res) => {
  try {
    const { words } = req.body;
    if (!words || words.length === 0) {
      return res.status(400).json({ error: "يرجى إرسال كلمات صحيحة." });
    }

    // التحقق من التخزين المؤقت
    const cacheKey = words.join(",");
    const cachedSentence = cache.get(cacheKey);
    if (cachedSentence) {
      return res.json({ sentence: cachedSentence });
    }

    // إرسال الطلب إلى OpenRouter.ai
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "deepseek/deepseek-r1-zero:free", // النموذج المطلوب
        messages: [
          {
            role: "system",
            content:
              "أنت مساعد يقوم بإنشاء جمل مفيدة ومترابطة من الكلمات المدخلة. يجب أن تكون الجملة منطقية وذات معنى، وليست مجرد كلمات متتالية. استخدم الكلمات التالية لإنشاء جملة مفيدة:",
          },
          {
            role: "user",
            content: `أنشئ جملة مترابطة من الكلمات التالية: ${words.join("، ")}. يجب أن تكون الجملة قصيرة وواضحة وذات معنى.`,
          },
        ],
        max_tokens: 100, // تقليل عدد الرموز لتسريع الاستجابة
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "HTTP-Referer": process.env.YOUR_SITE_URL || "https://your-site.com", // عنوان موقعك
          "X-Title": process.env.YOUR_SITE_NAME || "Your Site Name", // اسم موقعك
          "Content-Type": "application/json",
        },
      }
    );

    // استخراج الجملة من الاستجابة
    const message = response.data.choices[0].message;
    let sentence = message.content;

    if (!sentence && message.reasoning) {
      const match = message.reasoning.match(/"(.*?)"/);
      if (match) {
        sentence = match[1]; // استخراج الجملة بين علامتي الاقتباس
      }
    }
    if (sentence) {
      sentence = sentence.replace(/\boxed{"/, "").replace(/"}/, ""); // إزالة \boxed{}
      sentence = sentence.replace(/"/g, ""); // إزالة علامات التنصيص
    }

    // تخزين الجملة مؤقتًا
    cache.set(cacheKey, sentence);

    // إرجاع الجملة الناتجة
    res.json({ sentence });
  } catch (error) {
    console.error("خطأ أثناء الاتصال بـ OpenRouter.ai:", error);
    res.status(500).json({ error: "حدث خطأ أثناء إنشاء الجملة." });
  }
});

// تشغيل الخادم
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 الخادم يعمل على: http://localhost:${PORT}`);
});