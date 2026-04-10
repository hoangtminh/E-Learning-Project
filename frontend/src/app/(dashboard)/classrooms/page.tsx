import type { Metadata } from 'next';
import { TopNav } from '@/components/layout/TopNav';
import { cn } from '@/lib/utils';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Classrooms | Glacier E-Learning',
  description: 'Manage your current learning sessions and connect with peers.',
};

const mockCohorts = [
  {
    id: 1,
    title: 'Mastering Next.js 14',
    category: 'Web Advanced',
    categoryClasses: 'bg-sky-300/90 text-slate-900',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCvz6dRTaGnLp3HCtAnUdFeqPCG--8LDSkS_kIcRWF7YWP0FCxFmMSW13aLrBFMLDoBai-M594I-qogj1gqDul0Maz6pPWi6cvRzgrY2AsTIJhiu7uPjIT96j6CUWdvzaDmXLA61S0kCKoSTOjyRmnFs9jY1eqPTxz1dKrTBwj-Bfn1V9-CQ2kmQnwJZzrxlfFTicoMH9lhguYzCK9NO2x5yG9KIFRlmT1Pkk6g9hkWohZ39mUTXwyDUN4Q7NpnU_TSQjo9xmK42kf6',
    instructor: {
      name: 'Prof. Thomas Miller',
      title: 'Lead Instructor',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBb6eL5PPzNZzR8giaDg7Srq9OZ5_UmlrEmBnp4J1Ro3Fm2kiUzQ_TS3Jn51SZY4ShzHYu9Xo4bPovKkegDgz7G79ws6bfipigIMTBkBbX18ugbWaJm5mWYN0KSUYak0AHXKKLF19DRMHd_buLdDCCrNUbRmptNVAnRdgCKyDSef3966r1MLAFcl8BMu-VCyne8KYSwS_V9ev4K6_6hVJXZ-Uhz65ojO634x1r1BiLHE97gmgWjkcxL_CJOo3dIL2vgW-fLueb6FmhF'
    },
    schedule: 'Mon, Wed, Fri • 09:00 - 11:30',
    status: {
      icon: 'group',
      text: '24 Active Students',
      textClass: 'text-on-surface-variant',
      iconClass: 'text-primary'
    },
    action: {
      text: 'Enter Room',
      icon: 'arrow_forward',
      btnClass: 'bg-primary text-on-primary hover:bg-primary-dim',
      iconAnimation: 'group-hover/btn:translate-x-1 transition-transform'
    }
  },
  {
    id: 2,
    title: 'Advanced UI/UX Systems',
    category: 'Design',
    categoryClasses: 'bg-tertiary-container text-on-tertiary-container',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDbf9FS7YzN_8LQiqdMEVWV623RnuIA0UlzAfGlOLvrkhLLol1XUwEjWGH_8VhmfH4D_jlzfPbF-obQQvvK3CjcDlmCRmJ6ZcaInVN1qx--7HPsq9waXXwjgJOXwjKS4od106pILRxqFZhq8G04cpdNOAjB0tZ26mrb0RUO7NitZm6lSE-bBy_wztdW7lQUIUudXGjiTr8pKkU51msgLH1gs0oNQJKP1TIlXdd7cbkHG8Gd4UFFnONcOSoEwvQfERbL5oH_hoDXDBJh',
    instructor: {
      name: 'Sarah Chen',
      title: 'Design Lead',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDzmF5o086MD8tSHFJp-4arLKGMzm8zBp6w51UFi7zFElK42Uok2383EDCcFlm6LbZ0N7R0dbW5Il3XD2qkXsE0kq59qHlu-_8xXN7t5zqkDwn62JSAKw41wsMIkeMJQZDBuLG7YSL4KKCF18puEHpiN_aXbhWlzdBeE9hFn1HkdTt3peaO8F8UWpoUjFCqYbvHMuio7yYD01TIUlJPJkldtx6sVpYLntVfzw8OjNFOGcDFHhSBjEms5YcuwRDPcsU8EVlFKxcAuqUX'
    },
    schedule: 'Tue, Thu • 14:00 - 16:00',
    status: {
      icon: 'campaign',
      text: 'Session starting in 15m',
      textClass: 'text-tertiary font-medium',
      iconClass: 'text-primary'
    },
    action: {
      text: 'Join Now',
      icon: 'videocam',
      btnClass: 'bg-tertiary text-on-tertiary hover:bg-tertiary-dim',
      iconAnimation: 'animate-pulse'
    }
  },
  {
    id: 3,
    title: 'Python for AI',
    category: 'Data Science',
    categoryClasses: 'bg-secondary-container text-on-secondary-container',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBTd9exxx4xfCnO95mBJ78woWX1yyMClrkZnIxLnUU-pEhbS7mFKD6TIIAocNhPlh_vHFmTkedbOr6JcAUiAsAqfkagbyUwrl0-ole1eIa4VtH8QiwlcAU-8NbZmrJsCeIFAUFOi1V5Ipo8XGKgUzhtu-5wRe2ikAw8a9pP-TwgbWSdYtz0q-pHw_D-l0-AksG5fe1VoT-atdwDLDRtr95eT07JTXvzFjbTYg9dVMcHJyjAQI4wulQyrfgszEkmlmzKowEMovhMaNwg',
    instructor: {
      name: 'Dr. Robert Kovac',
      title: 'AI Researcher',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBiOHwjVeyCpCiSNEvnxMaOncr6rBS_nLeYtVyfiKu2eq9wxYRPVXQvnGoZIg27iS6pybBsQD_K7-UWIdkb5CB7SNbRuoOH6UdbSAlcdPrwumLmfSWCIGuGLoalafqhEEC6K5SaZanIXZdFN_72fxqbfAnwnkhKL4yzrQrfW8oP2vv69g0ryhOKoPOWGtysH3OLExaCT3IHHZ3K2at6kgkWBUXYMRRcM1BvxcuVmVSqDETOPe2Eipn7ueIZDe6zaWlQnEC7FEJwp_1t'
    },
    schedule: 'Saturday • 10:00 - 13:00',
    status: {
      icon: 'assignment_late',
      text: '2 Assignments due soon',
      textClass: 'text-on-surface-variant',
      iconClass: 'text-primary'
    },
    action: {
      text: 'Enter Room',
      icon: 'arrow_forward',
      btnClass: 'bg-primary text-on-primary hover:bg-primary-dim',
      iconAnimation: 'group-hover/btn:translate-x-1 transition-transform'
    }
  }
];

const mockRecentActivity = [
  {
    name: 'Jane Doe',
    action: 'Posted in Web Advanced',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAJnR7ndOjP0F7ipAR6tQr-tLqmw_QrNpd7AeYincADPOBwmZSu0gjh-xmVLALrA4X5ecxvm3pLdg-OUOU4UxCcB6ux0ZwZtVyqFQHmfsyKmSRmNutSH8r168ZBgrzJly01CAsiS5Y8w0u9P3MLYOg0uCy5CC-sqg3-6aLZhaysuZrz4kLoJOE1s-QwZAWgeOypEq5Ic1J5k59ii_27cOz7e5CTk2mxK1wvIzTWtVegQ8NRUNz2-JlSQB_poNr1h2Tk92zY8xsgyiqV'
  },
  {
    name: 'Mike Smith',
    action: 'Submitted Design Assignment',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAk5Fp9gtu5Ijk15JvOFLGfEiiK-v_Kc1Lq423rjtEvjPGx3xMrCTcmmxrZKekAOAgo3eJTRu4msj_-GlK86kYSG7BYUcXgCNyrtedni4C4KycLkkV0LJLIKpK8CZrKB8aBABr2aLSQRrSLR1SlfaHJUDdX2XZuW1Ln0QV4FbV9erEv0NJkv8eY_VnRrQuGY78aAg-MLHl8Urdk9tcFYt8bg_x02RsfBX0MTE396P44WCXkoFV24jT61Z2hr5cGJcgjZ7MZ-e8M2V-z'
  },
  {
    name: 'Kelly Vo',
    action: 'Started a live study group',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA3nc09LW7oEj9VrHUkCUU4Qb-kIlQeguzrTWXz4uKLV-BDrlQ0Nw-LDRnN67Icwz8NxA0O1SXh2gzgIt3yRZrmpL_nQab7aCA2yIEertLRDfnU-4rKH88srpmZURpQb9NtYlxH5poEOG2vKjHP-S_TIuwv5-9kDj6p9tlgJiS_jkT7L8kDpspP3t09wxtHLFgtM6-1EBZpk9MH7Fmed326VlXqFiplTNs19et64cyqMo5X_CcP4s8MHGeRMapFNCsR3iduDKMEM5uN'
  }
];

export default function ClassroomsPage() {
  return (
    <>
      <TopNav
        breadcrumbs={[{ label: 'Lớp Học' }, { label: 'Học kỳ 1, 2024' }]}
      />

      {/* Main Content Area */}
      <div className="p-8 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h3 className="text-3xl font-extrabold text-on-surface tracking-tight mb-2">
              My Active Cohorts
            </h3>
            <p className="text-on-surface-variant">
              Manage your current learning sessions and connect with peers.
            </p>
          </div>
          <div className="flex gap-3">
            <div className="glass-panel px-4 py-2 rounded-xl flex items-center gap-3">
              <span
                className="material-symbols-outlined text-primary"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                calendar_today
              </span>
              <div>
                <p className="text-[10px] font-bold text-on-surface-variant uppercase">
                  Today&apos;s Sessions
                </p>
                <p className="text-sm font-bold text-on-surface">
                  3 Classes Scheduled
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Classroom Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockCohorts.map((cohort) => (
            <div
              key={cohort.id}
              className="glass-panel-elevated rounded-2xl overflow-hidden group hover:shadow-[0_0_40px_rgba(125,211,252,0.15)] transition-all duration-300 flex flex-col"
            >
              <div className="relative h-48">
                <img
                  alt={cohort.title}
                  src={cohort.image}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                  <div>
                    <span
                      className={cn(
                        'px-2 py-1 rounded text-[10px] font-bold uppercase mb-2 inline-block',
                        cohort.categoryClasses
                      )}
                    >
                      {cohort.category}
                    </span>
                    <h4 className="text-xl font-bold text-white leading-tight">
                      {cohort.title}
                    </h4>
                  </div>
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-center gap-3 mb-6">
                  <img
                    alt={cohort.instructor.name}
                    src={cohort.instructor.avatar}
                    className="w-10 h-10 rounded-full border border-primary/20 object-cover"
                  />
                  <div>
                    <p className="text-xs font-bold text-on-surface-variant">
                      {cohort.instructor.title}
                    </p>
                    <p className="text-sm font-semibold text-on-surface">
                      {cohort.instructor.name}
                    </p>
                  </div>
                </div>
                <div className="space-y-3 mb-8 flex-1">
                  <div className="flex items-center gap-3 text-on-surface-variant">
                    <span className="material-symbols-outlined text-primary text-xl">
                      schedule
                    </span>
                    <span className="text-sm">{cohort.schedule}</span>
                  </div>
                  <div className={cn('flex items-center gap-3', cohort.status.textClass)}>
                    <span
                      className={cn(
                        'material-symbols-outlined text-xl',
                        cohort.status.iconClass
                      )}
                    >
                      {cohort.status.icon}
                    </span>
                    <span className="text-sm">{cohort.status.text}</span>
                  </div>
                </div>
                <button
                  type="button"
                  className={cn(
                    'w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors group/btn',
                    cohort.action.btnClass
                  )}
                >
                  {cohort.action.text}
                  <span
                    className={cn(
                      'material-symbols-outlined',
                      cohort.action.iconAnimation
                    )}
                  >
                    {cohort.action.icon}
                  </span>
                </button>
              </div>
            </div>
          ))}

          {/* Empty State / Add New Card */}
          <div className="border-2 border-dashed border-sky-300/30 rounded-2xl flex flex-col items-center justify-center p-8 hover:bg-sky-300/5 transition-colors group cursor-pointer h-full min-h-[450px]">
            <div className="w-16 h-16 rounded-full bg-sky-300/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-sky-400 text-3xl">
                add
              </span>
            </div>
            <h5 className="text-lg font-bold text-on-surface">
              Enroll in New Class
            </h5>
            <p className="text-sm text-on-surface-variant text-center mt-2 max-w-[200px]">
              Browse the course store to join more cohorts and grow your skills.
            </p>
          </div>
        </div>

        {/* Activity Recap Bento Piece */}
        <div className="mt-12 glass-panel p-8 rounded-3xl grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1 border-r border-sky-300/10">
            <h5 className="text-sm font-bold text-sky-400 uppercase tracking-widest mb-4">
              Quick Stats
            </h5>
            <div className="space-y-6">
              <div>
                <p className="text-3xl font-black text-on-surface">12</p>
                <p className="text-xs text-on-surface-variant">
                  Total Hours this week
                </p>
              </div>
              <div>
                <p className="text-3xl font-black text-on-surface">85%</p>
                <p className="text-xs text-on-surface-variant">
                  Attendance Rate
                </p>
              </div>
            </div>
          </div>
          <div className="md:col-span-3">
            <h5 className="text-sm font-bold text-sky-400 uppercase tracking-widest mb-6">
              Recent Peer Activity
            </h5>
            <div className="flex flex-wrap gap-4">
              {mockRecentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 bg-white/40 p-3 rounded-2xl border border-sky-300/10"
                >
                  <img
                    alt={activity.name}
                    src={activity.avatar}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-xs font-bold text-on-surface">
                      {activity.name}
                    </p>
                    <p className="text-[10px] text-on-surface-variant">
                      {activity.action}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
