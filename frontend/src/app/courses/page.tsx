"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { SiteShell } from "@/components/layout/site-shell";
import { buttonVariants } from "@/components/ui/button-variants";
import { api } from "@/services/api";
import { cn } from "@/lib/utils";

type CourseRow = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  price: unknown;
  visibility: string;
};

export default function CoursesCatalogPage() {
  const { data, isPending, isError } = useQuery({
    queryKey: ["courses"],
    queryFn: async () => {
      const { data: rows } = await api.get<CourseRow[]>("/courses");
      return rows;
    },
  });

  return (
    <SiteShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Danh mục khóa học</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Public catalog — NestJS GET /courses.
          </p>
        </div>
        {isPending ? (
          <p className="text-muted-foreground text-sm">Đang tải…</p>
        ) : isError ? (
          <p className="text-destructive text-sm">
            Không kết nối được API. Chạy backend port 4000 và cấu hình NEXT_PUBLIC_API_URL.
          </p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2">
            {data?.map((c) => (
              <li key={c.id} className="glass-elevated rounded-xl p-5">
                <h2 className="font-medium tracking-tight">{c.title}</h2>
                <p className="text-muted-foreground mt-2 line-clamp-2 text-sm">
                  {c.description ?? "—"}
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span>{c.visibility}</span>
                  {c.price != null ? <span>· Giá: {String(c.price)}</span> : null}
                </div>
                <Link
                  href={`/courses/${c.id}`}
                  className={cn(buttonVariants({ variant: "outline", size: "sm", className: "mt-4" }))}
                >
                  Chi tiết
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </SiteShell>
  );
}
