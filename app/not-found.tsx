import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-200">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-gray-700">
          Page not found
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          This page doesn&apos;t exist or the note is no longer available.
        </p>
        <Link
          href="/notes"
          className="mt-6 inline-block rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
        >
          Go to Notes
        </Link>
      </div>
    </main>
  );
}
