import Link from "next/link";
import { buttonVariants } from "@/components/ui/button-variants";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

export default function StudentDashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard học viên</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Tiến độ, khóa học đang học, nhiệm vụ — khung sẵn sàng cho biểu đồ & widget.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="glass-elevated rounded-xl p-6">
          <h2 className="font-medium">Khóa học đang học</h2>
          <p className="text-muted-foreground mt-2 text-sm">
            Kết nối TanStack Query tới <code className="text-primary/90">GET /courses</code> sau
            khi có enrollment.
          </p>
          <Link
            href={ROUTES.courses}
            className={cn(buttonVariants({ variant: "outline", size: "sm", className: "mt-4" }))}
          >
            Xem catalog
          </Link>
        </div>
        <div className="glass-elevated rounded-xl p-6">
          <h2 className="font-medium">Tham gia lớp học</h2>
          <p className="text-muted-foreground mt-2 text-sm">
            Luồng nhập mã mời → <code className="text-primary/90">classroom_members</code>{" "}
            (pending) → duyệt trong Classroom Admin.
          </p>
          <span
            className={cn(
              buttonVariants({ variant: "secondary", size: "sm", className: "mt-4 inline-flex" }),
            )}
          >
            Nhập mã lớp (TODO)
          </span>
        </div>
      </div>
    </div>
  );
}
