'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  XCircle,
  Printer,
  ArrowRight,
  BookOpen,
  PhoneCall,
  Home,
  RefreshCw,
  Loader2,
  Calendar,
  CreditCard,
  Building,
  Hash,
  ShoppingBag,
  HelpCircle
} from 'lucide-react';
import { paymentApi } from '@/api/payment';
import { getCourseById, Course } from '@/api/course';

// Bản đồ mã lỗi VNPay sang tiếng Việt chi tiết
const VNPAY_ERRORS: Record<string, { title: string; desc: string }> = {
  '07': {
    title: 'Giao dịch bị nghi ngờ',
    desc: 'Trừ tiền thành công nhưng giao dịch bị nghi ngờ. Hệ thống đang tiến hành đối soát, vui lòng liên hệ hỗ trợ để được kiểm tra.'
  },
  '09': {
    title: 'Thẻ chưa đăng ký Internet Banking',
    desc: 'Thẻ hoặc tài khoản của quý khách chưa đăng ký dịch vụ Internet Banking tại ngân hàng phát hành thẻ. Vui lòng đăng ký dịch vụ và thử lại.'
  },
  '10': {
    title: 'Xác thực thông tin không chính xác',
    desc: 'Quý khách đã nhập sai thông tin xác thực thẻ/tài khoản quá 3 lần. Vui lòng kiểm tra lại thông tin hoặc liên hệ ngân hàng.'
  },
  '11': {
    title: 'Hết hạn phiên thanh toán',
    desc: 'Đã hết thời gian chờ thanh toán (Timeout). Vui lòng thực hiện lại giao dịch nhanh chóng hơn.'
  },
  '12': {
    title: 'Thẻ/Tài khoản bị khóa',
    desc: 'Thẻ hoặc tài khoản ngân hàng của quý khách hiện đang bị khóa hoặc chưa được kích hoạt sử dụng.'
  },
  '24': {
    title: 'Giao dịch đã bị hủy',
    desc: 'Quý khách đã chủ động hủy giao dịch thanh toán này trên cổng VNPay.'
  },
  '51': {
    title: 'Số dư tài khoản không đủ',
    desc: 'Tài khoản ngân hàng của quý khách không đủ số dư để hoàn tất giao dịch. Vui lòng nạp thêm tiền hoặc đổi phương thức thanh toán.'
  },
  '65': {
    title: 'Vượt quá hạn mức giao dịch',
    desc: 'Tài khoản của quý khách đã vượt quá hạn mức chi tiêu cho phép trong ngày. Vui lòng liên hệ ngân hàng để nâng hạn mức.'
  },
  '75': {
    title: 'Ngân hàng đang bảo trì',
    desc: 'Hệ thống ngân hàng thanh toán đang thực hiện bảo trì định kỳ. Quý khách vui lòng thử lại sau vài phút hoặc dùng thẻ của ngân hàng khác.'
  },
  '99': {
    title: 'Lỗi hệ thống từ VNPay',
    desc: 'Đã xảy ra lỗi không xác định từ cổng thanh toán VNPay. Vui lòng thử lại sau hoặc liên hệ bộ phận hỗ trợ.'
  }
};

function PaymentResultContent() {
  const searchParams = useSearchParams();

  // Lấy các tham số từ VNPay redirect
  const vnp_ResponseCode = searchParams.get('vnp_ResponseCode');
  const vnp_TxnRef = searchParams.get('vnp_TxnRef');
  const vnp_Amount = searchParams.get('vnp_Amount');
  const vnp_BankCode = searchParams.get('vnp_BankCode');
  const vnp_CardType = searchParams.get('vnp_CardType');
  const vnp_PayDate = searchParams.get('vnp_PayDate');
  const vnp_OrderInfo = searchParams.get('vnp_OrderInfo');
  const vnp_TransactionNo = searchParams.get('vnp_TransactionNo');

  const isSuccess = vnp_ResponseCode === '00';

  // Trạng thái tải dữ liệu
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<Course | null>(null);

  // Định dạng số tiền
  const formattedAmount = vnp_Amount
    ? (Number(vnp_Amount) / 100).toLocaleString('vi-VN') + ' đ'
    : '0 đ';

  // Trích xuất mã khóa học từ vnp_OrderInfo hoặc dbTransaction
  let courseId = '';
  if (vnp_OrderInfo) {
    const match = vnp_OrderInfo.match(/Thanh toan khoa hoc\s+([a-zA-Z0-9_-]+)/i)
               || vnp_OrderInfo.match(/khoa hoc\s+([a-zA-Z0-9_-]+)/i);
    if (match) courseId = match[1];
  }

  // Định dạng thời gian VNPay YYYYMMDDHHmmss -> DD/MM/YYYY HH:mm:ss
  const formatPayDate = (dateStr: string | null) => {
    if (!dateStr || dateStr.length < 14) return 'Vừa xong';
    const year = dateStr.substring(0, 4);
    const month = dateStr.substring(4, 6);
    const day = dateStr.substring(6, 8);
    const hour = dateStr.substring(8, 10);
    const minute = dateStr.substring(10, 12);
    const second = dateStr.substring(12, 14);
    return `${hour}:${minute}:${second} - ${day}/${month}/${year}`;
  };

  // Lấy chi tiết lỗi
  const errorDetails = vnp_ResponseCode && VNPAY_ERRORS[vnp_ResponseCode]
    ? VNPAY_ERRORS[vnp_ResponseCode]
    : { title: 'Thanh toán thất bại', desc: `Đã có lỗi xảy ra trong quá trình thanh toán (Mã lỗi: ${vnp_ResponseCode}). Vui lòng thử lại.` };

  // Gọi API lấy trạng thái giao dịch từ DB
  useEffect(() => {
    // Nếu VNPay trả về mã lỗi (giao dịch thất bại), hiển thị ngay kết quả lập tức
    if (!isSuccess) {
      if (courseId) {
        getCourseById(courseId).then(res => {
          if (res.success && res.data) {
            setCourse(res.data);
          }
          setLoading(false);
        }).catch(err => {
          console.error('Lỗi khi lấy thông tin khóa học:', err);
          setLoading(false);
        });
      } else {
        queueMicrotask(() => setLoading(false));
      }
      return;
    }

    // Nếu VNPay trả về thành công, hiển thị giao diện thành công ngay lập tức
    const fetchSuccessData = async () => {
      try {
        const confirmResponse = await paymentApi.confirmReturn(Object.fromEntries(searchParams.entries()));
        if (confirmResponse.success && confirmResponse.data?.course) {
          setCourse(confirmResponse.data.course);
          setLoading(false);
          return;
        }

        if (vnp_TxnRef) {
          const response = await paymentApi.getTransaction(vnp_TxnRef);
          if (response.success && response.data?.course) {
            setCourse(response.data.course);
            setLoading(false);
            return;
          }
        }

        // Nếu giao dịch chưa có trong DB hoặc chưa hoàn tất IPN, lấy thông tin khóa học bằng courseId để hiển thị ngay
        if (courseId) {
          const res = await getCourseById(courseId);
          if (res.success && res.data) {
            setCourse(res.data);
          }
        }
        setLoading(false);
      } catch (err) {
        console.error('Lỗi khi tải thông tin giao dịch thành công:', err);
        // Fallback tối đa bằng courseId
        if (courseId) {
          try {
            const res = await getCourseById(courseId);
            if (res.success && res.data) {
              setCourse(res.data);
            }
          } catch (e) {
            console.error(e);
          }
        }
        setLoading(false);
      }
    };

    fetchSuccessData();
  }, [vnp_TxnRef, isSuccess, courseId, searchParams]);

  // Chức năng in biên lai chuyên nghiệp
  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 relative overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-tertiary/10 rounded-full blur-[100px] animate-pulse delay-700"></div>

        <div className="glass-panel-elevated rounded-2xl p-10 max-w-md w-full text-center relative z-10 shadow-2xl flex flex-col items-center gap-4">
          <Loader2 className="w-16 h-16 text-primary animate-spin" />
          <h2 className="text-xl font-bold text-on-background">Đang xác thực giao dịch...</h2>
          <p className="text-on-surface-variant text-sm">
            Vui lòng không tắt trình duyệt hoặc tải lại trang khi hệ thống đang xử lý và kích hoạt khóa học của bạn.
          </p>
        </div>
      </div>
    );
  }

  // Id khóa học cuối cùng để chuyển hướng học hoặc thanh toán lại
  const finalCourseId = course?.id || courseId;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background py-12 px-4 relative overflow-hidden">
      {/* Dynamic Background Circles */}
      <div className="absolute top-10 left-10 w-[400px] h-[400px] bg-primary/8 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-tertiary/8 rounded-full blur-[120px] pointer-events-none"></div>

      {/* CSS Print Stylesheet injected locally */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * {
            visibility: hidden !important;
            background: none !important;
          }
          #printable-receipt, #printable-receipt * {
            visibility: visible !important;
          }
          #printable-receipt {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 20px !important;
            box-shadow: none !important;
            border: 1px solid #ddd !important;
            background-color: #fff !important;
            color: #000 !important;
            border-radius: 0 !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 15 }}
        className="max-w-2xl w-full relative z-10"
      >
        {/* Main Glass Container */}
        <div className="glass-panel-elevated rounded-3xl overflow-hidden shadow-2xl border border-white/20 transition-all duration-300">

          {/* Header State (Success vs Fail) */}
          <div className={`p-8 text-center relative overflow-hidden ${
            isSuccess
              ? 'bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-b border-primary/20'
              : 'bg-gradient-to-br from-error/10 via-error/5 to-transparent border-b border-error/20'
          }`}>

            {/* Glowing Backdrop */}
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full blur-3xl pointer-events-none -z-10 ${
              isSuccess ? 'bg-primary/20' : 'bg-error/20'
            }`}></div>

            {/* Icon Animation */}
            <motion.div
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 150 }}
              className="inline-block mb-4"
            >
              {isSuccess ? (
                <div className="w-20 h-20 bg-primary/20 border border-primary/30 rounded-full flex items-center justify-center text-primary shadow-[0_0_20px_rgba(0,99,130,0.2)]">
                  <CheckCircle2 className="w-10 h-10" strokeWidth={2.5} />
                </div>
              ) : (
                <div className="w-20 h-20 bg-error/20 border border-error/30 rounded-full flex items-center justify-center text-error shadow-[0_0_20px_rgba(179,27,37,0.2)]">
                  <XCircle className="w-10 h-10" strokeWidth={2.5} />
                </div>
              )}
            </motion.div>

            {/* Title & Desc */}
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className={`text-3xl font-extrabold tracking-tight ${
                isSuccess ? 'text-primary' : 'text-error'
              }`}
            >
              {isSuccess ? 'Thanh Toán Thành Công!' : 'Giao Dịch Không Thành Công'}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-on-surface-variant mt-2 text-base max-w-lg mx-auto leading-relaxed"
            >
              {isSuccess
                ? 'Giao dịch của bạn đã được xác thực và tài khoản đã được kích hoạt khóa học thành công.'
                : errorDetails.desc
              }
            </motion.p>
          </div>

          <div className="p-8 space-y-8">

            {/* Display Course Card on Success */}
            {isSuccess && course && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="glass-panel rounded-2xl p-4 flex flex-col sm:flex-row gap-5 items-center border border-white/30 shadow-md hover:shadow-lg transition-shadow duration-300"
              >
                {/* Course Image */}
                <div className="w-full sm:w-32 h-24 rounded-xl overflow-hidden relative bg-slate-100 flex-shrink-0 border border-slate-200">
                  {course.imageUrl ? (
                    <img
                      src={course.imageUrl}
                      alt={course.title}
                      className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-400">
                      <BookOpen className="w-8 h-8" />
                    </div>
                  )}
                </div>

                {/* Course Metadata */}
                <div className="flex-1 text-center sm:text-left space-y-1">
                  <span className="text-[11px] font-bold text-primary bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    Khóa Học Của Bạn
                  </span>
                  <h3 className="font-bold text-on-background text-lg leading-snug line-clamp-1 mt-1">
                    {course.title}
                  </h3>
                  <p className="text-xs text-on-surface-variant">
                    Học trực tuyến mọi lúc, mọi nơi • Truy cập trọn đời
                  </p>
                </div>
              </motion.div>
            )}

            {/* Printable Receipt Panel */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              id="printable-receipt"
              className="bg-white/40 border border-white/20 rounded-2xl p-6 relative shadow-inner overflow-hidden"
            >
              {/* Decorative Receipt Jagged Header */}
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-slate-300/40 to-transparent"></div>

              <div className="flex items-center justify-between mb-6 pb-4 border-b border-dashed border-slate-300/60">
                <h4 className="font-bold text-on-background text-base flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-secondary" />
                  Chi Tiết Biên Lai
                </h4>
                {isSuccess && (
                  <button
                    onClick={handlePrint}
                    className="no-print text-xs font-semibold text-primary hover:text-primary-dim bg-white shadow border border-slate-100 hover:bg-slate-50 transition px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    In biên lai
                  </button>
                )}
              </div>

              {/* Receipt Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-sm text-on-surface-variant leading-relaxed">

                {/* Transaction Reference ID */}
                <div className="flex justify-between sm:flex-col gap-1 border-b sm:border-0 border-slate-100 pb-2 sm:pb-0">
                  <span className="text-xs text-on-surface-variant/80 flex items-center gap-1">
                    <Hash className="w-3.5 h-3.5" /> Mã đơn hàng (TxnRef)
                  </span>
                  <span className="font-mono font-semibold text-on-background text-[13px]">
                    {vnp_TxnRef || 'Không khả dụng'}
                  </span>
                </div>

                {/* VNPay Transaction No */}
                {vnp_TransactionNo && (
                  <div className="flex justify-between sm:flex-col gap-1 border-b sm:border-0 border-slate-100 pb-2 sm:pb-0">
                    <span className="text-xs text-on-surface-variant/80 flex items-center gap-1">
                      <Hash className="w-3.5 h-3.5" /> Mã giao dịch VNPay
                    </span>
                    <span className="font-mono font-semibold text-on-background text-[13px]">
                      {vnp_TransactionNo}
                    </span>
                  </div>
                )}

                {/* Amount Paid */}
                <div className="flex justify-between sm:flex-col gap-1 border-b sm:border-0 border-slate-100 pb-2 sm:pb-0">
                  <span className="text-xs text-on-surface-variant/80 flex items-center gap-1">
                    <CreditCard className="w-3.5 h-3.5" /> Số tiền thanh toán
                  </span>
                  <span className="font-bold text-primary text-base">
                    {formattedAmount}
                  </span>
                </div>

                {/* Bank Code */}
                {vnp_BankCode && (
                  <div className="flex justify-between sm:flex-col gap-1 border-b sm:border-0 border-slate-100 pb-2 sm:pb-0">
                    <span className="text-xs text-on-surface-variant/80 flex items-center gap-1">
                      <Building className="w-3.5 h-3.5" /> Ngân hàng thanh toán
                    </span>
                    <span className="font-semibold text-on-background text-[13px]">
                      {vnp_BankCode}
                    </span>
                  </div>
                )}

                {/* Card Type */}
                {vnp_CardType && (
                  <div className="flex justify-between sm:flex-col gap-1 border-b sm:border-0 border-slate-100 pb-2 sm:pb-0">
                    <span className="text-xs text-on-surface-variant/80 flex items-center gap-1">
                      <CreditCard className="w-3.5 h-3.5" /> Hình thức thanh toán
                    </span>
                    <span className="font-medium text-on-background text-[13px]">
                      {vnp_CardType}
                    </span>
                  </div>
                )}

                {/* Pay Date */}
                <div className="flex justify-between sm:flex-col gap-1 border-b sm:border-0 border-slate-100 pb-2 sm:pb-0">
                  <span className="text-xs text-on-surface-variant/80 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> Thời gian thanh toán
                  </span>
                  <span className="font-medium text-on-background text-[13px]">
                    {formatPayDate(vnp_PayDate)}
                  </span>
                </div>

              </div>
            </motion.div>

            {/* CTAs / Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="no-print flex flex-col sm:flex-row gap-4 justify-center"
            >
              {isSuccess ? (
                <>
                  {finalCourseId ? (
                    <Link
                      href={`/learning/${finalCourseId}`}
                      className="bg-primary hover:bg-primary-dim text-white font-bold px-8 py-3.5 rounded-xl shadow-[0_4px_20px_rgba(0,99,130,0.3)] hover:shadow-[0_4px_25px_rgba(0,99,130,0.45)] transition duration-200 flex items-center justify-center gap-2"
                    >
                      <BookOpen className="w-5 h-5" /> Vào học ngay
                      <ArrowRight className="w-4 h-4 text-white/80" />
                    </Link>
                  ) : (
                    <Link
                      href="/dashboard"
                      className="bg-primary hover:bg-primary-dim text-white font-bold px-8 py-3.5 rounded-xl shadow-[0_4px_20px_rgba(0,99,130,0.3)] hover:shadow-[0_4px_25px_rgba(0,99,130,0.45)] transition duration-200 flex items-center justify-center gap-2"
                    >
                      <Home className="w-5 h-5" /> Vào trang tổng quan
                      <ArrowRight className="w-4 h-4 text-white/80" />
                    </Link>
                  )}
                  <Link
                    href="/my-courses"
                    className="bg-slate-200/80 hover:bg-slate-200/100 border border-slate-300/40 text-on-surface font-semibold px-6 py-3.5 rounded-xl transition duration-200 flex items-center justify-center gap-2"
                  >
                    Khóa học của tôi
                  </Link>
                </>
              ) : (
                <>
                  {finalCourseId ? (
                    <Link
                      href={`/courses/${finalCourseId}`}
                      className="bg-error hover:bg-error-dim text-white font-bold px-8 py-3.5 rounded-xl shadow-[0_4px_20px_rgba(179,27,37,0.3)] hover:shadow-[0_4px_25px_rgba(179,27,37,0.45)] transition duration-200 flex items-center justify-center gap-2"
                    >
                      <RefreshCw className="w-4 h-4 animate-spin-reverse" /> Thử thanh toán lại
                    </Link>
                  ) : (
                    <Link
                      href="/courses"
                      className="bg-error hover:bg-error-dim text-white font-bold px-8 py-3.5 rounded-xl shadow-[0_4px_20px_rgba(179,27,37,0.3)] hover:shadow-[0_4px_25px_rgba(179,27,37,0.45)] transition duration-200 flex items-center justify-center gap-2"
                    >
                      <ShoppingBag className="w-5 h-5" /> Xem danh sách khóa học
                    </Link>
                  )}
                  <Link
                    href="/dashboard"
                    className="bg-slate-200/80 hover:bg-slate-200/100 border border-slate-300/40 text-on-surface font-semibold px-6 py-3.5 rounded-xl transition duration-200 flex items-center justify-center gap-2"
                  >
                    <Home className="w-4 h-4" /> Về trang chủ
                  </Link>
                </>
              )}
            </motion.div>
          </div>

          {/* Support Section Footer */}
          <div className="no-print px-8 py-5 bg-slate-50/50 border-t border-white/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-on-surface-variant/80">
            <span className="flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-secondary-dim" /> Bạn gặp khó khăn? Đừng lo lắng, chúng tôi luôn hỗ trợ bạn.
            </span>
            <div className="flex gap-4 font-semibold text-primary">
              <a href="mailto:support@elearning.edu.vn" className="hover:underline flex items-center gap-1">
                support@elearning.edu.vn
              </a>
              <span className="text-slate-300">|</span>
              <a href="tel:19001234" className="hover:underline flex items-center gap-1">
                <PhoneCall className="w-3 h-3" /> 1900 1234 (8:00 - 22:00)
              </a>
            </div>
          </div>

        </div>
      </motion.div>
    </div>
  );
}

export default function PaymentResultPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-on-surface-variant text-sm mt-3">Đang tải...</p>
      </div>
    }>
      <PaymentResultContent />
    </Suspense>
  );
}
