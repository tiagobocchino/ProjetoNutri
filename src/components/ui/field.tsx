import { forwardRef } from "react";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & { label?: string; error?: string };

export const Field = forwardRef<HTMLInputElement, InputProps>(function Field(
  { label, error, className = "", ...props },
  ref,
) {
  return (
    <label className="block">
      {label && (
        <span className="mb-1.5 block text-sm font-medium text-[color:var(--color-foreground)]">
          {label}
        </span>
      )}
      <input
        ref={ref}
        className={`w-full rounded-xl border border-[color:var(--color-border)] bg-white px-4 py-2.5 text-sm text-[color:var(--color-foreground)] outline-none transition focus:border-[color:var(--color-primary)] focus:ring-2 focus:ring-[color:var(--color-primary)]/20 ${className}`}
        {...props}
      />
      {error && <span className="mt-1 block text-xs text-[color:var(--color-destructive)]">{error}</span>}
    </label>
  );
});
