export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

    const API_KEY = process.env.GEMINI_API_KEY;

    if (!API_KEY) {
        return res.status(500).json({ reply: "[ERROR]: Kunci API belum ada di Vercel." });
    }

    try {
        // Pakai model gemini-pro (versi 1.0) - Paling stabil buat gratisan
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: "Jawab dengan singkat sebagai AI Security: " + req.body.message }]
                }]
            })
        });

        const data = await response.json();
        
        if (data.error) {
            return res.status(500).json({ reply: "[GOOGLE ERROR]: " + data.error.message });
        }

        if (data.candidates && data.candidates[0].content) {
            const reply = data.candidates[0].content.parts[0].text;
            res.status(200).json({ reply });
        } else {
            res.status(500).json({ reply: "[SISTEM]: Tidak ada respon dari AI." });
        }
        
    } catch (err) {
        res.status(500).json({ reply: "[SISTEM]: Gagal koneksi." });
    }
}
