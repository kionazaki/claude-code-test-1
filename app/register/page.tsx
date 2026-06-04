import { RegisterForm } from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-6">
          <div className="w-11 h-11 rounded-2xl bg-[#9a9a00] flex items-center justify-center shadow-lg shadow-[#9a9a00]/20">
            <span className="text-black text-xl font-bold leading-none">✦</span>
          </div>
        </div>
        <div className="bg-zinc-900 rounded-2xl shadow-xs ring-1 ring-white/10 p-8">
          <RegisterForm />
        </div>
      </div>
    </main>
  );
}
