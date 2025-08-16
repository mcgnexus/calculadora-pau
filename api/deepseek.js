// api/deepseek.js - Función serverless para DeepSeek
export default async function handler(req, res) {
    // Solo permitir POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método no permitido' });
    }

    // Configurar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    try {
        const { prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: 'Prompt requerido' });
        }

        // Llamar a DeepSeek API
        const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: [
                    {
                        role: 'system',
                        content: 'Eres un experto en matemáticas para estudiantes de 2º bachillerato preparando la PAU/Selectividad. Resuelve problemas de cálculo con precisión. Responde solo con el resultado matemático en notación simple, sin LaTeX.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.2,
                max_tokens: 1000
            })
        });

        if (!response.ok) {
            throw new Error(`DeepSeek API error: ${response.status}`);
        }

        const data = await response.json();
        
        return res.status(200).json({
            success: true,
            resultado: data.choices[0].message.content.trim(),
            tokens: data.usage?.total_tokens || 0,
            modelo: 'DeepSeek V3'
        });

    } catch (error) {
        console.error('DeepSeek error:', error);
        return res.status(500).json({
            success: false,
            error: 'Error al procesar la solicitud'
        });
    }
}
