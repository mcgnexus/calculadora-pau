// api/mistral.js - Función serverless para Mistral
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método no permitido' });
    }

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    try {
        const { prompt, resultado } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: 'Prompt requerido' });
        }

        const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`
            },
            body: JSON.stringify({
                model: 'mistral-large-latest',
                messages: [
                    {
                        role: 'system',
                        content: 'Eres un profesor especializado en preparación para la PAU/Selectividad. Explica paso a paso cómo resolver problemas de cálculo para estudiantes de 2º bachillerato. NO uses LaTeX ni símbolos complejos. Usa texto plano y símbolos básicos como ^, /, *, etc. Enfócate en métodos que aparecen en exámenes de Selectividad.'
                    },
                    {
                        role: 'user',
                        content: `Explica paso a paso cómo resolver este problema de nivel PAU/Selectividad: ${prompt}. El resultado es: ${resultado}. Usa notación simple sin LaTeX, con explicación pedagógica apropiada para estudiantes de bachillerato.`
                    }
                ],
                temperature: 0.3,
                max_tokens: 1000
            })
        });

        if (!response.ok) {
            throw new Error(`Mistral API error: ${response.status}`);
        }

        const data = await response.json();
        
        return res.status(200).json({
            success: true,
            explicacion: data.choices[0].message.content.trim(),
            tokens: data.usage?.total_tokens || 0,
            modelo: 'Mistral Large'
        });

    } catch (error) {
        console.error('Mistral error:', error);
        return res.status(500).json({
            success: false,
            error: 'Error al procesar la solicitud'
        });
    }
}
