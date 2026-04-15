const ratingBars = [
  { stars: 5, width: 72 },
  { stars: 4, width: 20 },
  { stars: 3, width: 6  },
  { stars: 2, width: 2  },
];

const reviews = [
  {
    name: 'Trần Minh Tuấn',
    date: '14 tháng 10, 2024',
    rating: 5,
    content: 'Khóa học cực kỳ chất lượng! Giảng viên giải thích rõ ràng, có nhiều ví dụ thực tế. Phần lab hands-on về Metasploit thực sự rất hữu ích. Đây là khoản đầu tư xứng đáng nhất cho sự nghiệp của tôi. Đã pass CompTIA Security+ sau khi hoàn thành!',
    helpful: 24,
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDkKyccVRS5noct4UmO5W_HEzTjednofcJWldd6r0NhskSjWcbuv6m9uCgE0XfI8POL-tlK2F3gqDaHcD9-kUR9PpZ4XZ10HWM2lss5rwtrR2iBohUW4Sw-d1KFrcJ_oDY2A2JPzg1-bKbcMCVD-fTXuY43h4I2sVCn4AyAjIUiLZwi5JKKuNuDNkaCoVOb3Vs4KtjZVHEIpxDg8S5Ex8vIETJPEXwqVwnbCcs2_HbOiEbIceJCr_aci28SIDrF6zvvLrrtBVNa8Raz',
  },
  {
    name: 'Lê Thị Hương',
    date: '28 tháng 9, 2024',
    rating: 4,
    content: 'Nội dung rất đầy đủ và được tổ chức tốt. Tuy nhiên tốc độ một số bài hơi chậm đối với người đã có nền tảng. Hy vọng có thêm bài tập CTF để thực hành thêm. Nhìn chung vẫn rất đáng học!',
    helpful: 11,
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB5wPWpl3tY7Cy0j9hxx4C70BrgTn2cA8I_SUGbHI5rBRnqy9Kd_vrTEDENCSIMQ41gDMRwbstoDC60vdofK56HtUajcWGpaFCIiim7EQPZy48me3It31esNQZFXdjG5oWbFITTllWlKCVAjCNfyXm7erq5F-sYmJvdMAWtaZbpArAnB3F7DhUyky3xeHq0DvHmffLdHSm1ONaEsAFemjM7hdKwKhBjVkw5qHJpe7wrHxNClC-jSLnfjiCUV7kCk8EYAjpLG5a_Z8QX',
  },
];

function StarRow({ rating, filled = true }: { rating: number; filled?: boolean }) {
  return (
    <div className="flex">
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={`material-symbols-outlined text-sm ${i < rating ? 'text-amber-400' : 'text-slate-300'} star-filled`}
        >
          star
        </span>
      ))}
    </div>
  );
}

export function CourseReviewsTab() {
  return (
    <div className="space-y-6">
      {/* Rating overview */}
      <div className="glass-panel rounded-2xl p-6 flex flex-col md:flex-row items-center gap-8">
        <div className="flex flex-col items-center text-center flex-shrink-0">
          <span className="text-7xl font-black text-[#006382] leading-none">4.8</span>
          <StarRow rating={5} />
          <p className="text-[11px] text-[#525b72] mt-1 font-medium">Xếp hạng khóa học</p>
        </div>
        <div className="flex-1 w-full space-y-2">
          {ratingBars.map((bar) => (
            <div key={bar.stars} className="flex items-center gap-3">
              <StarRow rating={bar.stars} />
              <div className="flex-1 h-2.5 bg-[#e0e8ff] rounded-full overflow-hidden">
                <div className="h-full bg-amber-400 rounded-full" style={{ width: `${bar.width}%` }} />
              </div>
              <span className="text-xs text-[#525b72] w-8 text-right">{bar.width}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Individual reviews */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.name} className="glass-panel rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <img src={review.avatar} alt={review.name} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-[#252f43] text-sm">{review.name}</h4>
                    <p className="text-[11px] text-[#525b72]">{review.date}</p>
                  </div>
                  <StarRow rating={review.rating} />
                </div>
                <p className="text-sm text-[#525b72] leading-relaxed mt-2">{review.content}</p>
                <div className="flex items-center gap-4 mt-3">
                  <button type="button" className="flex items-center gap-1 text-[11px] text-[#525b72] hover:text-[#006382] transition-colors">
                    <span className="material-symbols-outlined text-sm">thumb_up</span>
                    Hữu ích ({review.helpful})
                  </button>
                  <button type="button" className="text-[11px] text-[#525b72] hover:text-[#006382] transition-colors">
                    Báo cáo
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button type="button" className="w-full py-3 glass-panel rounded-xl text-[#006382] font-semibold text-sm hover:bg-[#006382]/5 transition-colors">
        Xem tất cả 3.200 đánh giá
      </button>
    </div>
  );
}
