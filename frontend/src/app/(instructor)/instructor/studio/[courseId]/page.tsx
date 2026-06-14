'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';
import { getCourse, CourseDetail, updateCourse } from '@/api/courses';
import {
  SectionWithLessons,
  LessonItem,
  getSections,
  createSection,
  updateSection,
  deleteSection,
  createLesson,
  updateLesson,
  deleteLesson,
  uploadLessonFile,
} from '@/api/instructor';
import { Quiz, getCreatedQuizzes } from '@/api/quizzes';
import { appAlert, appConfirm } from '@/components/ui/app-dialog-provider';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

export default function CourseEditorPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [sections, setSections] = useState<SectionWithLessons[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  // Editing states
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState('');
  const [descInput, setDescInput] = useState('');
  const [visibilityInput, setVisibilityInput] = useState<'public' | 'private' | 'sale'>('public');
  const [priceInput, setPriceInput] = useState('');
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [addingLessonTo, setAddingLessonTo] = useState<string | null>(null);
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [newLessonType, setNewLessonType] = useState('video');
  const [newLessonUrl, setNewLessonUrl] = useState('');
  const [newLessonBody, setNewLessonBody] = useState('');
  const [newLessonInputMode, setNewLessonInputMode] = useState<'url' | 'upload'>('url');
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadingFile, setUploadingFile] = useState<boolean>(false);

  // Lesson Editing States
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [editLessonTitle, setEditLessonTitle] = useState('');
  const [editLessonType, setEditLessonType] = useState('video');
  const [editLessonUrl, setEditLessonUrl] = useState('');
  const [editLessonBody, setEditLessonBody] = useState('');
  const [editLessonInputMode, setEditLessonInputMode] = useState<'url' | 'upload'>('url');
  const [editUploadProgress, setEditUploadProgress] = useState<number>(0);
  const [editUploadingFile, setEditUploadingFile] = useState<boolean>(false);
  const [newLessonDuration, setNewLessonDuration] = useState<number | undefined>(undefined);
  const [editLessonDuration, setEditLessonDuration] = useState<number | undefined>(undefined);
  
  // Quizzes
  const [availableQuizzes, setAvailableQuizzes] = useState<Quiz[]>([]);

  useEffect(() => {
    fetchData();
  }, [courseId]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [courseRes, sectionsRes, quizzesRes] = await Promise.all([
        getCourse(courseId),
        getSections(courseId),
        getCreatedQuizzes(),
      ]);
      if (courseRes.success && courseRes.data) {
        setCourse(courseRes.data);
        setTitleInput(courseRes.data.title);
        setDescInput(courseRes.data.description || '');
        setVisibilityInput((courseRes.data.visibility as 'public' | 'private' | 'sale') || 'public');
        setPriceInput(courseRes.data.price > 0 ? String(courseRes.data.price) : '');
      }
      if (sectionsRes.success && sectionsRes.data) {
        setSections(sectionsRes.data);
        // Expand all sections by default
        setExpandedSections(new Set(sectionsRes.data.map((s) => s.id)));
      }
      if (quizzesRes.success && quizzesRes.data) {
        setAvailableQuizzes(quizzesRes.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateCourse = async () => {
    if (!titleInput.trim()) return;
    try {
      const parsedPrice = parseFloat(priceInput.replace(/,/g, ''));
      const finalPrice = !isNaN(parsedPrice) && parsedPrice > 0 ? parsedPrice : 0;

      // Nếu nhập giá > 0 và visibility = public → tự đổi sang sale
      const finalVisibility =
        finalPrice > 0 && visibilityInput === 'public' ? 'sale' : visibilityInput;

      const res = await updateCourse(courseId, {
        title: titleInput.trim(),
        description: descInput.trim() || undefined,
        visibility: finalVisibility,
        price: finalPrice > 0 ? finalPrice : 0,
      });
      if (res.success && res.data) {
        setCourse(res.data);
        setVisibilityInput(finalVisibility);
        setPriceInput(finalPrice > 0 ? String(finalPrice) : '');
      }
      setEditingTitle(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddSection = async () => {
    if (!newSectionTitle.trim()) return;
    try {
      const res = await createSection(courseId, {
        title: newSectionTitle.trim(),
        orderIndex: sections.length,
      });
      if (res.success && res.data) {
        setSections((prev) => [...prev, res.data!]);
        setExpandedSections((prev) => new Set([...prev, res.data!.id]));
        setNewSectionTitle('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteSection = async (sectionId: string) => {
    if (!(await appConfirm({ title: 'Xóa phần học?', description: 'Tất cả bài học bên trong sẽ bị xóa.', confirmLabel: 'Xóa phần', variant: 'destructive' }))) return;
    try {
      await deleteSection(sectionId);
      setSections((prev) => prev.filter((s) => s.id !== sectionId));
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddLesson = async (sectionId: string) => {
    if (!newLessonTitle.trim()) return;
    try {
      const section = sections.find((s) => s.id === sectionId);
      const payload: any = {
        title: newLessonTitle.trim(),
        type: newLessonType,
        order: section ? section.lessons.length : 0,
      };
      if (newLessonType === 'video') {
        if (newLessonUrl.trim()) payload.contentUrl = newLessonUrl.trim();
        if (newLessonDuration) payload.durationSec = newLessonDuration;
      }
      if (newLessonType === 'text' && newLessonBody.trim()) {
        payload.body = newLessonBody.trim();
      }
      if (newLessonType === 'quiz' && newLessonUrl.trim()) {
        payload.contentUrl = newLessonUrl.trim(); // store quizId in contentUrl
      }
      const res = await createLesson(sectionId, payload);
      if (res.success && res.data) {
        setSections((prev) =>
          prev.map((s) =>
            s.id === sectionId ? { ...s, lessons: [...s.lessons, res.data!] } : s,
          ),
        );
        setNewLessonTitle('');
        setNewLessonUrl('');
        setNewLessonBody('');
        setNewLessonType('video');
        setNewLessonDuration(undefined);
        setAddingLessonTo(null);
      } else {
        void appAlert(res.error || 'Thêm bài học thất bại');
      }
    } catch (err: any) {
      console.error(err);
      void appAlert(err.message || 'Đã xảy ra lỗi');
    }
  };

  const handleDeleteLesson = async (sectionId: string, lessonId: string) => {
    if (!(await appConfirm({ title: 'Xóa bài học?', description: 'Bạn có chắc chắn muốn xóa bài học này?', confirmLabel: 'Xóa bài học', variant: 'destructive' }))) return;
    try {
      await deleteLesson(lessonId);
      setSections((prev) =>
        prev.map((s) =>
          s.id === sectionId
            ? { ...s, lessons: s.lessons.filter((l) => l.id !== lessonId) }
            : s,
        ),
      );
    } catch (err) {
      console.error(err);
    }
  };

  const startEditingLesson = (lesson: LessonItem) => {
    setEditingLessonId(lesson.id);
    setEditLessonTitle(lesson.title);
    setEditLessonType(lesson.type);
    setEditLessonUrl(lesson.contentUrl || '');
    setEditLessonBody(lesson.body || '');
    setEditLessonInputMode(lesson.contentUrl?.includes('s3.amazonaws.com') || lesson.contentUrl?.includes('glacier-bucket') ? 'upload' : 'url');
  };

  const handleUpdateLesson = async (sectionId: string, lessonId: string) => {
    if (!editLessonTitle.trim()) return;
    try {
      const payload: any = {
        title: editLessonTitle.trim(),
        type: editLessonType,
      };
      if (editLessonType === 'video') {
        payload.contentUrl = editLessonUrl.trim();
        payload.body = null;
        if (editLessonDuration) payload.durationSec = editLessonDuration;
      }
      if (editLessonType === 'text') {
        payload.body = editLessonBody.trim();
        payload.contentUrl = editLessonUrl.trim() || null;
      }
      if (editLessonType === 'quiz') {
        payload.contentUrl = editLessonUrl.trim(); // quizId
        payload.body = null;
      }

      const res = await updateLesson(lessonId, payload);
      if (res.success && res.data) {
        setSections((prev) =>
          prev.map((s) =>
            s.id === sectionId
              ? {
                  ...s,
                  lessons: s.lessons.map((l) => (l.id === lessonId ? res.data! : l)),
                }
              : s,
          ),
        );
        setEditLessonDuration(undefined);
        setEditingLessonId(null);
      } else {
        void appAlert(res.error || 'Cập nhật bài học thất bại');
      }
    } catch (err: any) {
      console.error(err);
      void appAlert(err.message || 'Đã xảy ra lỗi khi cập nhật bài học');
    }
  };

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const typeLabels: Record<string, { label: string; icon: string; color: string }> = {
    video: { label: 'Video', icon: 'play_circle', color: 'text-blue-500' },
    text: { label: 'Văn bản', icon: 'article', color: 'text-emerald-500' },
    file: { label: 'File', icon: 'attach_file', color: 'text-amber-500' },
    quiz: { label: 'Quiz', icon: 'quiz', color: 'text-purple-500' },
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-surface-container-lowest">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-surface-container-lowest">
        <p className="text-on-surface-variant/70 font-semibold">Không tìm thấy khóa học</p>
      </div>
    );
  }

  return (
    <div className="pb-16 transition-all p-4 sm:p-6 md:p-12 space-y-6 sm:space-y-8 bg-surface-container-lowest min-h-screen text-on-surface relative">
      <div className='absolute -right-16 -top-16 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none' />
      
      <div className='max-w-5xl mx-auto w-full space-y-6 sm:space-y-8 relative z-10'>
        {/* Header */}
        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant/30 pb-6'>
          <div className="flex items-center gap-3">
            <Link
              href="/instructor/studio"
              className="flex items-center gap-1 text-on-surface-variant/70 hover:text-primary transition-colors text-sm font-semibold"
            >
              <span className="material-symbols-outlined text-lg">arrow_back</span>
              Studio
            </Link>
            <span className="text-outline-variant/50">/</span>
            <h1 className="text-xl sm:text-2xl font-black text-on-surface tracking-tight truncate max-w-md">{course.title}</h1>
          </div>
          <Link
            href={`/courses/${courseId}`}
            className="text-xs font-bold bg-primary/10 text-primary px-4 py-2 rounded-xl hover:bg-primary/20 transition-colors flex items-center gap-1"
          >
            Xem trang học
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </Link>
        </div>

        {/* Course Info */}
        <div className="bg-white rounded-2xl border border-outline-variant/30 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-on-surface-variant flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">info</span>
              Thông tin khóa học
            </h2>
            {!editingTitle ? (
              <button
                onClick={() => setEditingTitle(true)}
                className="text-sm text-primary hover:underline font-medium"
              >
                Chỉnh sửa
              </button>
            ) : (
              <div className="flex gap-2">
                <button onClick={handleUpdateCourse} className="text-sm px-3 py-1 bg-primary/50 text-white rounded-lg font-medium">
                  Lưu
                </button>
                <button onClick={() => setEditingTitle(false)} className="text-sm text-on-surface-variant/70 hover:text-on-surface-variant">
                  Hủy
                </button>
              </div>
            )}
          </div>
          {editingTitle ? (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant/70 mb-1">Tên khóa học</label>
                <input
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  className="w-full px-4 py-2 border border-outline-variant/50 rounded-xl text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="bg-white">
                <label className="block text-xs font-semibold text-on-surface-variant/70 mb-1">Mô tả</label>
                <ReactQuill 
                  theme="snow" 
                  value={descInput} 
                  onChange={setDescInput} 
                  placeholder="Mô tả khóa học (tổng quan)..."
                  className="rounded-xl border border-outline-variant/50 overflow-hidden"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant/70 mb-1">Chế độ hiển thị</label>
                  <select
                    value={visibilityInput}
                    onChange={(e) => setVisibilityInput(e.target.value as 'public' | 'private' | 'sale')}
                    className="w-full px-3 py-2 border border-outline-variant/50 rounded-xl text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="public">Công khai miễn phí</option>
                    <option value="sale">Công khai có phí</option>
                    <option value="private">Riêng tư</option>
                  </select>
                </div>
                {(visibilityInput === 'sale' || visibilityInput === 'public') && (
                  <div>
                    <label className="block text-xs font-semibold text-on-surface-variant/70 mb-1">
                      Giá (VNĐ){visibilityInput === 'sale' && <span className="text-red-400"> *</span>}
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        step="1000"
                        value={priceInput}
                        onChange={(e) => setPriceInput(e.target.value)}
                        className="w-full px-3 py-2 pr-14 border border-outline-variant/50 rounded-xl text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
                        placeholder={visibilityInput === 'sale' ? '299000' : '0 = miễn phí'}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50 text-xs pointer-events-none">VNĐ</span>
                    </div>
                    {priceInput && parseFloat(priceInput) > 0 && (
                      <p className="text-xs text-on-surface-variant/50 mt-1">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(parseFloat(priceInput))}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div>
              <h3 className="text-lg font-semibold text-on-surface">{course.title}</h3>
              <div className="text-on-surface-variant/70 text-sm mt-1 prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-ol:my-1" dangerouslySetInnerHTML={{ __html: course.description || 'Chưa có mô tả' }} />
              <div className="flex flex-wrap gap-3 mt-3">
                <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
                  course.visibility === 'public'
                    ? 'bg-green-100 text-green-700'
                    : course.visibility === 'sale'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-surface-container-low text-on-surface-variant/80'
                }`}>
                  {course.visibility === 'public' ? '🌐 Công khai miễn phí'
                    : course.visibility === 'sale' ? '💰 Có phí'
                    : '🔒 Riêng tư'}
                </span>
                {Number(course.price) > 0 && (
                  <span className="inline-flex items-center text-xs font-bold text-blue-600">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(course.price))}
                  </span>
                )}
                <span className="text-xs text-on-surface-variant/50">{course._count?.sections ?? 0} phần học</span>
                <span className="text-xs text-on-surface-variant/50">{course._count?.members ?? 0} học viên</span>
              </div>
            </div>
          )}
        </div>

        {/* Sections & Lessons */}
        <div className="bg-white rounded-2xl border border-outline-variant/30 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-outline-variant/20 flex items-center justify-between">
            <h2 className="font-bold text-on-surface-variant flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">playlist_add</span>
              Nội dung khóa học ({sections.length} phần)
            </h2>
          </div>

          <div className="divide-y divide-outline-variant/20">
            {sections.map((section, sIdx) => (
              <div key={section.id}>
                {/* Section header */}
                <div className="flex items-center gap-3 px-6 py-4 bg-surface-container-lowest/50 hover:bg-surface-container-lowest transition-colors">
                  <button onClick={() => toggleSection(section.id)} className="shrink-0">
                    <span className={`material-symbols-outlined text-on-surface-variant/50 transition-transform ${expandedSections.has(section.id) ? 'rotate-90' : ''}`}>
                      chevron_right
                    </span>
                  </button>
                  <span className="w-7 h-7 rounded-lg bg-primary/10 text-sky-700 text-xs font-bold flex items-center justify-center shrink-0">
                    {sIdx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-on-surface text-sm">{section.title || 'Chưa đặt tên'}</h3>
                    <p className="text-xs text-on-surface-variant/50">{section.lessons.length} bài học</p>
                  </div>
                  <button
                    onClick={() => handleDeleteSection(section.id)}
                    className="text-slate-300 hover:text-red-500 transition-colors p-1"
                    title="Xóa phần"
                  >
                    <span className="material-symbols-outlined text-lg">delete</span>
                  </button>
                </div>

                {/* Lessons */}
                {expandedSections.has(section.id) && (
                  <div className="pl-16 pr-6 pb-4 space-y-2">
                    {section.lessons.map((lesson) => {
                      const t = typeLabels[lesson.type] || typeLabels.text;
                      const isEditingThis = editingLessonId === lesson.id;
                      return (
                        <div key={lesson.id} className="space-y-3 p-3 rounded-xl border border-outline-variant/20 hover:border-primary/30 transition-colors bg-white">
                          <div className="flex items-center gap-3">
                            <span className={`material-symbols-outlined text-lg ${t.color}`}>{t.icon}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-on-surface-variant truncate">{lesson.title}</p>
                              <p className="text-[11px] text-on-surface-variant/50">
                                {t.label}
                                {lesson.contentUrl && ' · URL đã gắn'}
                                {lesson.durationSec && ` · ${Math.floor(lesson.durationSec / 60)}m`}
                              </p>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => startEditingLesson(lesson)}
                                className="text-slate-300 hover:text-primary transition-colors p-1"
                                title="Chỉnh sửa bài học"
                              >
                                <span className="material-symbols-outlined text-base">edit</span>
                              </button>
                              <button
                                onClick={() => handleDeleteLesson(section.id, lesson.id)}
                                className="text-slate-300 hover:text-red-500 transition-colors p-1"
                                title="Xóa bài học"
                              >
                                <span className="material-symbols-outlined text-base">close</span>
                              </button>
                            </div>
                          </div>

                          {isEditingThis && (
                            <div className="p-4 border border-primary/30 rounded-xl bg-primary/5/20 space-y-3 mt-2">
                              <div>
                                <label className="block text-xs font-semibold text-on-surface-variant/70 mb-1">Tên bài học</label>
                                <input
                                  value={editLessonTitle}
                                  onChange={(e) => setEditLessonTitle(e.target.value)}
                                  className="w-full px-3 py-2 border border-outline-variant/50 rounded-lg text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
                                  placeholder="Tên bài học..."
                                />
                              </div>
                              <div className="flex gap-3 items-start">
                                <select
                                  value={editLessonType}
                                  onChange={(e) => { setEditLessonType(e.target.value); setEditLessonUrl(''); setEditLessonBody(''); }}
                                  className="px-3 py-2 border border-outline-variant/50 rounded-lg text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 shrink-0"
                                >
                                  <option value="video">Video</option>
                                  <option value="text">Văn bản</option>
                                  <option value="quiz">Quiz</option>
                                </select>

                                {/* Dynamic content field based on type */}
                                {editLessonType === 'video' && (
                                  <div className="flex-1 space-y-2">
                                    <div className="flex items-center gap-4 text-xs mb-1">
                                      <label className="flex items-center gap-1.5 cursor-pointer">
                                        <input type="radio" checked={editLessonInputMode === 'url'} onChange={() => setEditLessonInputMode('url')} /> Dán URL
                                      </label>
                                      <label className="flex items-center gap-1.5 cursor-pointer">
                                        <input type="radio" checked={editLessonInputMode === 'upload'} onChange={() => setEditLessonInputMode('upload')} /> Up file từ máy
                                      </label>
                                    </div>
                                    {editLessonInputMode === 'url' ? (
                                      <input
                                        value={editLessonUrl}
                                        onChange={(e) => setEditLessonUrl(e.target.value)}
                                        className="w-full px-3 py-2 border border-outline-variant/50 rounded-lg text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        placeholder="Dán URL video (YouTube, Vimeo...)"
                                      />
                                    ) : (
                                      <div className="relative">
                                        <input
                                          type="file"
                                          accept="video/*"
                                          disabled={editUploadingFile}
                                          onChange={async (e) => {
                                            if (e.target.files && e.target.files.length > 0) {
                                              const file = e.target.files[0];
                                              
                                              // Extract video duration locally
                                              try {
                                                const videoUrl = URL.createObjectURL(file);
                                                const tempVideo = document.createElement('video');
                                                tempVideo.preload = 'metadata';
                                                tempVideo.onloadedmetadata = () => {
                                                  URL.revokeObjectURL(videoUrl);
                                                  const dur = Math.round(tempVideo.duration);
                                                  setEditLessonDuration(dur);
                                                };
                                                tempVideo.src = videoUrl;
                                              } catch (err) {
                                                console.error('Error getting video metadata:', err);
                                              }

                                              setEditUploadingFile(true);
                                              setEditUploadProgress(0);
                                              const result = await uploadLessonFile(file, (p) => setEditUploadProgress(p));
                                              setEditUploadingFile(false);
                                              if (result.success && result.s3Key) {
                                                setEditLessonUrl(result.s3Key);
                                              } else {
                                                alert('Upload thất bại: ' + (result.error || 'Lỗi không xác định'));
                                              }
                                            }
                                          }}
                                          className="w-full px-3 py-1.5 border border-outline-variant/50 rounded-lg text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary/5 file:text-sky-700 hover:file:bg-primary/10"
                                        />
                                        {editUploadingFile && (
                                          <div className="mt-2">
                                            <div className="flex items-center justify-between text-xs text-on-surface-variant/70 mb-1">
                                              <span>Đang upload...</span>
                                              <span>{editUploadProgress}%</span>
                                            </div>
                                            <div className="w-full bg-slate-200 rounded-full h-2">
                                              <div
                                                className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                                                style={{ width: `${editUploadProgress}%` }}
                                              />
                                            </div>
                                          </div>
                                        )}
                                        {!editUploadingFile && editLessonUrl && editLessonInputMode === 'upload' && (
                                          <p className="mt-1 text-xs text-green-600">✓ Upload thành công!</p>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                )}

                                {editLessonType === 'text' && (
                                  <div className="flex-1 space-y-2">
                                    <div className="flex items-center gap-4 text-xs mb-1">
                                      <label className="flex items-center gap-1.5 cursor-pointer">
                                        <input type="radio" checked={editLessonInputMode === 'url'} onChange={() => setEditLessonInputMode('url')} /> Nhập nội dung
                                      </label>
                                      <label className="flex items-center gap-1.5 cursor-pointer">
                                        <input type="radio" checked={editLessonInputMode === 'upload'} onChange={() => setEditLessonInputMode('upload')} /> Up file từ máy
                                      </label>
                                    </div>
                                    {editLessonInputMode === 'url' ? (
                                      <textarea
                                        value={editLessonBody}
                                        onChange={(e) => setEditLessonBody(e.target.value)}
                                        className="w-full px-3 py-2 border border-outline-variant/50 rounded-lg text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                                        placeholder="Nhập nội dung văn bản bài học..."
                                        rows={4}
                                      />
                                    ) : (
                                      <div className="relative">
                                        <input
                                          type="file"
                                          accept=".txt,.pdf,.doc,.docx"
                                          disabled={editUploadingFile}
                                          onChange={async (e) => {
                                            if (e.target.files && e.target.files.length > 0) {
                                              const file = e.target.files[0];
                                              setEditUploadingFile(true);
                                              setEditUploadProgress(0);
                                              const result = await uploadLessonFile(file, (p) => setEditUploadProgress(p));
                                              setEditUploadingFile(false);
                                              if (result.success && result.s3Key) {
                                                setEditLessonUrl(result.s3Key);
                                                setEditLessonBody('File đã upload: ' + file.name);
                                              } else {
                                                alert('Upload thất bại: ' + (result.error || 'Lỗi không xác định'));
                                              }
                                            }
                                          }}
                                          className="w-full px-3 py-1.5 border border-outline-variant/50 rounded-lg text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary/5 file:text-sky-700 hover:file:bg-primary/10"
                                        />
                                        {editUploadingFile && (
                                          <div className="mt-2">
                                            <div className="flex items-center justify-between text-xs text-on-surface-variant/70 mb-1">
                                              <span>Đang upload...</span>
                                              <span>{editUploadProgress}%</span>
                                            </div>
                                            <div className="w-full bg-slate-200 rounded-full h-2">
                                              <div
                                                className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                                                style={{ width: `${editUploadProgress}%` }}
                                              />
                                            </div>
                                          </div>
                                        )}
                                        {!editUploadingFile && editLessonUrl && editLessonInputMode === 'upload' && (
                                          <p className="mt-1 text-xs text-green-600">✓ Upload thành công!</p>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                )}

                                {editLessonType === 'quiz' && (
                                  <div className="flex-1">
                                    {availableQuizzes.length === 0 ? (
                                      <div className="px-3 py-2 bg-purple-50 border border-purple-200 rounded-lg text-sm text-purple-700">
                                        Bạn chưa có bài Quiz nào. Hãy tạo Quiz trước.
                                      </div>
                                    ) : (
                                      <select
                                        value={editLessonUrl}
                                        onChange={(e) => setEditLessonUrl(e.target.value)}
                                        className="w-full px-3 py-2 border border-outline-variant/50 rounded-lg text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
                                      >
                                        <option value="">-- Chọn bài Quiz --</option>
                                        {availableQuizzes.map(q => (
                                          <option key={q.id} value={q.id}>{q.title}</option>
                                        ))}
                                      </select>
                                    )}
                                  </div>
                                )}
                              </div>

                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleUpdateLesson(section.id, lesson.id)}
                                  disabled={!editLessonTitle.trim()}
                                  className="px-4 py-1.5 bg-primary/50 text-white rounded-lg text-sm font-medium hover:bg-primary-dim disabled:opacity-50"
                                >
                                  Cập nhật
                                </button>
                                <button
                                  onClick={() => { setEditingLessonId(null); }}
                                  className="px-4 py-1.5 text-on-surface-variant/70 text-sm"
                                >
                                  Hủy
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* Add lesson form */}
                    {addingLessonTo === section.id ? (
                      <div className="p-4 border border-primary/30 rounded-xl bg-primary/5/30 space-y-3">
                        <input
                          value={newLessonTitle}
                          onChange={(e) => setNewLessonTitle(e.target.value)}
                          className="w-full px-3 py-2 border border-outline-variant/50 rounded-lg text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
                          placeholder="Tên bài học..."
                          autoFocus
                        />
                        <div className="flex gap-3 items-start">
                          <select
                            value={newLessonType}
                            onChange={(e) => { setNewLessonType(e.target.value); setNewLessonUrl(''); setNewLessonBody(''); }}
                            className="px-3 py-2 border border-outline-variant/50 rounded-lg text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 shrink-0"
                          >
                            <option value="video">Video</option>
                            <option value="text">Văn bản</option>
                            <option value="quiz">Quiz</option>
                          </select>

                          {/* Dynamic content field based on type */}
                          {newLessonType === 'video' && (
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-4 text-sm mb-1">
                                <label className="flex items-center gap-1.5 cursor-pointer">
                                  <input type="radio" checked={newLessonInputMode === 'url'} onChange={() => setNewLessonInputMode('url')} /> Dán URL
                                </label>
                                <label className="flex items-center gap-1.5 cursor-pointer">
                                  <input type="radio" checked={newLessonInputMode === 'upload'} onChange={() => setNewLessonInputMode('upload')} /> Up file từ máy
                                </label>
                              </div>
                              {newLessonInputMode === 'url' ? (
                                <input
                                  value={newLessonUrl}
                                  onChange={(e) => setNewLessonUrl(e.target.value)}
                                  className="w-full px-3 py-2 border border-outline-variant/50 rounded-lg text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
                                  placeholder="Dán URL video (YouTube, Vimeo...)"
                                />
                              ) : (
                                <div className="relative">
                                  <input
                                    type="file"
                                    accept="video/*"
                                    disabled={uploadingFile}
                                    onChange={async (e) => {
                                      if (e.target.files && e.target.files.length > 0) {
                                        const file = e.target.files[0];
                                        
                                        // Extract video duration locally
                                        try {
                                          const videoUrl = URL.createObjectURL(file);
                                          const tempVideo = document.createElement('video');
                                          tempVideo.preload = 'metadata';
                                          tempVideo.onloadedmetadata = () => {
                                            URL.revokeObjectURL(videoUrl);
                                            const dur = Math.round(tempVideo.duration);
                                            setNewLessonDuration(dur);
                                          };
                                          tempVideo.src = videoUrl;
                                        } catch (err) {
                                          console.error('Error getting video metadata:', err);
                                        }

                                        setUploadingFile(true);
                                        setUploadProgress(0);
                                        const result = await uploadLessonFile(file, (p) => setUploadProgress(p));
                                        setUploadingFile(false);
                                        if (result.success && result.s3Key) {
                                          setNewLessonUrl(result.s3Key);
                                        } else {
                                          alert('Upload thất bại: ' + (result.error || 'Lỗi không xác định'));
                                        }
                                      }
                                    }}
                                    className="w-full px-3 py-1.5 border border-outline-variant/50 rounded-lg text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary/5 file:text-sky-700 hover:file:bg-primary/10"
                                  />
                                  {uploadingFile && (
                                    <div className="mt-2">
                                      <div className="flex items-center justify-between text-xs text-on-surface-variant/70 mb-1">
                                        <span>Đang upload...</span>
                                        <span>{uploadProgress}%</span>
                                      </div>
                                      <div className="w-full bg-slate-200 rounded-full h-2">
                                        <div
                                          className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                                          style={{ width: `${uploadProgress}%` }}
                                        />
                                      </div>
                                    </div>
                                  )}
                                  {!uploadingFile && newLessonUrl && newLessonInputMode === 'upload' && (
                                    <p className="mt-1 text-xs text-green-600">✓ Upload thành công!</p>
                                  )}
                                </div>
                              )}
                            </div>
                          )}

                          {newLessonType === 'text' && (
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-4 text-sm mb-1">
                                <label className="flex items-center gap-1.5 cursor-pointer">
                                  <input type="radio" checked={newLessonInputMode === 'url'} onChange={() => setNewLessonInputMode('url')} /> Nhập nội dung
                                </label>
                                <label className="flex items-center gap-1.5 cursor-pointer">
                                  <input type="radio" checked={newLessonInputMode === 'upload'} onChange={() => setNewLessonInputMode('upload')} /> Up file từ máy
                                </label>
                              </div>
                              {newLessonInputMode === 'url' ? (
                                <textarea
                                  value={newLessonBody}
                                  onChange={(e) => setNewLessonBody(e.target.value)}
                                  className="w-full px-3 py-2 border border-outline-variant/50 rounded-lg text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                                  placeholder="Nhập nội dung văn bản bài học..."
                                  rows={4}
                                />
                              ) : (
                                <div className="relative">
                                  <input
                                    type="file"
                                    accept=".txt,.pdf,.doc,.docx"
                                    disabled={uploadingFile}
                                    onChange={async (e) => {
                                      if (e.target.files && e.target.files.length > 0) {
                                        const file = e.target.files[0];
                                        setUploadingFile(true);
                                        setUploadProgress(0);
                                        const result = await uploadLessonFile(file, (p) => setUploadProgress(p));
                                        setUploadingFile(false);
                                        if (result.success && result.s3Key) {
                                          setNewLessonUrl(result.s3Key);
                                          setNewLessonBody('File đã upload: ' + file.name);
                                        } else {
                                          alert('Upload thất bại: ' + (result.error || 'Lỗi không xác định'));
                                        }
                                      }
                                    }}
                                    className="w-full px-3 py-1.5 border border-outline-variant/50 rounded-lg text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary/5 file:text-sky-700 hover:file:bg-primary/10"
                                  />
                                  {uploadingFile && (
                                    <div className="mt-2">
                                      <div className="flex items-center justify-between text-xs text-on-surface-variant/70 mb-1">
                                        <span>Đang upload...</span>
                                        <span>{uploadProgress}%</span>
                                      </div>
                                      <div className="w-full bg-slate-200 rounded-full h-2">
                                        <div
                                          className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                                          style={{ width: `${uploadProgress}%` }}
                                        />
                                      </div>
                                    </div>
                                  )}
                                  {!uploadingFile && newLessonUrl && newLessonInputMode === 'upload' && (
                                    <p className="mt-1 text-xs text-green-600">✓ Upload thành công!</p>
                                  )}
                                </div>
                              )}
                            </div>
                          )}

                          {newLessonType === 'quiz' && (
                            <div className="flex-1">
                              {availableQuizzes.length === 0 ? (
                                <div className="px-3 py-2 bg-purple-50 border border-purple-200 rounded-lg text-sm text-purple-700">
                                  Bạn chưa có bài Quiz nào. Hãy <Link href="/quizzes" className="underline font-semibold hover:text-purple-900" target="_blank">tạo Quiz</Link> trước, sau đó tải lại trang này.
                                </div>
                              ) : (
                                <select
                                  value={newLessonUrl}
                                  onChange={(e) => setNewLessonUrl(e.target.value)}
                                  className="w-full px-3 py-2 border border-outline-variant/50 rounded-lg text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
                                >
                                  <option value="">-- Chọn bài Quiz --</option>
                                  {availableQuizzes.map(q => (
                                    <option key={q.id} value={q.id}>{q.title}</option>
                                  ))}
                                </select>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAddLesson(section.id)}
                            disabled={!newLessonTitle.trim()}
                            className="px-4 py-1.5 bg-primary/50 text-white rounded-lg text-sm font-medium hover:bg-primary-dim disabled:opacity-50"
                          >
                            Thêm bài
                          </button>
                          <button
                            onClick={() => { setAddingLessonTo(null); setNewLessonTitle(''); setNewLessonUrl(''); setNewLessonBody(''); }}
                            className="px-4 py-1.5 text-on-surface-variant/70 text-sm"
                          >
                            Hủy
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setAddingLessonTo(section.id)}
                        className="flex items-center gap-2 text-sm text-primary hover:text-sky-700 font-medium px-3 py-2 hover:bg-primary/5 rounded-lg transition-colors"
                      >
                        <span className="material-symbols-outlined text-base">add</span>
                        Thêm bài học
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Add section */}
          <div className="p-6 border-t border-outline-variant/20">
            <div className="flex items-center gap-3">
              <input
                value={newSectionTitle}
                onChange={(e) => setNewSectionTitle(e.target.value)}
                className="flex-1 px-4 py-2 border border-outline-variant/50 rounded-xl text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Tên phần mới..."
                onKeyDown={(e) => e.key === 'Enter' && handleAddSection()}
              />
              <button
                onClick={handleAddSection}
                disabled={!newSectionTitle.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-primary/50 text-white rounded-xl text-sm font-semibold hover:bg-primary-dim disabled:opacity-50 transition-all"
              >
                <span className="material-symbols-outlined text-base">add</span>
                Thêm phần
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
