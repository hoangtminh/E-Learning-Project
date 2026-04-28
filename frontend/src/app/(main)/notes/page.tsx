export default function MyNotesHubPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">My Notes Hub</h1>
      <p className="text-muted-foreground text-sm">
        Sidebar theo khóa học, tìm kiếm, timestamp — nối API <code className="text-primary/90">notes</code>{" "}
        và điều hướng về Learning Workspace với <code className="text-primary/90">seekTo</code>.
      </p>
      <div className="glass rounded-xl p-6 text-sm text-muted-foreground">
        Placeholder UI theo màn hình 5 trong đặc tả.
      </div>
    </div>
  );
}
