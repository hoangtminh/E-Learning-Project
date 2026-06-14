interface AssignmentDescriptionCardProps {
  description: string | null;
}

export function AssignmentDescriptionCard({ description }: AssignmentDescriptionCardProps) {
  return (
    <div className='glass-panel rounded-3xl p-8 shadow-xs border border-white/50 space-y-3'>
      <h3 className='text-xs font-bold text-on-surface uppercase tracking-wider'>Yêu cầu chi tiết</h3>
      {description ? (
        <div className='text-on-surface-variant/80 text-sm leading-relaxed whitespace-pre-wrap bg-surface-container-lowest/50 rounded-xl p-4 border border-outline-variant/20'>
          {description}
        </div>
      ) : (
        <p className='text-sm text-on-surface-variant/50 italic'>Không có yêu cầu đính kèm</p>
      )}
    </div>
  );
}
