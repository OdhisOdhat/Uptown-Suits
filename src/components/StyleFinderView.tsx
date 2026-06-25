import React, { useState } from "react";
import { Sparkles, Upload, Loader2, ArrowRight, CheckCircle2, User, HelpCircle } from "lucide-react";

interface StyleFinderViewProps {
  onApplyMeasurements: (measurements: any, designDetails: any) => void;
  savedMeasurements: any;
}

export default function StyleFinderView({ onApplyMeasurements, savedMeasurements }: StyleFinderViewProps) {
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [sideImage, setSideImage] = useState<string | null>(null);
  const [fullImage, setFullImage] = useState<string | null>(null);
  const [heightCategory, setHeightCategory] = useState("Regular");
  const [preferredStyle, setPreferredStyle] = useState("Modern Classic");
  
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const loadingSteps = [
    "Uploading secure biometric imagery...",
    "Extracting horizontal shoulder coordinates...",
    "Measuring waist proportion and chest posture...",
    "Querying tailoring rules from master Savile Row databases...",
    "Synthesizing customized wardrobe and color coordinates..."
  ];

  // Helper to handle image uploads
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, type: "front" | "side" | "full") => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === "front") setFrontImage(reader.result as string);
        if (type === "side") setSideImage(reader.result as string);
        if (type === "full") setFullImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Preset demo button to load high-quality mock data for testing
  const loadDemoData = () => {
    setFrontImage("https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=200");
    setSideImage("https://images.unsplash.com/photo-1593032465175-481ac7f401a0?auto=format&fit=crop&q=80&w=200");
    setFullImage("https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&q=80&w=200");
    setHeightCategory("Regular");
    setPreferredStyle("Bold Traditional Accent");
  };

  const startAnalysis = async () => {
    setIsLoading(true);
    setLoadingStep(0);
    setError(null);
    setResult(null);

    // Stagger loading step descriptions
    const stepInterval = setInterval(() => {
      setLoadingStep((prev) => {
        if (prev < loadingSteps.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 1500);

    try {
      const response = await fetch("/api/gemini/analyze-body", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          frontImage: frontImage,
          sideImage: sideImage,
          heightCategory,
          preferredStyle
        })
      });

      if (!response.ok) {
        throw new Error("Analysis failed. Please verify that your Gemini API key is configured correctly.");
      }

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to analyze photos. Please ensure API settings are valid.");
    } finally {
      clearInterval(stepInterval);
      setIsLoading(false);
    }
  };

  const handleApply = () => {
    if (!result) return;
    
    // Parse estimated measurements into numeric values
    const parsedMeasurements = {
      chest: parseInt(result.estimatedMeasurements?.chest) || 40,
      waist: parseInt(result.estimatedMeasurements?.waist) || 34,
      hips: parseInt(result.estimatedMeasurements?.hips) || 41,
      neck: parseFloat(result.estimatedMeasurements?.neck) || 16,
      sleeveLength: parseInt(result.estimatedMeasurements?.sleeveLength) || 33,
      inseam: parseInt(result.estimatedMeasurements?.inseam) || 31
    };

    const designDetails = {
      category: "suit",
      fabric: result.recommendedFabrics?.[0] || "Super 120s Merino Wool",
      color: result.colorPalette?.[0] || "Midnight Navy",
      pattern: "Solid",
      aiInsights: result.stylingInsights,
      designName: result.recommendedSuits?.[0] || "Bespoke Analyzed Suit"
    };

    onApplyMeasurements(parsedMeasurements, designDetails);
  };

  return (
    <div className="bg-atelier-bg min-h-screen py-12 px-4 lg:px-12 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="border-b border-atelier-border pb-8 mb-10">
        <span className="text-xs tracking-[0.25em] font-mono text-stone-400 uppercase">MODULE 1 & 3</span>
        <h1 className="text-4xl lg:text-5xl font-serif text-atelier-text mt-2">AI Style Finder & Body Analyzer</h1>
        <p className="text-stone-600 text-sm mt-3 max-w-3xl">
          Our advanced vision models analyze your body proportions, structural lines, skin tone category, and fashion preferences to recommend optimal fabrics, bespoke patterns, and estimate exact physical tailoring measurements.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Panel: Uploads and Controls */}
        <div className="lg:col-span-6 space-y-8">
          <div className="bg-white border border-atelier-border p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-serif text-xl font-medium text-stone-800">1. Upload Silhouette Photos</h3>
              <button
                onClick={loadDemoData}
                type="button"
                className="text-xs font-mono text-atelier-accent hover:underline cursor-pointer"
              >
                Load Demo Preset
              </button>
            </div>

            {/* Photo upload boxes */}
            <div className="grid grid-cols-3 gap-4">
              {/* Box 1: Front */}
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-mono text-stone-400 uppercase mb-2">FRONT VIEW</span>
                <label className="relative w-full aspect-[3/4] border-2 border-dashed border-stone-300 hover:border-atelier-accent transition-colors flex flex-col items-center justify-center p-2 bg-stone-50 cursor-pointer overflow-hidden">
                  {frontImage ? (
                    <img src={frontImage} alt="Front body silhouette" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center flex flex-col items-center justify-center">
                      <Upload className="w-5 h-5 text-stone-400 mb-2" />
                      <span className="text-[9px] text-stone-500 uppercase">Upload</span>
                    </div>
                  )}
                  <input type="file" accept="image/*" onChange={(e) => handleImageChange(e, "front")} className="hidden" />
                </label>
              </div>

              {/* Box 2: Side */}
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-mono text-stone-400 uppercase mb-2">SIDE VIEW</span>
                <label className="relative w-full aspect-[3/4] border-2 border-dashed border-stone-300 hover:border-atelier-accent transition-colors flex flex-col items-center justify-center p-2 bg-stone-50 cursor-pointer overflow-hidden">
                  {sideImage ? (
                    <img src={sideImage} alt="Side body silhouette" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center flex flex-col items-center justify-center">
                      <Upload className="w-5 h-5 text-stone-400 mb-2" />
                      <span className="text-[9px] text-stone-500 uppercase">Upload</span>
                    </div>
                  )}
                  <input type="file" accept="image/*" onChange={(e) => handleImageChange(e, "side")} className="hidden" />
                </label>
              </div>

              {/* Box 3: Full */}
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-mono text-stone-400 uppercase mb-2">FULL LENGTH</span>
                <label className="relative w-full aspect-[3/4] border-2 border-dashed border-stone-300 hover:border-atelier-accent transition-colors flex flex-col items-center justify-center p-2 bg-stone-50 cursor-pointer overflow-hidden">
                  {fullImage ? (
                    <img src={fullImage} alt="Full body silhouette" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center flex flex-col items-center justify-center">
                      <Upload className="w-5 h-5 text-stone-400 mb-2" />
                      <span className="text-[9px] text-stone-500 uppercase">Upload</span>
                    </div>
                  )}
                  <input type="file" accept="image/*" onChange={(e) => handleImageChange(e, "full")} className="hidden" />
                </label>
              </div>
            </div>
            <p className="text-[11px] text-stone-400 leading-normal mt-4">
              *Your photos are processed securely on private sandboxed servers. We analyze silhouettes strictly for drafting shoulders, neck angles, waist and hip proportions.
            </p>
          </div>

          {/* Form Options */}
          <div className="bg-white border border-atelier-border p-6 shadow-sm space-y-6">
            <h3 className="font-serif text-xl font-medium text-stone-800">2. Select Preferences</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono uppercase text-stone-500 mb-2">Height Category</label>
                <select
                  value={heightCategory}
                  onChange={(e) => setHeightCategory(e.target.value)}
                  className="w-full border border-stone-300 p-2 text-sm rounded-none focus:outline-none focus:border-atelier-accent bg-white cursor-pointer"
                >
                  <option value="Short">Short (under 5'7")</option>
                  <option value="Regular">Regular (5'7" - 6'1")</option>
                  <option value="Tall">Tall (over 6'1")</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-stone-500 mb-2">Preferred Style</label>
                <select
                  value={preferredStyle}
                  onChange={(e) => setPreferredStyle(e.target.value)}
                  className="w-full border border-stone-300 p-2 text-sm rounded-none focus:outline-none focus:border-atelier-accent bg-white cursor-pointer"
                >
                  <option value="Modern Classic">Modern Classic</option>
                  <option value="Traditional Heritage">Traditional Heritage</option>
                  <option value="Sleek Italian Slim">Sleek Italian Slim</option>
                  <option value="Relaxed Tailoring">Relaxed Tailoring</option>
                </select>
              </div>
            </div>

            <button
              onClick={startAnalysis}
              disabled={isLoading || (!frontImage && !sideImage)}
              className="w-full bg-atelier-text hover:bg-atelier-accent disabled:bg-stone-200 disabled:text-stone-400 text-white font-semibold uppercase tracking-[0.2em] text-xs py-4 rounded-none transition-all duration-300 cursor-pointer flex items-center justify-center space-x-2"
            >
              <Sparkles className="w-4 h-4 text-atelier-accent" />
              <span>{isLoading ? "Running AI Modeling..." : "Extract Proportions & Match Styles"}</span>
            </button>
            {!frontImage && !sideImage && (
              <p className="text-center text-xs text-stone-400 italic">Please upload at least one view or load demo to begin</p>
            )}
          </div>
        </div>

        {/* Right Panel: AI Response Output */}
        <div className="lg:col-span-6">
          <div className="bg-white border border-atelier-border p-6 lg:p-8 shadow-sm min-h-[400px] flex flex-col justify-between">
            {isLoading ? (
              <div className="flex-1 flex flex-col items-center justify-center py-20 space-y-6">
                <Loader2 className="w-10 h-10 text-atelier-accent animate-spin" />
                <div className="text-center max-w-sm space-y-2">
                  <h4 className="font-serif text-lg font-medium text-stone-800">Drafting Profile</h4>
                  <p className="text-xs text-atelier-accent font-mono tracking-wide uppercase animate-pulse">
                    {loadingSteps[loadingStep]}
                  </p>
                </div>
              </div>
            ) : result ? (
              <div className="space-y-6">
                {/* Result Title */}
                <div className="border-b border-atelier-border pb-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span className="text-xs font-mono uppercase tracking-widest text-stone-400">ANALYSIS COMPLETE</span>
                  </div>
                  <h3 className="font-serif text-3xl font-medium mt-1">Your Custom Fit Blueprint</h3>
                </div>

                {/* Grid metrics */}
                <div className="grid grid-cols-3 gap-4 bg-[#EFEBE5]/30 p-4 border border-atelier-border">
                  <div>
                    <span className="block text-[9px] font-mono text-stone-400 uppercase">BODY SHAPE</span>
                    <span className="font-serif font-semibold text-stone-800">{result.bodyShape}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] font-mono text-stone-400 uppercase">SHOULDERS</span>
                    <span className="font-serif font-semibold text-stone-800">{result.shoulderProportion}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] font-mono text-stone-400 uppercase">WAIST PROPORTION</span>
                    <span className="font-serif font-semibold text-stone-800">{result.waistProportion}</span>
                  </div>
                </div>

                {/* AI estimated measurements */}
                <div>
                  <h4 className="font-mono text-xs text-stone-500 uppercase tracking-wider mb-2">Estimated Tailor Measurements</h4>
                  <div className="grid grid-cols-5 gap-2 text-center">
                    <div className="border border-stone-200 p-2 bg-[#EFEBE5]/30">
                      <span className="block text-[9px] font-mono text-stone-400">CHEST</span>
                      <span className="font-mono text-xs font-semibold">{result.estimatedMeasurements?.chest}</span>
                    </div>
                    <div className="border border-stone-200 p-2 bg-[#EFEBE5]/30">
                      <span className="block text-[9px] font-mono text-stone-400">WAIST</span>
                      <span className="font-mono text-xs font-semibold">{result.estimatedMeasurements?.waist}</span>
                    </div>
                    <div className="border border-stone-200 p-2 bg-[#EFEBE5]/30">
                      <span className="block text-[9px] font-mono text-stone-400">HIPS</span>
                      <span className="font-mono text-xs font-semibold">{result.estimatedMeasurements?.hips}</span>
                    </div>
                    <div className="border border-stone-200 p-2 bg-[#EFEBE5]/30">
                      <span className="block text-[9px] font-mono text-stone-400">NECK</span>
                      <span className="font-mono text-xs font-semibold">{result.estimatedMeasurements?.neck}</span>
                    </div>
                    <div className="border border-stone-200 p-2 bg-[#EFEBE5]/30">
                      <span className="block text-[9px] font-mono text-stone-400">SLEEVE</span>
                      <span className="font-mono text-xs font-semibold">{result.estimatedMeasurements?.sleeveLength}</span>
                    </div>
                  </div>
                </div>

                {/* Styling Insights */}
                <div className="space-y-1.5">
                  <h4 className="font-mono text-xs text-stone-500 uppercase tracking-wider">Aesthetic Consultation</h4>
                  <p className="text-stone-600 text-sm leading-relaxed italic">
                    "{result.stylingInsights}"
                  </p>
                </div>

                {/* Recommended garments */}
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <h5 className="font-mono text-[10px] text-stone-400 uppercase tracking-wider mb-1">Recommended Cuts</h5>
                    <ul className="text-xs text-stone-600 list-disc list-inside space-y-1">
                      {result.recommendedSuits?.map((suit: string, i: number) => (
                        <li key={i}>{suit}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-mono text-[10px] text-stone-400 uppercase tracking-wider mb-1">Optimal Fabrics</h5>
                    <ul className="text-xs text-stone-600 list-disc list-inside space-y-1">
                      {result.recommendedFabrics?.map((fabric: string, i: number) => (
                        <li key={i}>{fabric}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Color Palette */}
                <div>
                  <h5 className="font-mono text-[10px] text-stone-400 uppercase tracking-wider mb-2">Recommended Accent Color Palette</h5>
                  <div className="flex items-center space-x-3">
                    {result.colorPalette?.map((color: string, i: number) => (
                      <div key={i} className="flex items-center space-x-1 border border-stone-200 p-1 bg-[#EFEBE5]/30 rounded">
                        <span className="w-3.5 h-3.5 inline-block border border-black/10 rounded-full bg-stone-500" style={{
                          backgroundColor: color.toLowerCase().includes("navy") ? "#1E293B" : 
                                          color.toLowerCase().includes("grey") ? "#64748B" :
                                          color.toLowerCase().includes("green") ? "#064E3B" :
                                          color.toLowerCase().includes("burgundy") ? "#7F1D1D" :
                                          color.toLowerCase().includes("black") ? "#000000" :
                                          color.toLowerCase().includes("camel") || color.toLowerCase().includes("gold") ? "#D97706" : "#C5A059"
                        }}></span>
                        <span className="text-[10px] text-stone-600 font-mono pr-1">{color}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action button */}
                <div className="pt-6 border-t border-atelier-border flex justify-end">
                  <button
                    onClick={handleApply}
                    className="bg-atelier-text hover:bg-atelier-accent text-white font-semibold text-xs uppercase tracking-[0.2em] px-6 py-4 rounded-none flex items-center space-x-2 transition-all duration-300 cursor-pointer shadow-md"
                  >
                    <span>Design suit with this blueprint</span>
                    <ArrowRight className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
            ) : error ? (
              <div className="flex-1 flex flex-col items-center justify-center py-20 text-center space-y-4">
                <span className="text-red-500 text-3xl">⚠️</span>
                <h4 className="font-serif text-xl font-medium text-stone-800">Analysis Error</h4>
                <p className="text-stone-500 text-xs max-w-sm leading-relaxed">{error}</p>
                <button
                  onClick={startAnalysis}
                  className="bg-stone-100 hover:bg-stone-200 text-stone-800 font-mono text-xs px-4 py-2 border border-stone-300"
                >
                  Retry Analysis
                </button>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center py-20 text-center space-y-4 text-stone-400">
                <User className="w-12 h-12 text-stone-300 stroke-[1.2]" />
                <h4 className="font-serif text-lg font-medium">Biometric Assessment Panel</h4>
                <p className="text-xs max-w-xs leading-relaxed">
                  Upload your front, side, and full-length body photos on the left panel, and click "Extract Proportions" to retrieve estimated bespoke parameters and tailoring advice.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
