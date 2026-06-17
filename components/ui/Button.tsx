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
    "bg-amber text-ink hover:bg-amber-deep focus:ring-amber disabled:bg-amber-soft",
  secondary:
    "bg-surface text-ink border border-line hover:bg-raised focus:ring-amber disabled:opacity-50",
  danger:
    "bg-terracotta text-white hover:bg-terracotta-deep focus:ring-terracotta disabled:bg-[#e7b8b2]",
  ghost:
    "bg-transparent text-ink-soft hover:bg-raised focus:ring-line disabled:opacity-50",
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
