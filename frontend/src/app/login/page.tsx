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
      setError(
        "Debes ingresar tu correo y contraseña."
      );
      return;
    }

    setLoading(true);

    try {
      // 1. INICIAR SESIÓN
      const credencial =
        await signInWithEmailAndPassword(
          auth,
          email.trim(),
          password
        );

      const uid = credencial.user.uid;

      // 2. BUSCAR PERFIL EN FIRESTORE
      const usuarioRef = doc(
        db,
        "usuarios",
        uid
      );

      const usuarioSnap =
        await getDoc(usuarioRef);

      // 3. COMPROBAR QUE EL PERFIL EXISTA
      if (!usuarioSnap.exists()) {
        await signOut(auth);

        setError(
          "Tu cuenta todavía no ha sido autorizada por el administrador."
        );

        return;
      }

      const datos = usuarioSnap.data();

      // 4. COMPROBAR SI LA CUENTA ESTÁ ACTIVA
      if (datos.activo === false) {
        await signOut(auth);

        setError(
          "Tu cuenta se encuentra desactivada. Contacta al administrador de TutorIA."
        );

        return;
      }

      // 5. COMPROBAR AUTORIZACIÓN
      if (datos.autorizado !== true) {
        await signOut(auth);

        setError(
          "Tu cuenta está pendiente de autorización."
        );

        return;
      }

      // 6. COMPROBAR ORGANIZACIÓN
      // Las cuentas antiguas sin daemId seguirán funcionando
      // para no bloquear usuarios de prueba.
      if (
        datos.daemId &&
        datos.daemId !== "pelarco"
      ) {
        await signOut(auth);

        setError(
          "Esta cuenta no pertenece a esta plataforma educativa."
        );

        return;
      }

      // 7. LEER ROL
      const rol =
        datos.rol || "alumno";

      // 8. REDIRECCIÓN SEGÚN ROL

      // Administrador general del DAEM
      if (rol === "admin_daem") {
        router.replace("/admin");
        return;
      }

      // Administrador normal
      if (rol === "admin") {
        router.replace("/admin");
        return;
      }

      // Profesor
      if (rol === "profesor") {
        router.replace("/profesor");
        return;
      }

      // Alumno
      if (rol === "alumno") {
        router.replace("/panel");
        return;
      }

      // Rol desconocido
      await signOut(auth);

      setError(
        "Tu cuenta tiene un rol no reconocido. Contacta al administrador."
      );

    } catch (err: any) {
      console.error(
        "Error al iniciar sesión:",
        err
      );

      if (
        err.code === "auth/invalid-credential" ||
        err.code === "auth/user-not-found" ||
        err.code === "auth/wrong-password"
      ) {
        setError(
          "Correo o contraseña incorrectos."
        );

      } else if (
        err.code === "auth/invalid-email"
      ) {
        setError(
          "El correo electrónico no es válido."
        );

      } else if (
        err.code === "auth/too-many-requests"
      ) {
        setError(
          "Demasiados intentos. Inténtalo nuevamente más tarde."
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
            Plataforma Educativa Comunal
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Acceso para estudiantes, docentes y administradores
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
            🏫 Plataforma destinada a comunidades educativas
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