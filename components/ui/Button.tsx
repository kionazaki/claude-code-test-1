import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-[#9a9a00] text-black hover:bg-[#b5b500] focus:ring-[#9a9a00] disabled:bg-[#4a4a00]",
  secondary:
    "bg-zinc-900 text-zinc-300 border border-zinc-700 hover:bg-zinc-800 focus:ring-[#9a9a00] disabled:opacity-50",
  danger:
    "bg-rose-700 text-white hover:bg-rose-600 focus:ring-rose-500 disabled:bg-rose-900",
  ghost:
    "bg-transparent text-zinc-400 hover:bg-zinc-800 focus:ring-zinc-600 disabled:opacity-50",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-2.5 text-base",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      disabled,
      children,
      className = "",
      ...rest
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        suppressHydrationWarning
        disabled={disabled || loading}
        className={[
          "inline-flex items-center justify-center gap-2 rounded-xl font-medium",
          "focus:outline-none focus:ring-2 focus:ring-offset-2",
          "transition-colors duration-150 cursor-pointer",
          "disabled:cursor-not-allowed",
          variantClasses[variant],
          sizeClasses[size],
          className,
        ].join(" ")}
        {...rest}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
