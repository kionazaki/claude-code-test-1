import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, id, className = "", ...rest }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label
            htmlFor={id}
            className="text-sm font-medium text-gray-700"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          suppressHydrationWarning
          className={[
            "rounded-md border px-3 py-2 text-sm text-gray-900",
            "focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent",
            "placeholder:text-gray-400",
            error
              ? "border-red-400 bg-red-50"
              : "border-gray-300 bg-white",
            className,
          ].join(" ")}
          {...rest}
        />
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
