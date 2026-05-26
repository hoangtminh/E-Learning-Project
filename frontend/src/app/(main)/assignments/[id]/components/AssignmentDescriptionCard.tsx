interface AssignmentDescriptionCardProps {
  description: string | null;
}

export function AssignmentDescriptionCard({ description }: AssignmentDescriptionCardProps) {
  return (
    <div className='glass-panel rounded-3xl p-8 shadow-sm border border-white/50 space-y-3'>
      <h3 className='text-xs font-bold text-slate-800 uppercase tracking-wider'>Yêu cầu chi tiết</h3>
      {description ? (
        <div className='text-slate-600 text-sm leading-relaxed whitespace-pre-wrap bg-slate-50/50 rounded-xl p-4 border border-slate-100'>
          {description}
        </div>
      ) : (
        <p className='text-sm text-slate-400 italic'>Không có yêu cầu đính kèm</p>
      )}
    </div>
  );
}
