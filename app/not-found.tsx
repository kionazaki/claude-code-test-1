import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-8xl font-bold text-violet-100">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-zinc-800">
          Page not found
        </h2>
        <p className="mt-2 text-sm text-zinc-500">
          This page doesn&apos;t exist or the note is no longer available.
        </p>
        <Link
          href="/notes"
          className="mt-6 inline-block rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 transition-colors"
        >
          Go to Notes
        </Link>
      </div>
    </main>
  );
}
