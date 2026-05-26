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
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [addingLessonTo, setAddingLessonTo] = useState<string | null>(null);
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [newLessonType, setNewLessonType] = useState('video');
  const [newLessonUrl, setNewLessonUrl] = useState('');
  const [newLessonBody, setNewLessonBody] = useState('');
  const [newLessonInputMode, setNewLessonInputMode] = useState<'url' | 'upload'>('url');
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadingFile, setUploadingFile] = useState<boolean>(false);
  
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
      await updateCourse(courseId, {
        title: titleInput.trim(),
        description: descInput.trim() || undefined,
      });
      setCourse((prev) => prev ? { ...prev, title: titleInput.trim(), description: descInput.trim() } : prev);
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
    if (!confirm('Xóa phần này? Tất cả bài học bên trong sẽ bị xóa.')) return;
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
      if (newLessonType === 'video' && newLessonUrl.trim()) {
        payload.contentUrl = newLessonUrl.trim();
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
        setAddingLessonTo(null);
      } else {
        alert(res.error || 'Thêm bài học thất bại');
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Đã xảy ra lỗi');
    }
  };

  const handleDeleteLesson = async (sectionId: string, lessonId: string) => {
    if (!confirm('Xóa bài học này?')) return;
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-slate-500">Không tìm thấy khóa học</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/instructor/studio"
              className="flex items-center gap-1 text-slate-500 hover:text-indigo-600 transition-colors text-sm"
            >
              <span className="material-symbols-outlined text-lg">arrow_back</span>
              Studio
            </Link>
            <span className="text-slate-300">/</span>
            <h1 className="font-bold text-slate-800 truncate max-w-md">{course.title}</h1>
          </div>
          <Link
            href={`/courses/${courseId}`}
            className="text-sm text-indigo-600 hover:underline font-medium"
          >
            Xem trang khóa học →
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {/* Course Info */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-slate-700 flex items-center gap-2">
              <span className="material-symbols-outlined text-indigo-500">info</span>
              Thông tin khóa học
            </h2>
            {!editingTitle ? (
              <button
                onClick={() => setEditingTitle(true)}
                className="text-sm text-indigo-600 hover:underline font-medium"
              >
                Chỉnh sửa
              </button>
            ) : (
              <div className="flex gap-2">
                <button onClick={handleUpdateCourse} className="text-sm px-3 py-1 bg-indigo-600 text-white rounded-lg font-medium">
                  Lưu
                </button>
                <button onClick={() => setEditingTitle(false)} className="text-sm text-slate-500 hover:text-slate-700">
                  Hủy
                </button>
              </div>
            )}
          </div>
          {editingTitle ? (
            <div className="space-y-3">
              <input
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <div className="bg-white">
                <ReactQuill 
                  theme="snow" 
                  value={descInput} 
                  onChange={setDescInput} 
                  placeholder="Mô tả khóa học (tổng quan)..."
                  className="rounded-xl border border-slate-300 overflow-hidden"
                />
              </div>
            </div>
          ) : (
            <div>
              <h3 className="text-lg font-semibold text-slate-800">{course.title}</h3>
              <div className="text-slate-500 text-sm mt-1 prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-ol:my-1" dangerouslySetInnerHTML={{ __html: course.description || 'Chưa có mô tả' }} />
              <div className="flex gap-4 mt-3 text-xs text-slate-400">
                <span>{course.visibility === 'public' ? '🌐 Công khai' : '🔒 Riêng tư'}</span>
                <span>{course._count?.sections ?? 0} phần học</span>
                <span>{course._count?.members ?? 0} học viên</span>
              </div>
            </div>
          )}
        </div>

        {/* Sections & Lessons */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-bold text-slate-700 flex items-center gap-2">
              <span className="material-symbols-outlined text-indigo-500">playlist_add</span>
              Nội dung khóa học ({sections.length} phần)
            </h2>
          </div>

          <div className="divide-y divide-slate-100">
            {sections.map((section, sIdx) => (
              <div key={section.id}>
                {/* Section header */}
                <div className="flex items-center gap-3 px-6 py-4 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                  <button onClick={() => toggleSection(section.id)} className="shrink-0">
                    <span className={`material-symbols-outlined text-slate-400 transition-transform ${expandedSections.has(section.id) ? 'rotate-90' : ''}`}>
                      chevron_right
                    </span>
                  </button>
                  <span className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center shrink-0">
                    {sIdx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-800 text-sm">{section.title || 'Chưa đặt tên'}</h3>
                    <p className="text-xs text-slate-400">{section.lessons.length} bài học</p>
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
                      return (
                        <div key={lesson.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-indigo-200 transition-colors bg-white">
                          <span className={`material-symbols-outlined text-lg ${t.color}`}>{t.icon}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-700 truncate">{lesson.title}</p>
                            <p className="text-[11px] text-slate-400">
                              {t.label}
                              {lesson.contentUrl && ' · URL đã gắn'}
                              {lesson.durationSec && ` · ${Math.floor(lesson.durationSec / 60)}m`}
                            </p>
                          </div>
                          <button
                            onClick={() => handleDeleteLesson(section.id, lesson.id)}
                            className="text-slate-300 hover:text-red-500 transition-colors p-1"
                          >
                            <span className="material-symbols-outlined text-base">close</span>
                          </button>
                        </div>
                      );
                    })}

                    {/* Add lesson form */}
                    {addingLessonTo === section.id ? (
                      <div className="p-4 border border-indigo-200 rounded-xl bg-indigo-50/30 space-y-3">
                        <input
                          value={newLessonTitle}
                          onChange={(e) => setNewLessonTitle(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="Tên bài học..."
                          autoFocus
                        />
                        <div className="flex gap-3 items-start">
                          <select
                            value={newLessonType}
                            onChange={(e) => { setNewLessonType(e.target.value); setNewLessonUrl(''); setNewLessonBody(''); }}
                            className="px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 shrink-0"
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
                                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                                        setUploadingFile(true);
                                        setUploadProgress(0);
                                        const result = await uploadLessonFile(file, (p) => setUploadProgress(p));
                                        setUploadingFile(false);
                                        if (result.success && result.publicUrl) {
                                          setNewLessonUrl(result.publicUrl);
                                        } else {
                                          alert('Upload thất bại: ' + (result.error || 'Lỗi không xác định'));
                                        }
                                      }
                                    }}
                                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                  />
                                  {uploadingFile && (
                                    <div className="mt-2">
                                      <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
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
                                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
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
                                        if (result.success && result.publicUrl) {
                                          setNewLessonUrl(result.publicUrl);
                                          setNewLessonBody('File đã upload: ' + file.name);
                                        } else {
                                          alert('Upload thất bại: ' + (result.error || 'Lỗi không xác định'));
                                        }
                                      }
                                    }}
                                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                  />
                                  {uploadingFile && (
                                    <div className="mt-2">
                                      <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
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
                                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                            className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
                          >
                            Thêm bài
                          </button>
                          <button
                            onClick={() => { setAddingLessonTo(null); setNewLessonTitle(''); setNewLessonUrl(''); setNewLessonBody(''); }}
                            className="px-4 py-1.5 text-slate-500 text-sm"
                          >
                            Hủy
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setAddingLessonTo(section.id)}
                        className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium px-3 py-2 hover:bg-indigo-50 rounded-lg transition-colors"
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
          <div className="p-6 border-t border-slate-100">
            <div className="flex items-center gap-3">
              <input
                value={newSectionTitle}
                onChange={(e) => setNewSectionTitle(e.target.value)}
                className="flex-1 px-4 py-2 border border-slate-300 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Tên phần mới..."
                onKeyDown={(e) => e.key === 'Enter' && handleAddSection()}
              />
              <button
                onClick={handleAddSection}
                disabled={!newSectionTitle.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-all"
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
