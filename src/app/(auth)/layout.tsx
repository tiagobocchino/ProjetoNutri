import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[color:var(--color-background)] px-4 py-12">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 block text-center">
          <span className="font-display text-2xl font-semibold text-[color:var(--color-primary)]">
            ProjetoNutri
          </span>
        </Link>
        <div className="card-surface p-8">{children}</div>
      </div>
    </div>
  );
}
