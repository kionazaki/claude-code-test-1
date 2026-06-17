import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-8xl font-bold text-blush">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-ink">
          Page not found
        </h2>
        <p className="mt-2 text-sm text-ink-faint">
          This page doesn&apos;t exist or the note is no longer available.
        </p>
        <Link
          href="/notes"
          className="mt-6 inline-block rounded-xl bg-amber px-4 py-2 text-sm font-medium text-ink hover:bg-amber-deep transition-colors"
        >
          Go to Notes
        </Link>
      </div>
    </main>
  );
}
