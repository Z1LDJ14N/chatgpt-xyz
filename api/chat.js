export default async function handler(req, res) {
    // Hanya menerima metode POST
    if (req.method !== 'POST') {
        return res.status(405).json({ reply: "Method Not Allowed" });
    }

    // Mengambil API Key Gemini dari Environment Variables Vercel
    const API_KEY = process.env.GEMINI_API_KEY;

    if (!API_KEY) {
        return res.status(500).json({ reply: "[ERROR]: API_KEY_NOT_FOUND. Periksa pengaturan Vercel." });
    }

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ 
                        text: "Kamu adalah sistem AI Cyber Security yang dingin, teknis, dan profesional. Gunakan istilah keamanan siber dalam jawabanmu. Jawab pesan ini dengan singkat: " + req.body.message 
                    }]
                }]
            })
        });

        const data = await response.json();

        // Cek jika ada error dari Google
        if (data.error) {
            return res.status(500).json({ reply: "[SYSTEM_ERROR]: " + data.error.message });
        }

        // Mengambil teks jawaban
        const reply = data.candidates[0].content.parts[0].text;
        res.status(200).json({ reply });

    } catch (err) {
        res.status(500).json({ reply: "[CRITICAL_FAILURE]: Koneksi ke inti AI terputus." });
    }
}
