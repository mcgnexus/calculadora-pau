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
1. Usa notación matemática LaTeX para todas las fórmulas y ecuaciones
2. Explica cada paso del razonamiento de forma clara y pedagógica
3. Después de cada expresión matemática en LaTeX, proporciona su equivalente en formato natural/texto
4. Usa un lenguaje accesible pero preciso
5. Estructura la respuesta con:
   - Planteamiento del problema
   - Desarrollo paso a paso
   - Solución final con interpretación

Ejemplo de formato:
"La derivada de $f(x) = x^2$ es $f'(x) = 2x$ (la derivada de x cuadrado es 2x)"

Mantén un tono didáctico y motivador para estudiantes de bachillerato.`
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
