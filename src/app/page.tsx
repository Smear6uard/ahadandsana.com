export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <div className="max-w-2xl rounded-2xl border border-stone-200 bg-white p-10 shadow-sm">
        <p className="text-sm uppercase tracking-[0.3em] text-stone-500">
          ahadandsana.com
        </p>
        <h1 className="mt-4 text-3xl font-semibold text-stone-900">
          Wedding RSVP backend is configured.
        </h1>
        <p className="mt-4 text-base leading-7 text-stone-600">
          This project currently exposes the RSVP and admin API routes, database
          schema, and middleware protection. The frontend UI will be added
          later.
        </p>
      </div>
    </main>
  );
}
