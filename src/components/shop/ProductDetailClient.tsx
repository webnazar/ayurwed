'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShoppingCart,
  ChevronRight,
  Building2,
  Tag,
  ShieldCheck,
  Star,
  Plus,
  Minus,
  ArrowLeft,
  Leaf,
  Check,
  FileText,
  Truck,
  RotateCcw,
  Sparkles,
  MessageSquare,
  HelpCircle,
  Zap,
} from 'lucide-react';
import { useCart } from '@/components/shop/CartContext';
import CartDrawer from '@/components/shop/CartDrawer';
import ShopProductCard from '@/components/shop/ShopProductCard';
import ProductShareButton from '@/components/shop/ProductShareButton';
import toast from 'react-hot-toast';

const formatPrice = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

interface ProductDetailProps {
  product: any;
  related: any[];
}

export default function ProductDetailClient({ product, related }: ProductDetailProps) {
  const router = useRouter();
  const { addItem, items, openCart } = useCart();
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState<'profile' | 'description' | 'quality'>('profile');

  const validImages: string[] = React.useMemo(() => {
    if (!Array.isArray(product.images)) return [];
    return product.images.filter(
      (img: any) =>
        typeof img === 'string' &&
        img.trim().length > 0 &&
        img !== '/placeholder-product.png' &&
        img !== '[]' &&
        img !== '{}'
    );
  }, [product.images]);

  const currentImg = validImages[activeImg] || null;

  const inCart = items.find((i) => i.productId === product.id);
  const disc =
    product.mrp > product.sellingPrice
      ? Math.round(((product.mrp - product.sellingPrice) / product.mrp) * 100)
      : 0;

  const handleAddToCart = () => {
    if (product.stock === 0) return toast.error('Out of stock');
    for (let i = 0; i < qty; i++) {
      addItem({
        productId: product.id,
        name: product.name,
        slug: product.slug,
        image: validImages[0] || '/icon.webp',
        price: product.sellingPrice,
        mrp: product.mrp,
        unit: product.unit,
        stock: product.stock,
      });
    }
    toast.success(`Added ${qty} unit(s) to cart!`, { icon: '🛒' });
    openCart();
  };

  const handleBuyNow = () => {
    if (product.stock === 0) return toast.error('Out of stock');
    if (!inCart) {
      for (let i = 0; i < qty; i++) {
        addItem({
          productId: product.id,
          name: product.name,
          slug: product.slug,
          image: validImages[0] || '/icon.webp',
          price: product.sellingPrice,
          mrp: product.mrp,
          unit: product.unit,
          stock: product.stock,
        });
      }
    }
    router.push('/shop/checkout');
  };

  const handleOpenAyuri = () => {
    const trigger = document.getElementById('ayuri-chat-widget-trigger');
    if (trigger) {
      trigger.click();
    } else {
      const widget = document.getElementById('ayuri-chat-widget');
      if (widget) widget.classList.remove('hidden');
    }
  };

  const formattedType = (product.type || 'READY_PRODUCT').replace('_', ' ');

  return (
    <>
      <CartDrawer />

      <div className="min-h-screen bg-background">
        {/* Breadcrumb Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <nav className="flex items-center gap-2 text-xs sm:text-sm text-foreground/50 flex-wrap">
            <Link href="/" className="hover:text-brand-green transition-colors">
              Home
            </Link>
            <ChevronRight className="h-3.5 w-3.5 flex-shrink-0" />
            <Link href="/shop" className="hover:text-brand-green transition-colors">
              Shop
            </Link>
            {product.category && (
              <>
                <ChevronRight className="h-3.5 w-3.5 flex-shrink-0" />
                <Link
                  href={`/shop?category=${encodeURIComponent(product.category)}`}
                  className="hover:text-brand-green transition-colors"
                >
                  {product.category}
                </Link>
              </>
            )}
            <ChevronRight className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="text-brand-green font-semibold line-clamp-1">{product.name}</span>
          </nav>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
          {/* Main Product Showcase Box */}
          <div className="bg-card border border-border rounded-3xl p-5 sm:p-8 lg:p-10 shadow-sm mb-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
              {/* Left Column: Image Gallery (5 cols) */}
              <div className="lg:col-span-5 space-y-4">
                <div className="relative aspect-square rounded-3xl overflow-hidden bg-muted border border-border shadow-xs flex items-center justify-center group">
                  {currentImg ? (
                    <img
                      src={currentImg}
                      alt={product.name}
                      className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        const target = e.currentTarget;
                        target.src = '/icon.webp';
                        target.className =
                          'w-full h-full object-contain p-8 sm:p-16 bg-emerald-50/50 group-hover:scale-105 transition-transform duration-500';
                      }}
                    />
                  ) : (
                    <img
                      src="/icon.webp"
                      alt={product.name}
                      className="w-full h-full object-contain p-8 sm:p-16 bg-emerald-50/50 transition-transform duration-500"
                    />
                  )}

                  {/* Badges Overlay */}
                  <div className="absolute top-4 left-4 flex flex-col gap-2 items-start">
                    {disc > 0 && (
                      <span className="bg-rose-500 text-white text-xs font-extrabold px-3 py-1 rounded-full shadow-sm">
                        {disc}% OFF
                      </span>
                    )}
                    {product.isFeatured && (
                      <span className="bg-brand-gold text-brand-green text-xs font-extrabold px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
                        <Star className="h-3 w-3 fill-current" /> Featured
                      </span>
                    )}
                  </div>

                  {/* Share Icon Button on Image */}
                  <div className="absolute top-4 right-4 z-10">
                    <ProductShareButton
                      productName={product.name}
                      category={product.category}
                      brandName={product.manufacturer?.companyName}
                      sellingPrice={product.sellingPrice}
                      variant="icon"
                    />
                  </div>

                  {product.stock > 0 && product.stock <= 5 && (
                    <div className="absolute bottom-4 left-4 bg-amber-500/90 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm backdrop-blur-xs animate-pulse">
                      Only {product.stock} Left!
                    </div>
                  )}
                </div>

                {/* Thumbnail Strip */}
                {validImages.length > 1 && (
                  <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-thin">
                    {validImages.map((img: string, i: number) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setActiveImg(i)}
                        className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 transition-all p-1 bg-muted ${
                          i === activeImg
                            ? 'border-brand-green shadow-md scale-102 ring-2 ring-brand-green/20'
                            : 'border-border hover:border-brand-green/50 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={img}
                          alt={`${product.name} view ${i + 1}`}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            e.currentTarget.src = '/icon.webp';
                            e.currentTarget.className = 'w-full h-full object-contain p-2 bg-emerald-50/50';
                          }}
                        />
                      </button>
                    ))}
                  </div>
                )}

                {/* Need Guidance Callout below image */}
                <div className="bg-brand-green-light/40 border border-brand-green/20 rounded-2xl p-4 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 text-brand-green font-medium">
                    <Sparkles className="h-4 w-4 text-brand-gold flex-shrink-0" />
                    <span>Want dosage guidance or formulation advice?</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleOpenAyuri}
                    className="font-extrabold text-brand-green underline hover:text-brand-gold transition-colors flex-shrink-0"
                  >
                    Ask Ayuri AI
                  </button>
                </div>
              </div>

              {/* Right Column: Buying Box & Product Details (7 cols) */}
              <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  {/* Category, Form Type, Brand Tags & Share Button */}
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="bg-brand-gold text-brand-green font-extrabold px-3 py-1 rounded-full uppercase tracking-wider text-[11px]">
                        {formattedType}
                      </span>
                      {product.category && (
                        <Link
                          href={`/shop?category=${encodeURIComponent(product.category)}`}
                          className="bg-brand-green-light/70 hover:bg-brand-green hover:text-white text-brand-green font-bold px-3 py-1 rounded-full flex items-center gap-1 transition-colors text-[11px]"
                        >
                          <Tag className="h-3 w-3" /> {product.category}
                        </Link>
                      )}
                      {product.sku && (
                        <span className="bg-muted text-foreground/50 font-mono px-2.5 py-0.5 rounded-md text-[10px]">
                          SKU: {product.sku}
                        </span>
                      )}
                    </div>
                    <ProductShareButton
                      productName={product.name}
                      category={product.category}
                      brandName={product.manufacturer?.companyName}
                      sellingPrice={product.sellingPrice}
                      variant="button"
                    />
                  </div>

                  {/* Title & Botanical Name */}
                  <div>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-brand-green leading-tight">
                      {product.name}
                    </h1>
                    {product.botanicalName && (
                      <p className="text-sm sm:text-base font-serif italic text-foreground/60 mt-1 flex items-center gap-1.5">
                        <Leaf className="h-3.5 w-3.5 text-brand-gold" />
                        <span>Botanical Name: {product.botanicalName}</span>
                      </p>
                    )}
                  </div>

                  {/* Indication / Health Badges */}
                  {product.indications && product.indications.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {product.indications.map((ind: any) => (
                        <span
                          key={ind.id}
                          className="bg-amber-500/10 text-amber-900 dark:text-amber-200 border border-amber-500/20 text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1"
                        >
                          <span>🩺</span> {ind.name}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Short Description */}
                  {product.shortDesc && (
                    <p className="text-foreground/70 text-sm sm:text-base leading-relaxed">
                      {product.shortDesc}
                    </p>
                  )}

                  {/* Brand / Manufacturer Card */}
                  {product.manufacturer && (
                    <div className="bg-muted/40 border border-border rounded-2xl p-3.5 flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-brand-green/10 flex items-center justify-center flex-shrink-0 text-brand-green">
                        <Building2 className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-foreground/50 block">
                          Brand / Manufacturer
                        </span>
                        <p className="font-extrabold text-brand-green text-sm truncate">
                          {product.manufacturer.companyName}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-500/20">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        <span>Licensed Brand</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* B2C Price & Purchasing Box */}
                <div className="bg-gradient-to-br from-brand-green-light/30 via-card to-brand-gold-light/20 rounded-3xl p-6 border border-brand-green/20 space-y-5">
                  {/* Price Row */}
                  <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-border/70 pb-4">
                    <div>
                      <span className="text-[11px] font-bold text-foreground/50 uppercase tracking-wider block">
                        Special Online Price
                      </span>
                      <div className="flex items-baseline gap-2 mt-0.5">
                        <span className="text-3xl sm:text-4xl font-black text-brand-green">
                          {formatPrice(product.sellingPrice)}
                        </span>
                        {product.unit && (
                          <span className="text-xs text-foreground/60 font-semibold">
                            / {product.unit}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-foreground/50 block mt-0.5">
                        Inclusive of all applicable taxes
                      </span>
                    </div>

                    {product.mrp > product.sellingPrice && (
                      <div className="text-right">
                        <span className="text-sm sm:text-base text-foreground/40 line-through block font-medium">
                          MRP {formatPrice(product.mrp)}
                        </span>
                        <span className="inline-block bg-emerald-500 text-white text-xs font-extrabold px-3 py-1 rounded-full shadow-xs mt-1">
                          Save {disc}% (₹{product.mrp - product.sellingPrice} Off)
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Stock Availability */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      {product.stock > 0 ? (
                        <>
                          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="font-extrabold text-emerald-700 dark:text-emerald-300">
                            In Stock • Ready to dispatch
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                          <span className="font-extrabold text-rose-500">Currently Out of Stock</span>
                        </>
                      )}
                    </div>
                    <span className="text-foreground/50">Pan-India Express Dispatch</span>
                  </div>

                  {/* Quantity Stepper & Action Buttons */}
                  {product.stock > 0 ? (
                    <div className="space-y-3 pt-1">
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        {/* Quantity Stepper */}
                        <div className="flex items-center justify-between bg-card border border-border rounded-2xl p-1.5 shadow-2xs w-full sm:w-36 flex-shrink-0">
                          <button
                            type="button"
                            onClick={() => setQty((q) => Math.max(1, q - 1))}
                            disabled={qty <= 1}
                            className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-muted font-bold text-foreground disabled:opacity-30 transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="font-black text-brand-green text-base w-10 text-center">
                            {qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                            disabled={qty >= product.stock}
                            className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-muted font-bold text-foreground disabled:opacity-30 transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>

                        {/* Add to Cart */}
                        <button
                          type="button"
                          onClick={handleAddToCart}
                          className="flex-1 bg-brand-green/10 hover:bg-brand-green text-brand-green hover:text-white border border-brand-green/25 hover:border-transparent py-3.5 px-6 rounded-2xl font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 transition-all duration-200 shadow-2xs active:scale-98"
                        >
                          <ShoppingCart className="h-4 w-4" />
                          <span>{inCart ? `Add More (${inCart.quantity} in Cart)` : 'Add to Cart'}</span>
                        </button>
                      </div>

                      {/* Buy Now Direct Button */}
                      <button
                        type="button"
                        onClick={handleBuyNow}
                        className="w-full bg-brand-green hover:bg-brand-gold hover:text-brand-green text-white py-3.5 px-6 rounded-2xl font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg active:scale-98"
                      >
                        <Zap className="h-4 w-4 fill-current" />
                        <span>Buy Now with 1-Click</span>
                      </button>
                    </div>
                  ) : (
                    <div className="bg-muted p-4 rounded-2xl text-center text-sm font-bold text-foreground/60">
                      This formulation is temporarily out of stock. Please check back shortly.
                    </div>
                  )}

                  {/* Consumer Guarantees Row */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-[11px] text-foreground/70 font-semibold border-t border-border/60">
                    <div className="flex items-center gap-2">
                      <Leaf className="h-4 w-4 text-brand-green flex-shrink-0" />
                      <span>100% Classical</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                      <span>Lab Tested Purity</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4 text-brand-gold flex-shrink-0" />
                      <span>Pan-India Delivery</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <RotateCcw className="h-4 w-4 text-blue-500 flex-shrink-0" />
                      <span>Easy 7-Day Returns</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Product Specifications & Details Tabs */}
          <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 lg:p-10 shadow-sm mb-12 space-y-6">
            {/* Tab Headers */}
            <div className="flex items-center gap-2 border-b border-border pb-4 overflow-x-auto scrollbar-none">
              <button
                type="button"
                onClick={() => setActiveTab('profile')}
                className={`px-5 py-2.5 rounded-2xl font-extrabold text-xs sm:text-sm transition-all flex items-center gap-2 flex-shrink-0 ${
                  activeTab === 'profile'
                    ? 'bg-brand-green text-white shadow-sm'
                    : 'text-foreground/60 hover:text-foreground bg-muted/60'
                }`}
              >
                <FileText className="h-4 w-4" /> Formulation &amp; Clinical Profile
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('description')}
                className={`px-5 py-2.5 rounded-2xl font-extrabold text-xs sm:text-sm transition-all flex items-center gap-2 flex-shrink-0 ${
                  activeTab === 'description'
                    ? 'bg-brand-green text-white shadow-sm'
                    : 'text-foreground/60 hover:text-foreground bg-muted/60'
                }`}
              >
                <HelpCircle className="h-4 w-4" /> Description &amp; Traditional Context
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('quality')}
                className={`px-5 py-2.5 rounded-2xl font-extrabold text-xs sm:text-sm transition-all flex items-center gap-2 flex-shrink-0 ${
                  activeTab === 'quality'
                    ? 'bg-brand-green text-white shadow-sm'
                    : 'text-foreground/60 hover:text-foreground bg-muted/60'
                }`}
              >
                <ShieldCheck className="h-4 w-4" /> Quality &amp; Safety Standards
              </button>
            </div>

            {/* Tab 1: Profile & Composition */}
            {activeTab === 'profile' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm animate-in fade-in-50 duration-200">
                {product.botanicalName && (
                  <div className="bg-muted/40 p-4 rounded-2xl space-y-1">
                    <span className="text-[10px] uppercase font-bold text-foreground/50 tracking-wider">
                      Botanical Source
                    </span>
                    <p className="font-serif italic font-bold text-brand-green text-base">
                      {product.botanicalName}
                    </p>
                  </div>
                )}

                <div className="bg-muted/40 p-4 rounded-2xl space-y-1">
                  <span className="text-[10px] uppercase font-bold text-foreground/50 tracking-wider">
                    Formulation Delivery Format
                  </span>
                  <p className="font-bold text-foreground text-sm sm:text-base">{formattedType}</p>
                </div>

                {product.ingredients && (
                  <div className="bg-muted/40 p-4 rounded-2xl md:col-span-2 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-foreground/50 tracking-wider">
                      Key Herbal Ingredients &amp; Composition
                    </span>
                    <p className="font-medium text-foreground/85 leading-relaxed">
                      {product.ingredients}
                    </p>
                  </div>
                )}

                {product.benefits && (
                  <div className="bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-500/20 p-4 rounded-2xl md:col-span-2 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-emerald-800 dark:text-emerald-300 tracking-wider">
                      Therapeutic Benefits &amp; Indications
                    </span>
                    <p className="font-medium text-emerald-950 dark:text-emerald-200 leading-relaxed">
                      {product.benefits}
                    </p>
                  </div>
                )}

                {product.usage && (
                  <div className="bg-amber-50/50 dark:bg-amber-950/20 border border-amber-500/20 p-4 rounded-2xl md:col-span-2 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-amber-800 dark:text-amber-300 tracking-wider">
                      Suggested Dosage &amp; Anupana (Carrier)
                    </span>
                    <p className="font-medium text-amber-950 dark:text-amber-200 leading-relaxed">
                      {product.usage}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Detailed Description */}
            {activeTab === 'description' && (
              <div className="prose prose-sm max-w-none text-foreground/80 leading-relaxed text-sm sm:text-base animate-in fade-in-50 duration-200 whitespace-pre-line">
                {product.description ||
                  product.shortDesc ||
                  'No additional description available for this formulation.'}
              </div>
            )}

            {/* Tab 3: Quality & Safety */}
            {activeTab === 'quality' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-in fade-in-50 duration-200">
                {[
                  {
                    title: 'Classical Textual Reference',
                    desc: 'Prepared in strict adherence to authoritative Ayurvedic texts (Charaka Samhita, Sushruta Samhita, and the Ayurvedic Pharmacopoeia of India).',
                  },
                  {
                    title: 'Heavy Metal & Microbial Tested',
                    desc: 'Each production batch undergoes testing for lead, mercury, arsenic, cadmium, and microbial limits to ensure consumer safety.',
                  },
                  {
                    title: 'GMP Licensed Manufacturing',
                    desc: 'Formulated in state-of-the-art facilities compliant with Good Manufacturing Practices and licensed by state Ayush departments.',
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="bg-muted/40 p-4 rounded-2xl space-y-2 border border-border"
                  >
                    <div className="flex items-center gap-2 text-brand-green font-bold text-sm">
                      <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                      <span>{item.title}</span>
                    </div>
                    <p className="text-xs text-foreground/70 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Ask Ayuri AI Product Assistant Callout Banner */}
          <div className="bg-gradient-to-r from-brand-green-light via-brand-green-light/40 to-brand-gold-light/20 border border-brand-green/20 rounded-3xl p-6 sm:p-8 mb-12 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-brand-green text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                <Sparkles className="h-7 w-7 text-brand-gold" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg sm:text-xl font-extrabold text-brand-green">
                  Unsure if {product.name} fits your Prakriti (Body Type)?
                </h3>
                <p className="text-xs sm:text-sm text-foreground/70 max-w-2xl">
                  Consult Ayuri, your 24/7 Ayurvedic AI advisor. Ask questions about dosage, compatibility with current health concerns, or diet recommendations.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleOpenAyuri}
              className="bg-brand-green hover:bg-brand-gold hover:text-brand-green text-white font-extrabold px-6 py-3 rounded-full text-xs sm:text-sm flex items-center gap-2 transition-all shadow-sm active:scale-95 flex-shrink-0"
            >
              <MessageSquare className="h-4 w-4" />
              <span>Ask Ayuri About This</span>
            </button>
          </div>

          {/* Related Formulations Carousel / Grid */}
          {related.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-brand-gold-dark">
                    Explore More
                  </span>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-brand-green mt-0.5">
                    Related Classical Formulations
                  </h2>
                </div>
                <Link
                  href="/shop"
                  className="text-xs sm:text-sm text-brand-green hover:text-brand-gold font-bold flex items-center gap-1 transition-colors"
                >
                  <span>View All</span>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {related.map((p) => (
                  <ShopProductCard key={p.id} product={p} mode="B2C" />
                ))}
              </div>
            </div>
          )}

          {/* Back to Catalog Link */}
          <div className="mt-12 text-center">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 text-brand-green hover:text-brand-gold transition-colors font-bold text-sm bg-card border border-border px-6 py-3 rounded-full shadow-2xs hover:shadow-xs"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Ayurwed Catalog</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
