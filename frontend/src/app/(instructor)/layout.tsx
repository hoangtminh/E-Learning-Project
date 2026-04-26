import Link from 'next/link';

export default async function InstructorGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // const token = cookies().get("access_token")?.value;
  // if (!token) redirect(`${ROUTES.login}?from=/instructor/studio`);

  // const res = await fetch(`${serverApiUrl}/auth/me`, {
  //   headers: { Authorization: `Bearer ${token}` },
  //   cache: "no-store",
  // });

  // if (!res.ok) redirect(ROUTES.login);

  // const user = (await res.json()) as { role?: string };

  // if (user.role !== "instructor" && user.role !== "admin") {
  return (
    <div className='flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-6'>
      <div className='glass-elevated max-w-md rounded-2xl p-8 text-center'>
        <h1 className='text-lg font-semibold'>403 — Không có quyền</h1>
        <p className='text-muted-foreground mt-2 text-sm'>
          Khu vực giảng viên. Yêu cầu role instructor hoặc admin.
        </p>
        <Link
          href='/'
          className='text-primary mt-4 inline-block text-sm underline-offset-4 hover:underline'
        >
          Về dashboard
        </Link>
      </div>
    </div>
  );
  // }

  return <div className='min-h-screen bg-background px-4 py-8'>{children}</div>;
}
