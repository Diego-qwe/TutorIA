"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import {
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";

import {
  doc,
  getDoc,
} from "firebase/firestore";

import {
  auth,
  db,
} from "@/lib/firebase";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Debes ingresar tu correo y contraseña.");
      return;
    }

    setLoading(true);

    try {
      // 1. Iniciar sesión con Firebase
      const credencial =
        await signInWithEmailAndPassword(
          auth,
          email.trim(),
          password
        );

      const uid = credencial.user.uid;

      // 2. Buscar perfil del usuario
      const usuarioRef = doc(
        db,
        "usuarios",
        uid
      );

      const usuarioSnap =
        await getDoc(usuarioRef);

      // 3. Comprobar que exista el perfil
      if (!usuarioSnap.exists()) {
        await signOut(auth);

        setError(
          "No encontramos tu perfil en TutorIA."
        );

        return;
      }

      const datos = usuarioSnap.data();

      // 4. Comprobar si la cuenta está activa
      if (datos.activo === false) {
        await signOut(auth);

        setError(
          "Tu cuenta se encuentra desactivada. Contacta al administrador del Colegio Antares."
        );

        return;
      }

      // 5. Comprobar autorización
      if (datos.autorizado !== true) {
        await signOut(auth);

        setError(
          "Tu cuenta está pendiente de autorización."
        );

        return;
      }

      // 6. Comprobar que pertenezca al Colegio Antares
      if (
        datos.establecimientoId &&
        datos.establecimientoId !== "colegio-antares"
      ) {
        await signOut(auth);

        setError(
          "Esta cuenta no pertenece al Colegio Antares."
        );

        return;
      }

      // 7. Leer rol
      const rol = datos.rol || "alumno";

      // 8. Profesor
      if (rol === "profesor") {
        router.replace("/profesor");
        return;
      }

      // 9. Alumno
      if (rol === "alumno") {
        router.replace("/panel");
        return;
      }

      // Cualquier otro rol ya no forma parte
      // de esta versión de TutorIA.
      await signOut(auth);

      setError(
        "Tu cuenta no tiene un rol válido para esta plataforma."
      );

    } catch (err: unknown) {
      console.error(
        "Error al iniciar sesión:",
        err
      );

      const firebaseError = err as {
        code?: string;
      };

      if (
        firebaseError.code === "auth/invalid-credential" ||
        firebaseError.code === "auth/user-not-found" ||
        firebaseError.code === "auth/wrong-password"
      ) {
        setError(
          "Correo o contraseña incorrectos."
        );

      } else if (
        firebaseError.code === "auth/invalid-email"
      ) {
        setError(
          "El correo electrónico no es válido."
        );

      } else if (
        firebaseError.code === "auth/too-many-requests"
      ) {
        setError(
          "Demasiados intentos. Inténtalo nuevamente más tarde."
        );

      } else if (
        firebaseError.code === "auth/network-request-failed"
      ) {
        setError(
          "No se pudo conectar con Firebase. Revisa tu conexión a Internet."
        );

      } else {
        setError(
          "No se pudo iniciar sesión. Inténtalo nuevamente."
        );
      }

    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-4">

      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">

        <div className="mb-7 text-center">

          <div className="mb-3 text-5xl">
            🤖
          </div>

          <h1 className="text-3xl font-bold text-slate-900">
            TutorIA
          </h1>

          <p className="mt-2 font-medium text-blue-600">
            Colegio Antares
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Acceso para estudiantes y profesores
          </p>

        </div>

        <form
          onSubmit={handleLogin}
          className="space-y-5"
        >

          <div>
            <label className="mb-2 block font-medium text-slate-700">
              Correo electrónico
            </label>

            <input
              type="email"
              placeholder="correo@ejemplo.com"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              autoComplete="email"
              required
              className="w-full rounded-xl border border-slate-300 p-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="mb-2 block font-medium text-slate-700">
              Contraseña
            </label>

            <input
              type="password"
              placeholder="********"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              autoComplete="current-password"
              required
              className="w-full rounded-xl border border-slate-300 p-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "Ingresando..."
              : "Ingresar a TutorIA"}
          </button>

        </form>

        <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-3 text-center">
          <p className="text-sm text-blue-800">
            🏫 Plataforma educativa del Colegio Antares
          </p>
        </div>

        <p className="mt-6 text-center text-slate-600">
          ¿No tienes cuenta?{" "}

          <Link
            href="/register"
            className="font-semibold text-blue-600 hover:underline"
          >
            Solicitar acceso
          </Link>
        </p>

        <p className="mt-3 text-center">
          <Link
            href="/"
            className="text-slate-500 hover:underline"
          >
            ← Volver a TutorIA
          </Link>
        </p>

      </div>

    </main>
  );
}