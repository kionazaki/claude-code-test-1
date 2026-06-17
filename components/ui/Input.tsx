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
            className="text-sm font-medium text-ink"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          suppressHydrationWarning
          className={[
            "rounded-xl border px-3 py-2.5 text-sm text-ink",
            "focus:outline-none focus:ring-2 focus:ring-amber focus:border-transparent",
            "placeholder:text-ink-faint",
            error
              ? "border-terracotta bg-terracotta-soft"
              : "border-line bg-surface",
            className,
          ].join(" ")}
          {...rest}
        />
        {error && <p className="text-xs text-terracotta-deep">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
