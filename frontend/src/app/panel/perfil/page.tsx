"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function PerfilPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.replace("/login");
        return;
      }

      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  async function cerrarSesion() {
    try {
      await signOut(auth);
      router.replace("/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-xl">
          Cargando perfil... 👤
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="max-w-2xl mx-auto">

        <Link
          href="/panel"
          className="inline-block mb-6 text-blue-600 hover:underline"
        >
          ← Volver al panel
        </Link>

        <div className="bg-white rounded-2xl shadow p-8">

          <div className="text-center mb-8">
            <div className="text-7xl mb-4">
              👤
            </div>

            <h1 className="text-3xl font-bold">
              Mi perfil
            </h1>

            <p className="text-gray-500 mt-2">
              Tu cuenta de TutorIA
            </p>
          </div>

          <div className="space-y-5">

            <div className="border rounded-xl p-4">
              <p className="text-sm text-gray-500">
                Nombre
              </p>

              <p className="text-lg font-semibold">
                {user?.displayName || "Estudiante"}
              </p>
            </div>

            <div className="border rounded-xl p-4">
              <p className="text-sm text-gray-500">
                Correo electrónico
              </p>

              <p className="text-lg font-semibold break-all">
                {user?.email}
              </p>
            </div>

            <div className="border rounded-xl p-4">
              <p className="text-sm text-gray-500">
                Estado
              </p>

              <p className="text-lg font-semibold text-green-600">
                🟢 Cuenta activa
              </p>
            </div>

          </div>

          <button
            onClick={cerrarSesion}
            className="w-full mt-8 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition"
          >
            Cerrar sesión
          </button>

        </div>
      </div>
    </main>
  );
}