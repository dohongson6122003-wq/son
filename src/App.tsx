/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  ShieldCheck, 
  Zap, 
  Star, 
  ChevronRight, 
  Truck, 
  RotateCcw, 
  CheckCircle2,
  ShoppingBag,
  Loader2
} from 'lucide-react';

const FeatureCard = ({ icon: Icon, title, description, delay }: { icon: any, title: string, description: string, delay: number }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
    className="bg-white p-6 rounded-2xl card-shadow border border-rose-50 flex flex-col items-center text-center group hover:border-rose-200 transition-colors"
  >
    <div className="w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center mb-4 group-hover:bg-rose-100 transition-colors">
      <Icon className="w-6 h-6 text-rose-500" />
    </div>
    <h3 className="text-lg font-bold text-slate-800 mb-2">{title}</h3>
    <p className="text-sm text-slate-600 leading-relaxed">{description}</p>
  </motion.div>
);

export default function App() {
  const [formData, setFormData] = useState({ name: '', phone: '', address: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const scrollToOrder = () => {
    document.getElementById('order-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.address) {
      setErrorMessage('Vui lòng điền đầy đủ thông tin');
      setStatus('error');
      return;
    }

    setStatus('loading');
    try {
      const response = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setStatus('success');
        setFormData({ name: '', phone: '', address: '' });
      } else {
        const data = await response.json();
        setErrorMessage(data.error || 'Có lỗi xảy ra, vui lòng thử lại');
        setStatus('error');
      }
    } catch (error) {
      setErrorMessage('Không thể kết nối đến máy chủ');
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-rose-100 selection:text-rose-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-bottom border-slate-100">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-rose-500 rounded-lg flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-slate-900">
              Dép Siêu <span className="text-rose-500">Êm</span>
            </span>
          </div>
          <button 
            onClick={scrollToOrder}
            className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-full text-sm font-bold transition-all active:scale-95 shadow-lg shadow-rose-200"
          >
            MUA NGAY
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto pb-20">
        {/* Hero Section */}
        <section className="px-4 pt-12 pb-16 text-center bg-gradient-soft rounded-b-[40px] border-b border-rose-100">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 leading-tight">
              Dép Siêu <span className="text-rose-500 italic font-serif">Êm</span> Cho Bé
            </h1>
            <p className="text-lg text-slate-600 mb-8 font-medium">
              Nhẹ tênh — Chống trượt — Bé chạy nhảy cả ngày
            </p>

            <div className="mb-10">
              <button 
                onClick={scrollToOrder}
                className="group relative bg-rose-500 hover:bg-rose-600 text-white px-8 py-4 rounded-2xl text-xl font-black transition-all shadow-xl shadow-rose-200 hover:-translate-y-1 active:translate-y-0"
              >
                MUA NGAY - GIẢM 30%
                <div className="absolute -top-3 -right-3 bg-yellow-400 text-rose-900 text-xs font-black px-2 py-1 rounded-md rotate-12 shadow-sm">
                  HOT!
                </div>
              </button>
            </div>

            <div className="flex flex-col items-center gap-1 mb-10">
              <span className="text-slate-400 line-through text-lg font-medium">245.000đ</span>
              <span className="text-slate-500 text-sm font-bold uppercase tracking-widest">Chỉ Còn</span>
              <span className="text-4xl font-black text-rose-600">184.000đ</span>
            </div>

            <div className="relative max-w-md mx-auto">
              <div className="absolute inset-0 bg-rose-200 blur-3xl opacity-20 rounded-full"></div>
              <img 
                src="https://picsum.photos/seed/baby-sandals/800/600" 
                alt="Dép siêu êm cho bé" 
                className="relative rounded-3xl shadow-2xl border-4 border-white object-cover aspect-[4/3]"
                referrerPolicy="no-referrer"
              />
            </div>
          </motion.div>
        </section>

        {/* Features Section */}
        <section className="px-4 py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-4">
              Tại Sao Chọn <span className="text-rose-500">Dép Siêu Êm?</span>
            </h2>
            <div className="w-20 h-1.5 bg-rose-500 mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FeatureCard 
              icon={Heart}
              title="Êm Mềm"
              description="Chất liệu mềm mịn không làm hại da hay chân bé. Được kiểm định an toàn cho trẻ em từ 1 tuổi trở lên."
              delay={0.1}
            />
            <FeatureCard 
              icon={ShieldCheck}
              title="Chống Trượt"
              description="Đế cao su chuyên dụng giúp bé không bị trượt ngay cả khi chạy trên sàn ẩm ướt hoặc bậc thang."
              delay={0.2}
            />
            <FeatureCard 
              icon={Zap}
              title="Siêu Nhẹ"
              description="Chỉ nặng 120g/đôi, bé cảm thấy nhẹ nhàng dễ chịu, tự do vận động và khám phá thế giới xung quanh."
              delay={0.3}
            />
            <FeatureCard 
              icon={Star}
              title="Đáng Yêu"
              description="Thiết kế màu sắc bắt mắt, họa tiết vui nhộn giúp bé tự tin và luôn cảm thấy hạnh phúc mỗi khi mặc."
              delay={0.4}
            />
          </div>
        </section>

        {/* Gallery Section */}
        <section className="px-4 py-20 bg-white rounded-[40px] border border-slate-100">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-4">
              Hình Ảnh <span className="text-rose-500">Sản Phẩm Thực Tế</span>
            </h2>
            <p className="text-slate-600 max-w-xl mx-auto">
              Các sản phẩm dép siêu êm được chụp ảnh thực tế tại cửa hàng. Bé yêu sẽ thích ngay từ cái nhìn đầu tiên với những màu sắc tươi sáng và thiết kế dễ thương.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="overflow-hidden rounded-3xl shadow-lg border border-slate-100"
              >
                <img 
                  src={`https://picsum.photos/seed/baby-sandals-${i}/800/1000`} 
                  alt={`Sản phẩm thực tế ${i}`}
                  className="w-full object-cover aspect-[4/5] hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
              </motion.div>
            ))}
          </div>
        </section>

        {/* Special Offer Section */}
        <section className="px-4 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-rose-50 rounded-[40px] p-10 border-2 border-dashed border-rose-200"
          >
            <h2 className="text-3xl font-extrabold text-rose-600 mb-8">Ưu Đãi Đặc Biệt</h2>
            <p className="text-slate-700 font-bold mb-6">Hôm nay mua là hôm nay giao</p>
            
            <div className="flex flex-col gap-4 mb-10">
              <div className="flex flex-col">
                <span className="text-slate-400 line-through text-xl">245.000đ</span>
                <span className="text-slate-500 text-xs uppercase font-bold tracking-widest">Giá gốc</span>
              </div>
              <div className="flex flex-col">
                <span className="text-4xl font-black text-rose-600">184.000đ</span>
                <span className="text-rose-500 text-xs uppercase font-bold tracking-widest">Giá ưu đãi (Giảm 30%)</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-rose-100 flex items-center gap-4">
                <div className="w-10 h-10 bg-rose-50 rounded-full flex items-center justify-center shrink-0">
                  <Truck className="w-5 h-5 text-rose-500" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-slate-800">1-2 ngày</div>
                  <div className="text-xs text-slate-500">Giao hàng tận nhà</div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-rose-100 flex items-center gap-4">
                <div className="w-10 h-10 bg-rose-50 rounded-full flex items-center justify-center shrink-0">
                  <RotateCcw className="w-5 h-5 text-rose-500" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-slate-800">30 ngày</div>
                  <div className="text-xs text-slate-500">Hoàn tiền nếu không hài lòng</div>
                </div>
              </div>
            </div>

            <button 
              onClick={scrollToOrder}
              className="w-full bg-rose-500 hover:bg-rose-600 text-white py-5 rounded-2xl text-2xl font-black transition-all shadow-xl shadow-rose-200 active:scale-[0.98]"
            >
              MUA NGAY
            </button>
          </motion.div>
        </section>

        {/* Order Form Section */}
        <section id="order-form" className="px-4 py-20">
          <div className="bg-white rounded-[40px] p-8 md:p-12 shadow-2xl border border-slate-100">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-extrabold text-slate-900 mb-4">
                Đặt Hàng <span className="text-rose-500">Ngay Hôm Nay</span>
              </h2>
              <p className="text-slate-600">
                Nhận dép siêu êm trong 1-2 ngày. Điền thông tin dưới đây và chúng tôi sẽ liên hệ xác nhận đơn hàng trong 15 phút. Hoàn toàn miễn phí giao hàng toàn thành phố.
              </p>
            </div>

            <AnimatePresence mode="wait">
              {status === 'success' ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="text-center py-10"
                >
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-10 h-10 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">Đặt hàng thành công!</h3>
                  <p className="text-slate-600 mb-8">Cảm ơn bạn đã tin tưởng. Chúng tôi sẽ sớm liên hệ với bạn.</p>
                  <button 
                    onClick={() => setStatus('idle')}
                    className="text-rose-500 font-bold hover:underline"
                  >
                    Tiếp tục mua hàng
                  </button>
                </motion.div>
              ) : (
                <form className="space-y-6 max-w-md mx-auto" onSubmit={handleSubmit}>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Họ và tên</label>
                    <input 
                      type="text" 
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Nhập họ tên của bạn"
                      className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Số điện thoại</label>
                    <input 
                      type="tel" 
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="Nhập số điện thoại"
                      className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Địa chỉ nhận hàng</label>
                    <textarea 
                      required
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Nhập địa chỉ chi tiết"
                      rows={3}
                      className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 outline-none transition-all resize-none"
                    ></textarea>
                  </div>

                  {status === 'error' && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100">
                      {errorMessage}
                    </div>
                  )}
                  
                  <div className="pt-4">
                    <button 
                      type="submit"
                      disabled={status === 'loading'}
                      className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white py-5 rounded-2xl text-xl font-bold transition-all shadow-xl active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                      {status === 'loading' ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                      ) : (
                        <>
                          XÁC NHẬN ĐẶT HÀNG
                          <ChevronRight className="w-5 h-5" />
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex items-center justify-center gap-6 pt-6 opacity-60">
                    <div className="flex items-center gap-1 text-xs font-bold">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      BẢO MẬT
                    </div>
                    <div className="flex items-center gap-1 text-xs font-bold">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      CHÍNH HÃNG
                    </div>
                    <div className="flex items-center gap-1 text-xs font-bold">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      MIỄN PHÍ SHIP
                    </div>
                  </div>
                </form>
              )}
            </AnimatePresence>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-8 h-8 bg-rose-500 rounded-lg flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <span className="font-extrabold text-xl tracking-tight">
              Dép Siêu <span className="text-rose-500">Êm</span>
            </span>
          </div>
          <p className="text-slate-400 text-sm mb-8">
            © 2024 Dép Siêu Êm Cho Bé. Tất cả quyền được bảo lưu.
          </p>
          <div className="flex justify-center gap-6 text-slate-500 text-xs font-bold uppercase tracking-widest">
            <a href="#" className="hover:text-rose-500 transition-colors">Chính sách bảo mật</a>
            <a href="#" className="hover:text-rose-500 transition-colors">Điều khoản dịch vụ</a>
            <a href="#" className="hover:text-rose-500 transition-colors">Liên hệ</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
