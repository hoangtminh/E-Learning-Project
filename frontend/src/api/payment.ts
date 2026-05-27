import { apiPost, apiGet } from './client';
import type { Course } from './course';

export interface PaymentTransaction {
  id: string;
  userId: string;
  courseId: string;
  amount: number | string;
  status: string;
  vnpTxnRef: string;
  course?: Course;
}

export const paymentApi = {
  createPaymentUrl: async (courseId: string) => {
    const response = await apiPost<{ paymentUrl: string }>('/payment/create_url', { courseId });
    return (response.data || {}) as { paymentUrl?: string };
  },
  getTransaction: async (txnRef: string) => {
    const response = await apiGet<PaymentTransaction>("/payment/transaction/" + txnRef);
    return response;
  },
  confirmReturn: async (params: Record<string, string>) => {
    const response = await apiPost<PaymentTransaction>("/payment/vnpay_return", params);
    return response;
  },
};
