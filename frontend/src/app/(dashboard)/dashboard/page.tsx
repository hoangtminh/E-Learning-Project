"use client";

import Link from "next/link";
import {
  BookOpen,
  TrendingUp,
  Zap,
  Target,
} from "lucide-react";
import { StatsCard } from "@/components/dashboard/stats-card";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { ActiveCourses } from "@/components/dashboard/active-courses";
import { AssignmentsDue } from "@/components/dashboard/assignments-due";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

export default function StudentDashboardPage() {
  // Mock stats data - thay bằng API call khi có backend
  const stats = [
    {
      icon: BookOpen,
      label: "Khóa học",
      value: 3,
      subText: "đang học",
      trend: { value: 0, direction: "up" as const },
    },
    {
      icon: TrendingUp,
      label: "Hoàn thành",
      value: "68%",
      subText: "trung bình",
      trend: { value: 12, direction: "up" as const },
    },
    {
      icon: Zap,
      label: "Streak",
      value: "5 ngày",
      subText: "học liên tục",
      trend: { value: 100, direction: "up" as const },
    },
    {
      icon: Target,
      label: "Mục tiêu tuần",
      value: "12h",
      subText: "đã hoàn thành",
      trend: { value: 8, direction: "up" as const },
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Xin chào, Học viên! 👋</h1>
        <p className="text-muted-foreground mt-2">
          Tiến độ của bạn, bài tập sắp hết hạn & khóa học đang học
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, idx) => (
          <StatsCard
            key={idx}
            icon={stat.icon}
            label={stat.label}
            value={stat.value}
            subText={stat.subText}
            trend={stat.trend}
          />
        ))}
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight">Hành động nhanh</h2>
        <QuickActions />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Active Courses - spans 2 columns */}
        <div className="lg:col-span-2">
          <ActiveCourses />
        </div>

        {/* Assignments Due - sidebar */}
        <div>
          <AssignmentsDue />
        </div>
      </div>

      {/* Continue Learning Section */}
      <div className="glass-elevated rounded-xl p-6 space-y-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Tiếp tục học</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Lesson sau: React Suspense Patterns • Web Design color theory
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Link
            href="/learning/1"
            className={cn(
              buttonVariants({ variant: "default", size: "sm" }),
              "w-full"
            )}
          >
            🎥 Bắt đầu bài học
          </Link>
          <Link
            href="/dashboard/assignments"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "w-full"
            )}
          >
            📝 Xem bài tập
          </Link>
        </div>
      </div>
    </div>
  );
}
