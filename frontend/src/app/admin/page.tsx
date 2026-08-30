"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";

type Usuario = {
  id: string;
  nombre?: string;
  correo?: string;
  autorizado?: boolean;
  rol?: string;
};

export default function AdminPage() {
  const router = useRouter();

  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function cargarUsuarios() {
    try {
      const snapshot = await getDocs(collection(db, "usuarios"));

      const lista: Usuario[] = snapshot.docs.map((documento) => ({
        id: documento.id,
        ...documento.data(),
      }));

      setUsuarios(lista);
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar los usuarios.");
    }
  }

  useEffect(() => {
    const cancelar = onAuthStateChanged(auth, async (usuario) => {
      if (!usuario) {
        router.replace("/login");
        return;
      }

      try {
        // Comprobar que quien entra sea administrador
        const adminRef = doc(db, "usuarios", usuario.uid);
        const adminSnap = await getDoc(adminRef);

        if (!adminSnap.exists()) {
          router.replace("/panel");
          return;
        }

        const datos = adminSnap.data();

        if (
          datos.rol !== "admin" ||
          datos.autorizado !== true
        ) {
          router.replace("/panel");
          return;
        }

        // Es administrador
        await cargarUsuarios();
        setCargando(false);
      } catch (err) {
        console.error(err);
        router.replace("/panel");
      }
    });

    return () => cancelar();
  }, [router]);

  async function cambiarAutorizacion(
    uid: string,
    autorizado: boolean
  ) {
    try {
      setProcesando(uid);
      setError("");

      const usuarioRef = doc(db, "usuarios", uid);

      await updateDoc(usuarioRef, {
        autorizado,
      });

      // Actualizar pantalla sin recargar
      setUsuarios((actuales) =>
        actuales.map((usuario) =>
          usuario.id === uid
            ? { ...usuario, autorizado }
            : usuario
        )
      );
    } catch (err) {
      console.error(err);
      setError("No se pudo modificar el usuario.");
    } finally {
      setProcesando(null);
    }
  }

  if (cargando) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-100">
        <p className="text-xl font-semibold">
          🔐 Verificando administrador...
        </p>
      </main>
    );
  }

  const pendientes = usuarios.filter(
    (usuario) =>
      usuario.autorizado !== true &&
      usuario.rol !== "admin"
  );

  const autorizados = usuarios.filter(
    (usuario) =>
      usuario.autorizado === true &&
      usuario.rol !== "admin"
  );

  return (
    <main className="min-h-screen bg-slate-100 p-6">

      <div className="max-w-5xl mx-auto">

        <div className="bg-slate-900 text-white rounded-2xl p-6 mb-6 shadow-lg">

          <h1 className="text-3xl font-bold">
            🛡️ Administración de TutorIA
          </h1>

          <p className="text-slate-300 mt-2">
            Control de acceso de usuarios
          </p>

        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl mb-6">
            ⚠️ {error}
          </div>
        )}

        {/* SOLICITUDES PENDIENTES */}

        <section className="bg-white rounded-2xl shadow p-6 mb-6">

          <h2 className="text-2xl font-bold mb-5">
            ⏳ Solicitudes pendientes
          </h2>

          {pendientes.length === 0 ? (
            <p className="text-gray-500">
              No hay solicitudes pendientes.
            </p>
          ) : (
            <div className="space-y-4">

              {pendientes.map((usuario) => (
                <div
                  key={usuario.id}
                  className="border rounded-xl p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                >

                  <div>
                    <p className="font-bold text-lg">
                      👤 {usuario.nombre || "Sin nombre"}
                    </p>

                    <p className="text-gray-600">
                      📧 {usuario.correo || "Sin correo"}
                    </p>

                    <p className="text-yellow-600 mt-1">
                      ⏳ Pendiente
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      cambiarAutorizacion(
                        usuario.id,
                        true
                      )
                    }
                    disabled={procesando === usuario.id}
                    className="bg-green-600 text-white px-5 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    {procesando === usuario.id
                      ? "Procesando..."
                      : "✅ Autorizar"}
                  </button>

                </div>
              ))}

            </div>
          )}

        </section>

        {/* USUARIOS AUTORIZADOS */}

        <section className="bg-white rounded-2xl shadow p-6">

          <h2 className="text-2xl font-bold mb-5">
            ✅ Usuarios autorizados
          </h2>

          {autorizados.length === 0 ? (
            <p className="text-gray-500">
              Todavía no hay usuarios autorizados.
            </p>
          ) : (
            <div className="space-y-4">

              {autorizados.map((usuario) => (
                <div
                  key={usuario.id}
                  className="border rounded-xl p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                >

                  <div>
                    <p className="font-bold text-lg">
                      👤 {usuario.nombre || "Sin nombre"}
                    </p>

                    <p className="text-gray-600">
                      📧 {usuario.correo || "Sin correo"}
                    </p>

                    <p className="text-green-600 mt-1">
                      ✅ Autorizado
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      cambiarAutorizacion(
                        usuario.id,
                        false
                      )
                    }
                    disabled={procesando === usuario.id}
                    className="bg-red-600 text-white px-5 py-3 rounded-lg hover:bg-red-700 disabled:opacity-50"
                  >
                    {procesando === usuario.id
                      ? "Procesando..."
                      : "🔒 Bloquear"}
                  </button>

                </div>
              ))}

            </div>
          )}

        </section>

      </div>

    </main>
  );
}