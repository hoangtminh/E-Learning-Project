import Link from "next/link";
import { SiteShell } from "@/components/layout/site-shell";
import { buttonVariants } from "@/components/ui/button-variants";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

type PageProps = { params: { courseId: string } };

export default function CourseDetailPage({ params }: PageProps) {
  return (
    <SiteShell>
      <div className="space-y-6">
        <div className="glass-elevated aspect-video max-w-3xl rounded-xl" />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Chi tiết khóa học · <code className="text-primary/90">{params.courseId}</code>
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Video intro, syllabus accordion, instructor bio, reviews, nút Enroll/Buy — nối API chi tiết
            sau.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href={ROUTES.dashboard} className={cn(buttonVariants({ size: "sm" }))}>
              Tham gia / Mua (stub → dashboard)
            </Link>
            <Link
              href={`/learning/${params.courseId}/lesson-placeholder`}
              className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
            >
              Học thử workspace
            </Link>
          </div>
        </div>
      </div>
    </SiteShell>
  );
}
