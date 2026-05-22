'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { callsApi, Call, CallType, CallStatus } from '@/api/calls';
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
  const [searchedUsers, setSearchedUsers] = useState<any[]>([]);
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
      } catch (err: any) {
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

  const handleCreateDirectCall = async (targetUser: any) => {
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
    } catch (err: any) {
      setError(err.message || 'Lỗi hệ thống khi bắt đầu cuộc gọi.');
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
    } catch (err: any) {
      setError(err.message || 'Lỗi hệ thống khi khởi tạo cuộc họp.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <main className='flex flex-1 h-full overflow-y-auto bg-background text-on-surface p-6'>
      <div className='max-w-6xl mx-auto w-full flex flex-col gap-6'>
        {/* Header Block */}
        <div className='relative overflow-hidden bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 rounded-3xl border border-outline/10 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4'>
          <div className='space-y-1.5 z-10'>
            <h1 className='text-3xl font-extrabold text-primary flex items-center gap-3 tracking-tight'>
              <Video className='size-9 text-primary animate-pulse shrink-0' />
              Cuộc họp & Cuộc gọi
            </h1>
            <p className='text-on-surface-variant text-sm max-w-2xl'>
              Khởi tạo cuộc họp tức thì (Private / Public), tìm kiếm kết nối
              video 1:1, và quản lý lịch sử cuộc gọi. Các tính năng cuộc họp lớp
              hoặc nhóm được tạo trực tiếp ngay trong lớp học hoặc kênh chat
              tương ứng.
            </p>
          </div>
          <Button
            variant='outline'
            size='icon'
            onClick={loadCallsData}
            disabled={loading}
            className='rounded-2xl bg-surface hover:bg-primary/10 hover:text-primary transition-all shadow-sm z-10'
            title='Làm mới dữ liệu'
          >
            <RefreshCw className={`size-5 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {error && (
          <div className='bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3.5 rounded-2xl text-sm font-medium flex items-center gap-2.5 animate-in fade-in slide-in-from-top-1 duration-200'>
            <AlertCircle className='size-5 shrink-0' />
            <span>{error}</span>
          </div>
        )}

        {/* Dashboard Content split in two columns */}
        <div className='grid grid-cols-1 lg:grid-cols-12 gap-6 items-start'>
          {/* LEFT: Search User & Custom call creations */}
          <div className='lg:col-span-5 space-y-6'>
            {/* Instant Custom Call Creator Card */}
            <Card className='rounded-3xl border-outline-variant bg-surface-container-lowest shadow-sm'>
              <CardHeader className='pb-4 border-b border-outline-variant'>
                <CardTitle className='text-lg font-bold flex items-center gap-2'>
                  <Video className='size-5 text-primary' />
                  Tạo cuộc họp nhanh
                </CardTitle>
                <CardDescription>
                  Tạo cuộc họp Private hoặc Public tức thì và nhận đường dẫn
                  chia sẻ.
                </CardDescription>
              </CardHeader>
              <CardContent className='pt-6 space-y-4'>
                <div className='space-y-2'>
                  <label className='text-xs font-semibold text-on-surface-variant/80'>
                    Tiêu đề cuộc họp
                  </label>
                  <Input
                    type='text'
                    placeholder='Ví dụ: Thảo luận bài tập nhóm...'
                    value={newCallTitle}
                    onChange={(e) => setNewCallTitle(e.target.value)}
                    className='rounded-xl border-outline-variant focus-visible:ring-primary/20 h-10 text-sm'
                  />
                </div>

                <div className='space-y-2'>
                  <label className='text-xs font-semibold text-on-surface-variant/80'>
                    Chế độ bảo mật
                  </label>
                  <div className='grid grid-cols-2 gap-2.5'>
                    <button
                      type='button'
                      onClick={() => setNewCallType(CallType.PRIVATE)}
                      className={`p-3 rounded-2xl border text-xs font-bold transition-all text-center flex flex-col items-center justify-center gap-1 ${
                        newCallType === CallType.PRIVATE
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-outline-variant bg-surface hover:bg-surface-variant/10 text-on-surface-variant'
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
                      className={`p-3 rounded-2xl border text-xs font-bold transition-all text-center flex flex-col items-center justify-center gap-1 ${
                        newCallType === CallType.PUBLIC
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-outline-variant bg-surface hover:bg-surface-variant/10 text-on-surface-variant'
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
                  className='w-full rounded-xl bg-primary hover:bg-primary-dim text-white font-bold h-10 mt-2 shadow-sm text-sm active:scale-95 transition-all'
                >
                  {creating ? 'Đang khởi tạo...' : 'Tạo cuộc họp'}
                </Button>
              </CardContent>
            </Card>

            <Card className='rounded-3xl border-outline-variant bg-surface-container-lowest shadow-sm'>
              <CardHeader className='pb-4 border-b border-outline-variant'>
                <CardTitle className='text-lg font-bold flex items-center gap-2'>
                  <PhoneCall className='size-5 text-primary' />
                  Bắt đầu cuộc gọi mới
                </CardTitle>
                <CardDescription>
                  Nhập tên hoặc email để tìm kiếm và gọi video trực tiếp cho
                  thành viên khác.
                </CardDescription>
              </CardHeader>
              <CardContent className='pt-6 space-y-4'>
                <div className='relative'>
                  <Search className='absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/40 size-4' />
                  <Input
                    type='text'
                    placeholder='Tìm tên hoặc email...'
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className='pl-9 rounded-2xl bg-surface border-outline-variant focus-visible:ring-primary/20 h-11'
                  />
                </div>

                <ScrollArea className='h-[350px] pr-2'>
                  {searching ? (
                    <div className='flex flex-col items-center justify-center py-16 gap-3'>
                      <div className='w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin'></div>
                      <p className='text-xs text-on-surface-variant/70 font-medium'>
                        Đang tìm kiếm...
                      </p>
                    </div>
                  ) : searchQuery.trim() === '' ? (
                    <div className='flex flex-col items-center justify-center py-16 text-center text-on-surface-variant/50 px-4'>
                      <User className='size-12 mb-3 text-on-surface-variant/20' />
                      <h4 className='font-bold text-sm text-on-surface/75'>
                        Chưa có thông tin tìm kiếm
                      </h4>
                      <p className='text-xs max-w-[200px] mt-1'>
                        Hãy gõ tên hoặc email người dùng ở trên để liên hệ.
                      </p>
                    </div>
                  ) : searchedUsers.length === 0 ? (
                    <div className='flex flex-col items-center justify-center py-16 text-center text-on-surface-variant/50 px-4'>
                      <VideoOff className='size-12 mb-3 text-on-surface-variant/20' />
                      <h4 className='font-bold text-sm text-on-surface/75'>
                        Không tìm thấy kết quả
                      </h4>
                      <p className='text-xs max-w-[200px] mt-1'>
                        Thành viên này không tồn tại hoặc thông tin chưa chính
                        xác.
                      </p>
                    </div>
                  ) : (
                    <div className='space-y-2.5'>
                      {searchedUsers.map((user) => (
                        <div
                          key={user.id}
                          className='flex items-center justify-between p-3 rounded-2xl border border-outline/10 bg-surface/50 hover:bg-primary/5 hover:border-primary/20 transition-all group'
                        >
                          <div className='flex items-center gap-3 min-w-0'>
                            <Avatar className='size-10 border border-outline-variant shrink-0'>
                              <AvatarImage
                                src={user.avatarUrl || ''}
                                alt={user.fullName || ''}
                              />
                              <AvatarFallback className='bg-primary/10 text-primary font-bold text-xs uppercase'>
                                {(user.fullName || user.email).substring(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <div className='min-w-0'>
                              <h4 className='font-bold text-sm text-on-surface truncate group-hover:text-primary transition-colors'>
                                {user.fullName || 'Người dùng'}
                              </h4>
                              <p className='text-xs text-on-surface-variant/70 truncate'>
                                {user.email}
                              </p>
                            </div>
                          </div>

                          <Button
                            onClick={() => handleCreateDirectCall(user)}
                            disabled={creating}
                            size='sm'
                            className='rounded-xl bg-primary hover:bg-primary-dim text-white font-semibold flex items-center gap-1.5 shrink-0 active:scale-95 shadow-sm transition-all'
                          >
                            <PhoneCall className='size-3.5' />
                            Gọi ngay
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT: Ongoing & History list */}
          <div className='lg:col-span-7 space-y-6'>
            {/* Ongoing Calls Card */}
            <Card className='rounded-3xl border-outline-variant bg-surface-container-lowest shadow-sm'>
              <CardHeader className='pb-4 border-b border-outline-variant flex flex-row items-center justify-between'>
                <div>
                  <CardTitle className='text-lg font-bold flex items-center gap-2'>
                    <span className='flex size-2.5 rounded-full bg-emerald-500 animate-pulse'></span>
                    Cuộc gọi đang trực tuyến ({ongoingCalls.length})
                  </CardTitle>
                  <CardDescription>
                    Danh sách các kết nối video đang trực tuyến của bạn.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className='pt-6'>
                {ongoingCalls.length === 0 ? (
                  <div className='flex flex-col items-center justify-center py-12 text-center text-on-surface-variant/40'>
                    <PhoneOff className='size-10 mb-2' />
                    <p className='text-sm font-medium'>
                      Chưa có cuộc gọi trực tuyến nào
                    </p>
                  </div>
                ) : (
                  <div className='space-y-3'>
                    {ongoingCalls.map((call) => (
                      <div
                        key={call.id}
                        className='flex flex-col md:flex-row md:items-center justify-between p-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 transition-all gap-4'
                      >
                        <div className='space-y-1'>
                          <div className='flex items-center gap-2 flex-wrap'>
                            <h3 className='font-bold text-on-surface text-sm md:text-base'>
                              {call.title || 'Cuộc gọi 1:1'}
                            </h3>
                            <Badge
                              variant='outline'
                              className='bg-emerald-500/10 border-emerald-500/30 text-emerald-600 font-semibold px-2 py-0.5 text-[10px] rounded-full uppercase tracking-wider shrink-0'
                            >
                              Trực tuyến
                            </Badge>
                          </div>
                          <p className='text-xs text-on-surface-variant/80 flex items-center gap-1.5'>
                            <User className='size-3.5 text-primary' />
                            <span>
                              Chủ phòng:{' '}
                              {call.creator?.fullName || 'Người dùng'}
                            </span>
                          </p>
                          <p className='text-xs text-on-surface-variant/60 flex items-center gap-1.5'>
                            <Clock className='size-3.5 text-primary' />
                            <span>
                              Bắt đầu:{' '}
                              {call.startedAt
                                ? new Date(call.startedAt).toLocaleString()
                                : 'Vừa xong'}
                            </span>
                          </p>
                        </div>

                        <Button
                          onClick={() => handleJoinCall(call.id)}
                          className='rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-1.5 shadow-md shadow-emerald-600/10 active:scale-95 transition-all self-end md:self-center'
                        >
                          <Video className='size-4' />
                          Tham gia
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* History Calls Card */}
            <Card className='rounded-3xl border-outline-variant bg-surface-container-lowest shadow-sm'>
              <CardHeader className='pb-4 border-b border-outline-variant'>
                <CardTitle className='text-lg font-bold flex items-center gap-2'>
                  <History className='size-5 text-primary' />
                  Lịch sử cuộc gọi
                </CardTitle>
                <CardDescription>
                  Tổng quan lịch sử các cuộc gọi gần nhất của bạn.
                </CardDescription>
              </CardHeader>
              <CardContent className='pt-6'>
                {historyCalls.length === 0 ? (
                  <div className='flex flex-col items-center justify-center py-12 text-center text-on-surface-variant/40'>
                    <History className='size-10 mb-2' />
                    <p className='text-sm font-medium'>
                      Chưa có lịch sử cuộc gọi
                    </p>
                  </div>
                ) : (
                  <ScrollArea className='h-[300px] pr-2'>
                    <div className='space-y-3'>
                      {historyCalls.map((call) => (
                        <div
                          key={call.id}
                          className='flex items-center justify-between p-4 rounded-2xl border border-outline/10 bg-surface/30 hover:bg-surface-variant/10 transition-all gap-4'
                        >
                          <div className='space-y-1.5 min-w-0'>
                            <h3 className='font-bold text-on-surface text-sm truncate'>
                              {call.title || 'Cuộc gọi 1:1'}
                            </h3>
                            <div className='flex items-center gap-3 text-xs text-on-surface-variant/70 flex-wrap'>
                              <span className='flex items-center gap-1'>
                                <User className='size-3.5 text-on-surface-variant/40' />
                                <span className='truncate'>
                                  {call.creator?.fullName || 'Người dùng'}
                                </span>
                              </span>
                              <span className='flex items-center gap-1'>
                                <Clock className='size-3.5 text-on-surface-variant/40' />
                                <span>
                                  {call.startedAt
                                    ? new Date(
                                        call.startedAt,
                                      ).toLocaleDateString()
                                    : 'N/A'}
                                </span>
                              </span>
                            </div>
                          </div>

                          <div className='flex flex-col items-end gap-1.5 shrink-0'>
                            {call.status === CallStatus.ENDED ? (
                              <Badge
                                variant='secondary'
                                className='rounded-full px-2 py-0.5 text-[10px] uppercase font-semibold text-on-surface-variant/80 bg-surface-variant border-transparent shrink-0'
                              >
                                Đã kết thúc
                              </Badge>
                            ) : (
                              <Badge
                                variant='outline'
                                className='bg-emerald-500/10 border-emerald-500/30 text-emerald-600 font-semibold px-2 py-0.5 text-[10px] rounded-full uppercase tracking-wider shrink-0 animate-pulse'
                              >
                                Trực tuyến
                              </Badge>
                            )}
                            <span className='text-[10px] text-on-surface-variant/50'>
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
          </div>
        </div>
      </div>
    </main>
  );
}
