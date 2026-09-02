import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-indigo-50 text-gray-900">
      
      {/* Barra superior */}
      <header className="w-full border-b bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-2xl font-bold text-blue-700">
              TutorIA
            </h1>
            <p className="text-xs text-gray-500">
              Inteligencia Artificial Educativa
            </p>
          </div>

          <Link
            href="/login"
            className="rounded-xl bg-blue-600 px-5 py-2.5 font-semibold text-white transition hover:bg-blue-700"
          >
            Comenzar
          </Link>
        </div>
      </header>

      {/* Presentación */}
      <section className="mx-auto flex min-h-[70vh] max-w-7xl flex-col items-center justify-center px-6 py-20 text-center">
        
        <div className="mb-6 rounded-full bg-blue-100 px-5 py-2 text-sm font-semibold text-blue-700">
          Educación + Inteligencia Artificial
        </div>

        <h2 className="max-w-4xl text-4xl font-extrabold leading-tight md:text-6xl">
          Aprende con el apoyo de{" "}
          <span className="text-blue-600">
            TutorIA
          </span>
        </h2>

        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-gray-600 md:text-xl">
          Una plataforma educativa diseñada para acompañar a estudiantes
          mediante explicaciones, ejercicios, práctica y apoyo personalizado
          con inteligencia artificial.
        </p>

        <Link
          href="/login"
          className="mt-10 rounded-2xl bg-blue-600 px-10 py-4 text-lg font-bold text-white shadow-lg transition hover:-translate-y-1 hover:bg-blue-700 hover:shadow-xl"
        >
          Comenzar
        </Link>

        <p className="mt-4 text-sm text-gray-500">
          Accede con tu cuenta de TutorIA
        </p>
      </section>

      {/* Funciones */}
      <section className="bg-white px-6 py-20">
        <div className="mx-auto max-w-7xl">
          
          <div className="mb-14 text-center">
            <h2 className="text-3xl font-bold md:text-4xl">
              Todo lo que necesitas para aprender
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-gray-600">
              TutorIA entrega herramientas para apoyar el aprendizaje
              dentro y fuera de la sala de clases.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            
            <div className="rounded-2xl border bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <div className="mb-4 text-4xl">
                📚
              </div>

              <h3 className="mb-2 text-xl font-bold">
                Asignaturas
              </h3>

              <p className="text-gray-600">
                Aprende Matemática, Lenguaje, Historia, Ciencias e Inglés.
              </p>
            </div>

            <div className="rounded-2xl border bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <div className="mb-4 text-4xl">
                🤖
              </div>

              <h3 className="mb-2 text-xl font-bold">
                Tutor inteligente
              </h3>

              <p className="text-gray-600">
                Pregunta, aprende y recibe explicaciones adaptadas a tus dudas.
              </p>
            </div>

            <div className="rounded-2xl border bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <div className="mb-4 text-4xl">
                ✏️
              </div>

              <h3 className="mb-2 text-xl font-bold">
                Ejercicios
              </h3>

              <p className="text-gray-600">
                Practica contenidos y refuerza lo aprendido mediante actividades.
              </p>
            </div>

            <div className="rounded-2xl border bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <div className="mb-4 text-4xl">
                📊
              </div>

              <h3 className="mb-2 text-xl font-bold">
                Progreso
              </h3>

              <p className="text-gray-600">
                Revisa tus avances y continúa mejorando durante tu aprendizaje.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Establecimientos */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-5xl rounded-3xl bg-blue-600 px-8 py-14 text-center text-white shadow-xl">
          
          <h2 className="text-3xl font-bold md:text-4xl">
            TutorIA para establecimientos educacionales
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-lg text-blue-100">
            Una herramienta tecnológica para complementar el aprendizaje
            de los estudiantes y entregar nuevas posibilidades de apoyo
            educativo.
          </p>

          <Link
            href="/login"
            className="mt-8 inline-block rounded-xl bg-white px-8 py-3 font-bold text-blue-700 transition hover:bg-blue-50"
          >
            Comenzar
          </Link>

        </div>
      </section>

      {/* Pie */}
      <footer className="border-t bg-white px-6 py-8 text-center">
        <p className="font-semibold text-gray-700">
          TutorIA
        </p>

        <p className="mt-1 text-sm text-gray-500">
          Inteligencia Artificial al servicio de la educación
        </p>
      </footer>

    </main>
  );
}