import mongoose from "mongoose";

// الاتصال بقاعدة البيانات
export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { dbName: "test" });
    console.log("تم الاتصال بقاعدة البيانات بنجاح");
  } catch (error) {
    console.error("خطأ في الاتصال بقاعدة البيانات:", error);
    process.exit(1); // إيقاف التطبيق في حالة فشل الاتصال
  }
};

// نماذج Mongoose
const CategorySchema = new mongoose.Schema({
  title: String,
  value: String,
});

const ImageSchema = new mongoose.Schema({
  categoryValue: String,
  imageUrl: String,
  word: String,
});

// تصدير النماذج
export const Category = mongoose.model("Category", CategorySchema, "test.categories");
export const Image = mongoose.model("Image", ImageSchema, "images");