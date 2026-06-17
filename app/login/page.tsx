import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";

interface Props {
  searchParams: Promise<{ callbackUrl?: string }>;
}

export default async function LoginPage({ searchParams }: Props) {
  const params = await searchParams;
  // Validate callbackUrl to prevent open redirect — only allow relative paths
  const raw = params.callbackUrl ?? "";
  const callbackUrl =
    raw.startsWith("/") && !raw.startsWith("//") ? raw : "/notes";

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-6">
          <div className="w-11 h-11 rounded-2xl bg-amber flex items-center justify-center shadow-lg shadow-amber/20">
            <span className="text-ink text-xl font-bold leading-none">✦</span>
          </div>
        </div>
        <div className="bg-surface rounded-2xl shadow-xs ring-1 ring-line p-8">
          <Suspense>
            <LoginForm callbackUrl={callbackUrl} />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
