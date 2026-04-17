'use client';

import Link from 'next/link';
import { useSidebar } from '@/contexts/SidebarContext';

interface TopNavProps {
  breadcrumbs?: { label: string; href?: string }[];
}

export function TopNav({ breadcrumbs }: TopNavProps) {
  const { toggle } = useSidebar();

  return (
    <header className="flex justify-between items-center w-full px-6 py-3 sticky top-0 z-40 bg-slate-900/60 backdrop-blur-xl border-b border-sky-300/10 shadow-[0_0_30px_rgba(125,211,252,0.05)] h-16">
      {/* ── Left: Breadcrumb ── */}
      <div className="flex items-center gap-2 text-sm">
        {/* Mobile hamburger */}
        <button type="button"
          onClick={toggle}
          className="md:hidden p-1 text-sky-300"
          aria-label="Open menu"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>

        {/* Desktop breadcrumb */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="hidden md:flex items-center gap-2" aria-label="Breadcrumb">
            {breadcrumbs.map((crumb, i) => (
              <span key={i} className="flex items-center gap-2">
                {i > 0 && (
                  <span className="material-symbols-outlined text-slate-600 text-sm">
                    chevron_right
                  </span>
                )}
                {crumb.href && i < breadcrumbs.length - 1 ? (
                  <Link
                    href={crumb.href}
                    className="text-slate-400 hover:text-sky-300 transition-colors"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-sky-300 font-semibold truncate max-w-xs">
                    {crumb.label}
                  </span>
                )}
              </span>
            ))}
          </nav>
        )}
      </div>

      {/* ── Right: Actions + User ── */}
      <div className="flex items-center gap-3">
        <button type="button" className="p-2 rounded-full text-slate-400 hover:bg-sky-300/10 hover:text-sky-300 transition-colors duration-200">
          <span className="material-symbols-outlined">search</span>
        </button>

        <button type="button" className="p-2 rounded-full text-slate-400 hover:bg-sky-300/10 hover:text-sky-300 transition-colors duration-200 relative">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-2 right-2 w-2 h-2 bg-[#b31b25] rounded-full border-2 border-slate-900" />
        </button>

        <div className="h-8 w-px bg-sky-300/20 mx-1" />

        <div className="flex items-center gap-3 cursor-pointer">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-semibold text-sky-100">Minh Anh</p>
            <p className="text-[10px] text-slate-400">Học viên Premium</p>
          </div>
          <img
            alt="User Avatar"
            className="w-8 h-8 rounded-full border border-sky-400/30 object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuD4bXoPMqC9OzuAatl-Uqzs5YIFpKrCzUhC0K_-jTOPqUoRbh6x0Sptw4Wax-hRpMS9VzILlsUtTS2f-wSPyFPUKhiokiyy40Cq_ObyAZF1g1sv72B_r8ApugPHhEPiSgdS_dw_XJpUm1vSoh7XuXErjkKiI5qxSdVublen5l0xdO_rpLWjy9EF5ZWqEXsQ7QCqLwcbxGg6u3ykFBBCrw99BkbI_KCcsUW_HSZAmUka3bFqw_63A1-xuEzpPqKZewyaP4PEDiqwEwdl"
          />
        </div>
      </div>
    </header>
  );
}
