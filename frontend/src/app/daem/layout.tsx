"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

import { auth, db } from "@/lib/firebase";

export default function DaemLayout({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();

  const [verificando, setVerificando] = useState(true);
  const [permitido, setPermitido] = useState(false);
  const [mensaje, setMensaje] = useState("Verificando acceso...");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (usuario) => {
      // No hay sesión iniciada
      if (!usuario) {
        setMensaje("Debes iniciar sesión.");
        setPermitido(false);
        setVerificando(false);

        setTimeout(() => {
          router.replace("/");
        }, 1000);

        return;
      }

      try {
        // Buscar los datos del usuario en Firestore
        const referenciaUsuario = doc(
          db,
          "usuarios",
          usuario.uid
        );

        const documentoUsuario = await getDoc(
          referenciaUsuario
        );

        if (!documentoUsuario.exists()) {
          setMensaje(
            "Tu cuenta no tiene información registrada."
          );

          setPermitido(false);
          setVerificando(false);

          setTimeout(() => {
            router.replace("/");
          }, 1500);

          return;
        }

        const datos = documentoUsuario.data();

        const rol = String(
          datos.rol ?? ""
        ).toLowerCase();

        const autorizado =
          datos.autorizado === true;

        const activo =
          datos.activo !== false;

        const daemId =
          datos.daemId ?? "";

        // Solo cuentas DAEM autorizadas de Pelarco
        if (
          rol === "daem" &&
          autorizado &&
          activo &&
          daemId === "pelarco"
        ) {
          setPermitido(true);
          setVerificando(false);
          return;
        }

        // Usuario conectado, pero sin permiso
        setMensaje(
          "No tienes autorización para acceder al Panel DAEM."
        );

        setPermitido(false);
        setVerificando(false);

        setTimeout(() => {
          router.replace("/");
        }, 1800);
      } catch (error) {
        console.error(
          "Error verificando acceso DAEM:",
          error
        );

        setMensaje(
          "No se pudo verificar tu autorización."
        );

        setPermitido(false);
        setVerificando(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (verificando) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="rounded-3xl bg-white p-10 text-center shadow-lg">
          <div className="mb-4 text-5xl">
            🔒
          </div>

          <h1 className="text-2xl font-bold text-slate-900">
            TutorIA
          </h1>

          <p className="mt-3 text-slate-600">
            Verificando acceso...
          </p>
        </div>
      </main>
    );
  }

  if (!permitido) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="max-w-md rounded-3xl bg-white p-10 text-center shadow-lg">
          <div className="mb-4 text-5xl">
            ⛔
          </div>

          <h1 className="text-2xl font-bold text-slate-900">
            Acceso restringido
          </h1>

          <p className="mt-3 text-slate-600">
            {mensaje}
          </p>

          <p className="mt-4 text-sm text-slate-400">
            TutorIA • DAEM Pelarco
          </p>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}