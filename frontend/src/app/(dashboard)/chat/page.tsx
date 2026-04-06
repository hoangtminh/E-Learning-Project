export default function ChatCenterPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">Chat Center</h1>
      <p className="text-muted-foreground text-sm">
        Danh sách hội thoại · khung chat · files — map tới bảng{" "}
        <code className="text-primary/90">conversations</code> /{" "}
        <code className="text-primary/90">messages</code>.
      </p>
      <div className="glass grid min-h-[320px] grid-cols-1 gap-px rounded-xl md:grid-cols-[240px_1fr_200px] md:bg-primary/10">
        <div className="glass rounded-xl p-3 text-xs text-muted-foreground md:rounded-r-none">
          Conversations
        </div>
        <div className="glass p-4 text-sm text-muted-foreground md:rounded-none">Messages</div>
        <div className="glass rounded-xl p-3 text-xs text-muted-foreground md:rounded-l-none">
          Info / files
        </div>
      </div>
    </div>
  );
}
