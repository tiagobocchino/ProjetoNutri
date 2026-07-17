import { forwardRef } from "react";

const controlBase =
  "w-full rounded-xl border border-[color:var(--color-border)] bg-white px-4 py-2.5 text-sm text-[color:var(--color-foreground)] outline-none transition focus:border-[color:var(--color-primary)] focus:ring-2 focus:ring-[color:var(--color-primary)]/20";

const labelText = "mb-1.5 block text-sm font-medium text-[color:var(--color-foreground)]";
const errorText = "mt-1 block text-xs text-[color:var(--color-destructive)]";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & { label?: string; error?: string };

export const Field = forwardRef<HTMLInputElement, InputProps>(function Field(
  { label, error, className = "", ...props },
  ref,
) {
  return (
    <label className="block">
      {label && <span className={labelText}>{label}</span>}
      <input ref={ref} className={`${controlBase} ${className}`} {...props} />
      {error && <span className={errorText}>{error}</span>}
    </label>
  );
});

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string; error?: string };

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, error, className = "", ...props },
  ref,
) {
  return (
    <label className="block">
      {label && <span className={labelText}>{label}</span>}
      <textarea ref={ref} className={`${controlBase} min-h-24 ${className}`} {...props} />
      {error && <span className={errorText}>{error}</span>}
    </label>
  );
});

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string; error?: string };

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, error, className = "", children, ...props },
  ref,
) {
  return (
    <label className="block">
      {label && <span className={labelText}>{label}</span>}
      <select ref={ref} className={`${controlBase} ${className}`} {...props}>
        {children}
      </select>
      {error && <span className={errorText}>{error}</span>}
    </label>
  );
});
