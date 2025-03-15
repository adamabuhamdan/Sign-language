import { categories, imagesData } from './data.js';
import { sendToAI } from './openai.js'; // استيراد دالة sendToAI

// العناصر الأساسية
const categoryTable = document.getElementById("category-table");
const imageContainer = document.getElementById("image-container");

// مصفوفة لتخزين الكلمات المختارة
let selectedWords = [];

// عرض الفئات في القائمة
for (const element of categories) {
    categoryTable.innerHTML += `
        <tr>
            <td class="category-option" data-value="${element.value}">${element.title}</td>
        </tr>
    `;
}

// عرض الصور
function displayImages(images) {
    imageContainer.innerHTML = ""; // مسح المحتوى السابق
    images.forEach(image => {
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
            <img src="${image.imageUrl}" alt="${image.word}" />
            <p>${image.word}</p>
        `;

        // إضافة حدث النقر على الصورة
        card.addEventListener("click", () => {
            if (!selectedWords.includes(image.word)) {
                selectedWords.push(image.word);
                card.style.backgroundColor = "orange"; // تغيير لون البطاقة عند التحديد
                console.log("الكلمات المختارة:", selectedWords);
            } else {
                selectedWords = selectedWords.filter(word => word !== image.word);
                card.style.backgroundColor = "#fff"; // إعادة لون البطاقة إلى الوضع الطبيعي
                console.log("الكلمات المختارة:", selectedWords);
            }
        });

        imageContainer.appendChild(card);
    });
}

// إضافة تفاعلية للقائمة
categoryTable.addEventListener("click", (e) => {
    if (e.target.classList.contains("category-option")) {
        const selectedValue = e.target.getAttribute("data-value");
        if (selectedValue && imagesData[selectedValue]) {
            displayImages(imagesData[selectedValue]);
        }
    }
});

// إرسال المصفوفة إلى الذكاء الاصطناعي
document.getElementById("generate-btn").addEventListener("click", () => {
    if (selectedWords.length > 0) {
        console.log("إرسال الكلمات إلى الذكاء الاصطناعي:", selectedWords);
        sendToAI(selectedWords); // استخدام دالة sendToAI من openai.js
    } else {
        alert("اختر بعض الصور أولاً!");
    }
});