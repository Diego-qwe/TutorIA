"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  onAuthStateChanged,
  signOut,
  User,
} from "firebase/auth";

import {
  doc,
  getDoc,
} from "firebase/firestore";

import { auth, db } from "@/lib/firebase";

type DatosFirestore = {
  nombre?: string;
  correo?: string;
  curso?: string;
  rol?: string;
  autorizado?: boolean;
  activo?: boolean;
};

export default function Perfil() {
  const router = useRouter();

  const [user, setUser] =
    useState<User | null>(null);

  const [datos, setDatos] =
    useState<DatosFirestore | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [cerrando, setCerrando] =
    useState(false);

  useEffect(() => {
    const unsubscribe =
      onAuthStateChanged(
        auth,
        async (currentUser) => {
          if (!currentUser) {
            router.replace("/login");
            return;
          }

          setUser(currentUser);

          try {
            const usuarioRef = doc(
              db,
              "usuarios",
              currentUser.uid
            );

            const snapshot =
              await getDoc(usuarioRef);

            if (snapshot.exists()) {
              setDatos(
                snapshot.data() as DatosFirestore
              );
            } else {
              setDatos(null);
            }
          } catch (error) {
            console.error(
              "Error cargando perfil:",
              error
            );
          } finally {
            setLoading(false);
          }
        }
      );

    return () => unsubscribe();
  }, [router]);

  async function cerrarSesion() {
    try {
      setCerrando(true);

      await signOut(auth);

      router.replace("/login");
    } catch (error) {
      console.error(
        "Error al cerrar sesión:",
        error
      );

      setCerrando(false);
    }
  }

  function nombreRol() {
    switch (datos?.rol) {
      case "admin":
        return "Administrador";

      case "profesor":
        return "Profesor";

      case "alumno":
        return "Estudiante";

      default:
        return "Estudiante";
    }
  }

  function emojiRol() {
    switch (datos?.rol) {
      case "admin":
        return "🛡️";

      case "profesor":
        return "👨‍🏫";

      default:
        return "🎓";
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">

        <div className="text-center">

          <div className="mb-4 text-6xl">
            👤
          </div>

          <p className="text-lg font-semibold text-slate-700">
            Cargando tu perfil...
          </p>

        </div>

      </div>
    );
  }

  const nombre =
    datos?.nombre ||
    user?.displayName ||
    "Estudiante";

  const correo =
    datos?.correo ||
    user?.email ||
    "Sin correo";

  const inicial =
    nombre
      .trim()
      .charAt(0)
      .toUpperCase() || "?";

  return (
    <div className="mx-auto w-full max-w-4xl">

      {/* TÍTULO */}

      <div className="mb-8">

        <h2 className="text-3xl font-bold text-slate-900">
          👤 Mi perfil
        </h2>

        <p className="mt-2 text-slate-600">
          Revisa la información de tu cuenta de TutorIA.
        </p>

      </div>

      {/* TARJETA PRINCIPAL */}

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">

        {/* CABECERA DEL PERFIL */}

        <div className="bg-blue-600 px-6 py-8 text-white md:px-10">

          <div className="flex flex-col items-center gap-5 text-center md:flex-row md:text-left">

            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-white text-4xl font-bold text-blue-600 shadow">
              {inicial}
            </div>

            <div>

              <h3 className="text-3xl font-bold">
                {nombre}
              </h3>

              <p className="mt-2 text-blue-100">
                {correo}
              </p>

              <div className="mt-4 inline-flex rounded-full bg-white/20 px-4 py-2 text-sm font-semibold">
                {emojiRol()} {nombreRol()}
              </div>

            </div>

          </div>

        </div>

        {/* DATOS */}

        <div className="p-6 md:p-10">

          <h3 className="mb-5 text-xl font-bold text-slate-900">
            Información de la cuenta
          </h3>

          <div className="grid gap-5 md:grid-cols-2">

            {/* NOMBRE */}

            <div className="rounded-xl border border-slate-200 p-5">

              <p className="text-sm font-medium text-slate-500">
                👤 Nombre
              </p>

              <p className="mt-2 text-lg font-semibold text-slate-900">
                {nombre}
              </p>

            </div>

            {/* CORREO */}

            <div className="rounded-xl border border-slate-200 p-5">

              <p className="text-sm font-medium text-slate-500">
                ✉️ Correo electrónico
              </p>

              <p className="mt-2 break-all text-lg font-semibold text-slate-900">
                {correo}
              </p>

            </div>

            {/* CURSO */}

            <div className="rounded-xl border border-slate-200 p-5">

              <p className="text-sm font-medium text-slate-500">
                📚 Curso
              </p>

              <p className="mt-2 text-lg font-semibold text-slate-900">
                {datos?.curso ||
                  "No especificado"}
              </p>

            </div>

            {/* ROL */}

            <div className="rounded-xl border border-slate-200 p-5">

              <p className="text-sm font-medium text-slate-500">
                🎓 Tipo de cuenta
              </p>

              <p className="mt-2 text-lg font-semibold text-slate-900">
                {emojiRol()} {nombreRol()}
              </p>

            </div>

            {/* ESTADO */}

            <div className="rounded-xl border border-slate-200 p-5 md:col-span-2">

              <p className="text-sm font-medium text-slate-500">
                Estado de la cuenta
              </p>

              <p className="mt-2 text-lg font-semibold text-green-600">
                🟢 Cuenta activa
              </p>

            </div>

          </div>

          {/* SESIÓN */}

          <div className="mt-8 border-t border-slate-200 pt-8">

            <h3 className="font-bold text-slate-900">
              Sesión
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Puedes cerrar tu sesión de TutorIA en este dispositivo.
            </p>

            <button
              type="button"
              onClick={cerrarSesion}
              disabled={cerrando}
              className="mt-5 rounded-xl bg-red-600 px-6 py-3 font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {cerrando
                ? "Cerrando sesión..."
                : "🚪 Cerrar sesión"}
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}