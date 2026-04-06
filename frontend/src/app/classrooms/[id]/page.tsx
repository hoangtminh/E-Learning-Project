import { SiteShell } from "@/components/layout/site-shell";

type PageProps = { params: { id: string } };

export default function ClassroomDetailPage({ params }: PageProps) {
  return (
    <SiteShell>
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold tracking-tight">
          Lớp học <span className="text-primary/90">{params.id}</span>
        </h1>
        <p className="text-muted-foreground text-sm">
          Banner, mã mời, khóa học gắn lớp, task list, chat lớp — theo màn hình 6. Quyền member/admin
          kiểm tra thêm ở API.
        </p>
        <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
          <div className="glass-elevated min-h-[200px] rounded-xl p-4 text-sm text-muted-foreground">
            Nội dung lớp & nhiệm vụ
          </div>
          <div className="glass rounded-xl p-4 text-sm text-muted-foreground">
            Sidebar chat (Socket.io)
          </div>
        </div>
      </div>
    </SiteShell>
  );
}
