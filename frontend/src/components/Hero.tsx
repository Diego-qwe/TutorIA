import Link from "next/link";

export default function Hero() {
  return (
    <section className="p-10 text-center">

      <h1 className="text-5xl font-bold mb-6">
        Aprende mejor con TutorIA 🚀
      </h1>

      <p className="text-xl mb-8">
        Tu tutor inteligente con inteligencia artificial para aprender,
        practicar y mejorar cada día.
      </p>

      <div className="flex justify-center gap-4">

        <Link
          href="/panel"
          className="px-6 py-3 rounded-lg bg-blue-600 text-white"
        >
          Comenzar ahora
        </Link>

        <button className="px-6 py-3 rounded-lg border">
          Conocer más
        </button>

      </div>

    </section>
  );
}