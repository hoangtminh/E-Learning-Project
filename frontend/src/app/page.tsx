import Link from "next/link";
import { SiteShell } from "@/components/layout/site-shell";
import { buttonVariants } from "@/components/ui/button-variants";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

export default function HomePage() {
  return (
    <SiteShell>
      <section className="grid gap-10 py-12 md:grid-cols-2 md:items-center">
        <div className="space-y-6">
          <p className="text-sm font-medium tracking-wide text-primary/90">
            E-Learning · Realtime · Classroom
          </p>
          <h1 className="text-balance text-3xl font-semibold tracking-tight md:text-4xl">
            Ánh sáng đóng băng — học tập sâu, giao diện kính mờ cao cấp.
          </h1>
          <p className="text-muted-foreground max-w-prose leading-relaxed">
            Khóa học, lớp học, chat thời gian thực, nhiệm vụ và phòng live — theo
            đặc tả IT4409, sẵn sàng mở rộng nghiệp vụ.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href={ROUTES.courses}
              className={cn(buttonVariants({ size: "lg" }))}
            >
              Xem danh mục khóa học
            </Link>
            <Link
              href={ROUTES.dashboard}
              className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
            >
              Vào dashboard
            </Link>
          </div>
        </div>
        <div className="glass-elevated rounded-2xl p-8">
          <h2 className="text-lg font-semibold tracking-tight">Tech stack</h2>
          <ul className="text-muted-foreground mt-4 space-y-2 text-sm leading-relaxed">
            <li>Next.js App Router · TanStack Query · Zustand</li>
            <li>Socket.io-client · PeerJS · React Player</li>
            <li>NestJS · Prisma · PostgreSQL · JWT</li>
          </ul>
        </div>
      </section>
    </SiteShell>
  );
}
