export const sendToAI = async (words) => {
    try {
        console.log("الكلمات المرسلة إلى الذكاء الاصطناعي:", words); // للتأكد من أن الكلمات مرسلة بشكل صحيح
        const response = await fetch("http://localhost:5000/generate-sentence", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ words }),
        });
        const data = await response.json();
        document.getElementById("sentence-result").innerText = data.sentence;
    } catch (error) {
        console.error("حدث خطأ أثناء إرسال الكلمات إلى الذكاء الاصطناعي:", error);
    }
};