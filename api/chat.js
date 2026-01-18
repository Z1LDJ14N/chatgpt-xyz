export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

    if (!process.env.OPENAI_API_KEY) {
        return res.status(500).json({ error: "API Key Server Belum Dikonfigurasi." });
    }

    // INI RAHASIANYA: Instruksi agar AI berperan sebagai Sistem Cyber Security
    const systemPrompt = `
    SYSTEM IDENTITY: You are CYBER-DEFENSE-AI, an advanced automated security terminal persona.
    PROTOCOL:
    1. Your responses must be concise, highly technical, and authoritative.
    2. Use cybersecurity jargon (e.g., "firewall", "encryption", "payload", "vector", "handshake").
    3. Do not act like a helpful assistant. Act like a secure machine interface.
    4. If asked non-technical questions, respond with "[REDACTED] - Irrelevant query." or "Access Denied: Out of scope boundary."
    5. Use formatting like bullet points or code blocks whenever listing information.
    6. Keep responses relatively short and punchy, like terminal output.
    `;

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                // Menambahkan 'system' role di awal
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: req.body.message }
                ],
                temperature: 0.3, // Membuat jawaban lebih kaku/robotik (tidak terlalu kreatif)
                max_tokens: 250 // Membatasi panjang jawaban agar seperti output terminal
            })
        });

        const data = await response.json();
        
        if (data.error) {
            console.error("OpenAI Error:", data.error);
            return res.status(500).json({ error: "OpenAI Upstream Error: " + data.error.message });
        }

        const reply = data.choices[0].message.content;
        res.status(200).json({ reply });
        
    } catch (err) {
        console.error("Server Error:", err);
        res.status(500).json({ error: "Internal System Failure." });
    }
}
