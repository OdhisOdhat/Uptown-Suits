import React, { useState, useEffect } from "react";
import { Sparkles, ArrowRight, Loader2, Info, Coins, ShieldCheck, CheckCircle2, MessageSquare } from "lucide-react";
import { FABRICS, COLORS, PATTERNS, COLLARS_LAPELS, CUFFS, POCKETS, INITIAL_MEASUREMENTS } from "../data";
import { CustomDesignSpec, Measurement } from "../types";

interface CustomOrderViewProps {
  initialDesign?: Partial<CustomDesignSpec>;
  initialMeasurements?: Partial<Measurement>;
  onSubmitOrder: (customDetails: CustomDesignSpec, measurements: Measurement, paymentTerm: string, totalPrice: number) => void;
}

export default function CustomOrderView({ initialDesign, initialMeasurements, onSubmitOrder }: CustomOrderViewProps) {
  // Configurator States
  const [category, setCategory] = useState<any>(initialDesign?.category || "suit");
  const [selectedFabric, setSelectedFabric] = useState(initialDesign?.fabric || FABRICS[0].name);
  const [selectedColor, setSelectedColor] = useState(initialDesign?.color || COLORS[0].name);
  const [selectedPattern, setSelectedPattern] = useState(initialDesign?.pattern || PATTERNS[0].name);
  const [selectedLapel, setSelectedLapel] = useState(initialDesign?.lapelStyle || COLLARS_LAPELS[0].name);
  const [selectedCuff, setSelectedCuff] = useState(initialDesign?.cuffsStyle || CUFFS[0].name);
  const [selectedPocket, setSelectedPocket] = useState(initialDesign?.pocketsStyle || POCKETS[0].name);
  
  // Custom Bespoke Shoe & Accessory States
  const [shoeSize, setShoeSize] = useState<string>(initialDesign?.shoeSize || "9.5");
  const [shoeType, setShoeType] = useState<string>(initialDesign?.shoeType || "Wholecut Oxford");
  const [leatherType, setLeatherType] = useState<string>(initialDesign?.leatherType || "Full-grain Italian Calfskin");
  const [accessoryType, setAccessoryType] = useState<string>(initialDesign?.accessoryType || "7-Fold Silk Necktie");
  
  // Custom Prompts & AI Assistance States
  const [aiPrompt, setAiPrompt] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiSpec, setAiSpec] = useState<any>(null);

  // Measurement States (initialize with AI finder estimates or defaults)
  const [chest, setChest] = useState<number>(initialMeasurements?.chest || INITIAL_MEASUREMENTS.chest);
  const [waist, setWaist] = useState<number>(initialMeasurements?.waist || INITIAL_MEASUREMENTS.waist);
  const [hips, setHips] = useState<number>(initialMeasurements?.hips || INITIAL_MEASUREMENTS.hips);
  const [neck, setNeck] = useState<number>(initialMeasurements?.neck || INITIAL_MEASUREMENTS.neck);
  const [sleeveLength, setSleeveLength] = useState<number>(initialMeasurements?.sleeveLength || INITIAL_MEASUREMENTS.sleeveLength);
  const [inseam, setInseam] = useState<number>(initialMeasurements?.inseam || INITIAL_MEASUREMENTS.inseam);

  // Workflow states
  const [paymentTerm, setPaymentTerm] = useState("deposit"); // deposit, installments, full
  const [isOrdering, setIsOrdering] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(false);

  // Update when initial values change
  useEffect(() => {
    if (initialDesign) {
      if (initialDesign.category) setCategory(initialDesign.category);
      if (initialDesign.fabric) setSelectedFabric(initialDesign.fabric);
      if (initialDesign.color) setSelectedColor(initialDesign.color);
      if (initialDesign.pattern) setSelectedPattern(initialDesign.pattern);
      if (initialDesign.lapelStyle) setSelectedLapel(initialDesign.lapelStyle);
      if (initialDesign.pocketsStyle) setSelectedPocket(initialDesign.pocketsStyle);
      if (initialDesign.cuffsStyle) setSelectedCuff(initialDesign.cuffsStyle);
      if (initialDesign.shoeSize) setShoeSize(initialDesign.shoeSize);
      if (initialDesign.shoeType) setShoeType(initialDesign.shoeType);
      if (initialDesign.leatherType) setLeatherType(initialDesign.leatherType);
      if (initialDesign.accessoryType) setAccessoryType(initialDesign.accessoryType);
    }
    if (initialMeasurements) {
      if (initialMeasurements.chest) setChest(initialMeasurements.chest);
      if (initialMeasurements.waist) setWaist(initialMeasurements.waist);
      if (initialMeasurements.hips) setHips(initialMeasurements.hips);
      if (initialMeasurements.neck) setNeck(initialMeasurements.neck);
      if (initialMeasurements.sleeveLength) setSleeveLength(initialMeasurements.sleeveLength);
      if (initialMeasurements.inseam) setInseam(initialMeasurements.inseam);
    }
  }, [initialDesign, initialMeasurements]);

  const activeColorHex = COLORS.find((c) => c.name === selectedColor)?.hex || COLORS[0].hex;

  // Ask AI Senior Designer to write luxury spec
  const generateAiDesignSpec = async () => {
    setIsAiLoading(true);
    setAiSpec(null);
    try {
      const response = await fetch("/api/gemini/design-spec", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          fabric: category === "shoes" ? leatherType : category === "accessories" ? accessoryType : selectedFabric,
          color: selectedColor,
          pattern: category === "shoes" || category === "accessories" ? "Premium solid" : selectedPattern,
          collar: selectedLapel,
          cuffs: selectedCuff,
          pockets: selectedPocket,
          shoeSize,
          shoeType,
          leatherType,
          accessoryType,
          prompt: aiPrompt
        })
      });
      const data = await response.json();
      setAiSpec(data);
      if (data.designName) {
        setAiPrompt("");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAiLoading(false);
    }
  };

  const getPrice = () => {
    let base = 850;
    if (category === "shirt") base = 180;
    if (category === "trousers") base = 250;
    if (category === "jacket") base = 590;
    if (category === "dress") base = 750;
    if (category === "shoes") {
      base = 380;
      if (leatherType.includes("Alligator") || leatherType.includes("Shell Cordovan")) {
        base += 240;
      } else if (leatherType.includes("Patina")) {
        base += 100;
      }
      return base;
    }
    if (category === "accessories") {
      base = 95;
      if (accessoryType.includes("7-Fold") || accessoryType.includes("Silver")) {
        base += 60;
      }
      return base;
    }

    // premium fabric markup
    if (selectedFabric.includes("Cashmere")) base += 250;
    if (selectedFabric.includes("Brocade")) base += 100;
    if (selectedFabric.includes("Silk")) base += 150;

    return base;
  };

  const totalPrice = getPrice();

  const handlePlaceOrder = () => {
    setIsOrdering(true);
    setTimeout(() => {
      const spec: CustomDesignSpec = {
        category,
        fabric: category === "shoes" ? leatherType : category === "accessories" ? accessoryType : selectedFabric,
        color: selectedColor,
        pattern: category === "shoes" || category === "accessories" ? "Premium solid" : selectedPattern,
        collarStyle: category === "shirt" ? selectedLapel : undefined,
        lapelStyle: (category !== "shirt" && category !== "shoes" && category !== "accessories") ? selectedLapel : undefined,
        cuffsStyle: (category !== "shoes" && category !== "accessories") ? selectedCuff : undefined,
        pocketsStyle: (category !== "shoes" && category !== "accessories") ? selectedPocket : undefined,
        shoeSize: category === "shoes" ? shoeSize : undefined,
        shoeType: category === "shoes" ? shoeType : undefined,
        leatherType: category === "shoes" ? leatherType : undefined,
        accessoryType: category === "accessories" ? accessoryType : undefined,
        designName: aiSpec?.designName || `Custom Bespoke ${category.charAt(0).toUpperCase() + category.slice(1)}`
      };

      const measurements: Measurement = {
        chest,
        waist,
        hips,
        neck,
        sleeveLength,
        inseam
      };

      onSubmitOrder(spec, measurements, paymentTerm, totalPrice);
      setIsOrdering(false);
      setOrderConfirmed(true);
    }, 2000);
  };

  return (
    <div className="bg-atelier-bg min-h-screen py-12 px-4 lg:px-12 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="border-b border-atelier-border pb-8 mb-10">
        <span className="text-xs tracking-[0.25em] font-mono text-stone-400 uppercase">MODULE 2, 4 & 10</span>
        <h1 className="text-4xl lg:text-5xl font-serif text-atelier-text mt-2">Virtual Design Studio & Custom Order</h1>
        <p className="text-stone-600 text-sm mt-3 max-w-3xl">
          Craft your own bespoke suit, tuxedo, formal gown, or shirt. Select from premium fabrics, personalize components, and provide measurements. Our AI integrates with master tailors to execute your exact specifications.
        </p>
      </div>

      {orderConfirmed ? (
        <div className="max-w-2xl mx-auto bg-white border border-atelier-border p-12 text-center space-y-6 shadow-sm">
          <CheckCircle2 className="w-16 h-16 text-emerald-600 mx-auto stroke-[1.2]" />
          <h2 className="font-serif text-3xl font-semibold">Your Tailoring Commission is Accepted</h2>
          <p className="text-stone-600 text-sm leading-relaxed max-w-md mx-auto">
            Thank you for ordering. Your customized garment has entered our master tailoring production queue. 
            An assigned cutter will verify your measurements shortly.
          </p>
          <div className="bg-atelier-bg p-4 text-left border border-stone-200 divide-y divide-stone-200">
            <div className="flex justify-between py-2 text-xs font-mono">
              <span className="text-stone-400 uppercase">ORDER ID</span>
              <span className="font-bold text-stone-800">A-{Math.floor(Math.random() * 9000 + 1000)}</span>
            </div>
            <div className="flex justify-between py-2 text-xs font-mono">
              <span className="text-stone-400 uppercase">GARMENT SPEC</span>
              <span className="font-bold text-stone-800">{selectedColor} {selectedFabric} {category}</span>
            </div>
            <div className="flex justify-between py-2 text-xs font-mono">
              <span className="text-stone-400 uppercase">PAYMENT OPTION</span>
              <span className="font-bold text-atelier-accent uppercase">{paymentTerm}</span>
            </div>
            <div className="flex justify-between py-2 text-xs font-mono">
              <span className="text-stone-400 uppercase">TOTAL PRICE</span>
              <span className="font-bold text-stone-800">${totalPrice}</span>
            </div>
          </div>
          <button
            onClick={() => setOrderConfirmed(false)}
            className="inline-block bg-atelier-text hover:bg-atelier-accent text-white font-semibold text-xs uppercase tracking-[0.2em] px-8 py-4 rounded-none cursor-pointer transition-all duration-300"
          >
            Design Another Piece
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Interactive SVG CAD Renderer & AI Advisor */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white border border-atelier-border p-6 shadow-sm">
              <h3 className="font-serif text-sm font-semibold text-stone-400 mb-4 uppercase tracking-[0.2em] text-center">Live CAD Draft Preview</h3>

              {/* Vector SVG Suit Renderer */}
              <div className="relative aspect-square w-full max-w-sm mx-auto bg-atelier-bg border border-stone-200 flex items-center justify-center p-4">
                <svg
                  viewBox="0 0 200 200"
                  className="w-full h-full text-stone-800"
                  style={{ filter: "drop-shadow(0px 10px 15px rgba(0,0,0,0.1))" }}
                >
                  {/* Subtle chalk/grid lines behind */}
                  <line x1="100" y1="10" x2="100" y2="190" stroke="#E2DFD9" strokeWidth="0.5" strokeDasharray="2,2" />
                  <line x1="10" y1="100" x2="190" y2="100" stroke="#E2DFD9" strokeWidth="0.5" strokeDasharray="2,2" />
                  <circle cx="100" cy="100" r="80" stroke="#E2DFD9" strokeWidth="0.5" fill="none" strokeDasharray="4,4" />

                  {/* 1. SUIT CATEGORY RENDERING */}
                  {category === "suit" && (
                    <>
                      {/* Suit Outline Body */}
                      <path
                        d="M 50,40 L 150,40 L 165,100 L 155,170 L 45,170 L 35,100 Z"
                        fill={activeColorHex}
                        stroke="#1A1A1A"
                        strokeWidth="1.5"
                      />

                      {/* Stripes Pattern overlay if selected */}
                      {selectedPattern === "Chalkstripe" && (
                        <g opacity="0.15" stroke="#F8FAFC" strokeWidth="0.75">
                          <line x1="45" y1="40" x2="45" y2="170" />
                          <line x1="60" y1="40" x2="60" y2="170" />
                          <line x1="75" y1="40" x2="75" y2="170" />
                          <line x1="90" y1="40" x2="90" y2="170" />
                          <line x1="105" y1="40" x2="105" y2="170" />
                          <line x1="120" y1="40" x2="120" y2="170" />
                          <line x1="135" y1="40" x2="135" y2="170" />
                          <line x1="150" y1="40" x2="150" y2="170" />
                        </g>
                      )}

                      {/* Prince of Wales Check Pattern overlay if selected */}
                      {selectedPattern === "Prince of Wales Check" && (
                        <g opacity="0.1" stroke="#FAF8F5" strokeWidth="0.5">
                          <line x1="55" y1="40" x2="55" y2="170" />
                          <line x1="75" y1="40" x2="75" y2="170" />
                          <line x1="95" y1="40" x2="95" y2="170" />
                          <line x1="115" y1="40" x2="115" y2="170" />
                          <line x1="135" y1="40" x2="135" y2="170" />
                          <line x1="35" y1="60" x2="165" y2="60" />
                          <line x1="35" y1="80" x2="165" y2="80" />
                          <line x1="35" y1="100" x2="165" y2="100" />
                          <line x1="35" y1="120" x2="165" y2="120" />
                          <line x1="35" y1="140" x2="165" y2="140" />
                        </g>
                      )}

                      {/* Traditional Brocade Pattern overlay if selected */}
                      {selectedPattern === "Traditional Brocade" && (
                        <g opacity="0.2" stroke="#E2B070" strokeWidth="0.75" fill="none">
                          <path d="M 50,60 Q 60,50 70,60 T 90,60" />
                          <path d="M 110,60 Q 120,50 130,60 T 150,60" />
                          <path d="M 50,110 Q 60,100 70,110 T 90,110" />
                          <path d="M 110,110 Q 120,100 130,110 T 150,110" />
                        </g>
                      )}

                      {/* Inner Shirt V-neck opening */}
                      <path d="M 85,40 L 100,75 L 115,40 Z" fill="#F8FAFC" stroke="#1A1A1A" strokeWidth="1" />
                      
                      {/* Red/Dark Silk Tie */}
                      <path d="M 97,45 L 103,45 L 105,75 L 100,82 L 95,75 Z" fill="#7F1D1D" stroke="#1A1A1A" strokeWidth="0.5" />
                      
                      {/* Waistcoat Layer inside (three-piece suit) */}
                      <path d="M 85,75 L 100,88 L 115,75 L 115,120 L 100,132 L 85,120 Z" fill={selectedColor === "Sartorial Black" ? "#334155" : "#0F172A"} stroke="#1A1A1A" strokeWidth="1" opacity="0.9" />
                      <circle cx="100" cy="95" r="1.5" fill="#FAF8F5" />
                      <circle cx="100" cy="105" r="1.5" fill="#FAF8F5" />
                      <circle cx="100" cy="115" r="1.5" fill="#FAF8F5" />

                      {/* Suit center closure crease */}
                      <line x1="100" y1="132" x2="100" y2="170" stroke="#1A1A1A" strokeWidth="1.25" />

                      {/* Neck / Collar stand */}
                      <path d="M 80,40 C 80,30 120,30 120,40" fill="none" stroke="#1A1A1A" strokeWidth="1.5" />

                      {/* Lapels (Peak vs Notch vs Shawl) */}
                      {selectedLapel.includes("Peak") ? (
                        <>
                          <path d="M 85,40 L 65,70 L 80,72 L 100,105 Z" fill={activeColorHex} stroke="#1A1A1A" strokeWidth="1.25" />
                          <path d="M 115,40 L 135,70 L 120,72 L 100,105 Z" fill={activeColorHex} stroke="#1A1A1A" strokeWidth="1.25" />
                        </>
                      ) : selectedLapel.includes("Shawl") ? (
                        <path d="M 85,40 C 70,60 75,90 100,105 L 100,105 C 125,90 130,60 115,40 Z" fill="none" stroke="#1A1A1A" strokeWidth="2" />
                      ) : (
                        <>
                          <path d="M 85,40 L 70,68 L 73,74 L 100,105 Z" fill={activeColorHex} stroke="#1A1A1A" strokeWidth="1.25" />
                          <path d="M 115,40 L 130,68 L 127,74 L 100,105 Z" fill={activeColorHex} stroke="#1A1A1A" strokeWidth="1.25" />
                        </>
                      )}

                      {/* Buttons on suit closure */}
                      <circle cx="100" cy="115" r="2.5" fill="#C5A059" stroke="#1A1A1A" strokeWidth="0.5" />
                      <circle cx="100" cy="130" r="2.5" fill="#C5A059" stroke="#1A1A1A" strokeWidth="0.5" />

                      {/* Pockets (Patch vs Jetted vs Flapped) */}
                      {selectedPocket.includes("Patch") ? (
                        <>
                          <path d="M 50,130 L 68,130 L 68,148 C 68,152 50,152 50,148 Z" fill={activeColorHex} stroke="#1A1A1A" strokeWidth="1" />
                          <path d="M 132,130 L 150,130 L 150,148 C 150,152 132,152 132,148 Z" fill={activeColorHex} stroke="#1A1A1A" strokeWidth="1" />
                        </>
                      ) : (
                        <>
                          <rect x="48" y="132" width="22" height="6" fill={activeColorHex} stroke="#1A1A1A" strokeWidth="1" rx="0.5" />
                          <rect x="130" y="132" width="22" height="6" fill={activeColorHex} stroke="#1A1A1A" strokeWidth="1" rx="0.5" />
                          {selectedPocket.includes("Ticket") && (
                            <rect x="132" y="123" width="18" height="4" fill={activeColorHex} stroke="#1A1A1A" strokeWidth="0.75" rx="0.25" />
                          )}
                        </>
                      )}

                      {/* Breast pocket */}
                      <line x1="55" y1="80" x2="72" y2="76" stroke="#1A1A1A" strokeWidth="1.5" />
                    </>
                  )}

                  {/* 2. JACKET (BLAZER) RENDERING */}
                  {category === "jacket" && (
                    <>
                      {/* Jacket Outline Body */}
                      <path
                        d="M 50,40 L 150,40 L 165,100 L 155,170 L 45,170 L 35,100 Z"
                        fill={activeColorHex}
                        stroke="#1A1A1A"
                        strokeWidth="1.5"
                      />

                      {/* Stripes Pattern overlay if selected */}
                      {selectedPattern === "Chalkstripe" && (
                        <g opacity="0.15" stroke="#F8FAFC" strokeWidth="0.75">
                          <line x1="45" y1="40" x2="45" y2="170" />
                          <line x1="60" y1="40" x2="60" y2="170" />
                          <line x1="75" y1="40" x2="75" y2="170" />
                          <line x1="90" y1="40" x2="90" y2="170" />
                          <line x1="105" y1="40" x2="105" y2="170" />
                          <line x1="120" y1="40" x2="120" y2="170" />
                          <line x1="135" y1="40" x2="135" y2="170" />
                          <line x1="150" y1="40" x2="150" y2="170" />
                        </g>
                      )}

                      {/* Prince of Wales Check Pattern overlay if selected */}
                      {selectedPattern === "Prince of Wales Check" && (
                        <g opacity="0.1" stroke="#FAF8F5" strokeWidth="0.5">
                          <line x1="55" y1="40" x2="55" y2="170" />
                          <line x1="75" y1="40" x2="75" y2="170" />
                          <line x1="95" y1="40" x2="95" y2="170" />
                          <line x1="115" y1="40" x2="115" y2="170" />
                          <line x1="135" y1="40" x2="135" y2="170" />
                          <line x1="35" y1="60" x2="165" y2="60" />
                          <line x1="35" y1="80" x2="165" y2="80" />
                          <line x1="35" y1="100" x2="165" y2="100" />
                          <line x1="35" y1="120" x2="165" y2="120" />
                          <line x1="35" y1="140" x2="165" y2="140" />
                        </g>
                      )}

                      {/* Traditional Brocade Pattern overlay if selected */}
                      {selectedPattern === "Traditional Brocade" && (
                        <g opacity="0.2" stroke="#E2B070" strokeWidth="0.75" fill="none">
                          <path d="M 50,60 Q 60,50 70,60 T 90,60" />
                          <path d="M 110,60 Q 120,50 130,60 T 150,60" />
                        </g>
                      )}

                      {/* Inner Shirt V-neck opening (Deep elegant open look) */}
                      <path d="M 85,40 L 100,85 L 115,40 Z" fill="#F8FAFC" stroke="#1A1A1A" strokeWidth="1" />
                      <line x1="100" y1="85" x2="100" y2="170" stroke="#1A1A1A" strokeWidth="1.25" />

                      {/* Neck / Collar stand */}
                      <path d="M 80,40 C 80,30 120,30 120,40" fill="none" stroke="#1A1A1A" strokeWidth="1.5" />

                      {/* Lapels (Peak vs Notch vs Shawl) */}
                      {selectedLapel.includes("Peak") ? (
                        <>
                          <path d="M 85,40 L 65,70 L 80,72 L 100,105 Z" fill={activeColorHex} stroke="#1A1A1A" strokeWidth="1.25" />
                          <path d="M 115,40 L 135,70 L 120,72 L 100,105 Z" fill={activeColorHex} stroke="#1A1A1A" strokeWidth="1.25" />
                        </>
                      ) : selectedLapel.includes("Shawl") ? (
                        <path d="M 85,40 C 70,60 75,90 100,105 L 100,105 C 125,90 130,60 115,40 Z" fill="none" stroke="#1A1A1A" strokeWidth="2" />
                      ) : (
                        <>
                          <path d="M 85,40 L 70,68 L 73,74 L 100,105 Z" fill={activeColorHex} stroke="#1A1A1A" strokeWidth="1.25" />
                          <path d="M 115,40 L 130,68 L 127,74 L 100,105 Z" fill={activeColorHex} stroke="#1A1A1A" strokeWidth="1.25" />
                        </>
                      )}

                      {/* Horn buttons for casual blazer feel */}
                      <circle cx="100" cy="115" r="3" fill="#8B5A2B" stroke="#1A1A1A" strokeWidth="0.5" />
                      <circle cx="100" cy="132" r="3" fill="#8B5A2B" stroke="#1A1A1A" strokeWidth="0.5" />

                      {/* Pockets (Patch vs Jetted vs Flapped) */}
                      {selectedPocket.includes("Patch") ? (
                        <>
                          <path d="M 50,130 L 68,130 L 68,148 C 68,152 50,152 50,148 Z" fill={activeColorHex} stroke="#1A1A1A" strokeWidth="1" />
                          <path d="M 132,130 L 150,130 L 150,148 C 150,152 132,152 132,148 Z" fill={activeColorHex} stroke="#1A1A1A" strokeWidth="1" />
                        </>
                      ) : (
                        <>
                          <rect x="48" y="132" width="22" height="6" fill={activeColorHex} stroke="#1A1A1A" strokeWidth="1" rx="0.5" />
                          <rect x="130" y="132" width="22" height="6" fill={activeColorHex} stroke="#1A1A1A" strokeWidth="1" rx="0.5" />
                          {selectedPocket.includes("Ticket") && (
                            <rect x="132" y="123" width="18" height="4" fill={activeColorHex} stroke="#1A1A1A" strokeWidth="0.75" rx="0.25" />
                          )}
                        </>
                      )}

                      {/* Breast pocket */}
                      <line x1="55" y1="80" x2="72" y2="76" stroke="#1A1A1A" strokeWidth="1.5" />
                    </>
                  )}

                  {/* 3. CRISP CUSTOM SHIRT RENDERING */}
                  {category === "shirt" && (
                    <>
                      {/* Shirt Body Outline */}
                      <path
                        d="M 55,40 L 145,40 L 152,90 L 142,170 L 58,170 L 48,90 Z"
                        fill={activeColorHex}
                        stroke="#1A1A1A"
                        strokeWidth="1.5"
                      />

                      {/* Chalkstripe translates to fine shirt pinstripes */}
                      {selectedPattern === "Chalkstripe" && (
                        <g opacity="0.12" stroke="#475569" strokeWidth="0.5">
                          <line x1="55" y1="40" x2="58" y2="170" />
                          <line x1="70" y1="40" x2="72" y2="170" />
                          <line x1="85" y1="40" x2="86" y2="170" />
                          <line x1="100" y1="40" x2="100" y2="170" />
                          <line x1="115" y1="40" x2="114" y2="170" />
                          <line x1="130" y1="40" x2="128" y2="170" />
                          <line x1="145" y1="40" x2="142" y2="170" />
                        </g>
                      )}

                      {/* Checkered pattern overlay for shirt */}
                      {selectedPattern === "Prince of Wales Check" && (
                        <g opacity="0.1" stroke="#475569" strokeWidth="0.5">
                          <line x1="60" y1="40" x2="60" y2="170" />
                          <line x1="80" y1="40" x2="80" y2="170" />
                          <line x1="100" y1="40" x2="100" y2="170" />
                          <line x1="120" y1="40" x2="120" y2="170" />
                          <line x1="140" y1="40" x2="140" y2="170" />
                          <line x1="50" y1="60" x2="150" y2="60" />
                          <line x1="50" y1="90" x2="150" y2="90" />
                          <line x1="50" y1="120" x2="150" y2="120" />
                          <line x1="50" y1="150" x2="150" y2="150" />
                        </g>
                      )}

                      {/* Shirt Placket (Central fold) */}
                      <rect x="96" y="48" width="8" height="122" fill={activeColorHex} stroke="#1A1A1A" strokeWidth="0.75" />
                      
                      {/* Shirt buttons down the front */}
                      <circle cx="100" cy="65" r="1.75" fill="#FFFFFF" stroke="#64748B" strokeWidth="0.5" />
                      <circle cx="100" cy="85" r="1.75" fill="#FFFFFF" stroke="#64748B" strokeWidth="0.5" />
                      <circle cx="100" cy="105" r="1.75" fill="#FFFFFF" stroke="#64748B" strokeWidth="0.5" />
                      <circle cx="100" cy="125" r="1.75" fill="#FFFFFF" stroke="#64748B" strokeWidth="0.5" />
                      <circle cx="100" cy="145" r="1.75" fill="#FFFFFF" stroke="#64748B" strokeWidth="0.5" />

                      {/* Elegant spread / Mandarin Collar fold */}
                      {selectedLapel.includes("Mandarin") || selectedLapel.includes("Nehru") ? (
                        /* Mandarin stand */
                        <path d="M 82,41 C 82,34 118,34 118,41 Z" fill={activeColorHex} stroke="#1A1A1A" strokeWidth="1.25" />
                      ) : (
                        /* Traditional shirt collar wings folded over */
                        <>
                          <path d="M 80,40 L 100,55 L 90,40 Z" fill={activeColorHex} stroke="#1A1A1A" strokeWidth="1" />
                          <path d="M 120,40 L 100,55 L 110,40 Z" fill={activeColorHex} stroke="#1A1A1A" strokeWidth="1" />
                        </>
                      )}

                      {/* Left Breast Pocket */}
                      <path d="M 62,75 L 78,75 L 78,92 L 70,98 L 62,92 Z" fill={activeColorHex} stroke="#1A1A1A" strokeWidth="0.75" />
                      <line x1="62" y1="75" x2="78" y2="75" stroke="#1A1A1A" strokeWidth="1.25" />
                    </>
                  )}

                  {/* 4. VICTORIA TUXEDO DRESS RENDERING */}
                  {category === "dress" && (
                    <>
                      {/* Dress Gown Silhouette with elegant flare */}
                      <path
                        d="M 60,40 L 140,40 L 145,90 L 125,115 L 155,180 L 45,180 L 75,115 L 55,90 Z"
                        fill={activeColorHex}
                        stroke="#1A1A1A"
                        strokeWidth="1.5"
                      />

                      {/* Luxurious check/brocade textures for dress */}
                      {selectedPattern === "Traditional Brocade" && (
                        <g opacity="0.2" stroke="#E2B070" strokeWidth="0.75" fill="none">
                          <path d="M 60,60 Q 75,45 90,60 T 120,60" />
                          <path d="M 50,150 Q 75,130 100,150 T 150,150" />
                        </g>
                      )}

                      {/* V-neck Wrap top opening */}
                      <path d="M 82,40 L 100,80 L 118,40 Z" fill="#F8FAFC" stroke="#1A1A1A" strokeWidth="1" />

                      {/* Satin lapels crossing over beautifully */}
                      {selectedLapel.includes("Peak") ? (
                        <>
                          <path d="M 82,40 L 68,68 L 82,70 L 100,105 Z" fill="#0F172A" stroke="#1A1A1A" strokeWidth="1.25" />
                          <path d="M 118,40 L 132,68 L 118,70 L 100,105 Z" fill="#0F172A" stroke="#1A1A1A" strokeWidth="1.25" />
                        </>
                      ) : selectedLapel.includes("Shawl") ? (
                        <path d="M 82,40 C 65,60 70,90 100,105 C 130,90 135,60 118,40" fill="none" stroke="#1A1A1A" strokeWidth="1.75" />
                      ) : (
                        <>
                          {/* Classic Wrap Lapels */}
                          <path d="M 82,40 L 72,66 L 76,70 L 100,105 Z" fill="#0F172A" stroke="#1A1A1A" strokeWidth="1.25" />
                          <path d="M 118,40 L 128,66 L 124,70 L 100,105 Z" fill="#0F172A" stroke="#1A1A1A" strokeWidth="1.25" />
                        </>
                      )}

                      {/* Waist sash/belt (cinched waist detail) */}
                      <rect x="73" y="111" width="54" height="8" fill="#1A1A1A" stroke="#1A1A1A" strokeWidth="1" rx="1" />
                      <circle cx="100" cy="115" r="3.5" fill="#D97706" stroke="#1A1A1A" strokeWidth="0.5" />

                      {/* Bottom Gown hem double stitching */}
                      <path d="M 45,180 L 155,180" stroke="#1A1A1A" strokeWidth="1" />
                      <path d="M 46,176 L 154,176" stroke="#1A1A1A" strokeWidth="0.75" strokeDasharray="2,2" opacity="0.6" />
                    </>
                  )}

                  {/* 5. BESPOKE SHOE RENDERING */}
                  {category === "shoes" && (
                    <>
                      {/* Left Dress Shoe */}
                      <g transform="translate(15, 25)">
                        {/* Sole */}
                        <path d="M 30,120 C 30,125 50,130 80,125 C 100,120 110,110 115,100 C 115,90 100,85 85,85 C 75,85 55,95 40,105 C 30,112 30,120 30,120 Z" fill="#292524" stroke="#110C0B" strokeWidth="1.5" />
                        {/* Upper leather body */}
                        <path d="M 35,115 C 35,118 50,123 75,118 C 95,115 105,105 110,95 C 105,88 95,85 82,85 C 70,85 52,95 40,105 C 35,110 35,115 35,115 Z" fill={selectedColor === "Sartorial Black" ? "#1E1B18" : selectedColor === "Midnight Navy" ? "#1E293B" : "#78350F"} stroke="#110C0B" strokeWidth="1.25" />
                        {/* Heel */}
                        <path d="M 32,118 L 32,126 C 32,128 42,128 45,126 L 45,117 Z" fill="#1C1917" />
                        {/* Cap Toe Stitch Line */}
                        <path d="M 92,89 C 95,93 96,101 93,107" fill="none" stroke="#F59E0B" strokeWidth="0.75" strokeDasharray="1,1" opacity="0.8" />
                        {/* Lacing tab (vamp/facing) */}
                        <path d="M 68,93 L 80,91 L 82,99 L 70,102 Z" fill={selectedColor === "Sartorial Black" ? "#12100E" : "#5F2D0D"} stroke="#110C0B" strokeWidth="1" />
                        {/* Laces */}
                        <line x1="72" y1="94" x2="78" y2="98" stroke="#F59E0B" strokeWidth="1" />
                        {/* Brogue perforations details (dots) */}
                        <circle cx="95" cy="95" r="0.7" fill="#F59E0B" opacity="0.6" />
                        <circle cx="98" cy="98" r="0.7" fill="#F59E0B" opacity="0.6" />
                        <circle cx="101" cy="101" r="0.7" fill="#F59E0B" opacity="0.6" />
                      </g>
                      
                      {/* Right Dress Shoe */}
                      <g transform="translate(45, 45)">
                        {/* Sole */}
                        <path d="M 30,120 C 30,125 50,130 80,125 C 100,120 110,110 115,100 C 115,90 100,85 85,85 C 75,85 55,95 40,105 C 30,112 30,120 30,120 Z" fill="#292524" stroke="#110C0B" strokeWidth="1.5" />
                        {/* Upper leather body */}
                        <path d="M 35,115 C 35,118 50,123 75,118 C 95,115 105,105 110,95 C 105,88 95,85 82,85 C 70,85 52,95 40,105 C 35,110 35,115 35,115 Z" fill={selectedColor === "Sartorial Black" ? "#2E2A24" : selectedColor === "Midnight Navy" ? "#2B364A" : "#8F4513"} stroke="#110C0B" strokeWidth="1.25" />
                        {/* Heel */}
                        <path d="M 32,118 L 32,126 C 32,128 42,128 45,126 L 45,117 Z" fill="#1C1917" />
                        {/* Cap Toe Stitch Line */}
                        <path d="M 92,89 C 95,93 96,101 93,107" fill="none" stroke="#F59E0B" strokeWidth="0.75" strokeDasharray="1,1" opacity="0.8" />
                        {/* Lacing tab */}
                        <path d="M 68,93 L 80,91 L 82,99 L 70,102 Z" fill={selectedColor === "Sartorial Black" ? "#12100E" : "#5F2D0D"} stroke="#110C0B" strokeWidth="1" />
                        {/* Laces */}
                        <line x1="72" y1="94" x2="78" y2="98" stroke="#F59E0B" strokeWidth="1" />
                        <circle cx="95" cy="95" r="0.7" fill="#F59E0B" opacity="0.6" />
                        <circle cx="98" cy="98" r="0.7" fill="#F59E0B" opacity="0.6" />
                      </g>
                    </>
                  )}

                  {/* 6. BESPOKE ACCESSORY RENDERING */}
                  {category === "accessories" && (
                    <>
                      {/* Silk Folded Necktie and Pocket Square */}
                      <g transform="translate(40, 25)">
                        {/* Background elegant box */}
                        <rect x="10" y="10" width="100" height="130" fill="#FAFAF9" stroke="#E7E5E4" strokeWidth="1" />
                        
                        {/* Silk Tie Folded */}
                        <path d="M 45,20 L 75,20 L 70,110 L 60,125 L 50,110 Z" fill={selectedColor === "Midnight Navy" ? "#1E3A8A" : selectedColor === "Crimson Burgundy" ? "#991B1B" : "#B45309"} stroke="#1C1917" strokeWidth="1.5" />
                        
                        {/* Tie pattern details if patterned */}
                        <g opacity="0.4" stroke="#FCD34D" strokeWidth="1.25">
                          <line x1="48" y1="35" x2="72" y2="45" />
                          <line x1="48" y1="55" x2="71" y2="65" />
                          <line x1="48" y1="75" x2="70" y2="85" />
                          <line x1="49" y1="95" x2="68" y2="105" />
                        </g>
                        
                        {/* Tie knot representation */}
                        <path d="M 52,20 L 68,20 L 64,38 L 56,38 Z" fill={selectedColor === "Midnight Navy" ? "#172554" : selectedColor === "Crimson Burgundy" ? "#7F1D1D" : "#78350F"} stroke="#1C1917" strokeWidth="1" />
                        
                        {/* Pocket square (Hand-rolled borders showing) */}
                        <path d="M 85,25 L 100,10 L 105,25 L 95,35 Z" fill="#FBFBFB" stroke="#166534" strokeWidth="1.25" />
                        <path d="M 90,22 L 102,15 L 101,23 Z" fill="#166534" opacity="0.3" />
                        
                        {/* Monogram stamp detailing */}
                        <text x="8" y="125" className="font-mono text-[7px]" fill="#A8A29E">U.S. ATELIER</text>
                      </g>
                    </>
                  )}
                </svg>

                {/* Info Overlay */}
                <div className="absolute bottom-2 right-2 bg-stone-900/80 text-white font-mono text-[9px] px-2 py-1 rounded">
                  {category.toUpperCase()} · {selectedColor}
                </div>
              </div>
            </div>

            {/* AI Prompts Box */}
            <div className="bg-white border border-atelier-border p-5 shadow-sm space-y-4">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-atelier-accent" />
                <h4 className="font-serif text-base font-semibold text-atelier-text">AI Assistant Fabric & Design Advisor</h4>
              </div>
              <p className="text-xs text-stone-500">
                Need advice on matching accessories, traditional custom embroideries, or weather considerations? Instruct the model:
              </p>
              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="E.g., Design a warm winter double-breasted coat in gold-toned camelhair with peak lapels..."
                className="w-full border border-stone-200 p-3 text-xs rounded-none h-20 focus:outline-none focus:border-atelier-accent resize-none bg-stone-50"
              ></textarea>
              <button
                onClick={generateAiDesignSpec}
                disabled={isAiLoading || !aiPrompt}
                className="w-full bg-stone-100 border border-stone-300 hover:bg-stone-200 disabled:bg-stone-50 disabled:text-stone-300 text-stone-800 font-semibold uppercase text-[10px] tracking-wider py-3 rounded-none cursor-pointer flex items-center justify-center space-x-1 duration-300"
              >
                {isAiLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-atelier-accent" />
                    <span>Styling Masterpiece...</span>
                  </>
                ) : (
                  <>
                    <MessageSquare className="w-3.5 h-3.5 text-atelier-accent" />
                    <span>Request AI Styling Proposal</span>
                  </>
                )}
              </button>

              {aiSpec && (
                <div className="bg-[#EFEBE5]/30 border-l-2 border-atelier-accent p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-stone-400">AI PROPOSAL</span>
                    <span className="text-xs font-serif font-bold text-atelier-accent">{aiSpec.designName}</span>
                  </div>
                  <p className="text-stone-600 text-xs leading-normal italic">
                    "{aiSpec.luxuriousDescription}"
                  </p>
                  <div>
                    <span className="block text-[9px] font-mono text-stone-400 uppercase mb-1">TECHNICAL DETAILS</span>
                    <div className="flex flex-wrap gap-1">
                      {aiSpec.technicalDetails?.map((det: string, idx: number) => (
                        <span key={idx} className="bg-white border border-stone-200 px-2 py-0.5 text-[9px] font-mono text-stone-500">
                          {det}
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="text-[10px] text-atelier-accent font-mono leading-normal">
                    <strong>Coordinates:</strong> {aiSpec.coordinateAdvice}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Customizer parameters & Measurements */}
          <div className="lg:col-span-7 space-y-8">
            {/* Step 1: Customize Components */}
            <div className="bg-white border border-atelier-border p-6 shadow-sm space-y-6">
              <h3 className="font-serif text-xl font-medium border-b border-atelier-border pb-3 text-stone-800">
                1. Garment Component Configuration
              </h3>

              <div className="grid grid-cols-2 gap-6">
                {/* Category Selection */}
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-mono uppercase text-stone-400 mb-1.5">Garment Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full border border-stone-200 p-2 text-xs rounded-none bg-white focus:outline-none focus:border-atelier-accent cursor-pointer"
                  >
                    <option value="suit">Three-Piece Suit</option>
                    <option value="jacket">Bespoke Blazer</option>
                    <option value="shirt">Crisp Custom Shirt</option>
                    <option value="dress">Victoria Tuxedo Dress</option>
                    <option value="shoes">Bespoke Leather Shoes</option>
                    <option value="accessories">Bespoke Fine Accessories</option>
                  </select>
                </div>

                {/* Color Selector */}
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-mono uppercase text-stone-400 mb-1.5">Primary Shade</label>
                  <select
                    value={selectedColor}
                    onChange={(e) => setSelectedColor(e.target.value)}
                    className="w-full border border-stone-200 p-2 text-xs rounded-none bg-white focus:outline-none focus:border-atelier-accent cursor-pointer"
                  >
                    {COLORS.map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Standard Clothing Configurator */}
                {category !== "shoes" && category !== "accessories" && (
                  <>
                    {/* Fabric Selector */}
                    <div>
                      <label className="block text-xs font-mono uppercase text-stone-400 mb-1.5">Bespoke Fabric Mill</label>
                      <select
                        value={selectedFabric}
                        onChange={(e) => setSelectedFabric(e.target.value)}
                        className="w-full border border-stone-200 p-2 text-xs rounded-none bg-white focus:outline-none focus:border-atelier-accent cursor-pointer"
                      >
                        {FABRICS.map((f) => (
                          <option key={f.id} value={f.name}>
                            {f.name} ({f.mill})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Pattern Selector */}
                    <div>
                      <label className="block text-xs font-mono uppercase text-stone-400 mb-1.5">Fabric Pattern</label>
                      <select
                        value={selectedPattern}
                        onChange={(e) => setSelectedPattern(e.target.value)}
                        className="w-full border border-stone-200 p-2 text-xs rounded-none bg-white focus:outline-none focus:border-atelier-accent cursor-pointer"
                      >
                        {PATTERNS.map((p) => (
                          <option key={p.name} value={p.name}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Collar & Lapel */}
                    <div>
                      <label className="block text-xs font-mono uppercase text-stone-400 mb-1.5">Collar / Lapel Style</label>
                      <select
                        value={selectedLapel}
                        onChange={(e) => setSelectedLapel(e.target.value)}
                        className="w-full border border-stone-200 p-2 text-xs rounded-none bg-white focus:outline-none focus:border-atelier-accent cursor-pointer"
                      >
                        {COLLARS_LAPELS.map((cl) => (
                          <option key={cl.name} value={cl.name}>
                            {cl.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Cuff Style */}
                    <div>
                      <label className="block text-xs font-mono uppercase text-stone-400 mb-1.5">Sleeve Cuffs Style</label>
                      <select
                        value={selectedCuff}
                        onChange={(e) => setSelectedCuff(e.target.value)}
                        className="w-full border border-stone-200 p-2 text-xs rounded-none bg-white focus:outline-none focus:border-atelier-accent cursor-pointer"
                      >
                        {CUFFS.map((cf) => (
                          <option key={cf.name} value={cf.name}>
                            {cf.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Pockets Style */}
                    <div className="col-span-2">
                      <label className="block text-xs font-mono uppercase text-stone-400 mb-1.5">Tailor Pockets Arrangement</label>
                      <div className="grid grid-cols-2 gap-2">
                        {POCKETS.map((p) => (
                          <button
                            key={p.name}
                            type="button"
                            onClick={() => setSelectedPocket(p.name)}
                            className={`text-left p-3 border text-xs cursor-pointer flex flex-col justify-between transition-all duration-300 ${
                              selectedPocket === p.name
                                ? "border-atelier-accent bg-atelier-accent/5"
                                : "border-stone-200 bg-stone-50 hover:bg-stone-100"
                            }`}
                          >
                            <span className="font-medium text-stone-800">{p.name}</span>
                            <span className="text-[10px] text-stone-500 leading-normal mt-1">{p.desc}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Bespoke Shoe Configurator */}
                {category === "shoes" && (
                  <>
                    {/* Shoe Type */}
                    <div>
                      <label className="block text-xs font-mono uppercase text-stone-400 mb-1.5">Shoe Silhouette Style</label>
                      <select
                        value={shoeType}
                        onChange={(e) => setShoeType(e.target.value)}
                        className="w-full border border-stone-200 p-2 text-xs rounded-none bg-white focus:outline-none focus:border-atelier-accent cursor-pointer"
                      >
                        <option value="Wholecut Oxford">Wholecut Oxford (Sleek Evening)</option>
                        <option value="Brogue Derby">Brogue Derby (Refined Casual)</option>
                        <option value="Double Monk Strap">Double Monk Strap (Sartorial)</option>
                        <option value="Chelsea Boot">Chelsea Boot (Sleek & Sturdy)</option>
                        <option value="Suede Loafer">Suede Loafer (Riviera Summer)</option>
                      </select>
                    </div>

                    {/* Leather Type */}
                    <div>
                      <label className="block text-xs font-mono uppercase text-stone-400 mb-1.5">Premium Leather Selection</label>
                      <select
                        value={leatherType}
                        onChange={(e) => setLeatherType(e.target.value)}
                        className="w-full border border-stone-200 p-2 text-xs rounded-none bg-white focus:outline-none focus:border-atelier-accent cursor-pointer"
                      >
                        <option value="Full-grain Italian Calfskin">Full-grain Italian Calfskin</option>
                        <option value="French Calf Suede">French Calf Suede</option>
                        <option value="Genuine Shell Cordovan">Genuine Shell Cordovan (+$240)</option>
                        <option value="Hand-Painted Museum Patina">Hand-Painted Museum Patina (+$100)</option>
                        <option value="Premium Alligator Skin">Premium Alligator Skin (+$240)</option>
                      </select>
                    </div>

                    {/* Goodyear Welted Sole Option */}
                    <div>
                      <label className="block text-xs font-mono uppercase text-stone-400 mb-1.5">Sole Construction</label>
                      <select
                        className="w-full border border-stone-200 p-2 text-xs rounded-none bg-white focus:outline-none focus:border-atelier-accent cursor-pointer"
                        defaultValue="Hand-Stitched Oak Bark Leather"
                      >
                        <option value="Hand-Stitched Oak Bark Leather">Hand-Stitched Goodyear Welted Leather</option>
                        <option value="Vibram Lugged Rubber">Vibram Lugged Commando Rubber</option>
                        <option value="Elegant Blake Stitched Leather">Elegant Blake Stitched Leather</option>
                      </select>
                    </div>

                    {/* Shoe Size */}
                    <div>
                      <label className="block text-xs font-mono uppercase text-stone-400 mb-1.5">Shoe Fitting Size (US)</label>
                      <select
                        value={shoeSize}
                        onChange={(e) => setShoeSize(e.target.value)}
                        className="w-full border border-stone-200 p-2 text-xs rounded-none bg-white focus:outline-none focus:border-atelier-accent cursor-pointer"
                      >
                        {["7.0", "7.5", "8.0", "8.5", "9.0", "9.5", "10.0", "10.5", "11.0", "11.5", "12.0", "13.0"].map((sz) => (
                          <option key={sz} value={sz}>US {sz}</option>
                        ))}
                      </select>
                    </div>

                    <div className="col-span-2 bg-stone-50 border border-stone-200 p-4 text-xs space-y-1 text-stone-600">
                      <p className="font-semibold text-stone-800">👞 Bespoke Shoe Fitting Note:</p>
                      <p>Our custom shoes are built on individualized lasts matching your digital foot trace scan. Sizes can be adjusted using standard US shoe measures.</p>
                    </div>
                  </>
                )}

                {/* Bespoke Accessories Configurator */}
                {category === "accessories" && (
                  <>
                    {/* Accessory Type */}
                    <div>
                      <label className="block text-xs font-mono uppercase text-stone-400 mb-1.5">Bespoke Accessory Category</label>
                      <select
                        value={accessoryType}
                        onChange={(e) => setAccessoryType(e.target.value)}
                        className="w-full border border-stone-200 p-2 text-xs rounded-none bg-white focus:outline-none focus:border-atelier-accent cursor-pointer"
                      >
                        <option value="7-Fold Silk Necktie">7-Fold Silk Necktie</option>
                        <option value="Hand-Rolled Linen Pocket Square">Hand-Rolled Linen Pocket Square</option>
                        <option value="Silk Bow Tie & Cummerbund Set">Silk Bow Tie & Cummerbund Set (+$60)</option>
                        <option value="English Box-Cloth Suspenders">English Box-Cloth Suspenders</option>
                        <option value="Bridle Leather Belt with Solid Brass Buckle">Bridle Leather Belt with Solid Brass Buckle</option>
                        <option value="Sterling Silver Hand-Engraved Cufflinks">Sterling Silver Hand-Engraved Cufflinks (+$60)</option>
                      </select>
                    </div>

                    {/* Material */}
                    <div>
                      <label className="block text-xs font-mono uppercase text-stone-400 mb-1.5">Premium Finish/Pattern</label>
                      <select
                        className="w-full border border-stone-200 p-2 text-xs rounded-none bg-white focus:outline-none focus:border-atelier-accent cursor-pointer"
                        defaultValue="Solid Lustre"
                      >
                        <option value="Solid Lustre">Solid Lustre Satin</option>
                        <option value="English Polka Dot">English Polka Dot</option>
                        <option value="Vintage Paisley">Vintage Paisley Jacquard</option>
                        <option value="Regimental Stripe">Regimental Diagonal Stripe</option>
                        <option value="Hand-Stitched Monogram Initials">Hand-Stitched Monogram Initials</option>
                      </select>
                    </div>

                    <div className="col-span-2 bg-stone-50 border border-stone-200 p-4 text-xs space-y-1 text-stone-600">
                      <p className="font-semibold text-stone-800">🎗️ Custom Monogramming & Details:</p>
                      <p>All accessories are meticulously finished in our Savile Row workshop. Silk ties are hand-tipped, and pocket squares feature hand-rolled contrast edges.</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Step 2: Measurements Setup */}
            <div className="bg-white border border-atelier-border p-6 shadow-sm space-y-6">
              <div className="flex justify-between items-baseline border-b border-atelier-border pb-3">
                <h3 className="font-serif text-xl font-medium text-stone-800">2. Complete Fitting Measurements</h3>
                <span className="text-xs font-mono text-stone-400">ALL VALUES IN INCHES (IN)</span>
              </div>

              <p className="text-xs text-stone-500 leading-relaxed">
                You can manually input measurements, or keep your AI Style Finder biometric estimated coordinates on file. 
                Our master tailors cross-examine these with your silhouette images.
              </p>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-mono text-stone-400 mb-1">CHEST CIRCUMFERENCE</label>
                  <input
                    type="number"
                    value={chest}
                    onChange={(e) => setChest(parseFloat(e.target.value) || 0)}
                    className="w-full border border-stone-200 p-2 text-xs focus:outline-none focus:border-atelier-accent font-mono bg-stone-50 text-center"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-stone-400 mb-1">WAIST CIRCUMFERENCE</label>
                  <input
                    type="number"
                    value={waist}
                    onChange={(e) => setWaist(parseFloat(e.target.value) || 0)}
                    className="w-full border border-stone-200 p-2 text-xs focus:outline-none focus:border-atelier-accent font-mono bg-stone-50 text-center"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-stone-400 mb-1">HIPS CIRCUMFERENCE</label>
                  <input
                    type="number"
                    value={hips}
                    onChange={(e) => setHips(parseFloat(e.target.value) || 0)}
                    className="w-full border border-stone-200 p-2 text-xs focus:outline-none focus:border-atelier-accent font-mono bg-stone-50 text-center"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-stone-400 mb-1">NECK COLLAR WIDTH</label>
                  <input
                    type="number"
                    step="0.5"
                    value={neck}
                    onChange={(e) => setNeck(parseFloat(e.target.value) || 0)}
                    className="w-full border border-stone-200 p-2 text-xs focus:outline-none focus:border-atelier-accent font-mono bg-stone-50 text-center"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-stone-400 mb-1">SLEEVE OUTSEAM LENGTH</label>
                  <input
                    type="number"
                    value={sleeveLength}
                    onChange={(e) => setSleeveLength(parseFloat(e.target.value) || 0)}
                    className="w-full border border-stone-200 p-2 text-xs focus:outline-none focus:border-atelier-accent font-mono bg-atelier-accent/5 text-center border-atelier-accent/30"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-stone-400 mb-1">PANTS INSEAM LENGTH</label>
                  <input
                    type="number"
                    value={inseam}
                    onChange={(e) => setInseam(parseFloat(e.target.value) || 0)}
                    className="w-full border border-stone-200 p-2 text-xs focus:outline-none focus:border-atelier-accent font-mono bg-atelier-accent/5 text-center border-atelier-accent/30"
                  />
                </div>
              </div>
            </div>

            {/* Step 3: Billing Options & Submission */}
            <div className="bg-white border border-atelier-border p-6 shadow-sm space-y-6">
              <h3 className="font-serif text-xl font-medium border-b border-atelier-border pb-3 text-stone-800">
                3. Secure Payment & Commission Terms
              </h3>

              <div className="space-y-4">
                <label className="block text-xs font-mono uppercase text-stone-400 mb-1">Select Terms of Transaction</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentTerm("deposit")}
                    className={`p-3 text-xs text-center border cursor-pointer flex flex-col justify-between items-center transition-all duration-300 ${
                      paymentTerm === "deposit" ? "border-atelier-accent bg-atelier-accent/5" : "border-stone-200"
                    }`}
                  >
                    <span className="font-bold text-stone-800">50% Deposit</span>
                    <span className="text-[10px] text-stone-500 mt-1">${(totalPrice / 2).toFixed(0)} now</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentTerm("installments")}
                    className={`p-3 text-xs text-center border cursor-pointer flex flex-col justify-between items-center transition-all duration-300 ${
                      paymentTerm === "installments" ? "border-atelier-accent bg-atelier-accent/5" : "border-stone-200"
                    }`}
                  >
                    <span className="font-bold text-stone-800">Installments</span>
                    <span className="text-[10px] text-stone-500 mt-1">3x ${(totalPrice / 3).toFixed(0)}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentTerm("full")}
                    className={`p-3 text-xs text-center border cursor-pointer flex flex-col justify-between items-center transition-all duration-300 ${
                      paymentTerm === "full" ? "border-atelier-accent bg-atelier-accent/5" : "border-stone-200"
                    }`}
                  >
                    <span className="font-bold text-stone-800">Full Payment</span>
                    <span className="text-[10px] text-atelier-accent font-bold mt-1">${totalPrice}</span>
                  </button>
                </div>
              </div>

              <div className="bg-[#EFEBE5]/30 p-4 flex items-center space-x-3 border border-stone-200 text-stone-600 text-xs">
                <Coins className="w-5 h-5 text-atelier-accent shrink-0" />
                <span className="leading-relaxed">
                  Support checkout via <strong>M-Pesa Express, Visa, Mastercard, and Bank Wire</strong>. Deposits secure your fabric allocation and queue positioning.
                </span>
              </div>

              <div className="pt-6 border-t border-atelier-border flex items-center justify-between">
                <div>
                  <span className="block text-[10px] font-mono text-stone-400">TOTAL MASTER COMMISSION</span>
                  <span className="font-serif text-3xl font-bold text-stone-800">${totalPrice}</span>
                </div>
                <button
                  onClick={handlePlaceOrder}
                  disabled={isOrdering}
                  className="bg-atelier-text hover:bg-atelier-accent text-white font-semibold text-xs uppercase tracking-[0.2em] px-8 py-4 rounded-none flex items-center space-x-2 cursor-pointer shadow-lg transition-all duration-300"
                >
                  {isOrdering ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-atelier-accent" />
                      <span>Securing Fabric...</span>
                    </>
                  ) : (
                    <>
                      <span>Place Bespoke Order</span>
                      <ArrowRight className="w-4 h-4 text-white" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
