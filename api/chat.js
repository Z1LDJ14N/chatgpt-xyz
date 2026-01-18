export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

    const API_KEY = process.env.GEMINI_API_KEY;

    if (!API_KEY) {
        return res.status(500).json({ reply: "[KESALAHAN]: GEMINI_API_KEY tidak ditemukan di Vercel." });
    }

    try {
        // Alamat API yang sudah diperbaiki untuk model gemini-1.5-flash
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: "Kamu adalah sistem AI Cyber Security. Jawab dengan singkat dan teknis: " + req.body.message }]
                }]
            })
        });

        const data = await response.json();
        
        // Cek jika Google mengirimkan error
        if (data.error) {
            return res.status(500).json({ reply: "[ERROR GOOGLE]: " + data.error.message });
        }

        // Pastikan struktur data ada sebelum mengambil teks
        if (data.candidates && data.candidates[0].content) {
            const reply = data.candidates[0].content.parts[0].text;
            res.status(200).json({ reply });
        } else {
            res.status(500).json({ reply: "[ERROR]: Format respons Google tidak dikenal." });
        }
        
    } catch (err) {
        res.status(500).json({ reply: "[CRITICAL ERROR]: Gagal menyambung ke server Google." });
    }
}
