import Link from "next/link";
import { APP_NAME, ROUTES } from "@/lib/constants";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

export function SiteShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("min-h-screen bg-background text-foreground", className)}>
      <header className="border-b border-primary/10 bg-[rgba(15,21,36,0.45)] backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Link href={ROUTES.home} className="font-semibold tracking-tight text-primary">
            {APP_NAME}
          </Link>
          <nav className="flex items-center gap-2 text-sm">
            <Link
              href={ROUTES.courses}
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
            >
              Khóa học
            </Link>
            <Link
              href={ROUTES.login}
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
            >
              Đăng nhập
            </Link>
            <Link
              href={ROUTES.register}
              className={cn(buttonVariants({ size: "sm" }))}
            >
              Đăng ký
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
