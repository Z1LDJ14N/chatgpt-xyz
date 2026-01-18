export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('Dilarang');

    const API_KEY = process.env.GEMINI_API_KEY;

    if (!API_KEY) {
        return res.status(500).json({ reply: "[SISTEM]: Kunci API belum terpasang di Vercel." });
    }

    try {
        // Menggunakan v1 (bukan v1beta) agar lebih stabil di region Asia
        const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: "Kamu adalah AI Cyber Security. Jawab dengan singkat dan padat: " + req.body.message }]
                }],
                // Tambahan setting agar tidak kena blokir filter konten
                safetySettings: [
                    { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
                    { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" }
                ]
            })
        });

        const data = await response.json();
        
        if (data.error) {
            return res.status(500).json({ reply: "[GOOGLE REJECTED]: " + data.error.message });
        }

        if (data.candidates && data.candidates[0].content) {
            const reply = data.candidates[0].content.parts[0].text;
            res.status(200).json({ reply });
        } else {
            res.status(500).json({ reply: "[SISTEM]: Respon kosong. Cek kuota API kamu." });
        }
        
    } catch (err) {
        res.status(500).json({ reply: "[SISTEM]: Gagal menghubungi server pusat. Cek sinyal!" });
    }
}
