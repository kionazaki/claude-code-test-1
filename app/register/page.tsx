import { RegisterForm } from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-6">
          <div className="w-11 h-11 rounded-2xl bg-violet-600 flex items-center justify-center shadow-lg shadow-violet-200">
            <span className="text-white text-xl font-bold leading-none">✦</span>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-xs ring-1 ring-zinc-950/5 p-8">
          <RegisterForm />
        </div>
      </div>
    </main>
  );
}
