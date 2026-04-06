export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="glass-elevated w-full max-w-md rounded-2xl p-8">{children}</div>
    </div>
  );
}
