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

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Debes ingresar tu correo y contraseña.");
      return;
    }

    setLoading(true);

    try {
      const credencial = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      const uid = credencial.user.uid;

      const usuarioRef = doc(
        db,
        "usuarios",
        uid
      );

      const usuarioSnap = await getDoc(usuarioRef);

      if (!usuarioSnap.exists()) {
        await signOut(auth);

        setError(
          "Tu cuenta todavía no ha sido autorizada por el administrador."
        );

        return;
      }

      const datos = usuarioSnap.data();

      if (datos.autorizado !== true) {
        await signOut(auth);

        setError(
          "Tu cuenta está pendiente de autorización."
        );

        return;
      }

      router.push("/panel");

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
          "Demasiados intentos. Espera un momento e inténtalo nuevamente."
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
    <main className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg">

        <h1 className="text-3xl font-bold text-center mb-2">
          🤖 Iniciar sesión
        </h1>

        <p className="text-center text-gray-500 mb-6">
          Entra a tu cuenta de TutorIA
        </p>

        <form
          onSubmit={handleLogin}
          className="space-y-4"
        >

          <div>
            <label className="block mb-2 font-medium">
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
              className="w-full border rounded-lg p-3"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">
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
              className="w-full border rounded-lg p-3"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-sm">
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading
              ? "Ingresando..."
              : "Ingresar"}
          </button>

        </form>

        <p className="mt-6 text-center">
          ¿No tienes cuenta?{" "}

          <Link
            href="/register"
            className="text-blue-600 hover:underline"
          >
            Regístrate
          </Link>
        </p>

        <p className="mt-3 text-center">
          <Link
            href="/"
            className="text-gray-500 hover:underline"
          >
            ← Volver a TutorIA
          </Link>
        </p>

      </div>
    </main>
  );
}