import React, { useState, useEffect } from "react";
import { Heart, Ruler, Sparkles, Loader2, MessageSquare, Check, ShieldCheck, ClipboardList } from "lucide-react";
import { WardrobeItem, Measurement } from "../types";

interface WardrobeViewProps {
  wardrobe: WardrobeItem[];
  measurements: Measurement;
  onUpdateMeasurements: (newMeas: Measurement) => void;
}

export default function WardrobeView({ wardrobe, measurements, onUpdateMeasurements }: WardrobeViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<"wardrobe" | "profile">("wardrobe");

  // Local measurement inputs
  const [chest, setChest] = useState(measurements.chest);
  const [waist, setWaist] = useState(measurements.waist);
  const [hips, setHips] = useState(measurements.hips);
  const [neck, setNeck] = useState(measurements.neck);
  const [sleeveLength, setSleeveLength] = useState(measurements.sleeveLength);
  const [inseam, setInseam] = useState(measurements.inseam);
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Synchronize local inputs with measurements prop (essential for account-switching database updates)
  useEffect(() => {
    setChest(measurements.chest);
    setWaist(measurements.waist);
    setHips(measurements.hips);
    setNeck(measurements.neck);
    setSleeveLength(measurements.sleeveLength);
    setInseam(measurements.inseam);
  }, [measurements]);

  // AI wardrobe matcher states
  const [selectedWardrobeItem, setSelectedWardrobeItem] = useState<WardrobeItem | null>(null);
  const [isMatchingLoading, setIsMatchingLoading] = useState(false);
  const [matchAdvice, setMatchAdvice] = useState<string | null>(null);

  const handleSaveProfile = () => {
    const updated: Measurement = {
      chest,
      waist,
      hips,
      neck,
      sleeveLength,
      inseam
    };
    onUpdateMeasurements(updated);
    setProfileSuccess(true);
    setTimeout(() => setProfileSuccess(false), 2000);
  };

  const requestMatchingAdvice = async (item: WardrobeItem) => {
    setSelectedWardrobeItem(item);
    setIsMatchingLoading(true);
    setMatchAdvice(null);

    try {
      const response = await fetch("/api/gemini/style-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `I have a custom garment in my digital wardrobe: "${item.name}" in a beautiful ${item.color} shade, made of ${item.fabric || "fine textile"}. 
Please recommend three perfect matching coordinates (e.g. exact shirt collar style, tie color/texture, leather shoe type, pocket square pattern) to pair with this item for an upscale occasion. Speak in the voice of an elite Savile Row style advisor, keep it scannable with brief bullet points.`,
          history: []
        })
      });

      const data = await response.json();
      setMatchAdvice(data.text || "Pair this item with fresh silk accessories and Oxford footwear.");
    } catch (err) {
      console.error(err);
      setMatchAdvice("Our master style consultants recommend contrasting crisp cotton shirts, burgundy silk ties, and dark brown calfskin loafers.");
    } finally {
      setIsMatchingLoading(false);
    }
  };

  return (
    <div className="bg-atelier-bg min-h-screen py-12 px-4 lg:px-12 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="border-b border-atelier-border pb-8 mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-xs tracking-[0.25em] font-mono text-stone-400 uppercase">MODULE 3 & 8</span>
          <h1 className="text-4xl lg:text-5xl font-serif text-atelier-text mt-2">Private Wardrobe & Fitting Profile</h1>
          <p className="text-stone-600 text-sm mt-3 max-w-2xl">
            Manage your saved physical dimensions on file and explore your digital clothing closet, complete with smart coordinate matching algorithms.
          </p>
        </div>

        {/* Sub Navigation */}
        <div className="flex border border-atelier-border bg-white p-1">
          <button
            onClick={() => setActiveSubTab("wardrobe")}
            className={`px-4 py-2 text-xs font-mono uppercase tracking-[0.15em] transition-all duration-300 cursor-pointer ${
              activeSubTab === "wardrobe" ? "bg-atelier-text text-white" : "text-stone-600 hover:text-atelier-accent"
            }`}
          >
            Digital Closet
          </button>
          <button
            onClick={() => setActiveSubTab("profile")}
            className={`px-4 py-2 text-xs font-mono uppercase tracking-[0.15em] transition-all duration-300 cursor-pointer ${
              activeSubTab === "profile" ? "bg-atelier-text text-white" : "text-stone-600 hover:text-atelier-accent"
            }`}
          >
            Sartorial Dimensions
          </button>
        </div>
      </div>

      {activeSubTab === "wardrobe" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Closet Grid */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white border border-atelier-border p-6 shadow-sm">
              <h3 className="font-serif text-xl font-medium text-stone-800 border-b border-stone-200 pb-3 mb-6">
                Your Digital Closet
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {wardrobe.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => requestMatchingAdvice(item)}
                    className={`p-4 border transition-all duration-300 cursor-pointer flex space-x-4 items-center ${
                      selectedWardrobeItem?.id === item.id
                        ? "border-atelier-accent bg-atelier-accent/5 shadow-sm"
                        : "border-atelier-border hover:border-atelier-accent bg-stone-50"
                    }`}
                  >
                    <div className="w-16 h-20 bg-stone-100 overflow-hidden border">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <span className="block text-[8px] font-mono text-stone-400 uppercase">
                        {item.type.toUpperCase()} · {item.category.toUpperCase()}
                      </span>
                      <h4 className="font-serif text-sm font-bold text-stone-800 truncate">{item.name}</h4>
                      <p className="text-[10px] text-stone-500 truncate">{item.color} · {item.fabric || "Textile"}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Closet Matching Sidepanel */}
          <div className="lg:col-span-5">
            <div className="bg-white border border-atelier-border p-6 shadow-sm min-h-[300px] flex flex-col justify-between">
              {isMatchingLoading ? (
                <div className="flex-1 flex flex-col items-center justify-center py-20 space-y-4">
                  <Loader2 className="w-8 h-8 text-atelier-accent animate-spin" />
                  <p className="text-xs text-atelier-accent font-mono uppercase tracking-widest animate-pulse">Consulting style catalogs...</p>
                </div>
              ) : matchAdvice ? (
                <div className="space-y-6">
                  {/* Header info */}
                  <div className="border-b border-stone-200 pb-4">
                    <div className="flex items-center space-x-2">
                      <Sparkles className="w-4 h-4 text-atelier-accent" />
                      <span className="text-[10px] font-mono uppercase tracking-widest text-stone-400">COORDINATION ASSISTANT</span>
                    </div>
                    <h3 className="font-serif text-xl font-medium text-stone-800 mt-1">
                      Bespoke Styling: "{selectedWardrobeItem?.name}"
                    </h3>
                  </div>

                  {/* Advice body */}
                  <div className="text-stone-600 text-xs leading-relaxed whitespace-pre-line border-l-2 border-atelier-accent pl-4 italic">
                    {matchAdvice}
                  </div>

                  {/* Actions */}
                  <div className="pt-4 border-t border-stone-100 flex justify-end">
                    <button
                      onClick={() => setMatchAdvice(null)}
                      className="text-[10px] uppercase font-mono tracking-wider text-stone-400 hover:text-stone-800"
                    >
                      Dismiss Advice
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center text-stone-400 py-16">
                  <Sparkles className="w-10 h-10 text-stone-300 stroke-[1.2] mb-3" />
                  <h4 className="font-serif text-lg font-medium">Bespoke Coordination Advisor</h4>
                  <p className="text-xs max-w-xs leading-relaxed mt-2">
                    Click any garment in your digital closet on the left panel to trigger the AI Stylist. The model recommends matching ties, leather footwear, pocket squares, and shirts.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Sartorial Dimensions form panel */
        <div className="max-w-3xl mx-auto bg-white border border-atelier-border p-8 shadow-sm space-y-6">
          <div className="border-b border-atelier-border pb-3 flex justify-between items-baseline">
            <h3 className="font-serif text-2xl font-semibold text-stone-800">Your Registered Fitting Metrics</h3>
            <span className="text-xs font-mono text-stone-400 uppercase">VALUES IN INCHES (IN)</span>
          </div>

          <p className="text-xs text-stone-500 leading-normal">
            These values represent your master bespoke tailoring measurements. They are saved on file to enable instant custom one-click orders for future suits, coats, and accessories.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
            <div>
              <label className="block text-[10px] font-mono text-stone-400 mb-1.5 uppercase">CHEST WIDTH</label>
              <input
                type="number"
                value={chest}
                onChange={(e) => setChest(parseFloat(e.target.value) || 0)}
                className="w-full border border-stone-200 p-2 text-sm focus:outline-none focus:border-atelier-accent font-mono bg-atelier-bg text-center"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono text-stone-400 mb-1.5 uppercase">WAIST CIRCUMFERENCE</label>
              <input
                type="number"
                value={waist}
                onChange={(e) => setWaist(parseFloat(e.target.value) || 0)}
                className="w-full border border-stone-200 p-2 text-sm focus:outline-none focus:border-atelier-accent font-mono bg-atelier-bg text-center"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono text-stone-400 mb-1.5 uppercase">HIPS CIRCUMFERENCE</label>
              <input
                type="number"
                value={hips}
                onChange={(e) => setHips(parseFloat(e.target.value) || 0)}
                className="w-full border border-stone-200 p-2 text-sm focus:outline-none focus:border-atelier-accent font-mono bg-atelier-bg text-center"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono text-stone-400 mb-1.5 uppercase">NECK / COLLAR BAND</label>
              <input
                type="number"
                step="0.5"
                value={neck}
                onChange={(e) => setNeck(parseFloat(e.target.value) || 0)}
                className="w-full border border-stone-200 p-2 text-sm focus:outline-none focus:border-atelier-accent font-mono bg-atelier-bg text-center"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono text-stone-400 mb-1.5 uppercase">SLEEVE OUTSEAM</label>
              <input
                type="number"
                value={sleeveLength}
                onChange={(e) => setSleeveLength(parseFloat(e.target.value) || 0)}
                className="w-full border border-stone-200 p-2 text-sm focus:outline-none focus:border-atelier-accent font-mono bg-atelier-bg text-center"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono text-stone-400 mb-1.5 uppercase">PANTS INSEAM</label>
              <input
                type="number"
                value={inseam}
                onChange={(e) => setInseam(parseFloat(e.target.value) || 0)}
                className="w-full border border-stone-200 p-2 text-sm focus:outline-none focus:border-atelier-accent font-mono bg-atelier-bg text-center"
              />
            </div>
          </div>

          {/* Feedback & Actions */}
          <div className="pt-6 border-t border-stone-200 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs text-stone-400">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Biometric parameters secure.</span>
            </div>

            <div className="flex items-center space-x-3">
              {profileSuccess && (
                <span className="text-xs text-emerald-600 font-mono flex items-center space-x-1 animate-fade-in">
                  <Check className="w-3 h-3" />
                  <span>Profile updated</span>
                </span>
              )}
              <button
                onClick={handleSaveProfile}
                className="bg-atelier-text hover:bg-atelier-accent text-white font-semibold text-xs py-3 px-6 uppercase tracking-[0.15em] rounded-none cursor-pointer shadow-md transition-all duration-300"
              >
                Save Dimensions on File
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
