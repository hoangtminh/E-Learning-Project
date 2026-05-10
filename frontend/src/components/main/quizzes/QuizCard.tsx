"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Globe, Lock, MoreVertical, Play, Settings, Share2, Users } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Quiz } from "@/api/quizzes";

interface QuizCardProps {
  quiz: Quiz;
  onEdit?: (quiz: Quiz) => void;
  onSettings?: (quiz: Quiz) => void;
  onShare?: (quiz: Quiz) => void;
  onTake?: (quiz: Quiz) => void;
  isOwner?: boolean;
}

export function QuizCard({ quiz, onEdit, onSettings, onShare, onTake, isOwner }: QuizCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow group">
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start">
          <Badge variant={quiz.isPublic ? "default" : "secondary"} className="mb-2">
            {quiz.isPublic ? (
              <span className="flex items-center gap-1"><Globe className="size-3" /> Công khai</span>
            ) : (
              <span className="flex items-center gap-1"><Lock className="size-3" /> Riêng tư</span>
            )}
          </Badge>
          {isOwner && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-xs" className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreVertical className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit?.(quiz)}>
                  <Settings className="mr-2 size-4" /> Chỉnh sửa
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onSettings?.(quiz)}>
                  <Clock className="mr-2 size-4" /> Cài đặt
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onShare?.(quiz)}>
                  <Share2 className="mr-2 size-4" /> Chia sẻ
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        <CardTitle className="text-lg line-clamp-1">{quiz.title}</CardTitle>
        <CardDescription className="line-clamp-2 min-h-10">
          {quiz.description || "Không có mô tả."}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mt-2">
          <div className="flex items-center gap-1">
            <Clock className="size-3" />
            {quiz.duration ? `${quiz.duration} phút` : "Không giới hạn"}
          </div>
          <div className="flex items-center gap-1">
            <Users className="size-3" />
            {quiz._count?.memberships || 0} người tham gia
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button className="w-full" size="sm" onClick={() => onTake?.(quiz)}>
          <Play className="mr-2 size-4" /> Làm bài ngay
        </Button>
      </CardFooter>
    </Card>
  );
}
