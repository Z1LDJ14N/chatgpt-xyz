export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

    // Kode ini mencari GEMINI_API_KEY di pengaturan Vercel kamu
    const API_KEY = process.env.GEMINI_API_KEY;

    if (!API_KEY) {
        return res.status(500).json({ reply: "[KESALAHAN]: API_KEY_NOT_FOUND. Pastikan di Vercel namanya GEMINI_API_KEY" });
    }

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: "Kamu adalah sistem AI Cyber Security. Jawab singkat: " + req.body.message }]
                }]
            })
        });

        const data = await response.json();
        
        if (data.error) {
            return res.status(500).json({ reply: "[ERROR GOOGLE]: " + data.error.message });
        }

        const reply = data.candidates[0].content.parts[0].text;
        res.status(200).json({ reply });
        
    } catch (err) {
        res.status(500).json({ reply: "[CRITICAL ERROR]: Gagal menyambung ke server." });
    }
}
