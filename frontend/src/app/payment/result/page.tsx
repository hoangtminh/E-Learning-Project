'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

function PaymentResultContent() {
  const searchParams = useSearchParams();
  const errorCode = searchParams.get('vnp_ResponseCode');

  const isSuccess = errorCode === '00';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="bg-white rounded-lg pl-8 pr-8 pb-8 pt-6 shadow-md max-w-md w-full text-center">
        {isSuccess ? (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Thanh toán thành công!</h1>
            <p className="text-gray-600 mb-6">Cảm ơn bạn đã mua khóa học. Bắt đầu học ngay thôi!</p>
          </>
        ) : (
          <>
             <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Thanh toán thất bại</h1>
            <p className="text-gray-600 mb-6">Đã có lỗi xảy ra trong quá trình thanh toán (Mã lỗi: {errorCode}). Vui lòng thử lại sau.</p>
          </>
        )}

        <Link href="/dashboard" className="inline-block bg-blue-600 text-white font-medium px-6 py-2 rounded shadow hover:bg-blue-700 transition">
          Về trang chủ
        </Link>
      </div>
    </div>
  );
}

export default function PaymentResultPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentResultContent />
    </Suspense>
  );
}
