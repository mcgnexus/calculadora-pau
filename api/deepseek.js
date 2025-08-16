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
                        content: `Eres un experto en matemáticas para estudiantes de 2º bachillerato preparando la PAU/Selectividad. 

INSTRUCCIONES DE FORMATO:
1. Mantén respuestas cortas y directas: simplifica explicaciones al mínimo esencial
2. Usa notación matemática LaTeX para fórmulas
3. Después de cada LaTeX, proporciona equivalente en texto natural
4. Para derivadas e integrales: refleja pasos clave de resolución de forma concisa (ej: paso 1: identificar función, paso 2: aplicar regla, paso 3: simplificar)
5. Estructura simple: Problema → Pasos → Solución
6. Lenguaje accesible y motivador

Ejemplo para derivada: "Derivada de $f(x)=x^2$: Paso 1: Regla de potencia. Resultado: $f'(x)=2x$ (2x)."`
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.3,
                max_tokens: 800
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
