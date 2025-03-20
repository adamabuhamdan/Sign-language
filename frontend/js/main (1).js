

import { sendToAI } from './openai.js';

const categoryTable = document.getElementById("category-table");
const imageContainer = document.getElementById("image-container");
const playAudioBtn = document.getElementById("play-audio-btn");
const overlay = document.getElementById("overlay");
const audioBox = document.getElementById("audio-box");
const closeBoxBtn = document.getElementById("close-box-btn");
const videoOverlay = document.getElementById("video-overlay");
const closeVideoBtn = document.getElementById("close-video-btn");
const resetBtn = document.getElementById("reset-btn");
let selectedWords = [];
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

// تحديث التخزين المحلي
function saveFavorites() {
    localStorage.setItem("favorites", JSON.stringify(favorites));
}

// جلب الفئات من الخادم
async function fetchCategories() {
    try {
        const response = await fetch("http://localhost:5000/categories");
        const categories = await response.json();
        categoryTable.innerHTML = `
            <tr><td class="category-option" data-value="favorites">✪ المفضلة</td></tr>
        `;
        categories.forEach(category => {
            categoryTable.innerHTML += `
                <tr><td class="category-option" data-value="${category.value}">${category.title}</td></tr>
            `;
        });
    } catch (error) {
        console.error("حدث خطأ أثناء جلب الفئات:", error);
    }
}

// جلب الصور بناءً على الفئة
async function fetchImages(categoryValue) {
    try {
        const response = await fetch(`http://localhost:5000/images/${categoryValue}`);
        const images = await response.json();
        displayImages(images);
    } catch (error) {
        console.error("حدث خطأ أثناء جلب الصور:", error);
    }
}

function displayImages(images) {
    imageContainer.innerHTML = "";
    images.forEach(image => {
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
            <img src="${image.imageUrl}" alt="${image.word}" />
            <p>${image.word}</p>
            <span class="star">&#9734;</span>
        `;

        const star = card.querySelector(".star");
        const isFav = favorites.some(fav => fav.word === image.word);
        if (isFav) star.innerHTML = "&#9733;";

        card.addEventListener("click", () => {
            if (!selectedWords.includes(image.word)) {
                selectedWords.push(image.word);
                card.style.backgroundColor = "#9ea1d4";
                card.style.fontSize = "17px";
                card.style.color = "white";
            } else {
                selectedWords = selectedWords.filter(word => word !== image.word);
                if (document.body.classList.contains("dark-mode")) {
                    card.style.backgroundColor = "#2e2e2e";
                    card.style.color = "white";
                }
                else{
                    card.style.backgroundColor = "#ffff";
                    card.style.color = " #1e1e1e";
                }
                card.style.fontSize = "16px";
                
            }
        });

        star.addEventListener("click", (e) => {
            e.stopPropagation();
            const exists = favorites.some(fav => fav.word === image.word);
            if (exists) {
                favorites = favorites.filter(fav => fav.word !== image.word);
                star.innerHTML = "&#9734;";
            } else {
                favorites.push(image);
                star.innerHTML = "&#9733;";
            }
            saveFavorites();
        });

        imageContainer.appendChild(card);
    });
}

categoryTable.addEventListener("click", (e) => {
    if (e.target.classList.contains("category-option")) {
        const selectedValue = e.target.getAttribute("data-value");
        if (selectedValue === "favorites") {
            displayImages(favorites);
        } else if (selectedValue) {
            fetchImages(selectedValue);
        }
    }
});

document.getElementById("generate-btn").addEventListener("click", () => {
    if (selectedWords.length > 0) {
        sendToAI(selectedWords);
    } else {
        alert("اختر بعض الصور أولاً!");
    }
});

playAudioBtn.addEventListener("click", () => {
    const sentence = document.getElementById("sentence-result").innerText;
    if (sentence && sentence !== "الجملة المتوقعة من الذكاء الاصطناعي") {
        responsiveVoice.speak(sentence, "Arabic Male", {
            rate: 1,
            pitch: 1,
            volume: 1,
            onstart: () => console.log("بدأ التحدث"),
            onend: () => {
                overlay.style.display = "block";
                audioBox.style.display = "block";
            }
        });
    } else {
        alert("لا يوجد جملة لتشغيلها!");
    }
});

closeBoxBtn.addEventListener("click", () => {
    overlay.style.display = "none";
    audioBox.style.display = "none";
});

// جلب الفئات عند تحميل الصفحة
fetchCategories();


// إخفاء الفيديو عند النقر على زر الإغلاق
closeVideoBtn.addEventListener("click", () => {
    videoOverlay.style.display = "none";
});

// إخفاء الفيديو عند انتهاء التشغيل التلقائي
const introVideo = document.getElementById("intro-video");
introVideo.addEventListener("ended", () => {
    videoOverlay.style.display = "none";
});

// وظيفة إعادة تعيين الحالة
function resetApp() {
    // مسح الكلمات المحددة
    selectedWords = [];

    // إعادة تعيين ألوان البطاقات إلى الحالة الافتراضية
    const cards = document.querySelectorAll(".card");
    cards.forEach(card => {
        if (document.body.classList.contains("dark-mode")) {
            card.style.backgroundColor = "#2e2e2e";
            card.style.color = "white";
        } else {
            card.style.backgroundColor = "#ffff";
            card.style.color = "#1e1e1e";
        }
        card.style.fontSize = "16px";
    });

    // إعادة تعيين نص الجملة
    document.getElementById("sentence-result").innerText = "الجملة المتوقعة من الذكاء الاصطناعي";
}

// إضافة حدث النقر لزر إعادة تعيين
resetBtn.addEventListener("click", resetApp);