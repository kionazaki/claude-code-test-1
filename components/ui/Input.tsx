import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, id, className = "", ...rest }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={id}
            className="text-sm font-medium text-zinc-300"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          suppressHydrationWarning
          className={[
            "rounded-xl border px-3 py-2.5 text-sm text-zinc-100",
            "focus:outline-none focus:ring-2 focus:ring-[#9a9a00] focus:border-transparent",
            "placeholder:text-zinc-600",
            error
              ? "border-rose-700 bg-rose-950"
              : "border-zinc-700 bg-zinc-900",
            className,
          ].join(" ")}
          {...rest}
        />
        {error && <p className="text-xs text-rose-400">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
