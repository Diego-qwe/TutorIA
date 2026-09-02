import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";

export const runtime = "nodejs";

function clavesCoinciden(recibida: string, configurada: string) {
  const a = Buffer.from(recibida);
  const b = Buffer.from(configurada);

  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      idToken?: string;
      claveInstitucional?: string;
    };

    const claveConfigurada = process.env.DAEM_ACCESS_KEY;
    const claveRecibida = body.claveInstitucional?.trim() ?? "";

    if (
      !claveConfigurada ||
      !claveRecibida ||
      !clavesCoinciden(claveRecibida, claveConfigurada)
    ) {
      return NextResponse.json(
        { error: "La clave institucional no es válida." },
        { status: 403 }
      );
    }

    // Permite comprobar la clave antes de crear la cuenta para no dejar
    // usuarios huérfanos cuando alguien se equivoca al escribirla.
    if (!body.idToken) {
      return NextResponse.json({ claveValida: true });
    }

    const decodedToken = await getAdminAuth().verifyIdToken(body.idToken);

    await getAdminDb().collection("usuarios").doc(decodedToken.uid).update({
      autorizado: true,
      activo: true,
      accesoInstitucional: true,
      autorizadoEn: new Date(),
    });

    return NextResponse.json({ autorizado: true });
  } catch (error) {
    console.error("Error autorizando acceso institucional:", error);

    return NextResponse.json(
      { error: "No se pudo validar el acceso institucional." },
      { status: 500 }
    );
  }
}
