'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { callsApi, Call, CallType, CallStatus } from '@/api/calls';
import { motion } from 'framer-motion';

type SearchedUser = {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  role: string;
};

import {
  Search,
  PhoneCall,
  RefreshCw,
  History,
  Video,
  Clock,
  User,
  AlertCircle,
  PhoneOff,
  VideoOff,
  Plus,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function CallPage() {
  const router = useRouter();

  // Call States
  const [ongoingCalls, setOngoingCalls] = useState<Call[]>([]);
  const [historyCalls, setHistoryCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(true);

  // Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [searchedUsers, setSearchedUsers] = useState<SearchedUser[]>([]);
  const [searching, setSearching] = useState(false);

  // Creation State
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Instant Custom Meeting States
  const [newCallTitle, setNewCallTitle] = useState('');
  const [newCallType, setNewCallType] = useState<CallType>(CallType.PRIVATE);

  // Fetch calls data
  const loadCallsData = async () => {
    setLoading(true);
    try {
      const [ongoingRes, historyRes] = await Promise.all([
        callsApi.getOngoingCalls(),
        callsApi.getCallHistory(),
      ]);

      if (ongoingRes.success && ongoingRes.data) {
        setOngoingCalls(ongoingRes.data);
      }
      if (historyRes.success && historyRes.data) {
        setHistoryCalls(historyRes.data);
      }
    } catch (err) {
      console.error('Failed to load call lists', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCallsData();
  }, []);

  // Handle live search
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      const query = searchQuery.trim();
      if (!query) {
        setSearchedUsers([]);
        return;
      }

      setSearching(true);
      setError(null);
      try {
        const res = await callsApi.searchUsers(query);
        if (res.success && res.data) {
          setSearchedUsers(res.data);
        }
      } catch (err) {
        console.error('Failed to search users', err);
      } finally {
        setSearching(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const handleJoinCall = (callId: string) => {
    router.push(`/call/${callId}`);
  };

  const handleCreateDirectCall = async (targetUser: SearchedUser) => {
    setCreating(true);
    setError(null);
    try {
      const res = await callsApi.createCall({
        title: `Cuộc gọi với ${targetUser.fullName || targetUser.email}`,
        type: CallType.PRIVATE,
      });

      if (res.success && res.data) {
        // Pre-approve the target user so they can join instantly without manual host approval popup.
        await callsApi.approveParticipant(res.data.id, targetUser.id);
        router.push(`/call/${res.data.id}`);
      } else {
        setError(res.error || 'Tạo cuộc gọi trực tiếp thất bại!');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi hệ thống khi bắt đầu cuộc gọi.');
    } finally {
      setCreating(false);
    }
  };

  const handleCreateMeeting = async () => {
    setCreating(true);
    setError(null);
    try {
      const res = await callsApi.createCall({
        title:
          newCallTitle.trim() ||
          `Cuộc họp ${newCallType === CallType.PRIVATE ? 'Riêng tư' : 'Công khai'}`,
        type: newCallType,
      });

      if (res.success && res.data) {
        router.push(`/call/${res.data.id}`);
      } else {
        setError(res.error || 'Tạo cuộc họp thất bại!');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi hệ thống khi khởi tạo cuộc họp.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <main className='flex-1 overflow-y-auto bg-surface-container-lowest p-6 md:p-12 text-on-surface w-full pb-16'>
      <div className='max-w-5xl mx-auto flex flex-col gap-6 relative'>
        <div className='absolute -right-16 -top-16 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none' />

        {/* Header Block */}
        <div className='flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-outline-variant/30 pb-6 relative z-10'>
          <div className='space-y-1'>
            <h1 className='text-2xl font-black text-on-surface flex items-center gap-3 tracking-tight'>
              <Video className='size-7 text-primary shrink-0' />
              Cuộc họp & Cuộc gọi
            </h1>
            <p className='text-xs sm:text-sm text-on-surface-variant/85 max-w-2xl leading-relaxed'>
              Khởi tạo cuộc họp tức thì, kết nối video 1:1, và quản lý lịch sử cuộc gọi. Các tính năng cuộc họp lớp hoặc nhóm được tạo trực tiếp ngay trong lớp học hoặc kênh chat tương ứng.
            </p>
          </div>
          <Button
            variant='outline'
            size='icon'
            onClick={loadCallsData}
            disabled={loading}
            className='rounded-xl border-outline-variant/40 hover:bg-primary/5 hover:text-primary active:scale-[0.98] transition-all self-start md:self-center shrink-0 w-10 h-10 shadow-xs'
            title='Làm mới dữ liệu'
          >
            <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {error && (
          <div className='bg-error/10 border border-error/20 text-error px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2.5 animate-in fade-in slide-in-from-top-1 duration-200 z-10'>
            <AlertCircle className='size-4.5 shrink-0' />
            <span>{error}</span>
          </div>
        )}

        {/* Dashboard Content split in two columns */}
        <div className='grid grid-cols-1 lg:grid-cols-12 gap-6 items-start relative z-10'>
          {/* LEFT: Search User & Custom call creations */}
          <div className='lg:col-span-5 space-y-6'>
            {/* Instant Custom Call Creator Card */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <Card className='rounded-2xl border-outline-variant/30 bg-white shadow-xs overflow-hidden'>
                <CardHeader className='pb-4 border-b border-outline-variant/20'>
                  <CardTitle className='text-sm font-bold uppercase tracking-wider text-on-surface flex items-center gap-2'>
                    <Plus className='size-4 text-primary' />
                    Tạo cuộc họp nhanh
                  </CardTitle>
                  <CardDescription className='text-xs text-on-surface-variant/75 mt-1'>
                    Tạo cuộc họp Private hoặc Public tức thì và nhận đường dẫn chia sẻ.
                  </CardDescription>
                </CardHeader>
                <CardContent className='pt-5 space-y-4'>
                  <div className='space-y-1.5'>
                    <label className='text-xs font-bold text-on-surface-variant/80'>
                      Tiêu đề cuộc họp
                    </label>
                    <Input
                      type='text'
                      placeholder='Ví dụ: Thảo luận bài tập nhóm...'
                      value={newCallTitle}
                      onChange={(e) => setNewCallTitle(e.target.value)}
                      className='rounded-xl border-outline-variant/40 focus-visible:ring-primary/20 h-10 text-xs'
                    />
                  </div>

                  <div className='space-y-1.5'>
                    <label className='text-xs font-bold text-on-surface-variant/80'>
                      Chế độ bảo mật
                    </label>
                    <div className='grid grid-cols-2 gap-2.5'>
                      <button
                        type='button'
                        onClick={() => setNewCallType(CallType.PRIVATE)}
                        className={`p-3 rounded-xl border text-xs font-bold transition-all text-center flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                          newCallType === CallType.PRIVATE
                            ? 'border-primary bg-primary/5 text-primary'
                            : 'border-outline-variant/30 bg-surface hover:bg-outline-variant/10 text-on-surface-variant'
                        }`}
                      >
                        <span>Riêng tư (Private)</span>
                        <span className='text-[9px] font-normal opacity-70'>
                          Chủ phòng duyệt vào
                        </span>
                      </button>
                      <button
                        type='button'
                        onClick={() => setNewCallType(CallType.PUBLIC)}
                        className={`p-3 rounded-xl border text-xs font-bold transition-all text-center flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                          newCallType === CallType.PUBLIC
                            ? 'border-primary bg-primary/5 text-primary'
                            : 'border-outline-variant/30 bg-surface hover:bg-outline-variant/10 text-on-surface-variant'
                        }`}
                      >
                        <span>Công khai (Public)</span>
                        <span className='text-[9px] font-normal opacity-70'>
                          Vào tự do bằng link
                        </span>
                      </button>
                    </div>
                  </div>

                  <Button
                    onClick={handleCreateMeeting}
                    disabled={creating}
                    className='w-full rounded-xl bg-primary hover:bg-primary-dim text-white font-bold h-10 mt-2 shadow-xs text-xs active:scale-[0.98] transition-all'
                  >
                    {creating ? 'Đang khởi tạo...' : 'Tạo cuộc họp'}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Calling User Search Card */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30, delay: 0.05 }}
            >
              <Card className='rounded-2xl border-outline-variant/30 bg-white shadow-xs overflow-hidden'>
                <CardHeader className='pb-4 border-b border-outline-variant/20'>
                  <CardTitle className='text-sm font-bold uppercase tracking-wider text-on-surface flex items-center gap-2'>
                    <PhoneCall className='size-4 text-primary' />
                    Bắt đầu cuộc gọi mới
                  </CardTitle>
                  <CardDescription className='text-xs text-on-surface-variant/75 mt-1'>
                    Nhập tên hoặc email để tìm kiếm và gọi video trực tiếp cho thành viên khác.
                  </CardDescription>
                </CardHeader>
                <CardContent className='pt-5 space-y-4'>
                  <div className='relative'>
                    <Search className='absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50 size-4' />
                    <Input
                      type='text'
                      placeholder='Tìm tên hoặc email...'
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className='pl-9 rounded-xl bg-surface border-outline-variant/40 focus-visible:ring-primary/20 h-10 text-xs'
                    />
                  </div>

                  <ScrollArea className='h-[240px] pr-1'>
                    {searching ? (
                      <div className='flex flex-col items-center justify-center py-14 gap-2'>
                        <RefreshCw className='size-6 animate-spin text-primary' />
                        <p className='text-[10px] text-on-surface-variant/70 font-bold uppercase tracking-wider'>
                          Đang tìm kiếm...
                        </p>
                      </div>
                    ) : searchQuery.trim() === '' ? (
                      <div className='flex flex-col items-center justify-center py-12 text-center text-on-surface-variant/50 px-4'>
                        <User className='size-10 mb-2 text-on-surface-variant/30' />
                        <h4 className='font-bold text-xs text-on-surface/85'>
                          Chưa có thông tin tìm kiếm
                        </h4>
                        <p className='text-[10px] max-w-[200px] mt-1 text-on-surface-variant/70'>
                          Hãy gõ tên hoặc email thành viên ở trên để kết nối cuộc gọi.
                        </p>
                      </div>
                    ) : searchedUsers.length === 0 ? (
                      <div className='flex flex-col items-center justify-center py-12 text-center text-on-surface-variant/50 px-4'>
                        <VideoOff className='size-10 mb-2 text-on-surface-variant/30' />
                        <h4 className='font-bold text-xs text-on-surface/85'>
                          Không tìm thấy kết quả
                        </h4>
                        <p className='text-[10px] max-w-[200px] mt-1 text-on-surface-variant/70'>
                          Thành viên này không tồn tại hoặc thông tin tìm kiếm chưa chính xác.
                        </p>
                      </div>
                    ) : (
                      <div className='space-y-2'>
                        {searchedUsers.map((user) => (
                          <div
                            key={user.id}
                            className='flex items-center justify-between p-3 rounded-xl border border-outline-variant/20 bg-surface/50 hover:bg-primary/5 hover:border-primary/30 transition-all group'
                          >
                            <div className='flex items-center gap-3.5 min-w-0'>
                              <Avatar className='size-9 border border-outline-variant/30 shrink-0'>
                                <AvatarImage
                                  src={user.avatarUrl || ''}
                                  alt={user.fullName || ''}
                                />
                                <AvatarFallback className='bg-primary/10 text-primary font-bold text-xs uppercase'>
                                  {(user.fullName || user.email).substring(0, 2)}
                                </AvatarFallback>
                              </Avatar>
                              <div className='min-w-0'>
                                <h4 className='font-bold text-xs text-on-surface truncate group-hover:text-primary transition-colors'>
                                  {user.fullName || 'Người dùng'}
                                </h4>
                                <p className='text-[10px] text-on-surface-variant/75 truncate'>
                                  {user.email}
                                </p>
                              </div>
                            </div>

                            <Button
                              onClick={() => handleCreateDirectCall(user)}
                              disabled={creating}
                              size='sm'
                              className='rounded-lg bg-primary hover:bg-primary-dim text-white font-bold text-[10px] h-8 flex items-center gap-1 shrink-0 active:scale-[0.97] transition-all shadow-xs'
                            >
                              <PhoneCall className='size-3' />
                              Gọi ngay
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* RIGHT: Ongoing & History list */}
          <div className='lg:col-span-7 space-y-6'>
            {/* Ongoing Calls Card */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30, delay: 0.1 }}
            >
              <Card className='rounded-2xl border-outline-variant/30 bg-white shadow-xs overflow-hidden'>
                <CardHeader className='pb-4 border-b border-outline-variant/20 flex flex-row items-center justify-between'>
                  <div>
                    <CardTitle className='text-sm font-bold uppercase tracking-wider text-on-surface flex items-center gap-2'>
                      <span className='flex size-2 rounded-full bg-green-500 animate-pulse'></span>
                      Cuộc gọi trực tuyến ({ongoingCalls.length})
                    </CardTitle>
                    <CardDescription className='text-xs text-on-surface-variant/75 mt-1'>
                      Danh sách các kết nối video đang trực tuyến của bạn.
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className='pt-5'>
                  {ongoingCalls.length === 0 ? (
                    <div className='flex flex-col items-center justify-center py-10 text-center text-on-surface-variant/40'>
                      <PhoneOff className='size-9 mb-2 text-on-surface-variant/20' />
                      <p className='text-xs font-bold text-on-surface-variant/75'>
                        Chưa có cuộc gọi trực tuyến nào
                      </p>
                    </div>
                  ) : (
                    <div className='space-y-3'>
                      {ongoingCalls.map((call) => (
                        <div
                          key={call.id}
                          className='flex flex-col md:flex-row md:items-center justify-between p-4.5 rounded-xl border border-green-500/20 bg-[#EDF3EC] hover:bg-[#e4eedf] transition-all gap-4'
                        >
                          <div className='space-y-1 min-w-0'>
                            <div className='flex items-center gap-2.5 flex-wrap'>
                              <h3 className='font-bold text-[#346538] text-sm truncate'>
                                {call.title || 'Cuộc gọi 1:1'}
                              </h3>
                              <Badge
                                variant='outline'
                                className='bg-green-500/10 border-green-500/25 text-[#346538] font-bold px-2 py-0.5 text-[9px] rounded-md uppercase tracking-wider shrink-0'
                              >
                                Trực tuyến
                              </Badge>
                            </div>
                            <p className='text-[11px] text-[#346538]/85 flex items-center gap-1.5'>
                              <User className='size-3 text-[#346538]/70' />
                              <span>
                                Chủ phòng:{' '}
                                <span className='font-bold'>{call.creator?.fullName || 'Người dùng'}</span>
                              </span>
                            </p>
                            <p className='text-[11px] text-[#346538]/70 flex items-center gap-1.5'>
                              <Clock className='size-3 text-[#346538]/60' />
                              <span>
                                Bắt đầu:{' '}
                                {call.startedAt
                                  ? new Date(call.startedAt).toLocaleString('vi-VN')
                                  : 'Vừa xong'}
                              </span>
                            </p>
                          </div>

                          <Button
                            onClick={() => handleJoinCall(call.id)}
                            className='rounded-xl bg-[#346538] hover:bg-[#2c552f] text-white font-bold text-xs h-9 flex items-center gap-1.5 shadow-xs active:scale-[0.97] transition-all self-end md:self-center shrink-0 border-0'
                          >
                            <Video className='size-3.5' />
                            Tham gia
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* History Calls Card */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30, delay: 0.15 }}
            >
              <Card className='rounded-2xl border-outline-variant/30 bg-white shadow-xs overflow-hidden'>
                <CardHeader className='pb-4 border-b border-outline-variant/20'>
                  <CardTitle className='text-sm font-bold uppercase tracking-wider text-on-surface flex items-center gap-2'>
                    <History className='size-4 text-primary' />
                    Lịch sử cuộc gọi
                  </CardTitle>
                  <CardDescription className='text-xs text-on-surface-variant/75 mt-1'>
                    Tổng quan lịch sử các cuộc gọi gần nhất của bạn.
                  </CardDescription>
                </CardHeader>
                <CardContent className='pt-5'>
                  {historyCalls.length === 0 ? (
                    <div className='flex flex-col items-center justify-center py-10 text-center text-on-surface-variant/40'>
                      <History className='size-9 mb-2 text-on-surface-variant/20' />
                      <p className='text-xs font-bold text-on-surface-variant/75'>
                        Chưa có lịch sử cuộc gọi
                      </p>
                    </div>
                  ) : (
                    <ScrollArea className='h-[250px] pr-1'>
                      <div className='space-y-2.5'>
                        {historyCalls.map((call) => (
                          <div
                            key={call.id}
                            className='flex items-center justify-between p-3.5 rounded-xl border border-outline-variant/20 bg-surface/30 hover:bg-outline-variant/5 transition-all gap-4'
                          >
                            <div className='space-y-1 min-w-0'>
                              <h3 className='font-bold text-on-surface text-xs sm:text-sm truncate'>
                                {call.title || 'Cuộc gọi 1:1'}
                              </h3>
                              <div className='flex items-center gap-3 text-[10px] text-on-surface-variant/70 flex-wrap'>
                                <span className='flex items-center gap-1'>
                                  <User className='size-3 text-on-surface-variant/40' />
                                  <span className='truncate font-medium'>
                                    {call.creator?.fullName || 'Người dùng'}
                                  </span>
                                </span>
                                <span className='flex items-center gap-1'>
                                  <Clock className='size-3 text-on-surface-variant/40' />
                                  <span>
                                    {call.startedAt
                                      ? new Date(call.startedAt).toLocaleDateString('vi-VN')
                                      : 'N/A'}
                                  </span>
                                </span>
                              </div>
                            </div>

                            <div className='flex flex-col items-end gap-1 shrink-0'>
                              {call.status === CallStatus.ENDED ? (
                                <Badge
                                  variant='secondary'
                                  className='rounded-md px-2 py-0.5 text-[9px] uppercase font-bold text-on-surface-variant/80 bg-surface border-transparent shrink-0'
                                >
                                  Đã kết thúc
                                </Badge>
                              ) : (
                                <Badge
                                  variant='outline'
                                  className='bg-green-500/10 border-green-500/25 text-[#346538] font-bold px-2 py-0.5 text-[9px] rounded-md uppercase tracking-wider shrink-0 animate-pulse'
                                >
                                  Trực tuyến
                                </Badge>
                              )}
                              <span className='text-[9px] text-on-surface-variant/60 font-medium'>
                                {call.startedAt && call.endedAt
                                  ? `${Math.ceil((new Date(call.endedAt).getTime() - new Date(call.startedAt).getTime()) / 60000)} phút`
                                  : call.status === CallStatus.ONGOING
                                    ? 'Đang gọi...'
                                    : 'N/A'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </main>
  );
}
