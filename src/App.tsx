import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingBag, 
  ChevronRight, 
  Star, 
  Truck, 
  ShieldCheck, 
  RotateCcw, 
  CheckCircle2,
  Loader2,
  ArrowRight,
  Menu,
  X,
  Instagram,
  Facebook,
  Twitter
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { PRODUCTS, HERO_CONTENT, FEATURE_CONTENT, REVIEWS } from './constants';

import confetti from 'canvas-confetti';

const Navbar = ({ onScrollToOrder }: { onScrollToOrder: () => void }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/90 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-6'}`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <div className="flex items-center gap-2 group cursor-pointer">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center transition-transform group-hover:rotate-12">
            <ShoppingBag className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="font-display font-extrabold text-2xl tracking-tighter text-primary">
            shop <span className="text-muted-foreground font-light">bé yêu</span>
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium uppercase tracking-widest text-muted-foreground">
          <a href="#collection" className="hover:text-primary transition-colors">Bộ sưu tập</a>
          <a href="#features" className="hover:text-primary transition-colors">Tính năng</a>
          <a href="#reviews" className="hover:text-primary transition-colors">Đánh giá</a>
          <Button onClick={onScrollToOrder} size="sm" className="rounded-full px-6">Đặt hàng ngay</Button>
        </div>

        <button className="md:hidden text-primary" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-border overflow-hidden"
          >
            <div className="flex flex-col p-6 gap-4 text-sm font-bold uppercase tracking-widest">
              <a href="#collection" onClick={() => setIsMobileMenuOpen(false)}>Bộ sưu tập</a>
              <a href="#features" onClick={() => setIsMobileMenuOpen(false)}>Tính năng</a>
              <a href="#reviews" onClick={() => setIsMobileMenuOpen(false)}>Đánh giá</a>
              <Button onClick={() => { onScrollToOrder(); setIsMobileMenuOpen(false); }} className="w-full">Đặt hàng ngay</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const ProductCard = ({ product, onOpenDetail }: { product: any, onOpenDetail: (p: any) => void, key?: any }) => (
  <motion.div 
    whileHover={{ y: -10 }}
    className="group relative cursor-pointer"
    onClick={() => onOpenDetail(product)}
  >
    <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-secondary mb-4">
      <img 
        src={product.image} 
        alt={product.title} 
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        referrerPolicy="no-referrer"
      />
      {product.tag && (
        <Badge className="absolute top-4 left-4 bg-white text-primary hover:bg-white border-none shadow-sm">
          {product.tag}
        </Badge>
      )}
      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <Button variant="secondary" className="rounded-full font-bold">Xem chi tiết</Button>
      </div>
    </div>
    <div className="space-y-1">
      <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{product.category}</p>
      <h3 className="font-display font-bold text-xl text-primary">{product.title}</h3>
      <p className="font-medium text-primary/80">{product.price}</p>
    </div>
  </motion.div>
);

export default function App() {
  const [products, setProducts] = useState(PRODUCTS);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', phone: '', address: '', quantity: '1' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products');
        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            setProducts(data);
          }
        }
      } catch (error) {
        console.error("Failed to fetch products from Sheet, using defaults.");
      }
    };
    fetchProducts();
  }, []);

  const [reviewIndex, setReviewIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setReviewIndex((prev) => (prev + 1) % REVIEWS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const scrollToOrder = () => {
    document.getElementById('order-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent, productOverride?: any) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.address) {
      setErrorMessage('Vui lòng điền đầy đủ thông tin');
      setStatus('error');
      return;
    }

    const orderProduct = productOverride || selectedProduct;

    setStatus('loading');
    try {
      const response = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          productTitle: orderProduct?.title || "General Order",
          productPrice: orderProduct?.price || "N/A"
        }),
      });

      if (response.ok) {
        setStatus('success');
        setFormData({ name: '', phone: '', address: '', quantity: '1' });
        
        // Trigger celebratory confetti
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#0f172a', '#64748b', '#ffffff']
        });
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
    <div className="min-h-screen bg-white selection:bg-primary selection:text-primary-foreground">
      <Navbar onScrollToOrder={scrollToOrder} />

      <main>
        {/* Hero Section */}
        <section className="relative h-screen flex items-center overflow-hidden pt-20">
          <div className="absolute inset-0 z-0">
            <img 
              src={HERO_CONTENT.image} 
              alt="Hero background" 
              className="w-full h-full object-cover brightness-75"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent"></div>
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-2xl text-white"
            >
              <Badge variant="outline" className="text-white border-white/30 mb-6 px-4 py-1 text-xs uppercase tracking-[0.2em]">
                {HERO_CONTENT.badge}
              </Badge>
              <h1 className="text-6xl md:text-8xl font-display font-extrabold leading-[0.9] mb-8 tracking-tighter">
                {HERO_CONTENT.title.split(' ').slice(0, -3).join(' ')} <br /> <span className="text-white/60 italic">{HERO_CONTENT.title.split(' ').slice(-3).join(' ')}</span>
              </h1>
              <p className="text-lg md:text-xl text-white/80 mb-10 max-w-lg leading-relaxed font-light">
                {HERO_CONTENT.description}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button onClick={scrollToOrder} size="lg" className="rounded-full px-10 py-7 text-lg font-bold group">
                  Mua ngay <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Button>
                <Button variant="outline" size="lg" className="rounded-full px-10 py-7 text-lg font-bold text-white border-white/30 hover:bg-white/10">
                  Xem bộ sưu tập
                </Button>
              </div>
            </motion.div>
          </div>

          <div className="absolute bottom-10 left-6 z-10 hidden md:flex items-center gap-8">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-[0.3em] text-white/40">Follow us</span>
              <div className="flex gap-4">
                <Facebook className="w-4 h-4 text-white/60 hover:text-white cursor-pointer" />
                <Instagram className="w-4 h-4 text-white/60 hover:text-white cursor-pointer" />
                <Twitter className="w-4 h-4 text-white/60 hover:text-white cursor-pointer" />
              </div>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section id="collection" className="py-32 px-6 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="max-w-xl">
              <h2 className="text-4xl md:text-5xl font-display font-extrabold text-primary mb-6 tracking-tight">
                DÀNH CHO <span className="text-muted-foreground italic">MỌI THẾ HỆ</span>
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Chúng tôi tin rằng đôi giày tốt là khởi đầu của một hành trình tuyệt vời. Khám phá các dòng sản phẩm được thiết kế riêng biệt cho từng độ tuổi.
              </p>
            </div>
            <div className="flex gap-4">
              <Button variant="outline" className="rounded-full">Người lớn</Button>
              <Button variant="outline" className="rounded-full">Trẻ em</Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product: any) => (
              <ProductCard 
                key={product.id}
                product={product}
                onOpenDetail={setSelectedProduct}
              />
            ))}
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="bg-secondary/30 py-32 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
              <div className="relative">
                <div className="aspect-square rounded-[4rem] overflow-hidden">
                  <img 
                    src={FEATURE_CONTENT.image} 
                    alt="Shoe detail" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="absolute -bottom-10 -right-10 bg-white p-8 rounded-3xl shadow-xl max-w-xs hidden md:block">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-primary/5 rounded-full flex items-center justify-center">
                      <ShieldCheck className="w-6 h-6 text-primary" />
                    </div>
                    <span className="font-bold text-sm uppercase tracking-widest">{FEATURE_CONTENT.title}</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {FEATURE_CONTENT.description}
                  </p>
                </div>
              </div>

              <div className="space-y-12">
                <div>
                  <h2 className="text-4xl md:text-5xl font-display font-extrabold text-primary mb-8 tracking-tight">
                    TẠI SAO CHỌN <br /> <span className="text-muted-foreground italic">STEPUP?</span>
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Mỗi đôi giày tại StepUp đều trải qua quy trình kiểm tra nghiêm ngặt để đảm bảo sự thoải mái và an toàn tối đa cho người sử dụng.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                      <Truck className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <h4 className="font-bold text-lg">Giao hàng nhanh</h4>
                    <p className="text-sm text-muted-foreground">Giao hàng toàn quốc trong vòng 2-3 ngày làm việc.</p>
                  </div>
                  <div className="space-y-4">
                    <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                      <RotateCcw className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <h4 className="font-bold text-lg">Đổi trả 30 ngày</h4>
                    <p className="text-sm text-muted-foreground">Yên tâm mua sắm với chính sách đổi trả linh hoạt.</p>
                  </div>
                  <div className="space-y-4">
                    <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <h4 className="font-bold text-lg">Bảo hành 12 tháng</h4>
                    <p className="text-sm text-muted-foreground">Cam kết chất lượng với gói bảo hành dài hạn.</p>
                  </div>
                  <div className="space-y-4">
                    <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                      <Star className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <h4 className="font-bold text-lg">Hỗ trợ 24/7</h4>
                    <p className="text-sm text-muted-foreground">Đội ngũ tư vấn luôn sẵn sàng giải đáp mọi thắc mắc.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Reviews Section */}
        <section id="reviews" className="py-32 px-6 max-w-7xl mx-auto overflow-hidden">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-display font-extrabold text-primary mb-6 tracking-tight">
              KHÁCH HÀNG <span className="text-muted-foreground italic">NÓI GÌ?</span>
            </h2>
            <div className="flex justify-center gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <motion.div
                  key={i}
                  animate={{ 
                    opacity: [1, 0.4, 1],
                    scale: [1, 1.2, 1],
                  }}
                  transition={{ 
                    duration: 1.5, 
                    repeat: Infinity, 
                    delay: i * 0.2,
                    ease: "easeInOut"
                  }}
                >
                  <Star className="w-6 h-6 fill-yellow-400 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]" />
                </motion.div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="flex justify-center items-center min-h-[400px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={reviewIndex}
                  initial={{ opacity: 0, x: 50, scale: 0.9 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -50, scale: 0.9 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="w-full max-w-2xl px-4"
                >
                  <Card className="border-none bg-white shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-[3rem] p-8 md:p-16 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-2 h-full bg-primary"></div>
                    <CardContent className="p-0 space-y-8">
                      <div className="text-primary/10 absolute -top-4 -left-2 text-9xl font-serif opacity-20">“</div>
                      <p className="text-xl md:text-2xl italic text-primary font-medium leading-relaxed relative z-10">
                        {REVIEWS[reviewIndex].text}
                      </p>
                      <div className="flex items-center gap-4 pt-4">
                        <div className="w-14 h-14 bg-secondary rounded-full flex items-center justify-center text-primary font-bold text-xl">
                          {REVIEWS[reviewIndex].name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold text-xl text-primary">{REVIEWS[reviewIndex].name}</h4>
                          <p className="text-xs text-muted-foreground uppercase tracking-[0.2em] font-bold">{REVIEWS[reviewIndex].role}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </AnimatePresence>
            </div>
            
            {/* Dots Indicator */}
            <div className="flex justify-center gap-2 mt-8">
              {REVIEWS.map((_, i) => (
                <button 
                  key={i} 
                  onClick={() => setReviewIndex(i)}
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    reviewIndex === i ? 'w-8 bg-primary' : 'w-2 bg-primary/20'
                  }`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Order Form Section */}
        <section id="order-form" className="py-32 px-6 bg-primary text-primary-foreground">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
              <div className="space-y-8">
                <h2 className="text-5xl md:text-6xl font-display font-extrabold leading-tight tracking-tighter">
                  ĐẶT HÀNG <br /> <span className="text-primary-foreground/40 italic">NGAY HÔM NAY</span>
                </h2>
                <p className="text-primary-foreground/60 leading-relaxed text-lg">
                  Chỉ mất 30 giây để sở hữu đôi giày mơ ước. Chúng tôi sẽ liên hệ xác nhận đơn hàng trong vòng 15 phút.
                </p>
                <div className="space-y-4 pt-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full border border-primary-foreground/20 flex items-center justify-center">
                      <Truck className="w-6 h-6" />
                    </div>
                    <span className="font-medium">Miễn phí vận chuyển toàn quốc</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full border border-primary-foreground/20 flex items-center justify-center">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <span className="font-medium">Thanh toán khi nhận hàng (COD)</span>
                  </div>
                </div>
              </div>

              <Card className="bg-white text-primary rounded-[2.5rem] p-8 md:p-12 shadow-2xl">
                <AnimatePresence mode="wait">
                  {status === 'success' ? (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="text-center py-6"
                    >
                      <div className="w-24 h-24 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-8">
                        <CheckCircle2 className="w-12 h-12 text-primary" />
                      </div>
                      <h3 className="text-3xl font-display font-extrabold text-primary mb-4 tracking-tight">
                        CHÚC MỪNG! 🎉
                      </h3>
                      <p className="text-muted-foreground mb-2 font-bold">
                        Bạn đã đặt hàng thành công.
                      </p>
                      <p className="text-muted-foreground mb-10 leading-relaxed">
                        Cảm ơn bạn đã tin tưởng lựa chọn <span className="font-bold text-primary">shop bé yêu</span>. Đội ngũ của chúng tôi đang chuẩn bị những đôi giày tốt nhất để gửi đến bạn. Chúng tôi sẽ liên hệ xác nhận trong ít phút nữa!
                      </p>
                      <Button onClick={() => setStatus('idle')} variant="outline" className="rounded-full px-10 h-12 font-bold">
                        Tiếp tục mua sắm
                      </Button>
                    </motion.div>
                  ) : (
                    <form className="space-y-6" onSubmit={handleSubmit}>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Họ và tên</label>
                        <Input 
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Nhập họ tên của bạn"
                          className="h-14 rounded-2xl bg-secondary/30 border-none focus-visible:ring-primary"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Số điện thoại</label>
                        <Input 
                          type="tel" 
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="Nhập số điện thoại"
                          className="h-14 rounded-2xl bg-secondary/30 border-none focus-visible:ring-primary"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Địa chỉ nhận hàng</label>
                        <textarea 
                          required
                          value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                          placeholder="Nhập địa chỉ chi tiết"
                          rows={3}
                          className="w-full px-4 py-3 rounded-2xl bg-secondary/30 border-none focus:ring-2 focus:ring-primary outline-none transition-all resize-none text-sm"
                        ></textarea>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Số lượng</label>
                        <div className="flex items-center gap-4">
                          <Button 
                            type="button"
                            variant="outline" 
                            className="w-12 h-12 rounded-xl border-secondary"
                            onClick={() => setFormData(prev => ({ ...prev, quantity: Math.max(1, parseInt(prev.quantity) - 1).toString() }))}
                          >
                            -
                          </Button>
                          <Input 
                            type="number"
                            min="1"
                            value={formData.quantity}
                            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                            className="h-12 rounded-xl bg-secondary/30 border-none text-center font-bold"
                          />
                          <Button 
                            type="button"
                            variant="outline" 
                            className="w-12 h-12 rounded-xl border-secondary"
                            onClick={() => setFormData(prev => ({ ...prev, quantity: (parseInt(prev.quantity) + 1).toString() }))}
                          >
                            +
                          </Button>
                        </div>
                      </div>

                      {status === 'error' && (
                        <div className="bg-destructive/10 text-destructive p-4 rounded-xl text-sm font-medium border border-destructive/20">
                          {errorMessage}
                        </div>
                      )}
                      
                      <Button 
                        type="submit"
                        disabled={status === 'loading'}
                        className="w-full h-16 rounded-2xl text-lg font-bold shadow-lg shadow-primary/20"
                      >
                        {status === 'loading' ? (
                          <Loader2 className="w-6 h-6 animate-spin" />
                        ) : (
                          "XÁC NHẬN ĐẶT HÀNG"
                        )}
                      </Button>

                      <p className="text-[10px] text-center text-muted-foreground uppercase tracking-widest pt-4">
                        Thông tin của bạn được bảo mật tuyệt đối
                      </p>
                    </form>
                  )}
                </AnimatePresence>
              </Card>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white py-20 px-6 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
            <div className="col-span-1 md:col-span-2 space-y-6">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                  <ShoppingBag className="w-6 h-6 text-primary-foreground" />
                </div>
                <span className="font-display font-extrabold text-2xl tracking-tighter">
                  STEP<span className="text-muted-foreground font-light">UP</span>
                </span>
              </div>
              <p className="text-muted-foreground max-w-sm leading-relaxed">
                Thương hiệu giày dép hàng đầu dành cho mọi lứa tuổi. Chúng tôi cam kết mang lại sự thoải mái và phong cách trên từng bước chân.
              </p>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-primary hover:text-white transition-colors cursor-pointer">
                  <Facebook className="w-4 h-4" />
                </div>
                <div className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-primary hover:text-white transition-colors cursor-pointer">
                  <Instagram className="w-4 h-4" />
                </div>
                <div className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-primary hover:text-white transition-colors cursor-pointer">
                  <Twitter className="w-4 h-4" />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h4 className="font-bold uppercase tracking-widest text-xs">Liên kết nhanh</h4>
              <ul className="space-y-4 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Về chúng tôi</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Bộ sưu tập</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Chính sách bảo hành</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Liên hệ</a></li>
              </ul>
            </div>

            <div className="space-y-6">
              <h4 className="font-bold uppercase tracking-widest text-xs">Liên hệ</h4>
              <ul className="space-y-4 text-sm text-muted-foreground">
                <li>Hotline: 1900 1234</li>
                <li>Email: support@stepup.vn</li>
                <li>Địa chỉ: 123 Đường ABC, Quận 1, TP. HCM</li>
              </ul>
            </div>
          </div>

          <Separator className="mb-8" />
          
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground uppercase tracking-widest font-medium">
            <p>© 2024 StepUp Footwear. All rights reserved.</p>
            <div className="flex gap-8">
              <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Product Detail Modal (Vertical Layout - E-commerce Style) */}
      <Dialog open={!!selectedProduct} onOpenChange={(open) => !open && setSelectedProduct(null)}>
        <DialogContent className="max-w-md p-0 overflow-hidden rounded-[1.5rem] border-none h-[90vh] max-h-[800px] flex flex-col bg-white">
          <div className="flex-1 overflow-y-auto scrollbar-hide">
            <div className="flex flex-col pb-10">
              {/* Image Header */}
              <div className="relative aspect-square bg-secondary/20 flex items-center justify-center">
                <img 
                  src={selectedProduct?.image} 
                  alt={selectedProduct?.title} 
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  <Badge variant="secondary" className="w-fit text-[10px] px-2 py-0.5 rounded-full shadow-sm bg-white/80 backdrop-blur-md">{selectedProduct?.category}</Badge>
                  {selectedProduct?.tag && <Badge className="w-fit text-[10px] px-2 py-0.5 rounded-full bg-primary text-primary-foreground shadow-sm">{selectedProduct?.tag}</Badge>}
                </div>
              </div>

              {/* Product Info Body */}
              <div className="p-6 space-y-6">
                <div className="space-y-2">
                  <h3 className="text-2xl font-display font-extrabold text-primary leading-tight">
                    {selectedProduct?.title}
                  </h3>
                  <p className="text-xl font-bold text-destructive">
                    {selectedProduct?.price}
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Mô tả sản phẩm</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Sản phẩm cao cấp được thiết kế riêng cho sự thoải mái tối đa. Chất liệu bền bỉ, thoáng khí, phù hợp cho mọi hoạt động hàng ngày. Cam kết chất lượng từ shop bé yêu.
                  </p>
                </div>

                <Separator className="opacity-50" />

                {/* Order Form */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-primary">Thông tin đặt hàng</h4>
                    <span className="text-[10px] text-muted-foreground italic">Giao hàng toàn quốc</span>
                  </div>
                  
                  <AnimatePresence mode="wait">
                    {status === 'success' ? (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-green-50 p-6 rounded-2xl text-center border border-green-100"
                      >
                        <CheckCircle2 className="w-10 h-10 text-green-600 mx-auto mb-2" />
                        <p className="text-sm font-bold text-green-800">Đặt hàng thành công!</p>
                        <p className="text-xs text-green-700 mt-1">Chúng tôi sẽ sớm liên hệ với bạn.</p>
                      </motion.div>
                    ) : (
                      <div className="space-y-3">
                        <div className="grid gap-3">
                          <div className="grid grid-cols-2 gap-3">
                            <Input 
                              placeholder="Họ và tên" 
                              className="bg-secondary/30 border-none h-12 rounded-xl text-sm focus-visible:ring-1 focus-visible:ring-primary"
                              value={formData.name}
                              onChange={(e) => setFormData({...formData, name: e.target.value})}
                            />
                            <div className="flex items-center gap-2 bg-secondary/30 rounded-xl px-2">
                              <button 
                                type="button"
                                className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm text-primary font-bold"
                                onClick={() => setFormData(prev => ({ ...prev, quantity: Math.max(1, parseInt(prev.quantity) - 1).toString() }))}
                              >
                                -
                              </button>
                              <span className="flex-1 text-center font-bold text-sm">{formData.quantity}</span>
                              <button 
                                type="button"
                                className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm text-primary font-bold"
                                onClick={() => setFormData(prev => ({ ...prev, quantity: (parseInt(prev.quantity) + 1).toString() }))}
                              >
                                +
                              </button>
                            </div>
                          </div>
                          <Input 
                            placeholder="Số điện thoại liên hệ" 
                            className="bg-secondary/30 border-none h-12 rounded-xl text-sm focus-visible:ring-1 focus-visible:ring-primary"
                            value={formData.phone}
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          />
                          <textarea 
                            placeholder="Địa chỉ nhận hàng chi tiết" 
                            className="w-full p-4 bg-secondary/30 border-none rounded-xl text-sm focus:ring-1 focus:ring-primary outline-none min-h-[80px] transition-all"
                            value={formData.address}
                            onChange={(e) => setFormData({...formData, address: e.target.value})}
                          />
                        </div>

                        {status === 'error' && (
                          <p className="text-[10px] text-destructive font-bold text-center">{errorMessage}</p>
                        )}

                        <Button 
                          className="w-full h-14 rounded-xl font-bold text-base shadow-xl shadow-primary/20 active:scale-[0.98] transition-transform"
                          onClick={(e) => handleSubmit(e)}
                          disabled={status === 'loading'}
                        >
                          {status === 'loading' ? <Loader2 className="w-5 h-5 animate-spin" /> : "XÁC NHẬN MUA NGAY"}
                        </Button>
                        
                        <div className="flex items-center justify-center gap-4 pt-2">
                          <div className="flex items-center gap-1 text-[9px] font-bold text-muted-foreground uppercase tracking-tighter">
                            <Truck className="w-3 h-3" /> Miễn phí ship
                          </div>
                          <div className="flex items-center gap-1 text-[9px] font-bold text-muted-foreground uppercase tracking-tighter">
                            <RotateCcw className="w-3 h-3" /> Đổi trả 7 ngày
                          </div>
                        </div>
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
