import { apiPost } from './client';

export const paymentApi = {
  createPaymentUrl: async (courseId: string) => {
    const response = await apiPost<{ paymentUrl: string }>('/payment/create_url', { courseId });
    return (response.data || {}) as { paymentUrl?: string };
  },
};
