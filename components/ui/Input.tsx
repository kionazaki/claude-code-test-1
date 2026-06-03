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
            className="text-sm font-medium text-zinc-700"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          suppressHydrationWarning
          className={[
            "rounded-xl border px-3 py-2.5 text-sm text-zinc-900",
            "focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent",
            "placeholder:text-zinc-400",
            error
              ? "border-rose-400 bg-rose-50"
              : "border-zinc-300 bg-white",
            className,
          ].join(" ")}
          {...rest}
        />
        {error && <p className="text-xs text-rose-600">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
