"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar, Clock, Lock, Share2, Users, X, Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useQuiz } from "@/contexts/QuizContext";
import { Quiz } from "@/api/quizzes";

interface QuizSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quiz?: Quiz | null;
}

export function QuizSettingsModal({ open, onOpenChange, quiz }: QuizSettingsModalProps) {
  const { handleUpdateQuiz } = useQuiz();
  const [isSaving, setIsSaving] = useState(false);
  const [invitedEmail, setInvitedEmail] = useState("");
  const [members, setMembers] = useState<any[]>([]);

  const handleInvite = () => {
    if (!invitedEmail) return;
    setMembers([...members, { id: Math.random().toString(), email: invitedEmail, role: "member" }]);
    setInvitedEmail("");
  };

  const handleSave = async () => {
    if (!quiz?.id) return;
    setIsSaving(true);
    try {
      // In a real app, we would collect all settings here
      await handleUpdateQuiz(quiz.id, {}); 
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to update quiz settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Cài đặt & Chia sẻ</DialogTitle>
          <DialogDescription>
            Thiết lập quyền truy cập và chia sẻ quiz cho người khác.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-4">
             <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase">
                <Clock className="size-4" /> Thời gian & Hiển thị
             </div>
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                   <Label className="text-xs">Bắt đầu</Label>
                   <Input type="datetime-local" className="text-xs h-8" />
                </div>
                <div className="space-y-1">
                   <Label className="text-xs">Kết thúc</Label>
                   <Input type="datetime-local" className="text-xs h-8" />
                </div>
             </div>
          </div>

          <Separator />

          <div className="space-y-4">
             <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase">
                <Share2 className="size-4" /> Chia sẻ (Riêng tư)
             </div>
             <div className="flex gap-2">
                <Input 
                  placeholder="Nhập email người nhận..." 
                  value={invitedEmail}
                  onChange={(e) => setInvitedEmail(e.target.value)}
                  className="flex-1 h-9"
                />
                <Button size="sm" onClick={handleInvite}>Mời</Button>
             </div>

             <ScrollArea className="h-40 border rounded-md p-2">
                <div className="space-y-2">
                   {members.map(member => (
                     <div key={member.id} className="flex justify-between items-center bg-slate-50 p-2 rounded text-sm">
                        <span>{member.email}</span>
                        <Button variant="ghost" size="icon-xs" className="text-muted-foreground hover:text-destructive">
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

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>Đóng</Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 size-4 animate-spin" />}
            Lưu thay đổi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
