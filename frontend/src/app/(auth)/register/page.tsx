import Link from "next/link";
import { RegisterForm } from "./ui/register-form";
import { ROUTES } from "@/lib/constants";

export default function RegisterPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="text-xl font-semibold tracking-tight">Đăng ký</h1>
        <p className="text-muted-foreground text-sm">
          Tạo tài khoản để tham gia khóa học và lớp học.
        </p>
      </div>
      <RegisterForm />
      <p className="text-muted-foreground text-center text-sm">
        Đã có tài khoản?{" "}
        <Link href={ROUTES.login} className="text-primary hover:underline">
          Đăng nhập
        </Link>
      </p>
    </div>
  );
}
