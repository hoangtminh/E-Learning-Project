import Link from "next/link";
import { APP_NAME, ROUTES } from "@/lib/constants";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

const links = [
  { href: ROUTES.dashboard, label: "Dashboard" },
  { href: ROUTES.courses, label: "Khóa học" },
  { href: ROUTES.notes, label: "Ghi chú" },
  { href: "/chat", label: "Chat" },
  { href: ROUTES.instructorStudio, label: "Studio GV" },
] as const;

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <aside className="glass fixed inset-y-0 left-0 z-40 hidden w-56 flex-col border-r border-primary/10 p-4 md:flex">
        <Link
          href={ROUTES.home}
          className="mb-6 font-semibold tracking-tight text-primary"
        >
          {APP_NAME}
        </Link>
        <nav className="flex flex-1 flex-col gap-1 text-sm">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "justify-start",
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="md:pl-56">
        <header className="glass sticky top-0 z-30 border-b border-primary/10 px-4 py-3 md:hidden">
          <div className="flex flex-wrap gap-2">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={cn(buttonVariants({ variant: "outline", size: "xs" }))}
              >
                {l.label}
              </Link>
            ))}
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
      </div>
    </div>
  );
}
