"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar, Clock, Lock, Share2, Users, X, Loader2, Globe } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useQuiz } from "@/contexts/QuizContext";
import { useClassrooms } from "@/contexts/ClassroomContext";
import { Quiz } from "@/api/quizzes";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface QuizSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quiz?: Quiz | null;
}

export function QuizSettingsModal({ open, onOpenChange, quiz }: QuizSettingsModalProps) {
  const { handleUpdateQuiz, handleShareQuiz } = useQuiz();
  const [isSaving, setIsSaving] = useState(false);
  
  // Settings states
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [duration, setDuration] = useState<number>(30);
  const [isPublic, setIsPublic] = useState(true);

  // Invite states
  const [invitedEmail, setInvitedEmail] = useState("");
  const [members, setMembers] = useState<any[]>([]);
  const [selectedClassroomId, setSelectedClassroomId] = useState("");

  useEffect(() => {
    if (quiz && open) {
      setStartDate(quiz.startDate ? new Date(quiz.startDate).toISOString().slice(0, 16) : "");
      setEndDate(quiz.endDate ? new Date(quiz.endDate).toISOString().slice(0, 16) : "");
      setDuration(quiz.duration ?? 0);
      setIsPublic(quiz.isPublic ?? true);
      setMembers([]);
      setSelectedClassroomId("");
    }
  }, [quiz, open]);

  const handleInvite = () => {
    if (!invitedEmail.trim()) return;
    if (!/\S+@\S+\.\S+/.test(invitedEmail)) {
      toast.warning("Email không hợp lệ!");
      return;
    }
    if (members.some(m => m.email === invitedEmail)) {
      toast.warning("Email này đã được thêm vào danh sách!");
      return;
    }
    setMembers([...members, { id: Math.random().toString(), email: invitedEmail, role: "member" }]);
    setInvitedEmail("");
  };

  const handleRemoveMember = (email: string) => {
    setMembers(members.filter(m => m.email !== email));
  };

  const handleSave = async () => {
    if (!quiz?.id) return;
    setIsSaving(true);
    try {
      // 1. Update quiz details
      await handleUpdateQuiz(quiz.id, {
        startDate: startDate ? new Date(startDate).toISOString() : null,
        endDate: endDate ? new Date(endDate).toISOString() : null,
        duration: Number(duration),
        isPublic,
      });

      // 2. Share with emails
      if (members.length > 0) {
        const emails = members.map(m => m.email);
        await handleShareQuiz(quiz.id, { emails });
      }

      // 3. Share with classroom
      if (selectedClassroomId) {
        await handleShareQuiz(quiz.id, { classroomId: selectedClassroomId });
      }

      toast.success("Cập nhật cấu hình và chia sẻ thành công!");
      onOpenChange(false);
    } catch (error: any) {
      console.error('Failed to update quiz settings:', error);
      toast.error(error.message || 'Lưu cấu hình thất bại.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-slate-800">Cài đặt & Chia sẻ</DialogTitle>
          <DialogDescription className="text-xs">
            Thiết lập quyền truy cập và chia sẻ quiz cho học sinh hoặc lớp học.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 max-h-[70vh] overflow-y-auto pr-1">
          {/* Spacing & Settings Section */}
          <div className="space-y-3">
             <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase">
                <Clock className="size-3.5" /> Thời gian & Hiển thị
             </div>
             
             {/* Duration Limit */}
             <div className="space-y-1">
                <Label className="text-[11px] font-bold text-slate-500">Thời gian làm bài (Phút - Nhập 0 để không giới hạn)</Label>
                <Input 
                   type="number" 
                   min="0"
                   value={duration} 
                   onChange={(e) => setDuration(Number(e.target.value))} 
                   className="text-xs h-8 rounded-md" 
                />
             </div>

             <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                   <Label className="text-[11px] font-bold text-slate-500">Bắt đầu</Label>
                   <Input 
                      type="datetime-local" 
                      value={startDate} 
                      onChange={(e) => setStartDate(e.target.value)} 
                      className="text-xs h-8 rounded-md" 
                   />
                </div>
                <div className="space-y-1">
                   <Label className="text-[11px] font-bold text-slate-500">Kết thúc</Label>
                   <Input 
                      type="datetime-local" 
                      value={endDate} 
                      onChange={(e) => setEndDate(e.target.value)} 
                      className="text-xs h-8 rounded-md" 
                   />
                </div>
             </div>

             {/* Visibility selection */}
             <div className="space-y-1">
                <Label className="text-[11px] font-bold text-slate-500">Chế độ hiển thị</Label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setIsPublic(true)}
                    className={cn(
                      "flex items-center justify-center gap-1.5 py-1.5 rounded-md border font-bold text-[10px] transition-colors",
                      isPublic
                        ? "border-primary bg-primary/20 text-primary"
                        : "border-slate-200 hover:bg-slate-50 text-slate-655 bg-white"
                    )}
                  >
                    <Globe className="size-3.5" /> Công khai
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsPublic(false)}
                    className={cn(
                      "flex items-center justify-center gap-1.5 py-1.5 rounded-md border font-bold text-[10px] transition-colors",
                      !isPublic
                        ? "border-primary bg-primary/20 text-primary"
                        : "border-slate-200 hover:bg-slate-50 text-slate-655 bg-white"
                    )}
                  >
                    <Lock className="size-3.5" /> Riêng tư
                  </button>
                </div>
             </div>
          </div>

          <Separator />

          {/* Individual Share List */}
          <div className="space-y-3">
             <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase">
                <Users className="size-3.5" /> Chia sẻ cá nhân (Riêng tư)
             </div>
             <div className="flex gap-2">
                <Input 
                  placeholder="Nhập email người nhận..." 
                  value={invitedEmail}
                  onChange={(e) => setInvitedEmail(e.target.value)}
                  className="flex-1 h-8 text-xs rounded-md"
                />
                <Button size="sm" onClick={handleInvite} className="h-8 text-xs rounded-md bg-slate-800 text-white hover:bg-slate-900">Mời</Button>
             </div>

             <ScrollArea className="h-28 border rounded-md p-1.5 bg-slate-50/50">
                <div className="space-y-1">
                   {members.map(member => (
                     <div key={member.id} className="flex justify-between items-center bg-slate-100 p-1.5 rounded text-xs border border-slate-200">
                        <span className="font-semibold text-slate-700">{member.email}</span>
                        <Button 
                           variant="ghost" 
                           size="icon" 
                           onClick={() => handleRemoveMember(member.email)}
                           className="h-5 w-5 text-muted-foreground hover:text-rose-600 hover:bg-rose-50 rounded"
                        >
                           <X className="size-3" />
                        </Button>
                     </div>
                   ))}
                   {members.length === 0 && (
                     <p className="text-center text-xs text-muted-foreground py-4">Chưa có ai được mời.</p>
                   )}
                </div>
             </ScrollArea>
          </div>
        </div>

        <DialogFooter className="pt-2">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} disabled={isSaving} className="h-8 text-xs rounded-md">Đóng</Button>
          <Button size="sm" onClick={handleSave} disabled={isSaving} className="h-8 text-xs rounded-md bg-primary hover:bg-primary-dim text-white">
            {isSaving && <Loader2 className="mr-1.5 size-3.5 animate-spin" />}
            Lưu thay đổi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
