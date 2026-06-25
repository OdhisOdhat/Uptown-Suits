import React from "react";
import { Sparkles, ArrowRight, Scissors, Ruler, ShoppingBag, Wrench, ShieldCheck, Heart } from "lucide-react";

interface HomeViewProps {
  onNavigate: (tab: string) => void;
}

export default function HomeView({ onNavigate }: HomeViewProps) {
  return (
    <div className="bg-atelier-bg text-atelier-text pb-16">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden px-4 lg:px-12 py-12 lg:py-24 max-w-7xl mx-auto border-b border-atelier-border">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column - Copy */}
          <div className="lg:col-span-6 flex flex-col space-y-6">
            <span className="text-xs uppercase tracking-[0.25em] font-mono text-stone-400">
              UPTOWN SUITS · EST. 2026
            </span>
            <h1 className="text-5xl lg:text-7xl font-serif text-atelier-text leading-tight tracking-tight">
              Bespoke tailoring, <br />
              <span className="italic text-atelier-accent font-normal">reimagined.</span>
            </h1>
            <p className="text-base text-stone-600 leading-relaxed max-w-xl">
              Upload a photo, let our AI read your proportions, and design a
              garment cut for you alone. Or shop ready-to-wear, drop off a repair,
              and keep your measurements in one quiet wardrobe.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                onClick={() => onNavigate("style-finder")}
                className="bg-atelier-text hover:bg-atelier-accent text-white text-xs font-semibold tracking-[0.2em] uppercase px-8 py-5 rounded-none flex items-center justify-center space-x-2 transition-all duration-300 cursor-pointer shadow-md"
              >
                <Sparkles className="w-4 h-4 text-atelier-accent" />
                <span>Begin with AI Style Finder</span>
              </button>
              <button
                onClick={() => onNavigate("shop")}
                className="border border-atelier-text hover:bg-atelier-text hover:text-white text-atelier-text text-xs font-semibold tracking-[0.2em] uppercase px-8 py-5 rounded-none flex items-center justify-center space-x-2 transition-all duration-300 cursor-pointer"
              >
                <span>Browse the collection</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Column - Visual Graphic & Floating Card */}
          <div className="lg:col-span-6 relative flex justify-center">
            <div className="relative w-full max-w-lg aspect-[4/5] overflow-hidden shadow-2xl bg-stone-100">
              <img
                src="https://images.unsplash.com/photo-1593032465175-481ac7f401a0?auto=format&fit=crop&q=80&w=800"
                alt="Mannequin with draped bespoke suit navy fabric and chalk lines"
                className="w-full h-full object-cover grayscale-20 opacity-90 hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>

            {/* Today's Commission Floating Card */}
            <div className="absolute -bottom-6 -left-4 lg:-left-12 bg-[#EFEBE5] border border-atelier-border p-5 shadow-xl max-w-xs transition-transform duration-300 hover:translate-y-[-4px]">
              <span className="block text-[10px] tracking-[0.25em] font-mono text-stone-400 uppercase mb-1">
                TODAY'S COMMISSION
              </span>
              <h4 className="font-serif text-lg font-medium text-atelier-text leading-snug">
                Navy three-piece, Super 120s wool
              </h4>
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-atelier-border">
                <span className="text-xs font-mono text-stone-500">Order #A-2841</span>
                <span className="text-xs text-atelier-accent font-medium tracking-wide uppercase">Fitting · Tue</span>
              </div>
            </div>
          </div>
        </div>

        {/* STATS ROW */}
        <div className="grid grid-cols-3 gap-4 pt-16 lg:pt-24 max-w-4xl">
          <div className="flex flex-col">
            <span className="text-3xl lg:text-5xl font-serif text-atelier-text font-light">12k+</span>
            <span className="text-[10px] tracking-widest font-mono text-stone-400 uppercase mt-1">GARMENTS CUT</span>
          </div>
          <div className="flex flex-col border-l border-atelier-border pl-6 lg:pl-12">
            <span className="text-3xl lg:text-5xl font-serif text-atelier-text font-light">48</span>
            <span className="text-[10px] tracking-widest font-mono text-stone-400 uppercase mt-1">MASTER TAILORS</span>
          </div>
          <div className="flex flex-col border-l border-atelier-border pl-6 lg:pl-12">
            <span className="text-3xl lg:text-5xl font-serif text-atelier-text font-light">4.9</span>
            <span className="text-[10px] tracking-widest font-mono text-stone-400 uppercase mt-1">CUSTOMER RATING</span>
          </div>
        </div>
      </section>

      {/* 2. WHAT WE DO SECTION */}
      <section className="px-4 lg:px-12 py-16 lg:py-24 max-w-7xl mx-auto border-b border-atelier-border">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div className="space-y-4">
            <span className="text-xs tracking-[0.25em] font-mono text-stone-400 uppercase block">WHAT WE DO</span>
            <h2 className="text-4xl lg:text-5xl font-serif text-atelier-text">
              One house. Every thread of the wardrobe.
            </h2>
          </div>
          <button onClick={() => onNavigate("shop")} className="text-xs font-semibold tracking-[0.15em] uppercase text-stone-500 hover:text-atelier-text flex items-center space-x-1 cursor-pointer pt-4 md:pt-0">
            <span>Explore</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* 6 Grid items */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: AI Style Finder */}
          <div className="bg-[#EFEBE5]/30 border border-atelier-border p-8 hover:bg-[#EFEBE5]/70 hover:shadow-lg transition-all duration-300 flex flex-col justify-between aspect-video">
            <div>
              <Sparkles className="w-6 h-6 text-atelier-accent mb-6" />
              <h3 className="font-serif text-2xl mb-3">AI Style Finder</h3>
              <p className="text-stone-500 text-sm leading-relaxed">
                Upload three photos. Receive a complete style profile and curated looks built for your proportions.
              </p>
            </div>
            <button onClick={() => onNavigate("style-finder")} className="text-xs font-semibold uppercase tracking-[0.15em] text-atelier-text hover:text-atelier-accent flex items-center space-x-1 mt-6 cursor-pointer">
              <span>Try the finder</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 2: Virtual Design Studio */}
          <div className="bg-[#EFEBE5]/30 border border-atelier-border p-8 hover:bg-[#EFEBE5]/70 hover:shadow-lg transition-all duration-300 flex flex-col justify-between aspect-video">
            <div>
              <Scissors className="w-6 h-6 text-atelier-accent mb-6" />
              <h3 className="font-serif text-2xl mb-3">Virtual Design Studio</h3>
              <p className="text-stone-500 text-sm leading-relaxed">
                Compose your own suit, shirt, or dress — fabric, collar, cuff, lapel — and see it rendered on you.
              </p>
            </div>
            <button onClick={() => onNavigate("custom-studio")} className="text-xs font-semibold uppercase tracking-[0.15em] text-atelier-text hover:text-atelier-accent flex items-center space-x-1 mt-6 cursor-pointer">
              <span>Design a piece</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 3: Ready-to-Wear */}
          <div className="bg-[#EFEBE5]/30 border border-atelier-border p-8 hover:bg-[#EFEBE5]/70 hover:shadow-lg transition-all duration-300 flex flex-col justify-between aspect-video">
            <div>
              <ShoppingBag className="w-6 h-6 text-atelier-accent mb-6" />
              <h3 className="font-serif text-2xl mb-3">Ready-to-Wear</h3>
              <p className="text-stone-500 text-sm leading-relaxed">
                A tight, well-edited collection of menswear, womenswear, and heritage traditional pieces.
              </p>
            </div>
            <button onClick={() => onNavigate("shop")} className="text-xs font-semibold uppercase tracking-[0.15em] text-atelier-text hover:text-atelier-accent flex items-center space-x-1 mt-6 cursor-pointer">
              <span>Shop the edit</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 4: Repairs & Alterations */}
          <div className="bg-[#EFEBE5]/30 border border-atelier-border p-8 hover:bg-[#EFEBE5]/70 hover:shadow-lg transition-all duration-300 flex flex-col justify-between aspect-video">
            <div>
              <Wrench className="w-6 h-6 text-atelier-accent mb-6" />
              <h3 className="font-serif text-2xl mb-3">Repairs & Alterations</h3>
              <p className="text-stone-500 text-sm leading-relaxed">
                Torn seams, hem shortening, zip replacement — photo it, price it, and let our master tailors mend it.
              </p>
            </div>
            <button onClick={() => onNavigate("repairs")} className="text-xs font-semibold uppercase tracking-[0.15em] text-atelier-text hover:text-atelier-accent flex items-center space-x-1 mt-6 cursor-pointer">
              <span>Request a repair</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 5: Measurements */}
          <div className="bg-[#EFEBE5]/30 border border-atelier-border p-8 hover:bg-[#EFEBE5]/70 hover:shadow-lg transition-all duration-300 flex flex-col justify-between aspect-video">
            <div>
              <Ruler className="w-6 h-6 text-atelier-accent mb-6" />
              <h3 className="font-serif text-2xl mb-3">Measurements</h3>
              <p className="text-stone-500 text-sm leading-relaxed">
                AI-assisted measurements from your photos, plus manual entries for the purists.
              </p>
            </div>
            <button onClick={() => onNavigate("wardrobe")} className="text-xs font-semibold uppercase tracking-[0.15em] text-atelier-text hover:text-atelier-accent flex items-center space-x-1 mt-6 cursor-pointer">
              <span>Open your profile</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 6: Digital Wardrobe */}
          <div className="bg-[#EFEBE5]/30 border border-atelier-border p-8 hover:bg-[#EFEBE5]/70 hover:shadow-lg transition-all duration-300 flex flex-col justify-between aspect-video">
            <div>
              <Heart className="w-6 h-6 text-atelier-accent mb-6" />
              <h3 className="font-serif text-2xl mb-3">Digital Wardrobe</h3>
              <p className="text-stone-500 text-sm leading-relaxed">
                Every order, every measurement, every favorite style — kept secure in one quiet digital wardrobe.
              </p>
            </div>
            <button onClick={() => onNavigate("wardrobe")} className="text-xs font-semibold uppercase tracking-[0.15em] text-atelier-text hover:text-atelier-accent flex items-center space-x-1 mt-6 cursor-pointer">
              <span>View wardrobe</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* 3. FOUR STEPS PROCESS */}
      <section className="px-4 lg:px-12 py-16 lg:py-24 max-w-7xl mx-auto border-b border-atelier-border">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column */}
          <div className="lg:col-span-5 space-y-6">
            <span className="text-xs tracking-[0.25em] font-mono text-stone-400 uppercase block">THE TAILORPRO PROCESS</span>
            <h2 className="text-4xl lg:text-5xl font-serif leading-tight text-atelier-text">
              Four steps from photo <br />to finished piece.
            </h2>
            <p className="text-stone-600">
              Our AI handles the complex geometry; our master tailors handle the physical craft. You stay in control at every fitting.
            </p>
          </div>

          {/* Right Column - Step List */}
          <div className="lg:col-span-7 flex flex-col divide-y divide-atelier-border">
            {/* Step 1 */}
            <div className="py-6 first:pt-0 grid grid-cols-12 gap-4">
              <span className="col-span-2 font-serif text-2xl text-atelier-accent">01</span>
              <div className="col-span-10">
                <h4 className="font-serif text-lg font-medium mb-1">Capture</h4>
                <p className="text-stone-500 text-sm">Three photos: front, side, and full-length. The AI reads your proportions in seconds.</p>
              </div>
            </div>
            {/* Step 2 */}
            <div className="py-6 grid grid-cols-12 gap-4">
              <span className="col-span-2 font-serif text-2xl text-atelier-accent">02</span>
              <div className="col-span-10">
                <h4 className="font-serif text-lg font-medium mb-1">Compose</h4>
                <p className="text-stone-500 text-sm">Pick a silhouette, luxury fabric, and collar/lapel details — or let the AI fashion advisor suggest a cohesive look.</p>
              </div>
            </div>
            {/* Step 3 */}
            <div className="py-6 grid grid-cols-12 gap-4">
              <span className="col-span-2 font-serif text-2xl text-atelier-accent">03</span>
              <div className="col-span-10">
                <h4 className="font-serif text-lg font-medium mb-1">Confirm</h4>
                <p className="text-stone-500 text-sm">Review the rendered preview and estimated measurements. Pay a 50% deposit, installments, or full amount.</p>
              </div>
            </div>
            {/* Step 4 */}
            <div className="py-6 last:pb-0 grid grid-cols-12 gap-4">
              <span className="col-span-2 font-serif text-2xl text-atelier-accent">04</span>
              <div className="col-span-10">
                <h4 className="font-serif text-lg font-medium mb-1">Craft</h4>
                <p className="text-stone-500 text-sm">Hand-cut and stitched by an assigned master tailor. Track every milestone from fabric sourcing to courier delivery.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. THIS SEASON'S COMMISSIONS */}
      <section className="px-4 lg:px-12 py-16 lg:py-24 max-w-7xl mx-auto border-b border-atelier-border">
        <div className="flex justify-between items-end mb-12">
          <h2 className="text-4xl font-serif text-atelier-text">This season's commissions.</h2>
          <button onClick={() => onNavigate("shop")} className="text-xs uppercase tracking-[0.15em] font-semibold text-stone-500 hover:text-atelier-text cursor-pointer">
            See all
          </button>
        </div>

        {/* 3 Model Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-4">
            <div className="aspect-[3/4] overflow-hidden bg-stone-100 shadow-sm">
              <img
                src="https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&q=80&w=600"
                alt="Classic Blue Wool Suit tailored"
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
              />
            </div>
            <div className="flex justify-between items-baseline">
              <h4 className="font-serif text-lg font-medium">Midnight Wool Suit</h4>
              <span className="text-stone-400 text-xs font-mono">Commission #A-2841</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="aspect-[3/4] overflow-hidden bg-stone-100 shadow-sm">
              <img
                src="https://images.unsplash.com/photo-1544022613-e87ca75a784a?auto=format&fit=crop&q=80&w=600"
                alt="Sleek Long Camelhair Coat"
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
              />
            </div>
            <div className="flex justify-between items-baseline">
              <h4 className="font-serif text-lg font-medium">Bespoke Camelhair Overcoat</h4>
              <span className="text-stone-400 text-xs font-mono">Commission #A-1182</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="aspect-[3/4] overflow-hidden bg-stone-100 shadow-sm">
              <img
                src="https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=600"
                alt="Luxury Red Blazer on Model"
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
              />
            </div>
            <div className="flex justify-between items-baseline">
              <h4 className="font-serif text-lg font-medium">Crimson Silk Dinner Blazer</h4>
              <span className="text-stone-400 text-xs font-mono">Commission #A-9014</span>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CLOTH LIBRARY */}
      <section className="px-4 lg:px-12 py-16 lg:py-24 max-w-7xl mx-auto border-b border-atelier-border">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6">
            <div className="aspect-[4/3] overflow-hidden shadow-lg bg-stone-100">
              <img
                src="https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?auto=format&fit=crop&q=80&w=800"
                alt="Luxury textiles and folded wool fabrics"
                className="w-full h-full object-cover grayscale-10 hover:scale-105 transition-transform duration-700"
              />
            </div>
          </div>

          <div className="lg:col-span-6 space-y-6 lg:pl-6">
            <span className="text-xs tracking-[0.25em] font-mono text-stone-400 uppercase block">CLOTH LIBRARY</span>
            <h2 className="text-4xl lg:text-5xl font-serif leading-tight text-atelier-text">
              200+ cloths from <br />the world's finest mills.
            </h2>
            <p className="text-stone-600 leading-relaxed">
              Super 120s wool, Italian linen, Egyptian cotton, and silk blends — sourced and vetted, then matched to your climate and occasion by our AI fabric advisor.
            </p>
            <button
              onClick={() => onNavigate("custom-studio")}
              className="bg-atelier-text hover:bg-atelier-accent text-white text-xs font-semibold tracking-[0.2em] uppercase px-8 py-5 rounded-none flex items-center justify-center space-x-2 transition-all duration-300 cursor-pointer shadow-md"
            >
              <span>Start a custom order</span>
              <ArrowRight className="w-4 h-4 text-atelier-accent" />
            </button>
          </div>
        </div>
      </section>

      {/* 6. FEATURES ROW */}
      <section className="px-4 lg:px-12 py-12 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="flex items-start space-x-4">
          <ShieldCheck className="w-6 h-6 text-atelier-accent shrink-0 mt-0.5" />
          <div>
            <h4 className="font-serif text-lg font-medium mb-1">Perfect-fit guarantee</h4>
            <p className="text-stone-500 text-xs">Free alterations within 30 days of delivery. Absolute comfort assured.</p>
          </div>
        </div>

        <div className="flex items-start space-x-4 border-t md:border-t-0 md:border-l border-atelier-border pt-6 md:pt-0 md:pl-8">
          <Ruler className="w-6 h-6 text-atelier-accent shrink-0 mt-0.5" />
          <div>
            <h4 className="font-serif text-lg font-medium mb-1">Measurements on file</h4>
            <p className="text-stone-500 text-xs">Save once. Reorder forever, no further physical studio visit required.</p>
          </div>
        </div>

        <div className="flex items-start space-x-4 border-t md:border-t-0 md:border-l border-atelier-border pt-6 md:pt-0 md:pl-8">
          <Scissors className="w-6 h-6 text-atelier-accent shrink-0 mt-0.5" />
          <div>
            <h4 className="font-serif text-lg font-medium mb-1">Hand-finished</h4>
            <p className="text-stone-500 text-xs">Every single commission inspected and hand-pressed by a master tailor before shipping.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
