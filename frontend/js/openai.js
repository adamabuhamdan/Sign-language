export async function sendToAI(words) {
    try {
        const response = await fetch("http://localhost:5000/generate-sentence", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ words }),
        });

        const data = await response.json();
        if (data.sentence) {
            console.log("الجملة الناتجة:", data.sentence);
            alert("الجملة الناتجة: " + data.sentence);
        } else {
            console.error("لم يتم إنشاء جملة.");
        }
    } catch (error) {
        console.error("حدث خطأ أثناء الاتصال بالخادم:", error);
    }
}