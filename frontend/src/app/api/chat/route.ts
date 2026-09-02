import { NextResponse } from "next/server";

type MensajeHistorial = {
  role: "user" | "assistant";
  content: string;
};

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const message = body.message;
    const materia = body.materia || "General";

    const history: MensajeHistorial[] =
      Array.isArray(body.history)
        ? body.history
        : [];

    // Validar mensaje
    if (
      !message ||
      typeof message !== "string"
    ) {
      return NextResponse.json(
        {
          error: "Mensaje inválido",
        },
        {
          status: 400,
        }
      );
    }

    // API KEY
    const apiKey =
      process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "Falta configurar GEMINI_API_KEY",
        },
        {
          status: 500,
        }
      );
    }

    /*
     * CONVERTIR HISTORIAL
     * AL FORMATO DE GEMINI
     */
    const historialGemini = history
      .filter(
        (item) =>
          item &&
          typeof item.content === "string" &&
          (
            item.role === "user" ||
            item.role === "assistant"
          )
      )

      // Últimos 20 mensajes
      .slice(-20)

      .map((item) => ({
        role:
          item.role === "assistant"
            ? "model"
            : "user",

        parts: [
          {
            text: item.content,
          },
        ],
      }));

    /*
     * PREGUNTA ACTUAL
     */
    const contents = [
      ...historialGemini,

      {
        role: "user",
        parts: [
          {
            text: `
Materia seleccionada: ${materia}

Pregunta del estudiante:

${message}
            `.trim(),
          },
        ],
      },
    ];

    /*
     * TIMEOUT
     *
     * Si Gemini demora más de
     * 30 segundos, cancelamos.
     */
    const controller =
      new AbortController();

    const timeout =
      setTimeout(() => {
        controller.abort();
      }, 30000);

    let response: Response;

    try {
      response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          signal:
            controller.signal,

          body: JSON.stringify({
            systemInstruction: {
              parts: [
                {
                  text: `
Eres TutorIA, un asistente educativo para estudiantes de Chile.

Tu objetivo principal es ayudar al estudiante a aprender.

MATERIAS:

Puedes enseñar:

- Matemática
- Lenguaje
- Historia
- Ciencias
- Inglés
- Conocimientos generales

INSTRUCCIONES GENERALES:

- Explica de forma clara y sencilla.
- Adáptate al nivel del estudiante.
- Ayuda con preparación PAES cuando corresponda.
- Enseña paso a paso cuando sea útil.
- Sé amable y motivador.
- Responde en español salvo que el estudiante pida otro idioma.
- Respeta la materia seleccionada por el estudiante.

MEMORIA Y CONTEXTO:

- Lee siempre el historial antes de responder.
- Mantén continuidad con los mensajes anteriores.
- Recuerda los ejercicios que tú mismo hayas planteado.
- No vuelvas a saludar en cada mensaje si existe historial.
- No actúes como si fuera una conversación nueva cuando existe historial.

EJERCICIOS:

Si acabas de entregar un ejercicio y el estudiante responde con un número, palabra, alternativa o frase corta:

1. Interpreta esa respuesta usando el ejercicio anterior.
2. Comprueba si es correcta.
3. Si es correcta, confírmalo y explica brevemente por qué.
4. Si es incorrecta, explica dónde está el error.
5. Cuando sea posible, permite que el estudiante vuelva a intentarlo antes de entregar toda la solución.

MATEMÁTICA:

Cuando escribas expresiones matemáticas utiliza LaTeX compatible con KaTeX.

Para matemáticas dentro de una oración utiliza:

$expresión$

Para ecuaciones o procedimientos separados utiliza:

$$
expresión
$$

Ejemplo:

Para resolver:

$$
3x - 12 = x + 2
$$

restamos $x$ en ambos lados:

$$
2x - 12 = 2
$$

Luego:

$$
2x = 14
$$

Por lo tanto:

$$
x = 7
$$

No utilices \\( \\) ni \\[ \\] para las fórmulas.

IMPORTANTE:

- No inventes información.
- Si no entiendes la pregunta, pide una aclaración.
- No cambies de tema sin motivo.
- Si el estudiante cambia claramente de tema, responde al nuevo tema.
                  `.trim(),
                },
              ],
            },

            contents,
          }),
        }
      );
    } catch (error) {
      /*
       * Detectar específicamente
       * si fue timeout.
       */
      if (
        error instanceof Error &&
        error.name === "AbortError"
      ) {
        return NextResponse.json(
          {
            error:
              "TutorIA tardó demasiado en responder. Inténtalo nuevamente.",
          },
          {
            status: 504,
          }
        );
      }

      throw error;
    } finally {
      clearTimeout(timeout);
    }

    /*
     * LEER RESPUESTA
     */
    let data;

    try {
      data =
        await response.json();
    } catch {
      return NextResponse.json(
        {
          error:
            "Gemini devolvió una respuesta inválida.",
        },
        {
          status: 502,
        }
      );
    }

    /*
     * ERROR DE GEMINI
     */
    if (!response.ok) {
      console.error(
        "Error Gemini:",
        data
      );

      return NextResponse.json(
        {
          error:
            data?.error?.message ||
            "No fue posible obtener una respuesta de TutorIA.",
        },
        {
          status:
            response.status,
        }
      );
    }

    /*
     * EXTRAER TEXTO
     */
    const reply =
      data?.candidates?.[0]?.content?.parts
        ?.map(
          (part: { text?: string }) =>
            part.text || ""
        )
        .join("")
        .trim();

    /*
     * COMPROBAR RESPUESTA
     */
    if (!reply) {
      console.error(
        "Respuesta Gemini sin texto:",
        data
      );

      return NextResponse.json(
        {
          error:
            "Gemini no devolvió una respuesta.",
        },
        {
          status: 500,
        }
      );
    }

    /*
     * DEVOLVER RESPUESTA
     */
    return NextResponse.json({
      reply,
    });
  } catch (error) {
    console.error(
      "Error TutorIA:",
      error
    );

    return NextResponse.json(
      {
        error:
          "No fue posible conectarse con TutorIA.",
      },
      {
        status: 500,
      }
    );
  }
}