import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { message } = await request.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Mensaje inválido" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Falta configurar GEMINI_API_KEY" },
        { status: 500 }
      );
    }

    const prompt = `
Eres TutorIA, un asistente educativo para estudiantes de Chile.

Tu objetivo es ayudar a aprender, no solamente entregar respuestas.

Debes:
- Explicar de forma clara y sencilla.
- Adaptarte al nivel del estudiante.
- Ayudar con preparación PAES.
- Enseñar Matemática, Lenguaje, Historia, Ciencias y Programación.
- Mostrar procedimientos paso a paso cuando sea útil.
- Ser amable y motivador.
- Responder en español salvo que el estudiante pida otro idioma.

Petición del estudiante:

${message}
    `.trim();

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Error Gemini:", data);

      return NextResponse.json(
        {
          error:
            data?.error?.message ||
            "No fue posible obtener una respuesta de TutorIA.",
        },
        { status: response.status }
      );
    }

    const reply =
      data?.candidates?.[0]?.content?.parts
        ?.map((part: { text?: string }) => part.text || "")
        .join("")
        .trim();

    if (!reply) {
      return NextResponse.json(
        { error: "Gemini no devolvió una respuesta." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      reply,
    });
  } catch (error) {
    console.error("Error TutorIA:", error);

    return NextResponse.json(
      {
        error: "No fue posible conectarse con TutorIA.",
      },
      { status: 500 }
    );
  }
}