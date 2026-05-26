import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";

interface Props {
  searchParams: Promise<{ callbackUrl?: string }>;
}

export default async function LoginPage({ searchParams }: Props) {
  const params = await searchParams;
  const callbackUrl = params.callbackUrl ?? "/notes";

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <Suspense>
          <LoginForm callbackUrl={callbackUrl} />
        </Suspense>
      </div>
    </main>
  );
}
