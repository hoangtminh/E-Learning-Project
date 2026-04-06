import Link from "next/link";
import { Suspense } from "react";
import { LoginForm } from "./ui/login-form";
import { ROUTES } from "@/lib/constants";

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="text-xl font-semibold tracking-tight">Đăng nhập</h1>
        <p className="text-muted-foreground text-sm">
          Tiếp tục học tập và lớp học của bạn.
        </p>
      </div>
      <Suspense
        fallback={
          <p className="text-muted-foreground text-center text-sm">Đang tải…</p>
        }
      >
        <LoginForm />
      </Suspense>
      <p className="text-muted-foreground text-center text-sm">
        Chưa có tài khoản?{" "}
        <Link href={ROUTES.register} className="text-primary hover:underline">
          Đăng ký
        </Link>
      </p>
    </div>
  );
}
