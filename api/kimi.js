// api/kimi.js - Función serverless para Kimi
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método no permitido' });
    }

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    try {
        const { prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: 'Prompt requerido' });
        }

        const response = await fetch('https://api.moonshot.cn/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.KIMI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'moonshot-v1-32k',
                messages: [
                    {
                        role: 'system',
                        content: 'Analiza problemas matemáticos de nivel PAU/Selectividad. Responde en JSON con: {"dificultad": "Básico/Intermedio/Avanzado", "metodos": ["método1", "método2"], "errores_comunes": ["error1", "error2"], "ejemplos_similares": número, "consejos_pau": ["consejo1", "consejo2"]}'
                    },
                    {
                        role: 'user',
                        content: `Analiza este problema de PAU/Selectividad: ${prompt}. Contexto: Estudiante de 2º bachillerato preparando examen de matemáticas de Selectividad.`
                    }
                ],
                temperature: 0.2,
                max_tokens: 1000
            })
        });

        if (!response.ok) {
            throw new Error(`Kimi API error: ${response.status}`);
        }

        const data = await response.json();
        
        let analisis;
        try {
            analisis = JSON.parse(data.choices[0].message.content.trim());
        } catch {
            // Fallback si no puede parsear JSON
            analisis = {
                dificultad: 'Intermedio',
                metodos: ['Reglas de derivación', 'Integración básica'],
                errores_comunes: ['Errores de cálculo', 'Olvido de constantes'],
                ejemplos_similares: 3,
                consejos_pau: ['Revisar el resultado', 'Mostrar todos los pasos']
            };
        }

        return res.status(200).json({
            success: true,
            analisis: analisis,
            tokens: data.usage?.total_tokens || 0,
            modelo: 'Kimi K2'
        });

    } catch (error) {
        console.error('Kimi error:', error);
        return res.status(500).json({
            success: false,
            error: 'Error al procesar la solicitud'
        });
    }
}
