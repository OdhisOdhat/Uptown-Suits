import React, { useState } from "react";
import { Wrench, Upload, Loader2, ArrowRight, ShieldCheck, CheckCircle2, MessageSquare } from "lucide-react";
import { RepairRequest } from "../types";

interface RepairsViewProps {
  onSubmitRepair: (repair: RepairRequest) => void;
}

export default function RepairsView({ onSubmitRepair }: RepairsViewProps) {
  // Input fields
  const [garmentType, setGarmentType] = useState("Suit Jacket");
  const [issueType, setIssueType] = useState("Torn seam");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [pickupOption, setPickupOption] = useState<any>("Courier collection");

  // AI response states
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Workflow states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const loadDemoRepair = () => {
    setGarmentType("Italian Wool Blazer");
    setIssueType("Jacket resizing");
    setDescription("The jacket shoulders are too wide and need to be taken in by 1.5 inches. The lining should remain intact.");
    setImage("https://images.unsplash.com/photo-1593032465175-481ac7f401a0?auto=format&fit=crop&q=80&w=200");
  };

  const runAiAssessment = async () => {
    setIsAiLoading(true);
    setError(null);
    setAiResult(null);
    try {
      const response = await fetch("/api/gemini/repair-assess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          issueType,
          garmentType,
          description,
          image
        })
      });

      if (!response.ok) {
        throw new Error("AI assessment failed. Make sure your environment has a valid API Key.");
      }

      const data = await response.json();
      setAiResult(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to generate AI repair estimation.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      const repairReq: RepairRequest = {
        id: `REP-${Math.floor(Math.random() * 900 + 100)}`,
        customerName: "Fodhis O.",
        customerEmail: "fodhis1@gmail.com",
        garmentType,
        issueType,
        description,
        costEstimate: aiResult?.costEstimate || 45,
        timeEstimate: aiResult?.timeEstimate || "3-4 business days",
        complexity: aiResult?.complexity || "Simple",
        status: "Submitted",
        date: new Date().toISOString().split("T")[0],
        pickupOption,
        imageUrl: image || undefined
      };

      onSubmitRepair(repairReq);
      setIsSubmitting(false);
      setIsConfirmed(true);
    }, 1500);
  };

  return (
    <div className="bg-atelier-bg min-h-screen py-12 px-4 lg:px-12 max-w-7xl mx-auto">
      {/* Header */}
      <div className="border-b border-atelier-border pb-8 mb-10">
        <span className="text-xs tracking-[0.25em] font-mono text-stone-400 uppercase">MODULE 5</span>
        <h1 className="text-4xl lg:text-5xl font-serif text-atelier-text mt-2">Bespoke Clothing Repair & Alterations</h1>
        <p className="text-stone-600 text-sm mt-3 max-w-3xl">
          Bring your treasured garments back to life. Submit details and a photo of your torn seam, chipped zipper, or fitting issue. Our AI evaluates complexity and delivers precise price estimates, assignable to our specialist tailors.
        </p>
      </div>

      {isConfirmed ? (
        <div className="max-w-xl mx-auto bg-white border border-atelier-border p-10 text-center space-y-6 shadow-sm">
          <CheckCircle2 className="w-16 h-16 text-emerald-600 mx-auto stroke-[1.2]" />
          <h2 className="font-serif text-2xl font-semibold text-stone-800">Repair Ticket Submitted</h2>
          <p className="text-stone-600 text-sm leading-relaxed max-w-sm mx-auto">
            Your mending request is logged. Our courier team will organize your selected **{pickupOption}** shortly.
          </p>
          <div className="bg-atelier-bg border border-stone-200 text-xs text-stone-600 p-4 divide-y divide-stone-200">
            <div className="flex justify-between py-1.5"><span className="text-stone-400 font-mono">GARMENT</span><span className="font-bold">{garmentType}</span></div>
            <div className="flex justify-between py-1.5"><span className="text-stone-400 font-mono">ISSUE</span><span className="font-bold text-red-600">{issueType}</span></div>
            <div className="flex justify-between py-1.5"><span className="text-stone-400 font-mono">AI PRICE ESTIMATE</span><span className="font-bold text-atelier-accent">${aiResult?.costEstimate || 45}</span></div>
            <div className="flex justify-between py-1.5"><span className="text-stone-400 font-mono">PICKUP TYPE</span><span className="font-bold uppercase text-[10px]">{pickupOption}</span></div>
          </div>
          <button
            onClick={() => {
              setAiResult(null);
              setIsConfirmed(false);
              setDescription("");
              setImage(null);
            }}
            className="bg-atelier-text text-white text-xs font-semibold tracking-[0.15em] uppercase px-6 py-3 cursor-pointer hover:bg-atelier-accent transition-all duration-300"
          >
            Create New Repair Request
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Form & Photo upload */}
          <div className="lg:col-span-6 space-y-8">
            <div className="bg-white border border-atelier-border p-6 shadow-sm space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="font-serif text-xl font-medium text-stone-800">1. Submission Form</h3>
                <button
                  type="button"
                  onClick={loadDemoRepair}
                  className="text-xs font-mono text-atelier-accent hover:underline cursor-pointer"
                >
                  Load Demo Tear
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono text-stone-400 uppercase mb-2">Garment Category</label>
                  <select
                    value={garmentType}
                    onChange={(e) => setGarmentType(e.target.value)}
                    className="w-full border border-stone-200 p-2 text-xs rounded-none bg-white focus:outline-none focus:border-atelier-accent cursor-pointer"
                  >
                    <option value="Suit Jacket">Suit Jacket</option>
                    <option value="Trousers / Slacks">Trousers / Slacks</option>
                    <option value="Bespoke Shirt">Bespoke Shirt</option>
                    <option value="Silk/Tuxedo Dress">Silk / Tuxedo Dress</option>
                    <option value="Heavy Winter Overcoat">Heavy Winter Overcoat</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-stone-400 uppercase mb-2">Primary Alteration / Issue</label>
                  <select
                    value={issueType}
                    onChange={(e) => setIssueType(e.target.value)}
                    className="w-full border border-stone-200 p-2 text-xs rounded-none bg-white focus:outline-none focus:border-atelier-accent cursor-pointer"
                  >
                    <option value="Torn seam">Torn seam (mending)</option>
                    <option value="Zip replacement">Zip replacement</option>
                    <option value="Size adjustment">Size adjustment (fitting)</option>
                    <option value="Button replacement">Button replacement</option>
                    <option value="Shortening trousers">Shortening trousers</option>
                    <option value="Jacket resizing">Jacket resizing</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-[10px] font-mono text-stone-400 uppercase mb-2">Describe issue & tailor directives</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="E.g., Seam split in the underarm lining. I'd like matching silk lining replacement if possible..."
                  className="w-full border border-stone-200 p-3 text-xs rounded-none h-24 focus:outline-none focus:border-atelier-accent resize-none"
                ></textarea>
              </div>

              {/* Photo upload */}
              <div>
                <span className="block text-[10px] font-mono text-stone-400 uppercase mb-2">Upload Photo of Damaged Area</span>
                <label className="border-2 border-dashed border-stone-300 hover:border-atelier-accent bg-stone-50 cursor-pointer h-28 flex flex-col items-center justify-center p-4 transition-colors">
                  {image ? (
                    <div className="flex items-center space-x-3">
                      <img src={image} alt="Torn item" className="w-16 h-16 object-cover border" />
                      <span className="text-xs font-mono text-atelier-accent">Garment loaded successfully</span>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Upload className="w-6 h-6 text-stone-400 mx-auto mb-1" />
                      <span className="text-xs text-stone-500">Click to attach photo or drag file here</span>
                    </div>
                  )}
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                </label>
              </div>

              {/* AI Trigger */}
              <button
                onClick={runAiAssessment}
                disabled={isAiLoading || !description}
                className="w-full bg-atelier-text hover:bg-atelier-accent disabled:bg-stone-200 disabled:text-stone-400 text-white font-semibold uppercase text-xs py-4 tracking-[0.15em] transition-all duration-300 cursor-pointer flex items-center justify-center space-x-2"
              >
                <Wrench className="w-4 h-4 text-atelier-accent" />
                <span>{isAiLoading ? "Analyzing seam damage..." : "Retrieve AI Damage Assessment"}</span>
              </button>
              {!description && (
                <p className="text-center text-[11px] text-stone-400 italic">Please describe the tailoring issue to begin AI pricing assessment</p>
              )}
            </div>
          </div>

          {/* Right Column: AI Output result, pickup selection, and checkout */}
          <div className="lg:col-span-6 space-y-8">
            <div className="bg-white border border-atelier-border p-6 shadow-sm min-h-[300px] flex flex-col justify-between">
              {isAiLoading ? (
                <div className="flex-1 flex flex-col items-center justify-center py-20 space-y-4">
                  <Loader2 className="w-8 h-8 text-atelier-accent animate-spin" />
                  <p className="text-xs text-atelier-accent uppercase tracking-widest font-mono animate-pulse">Consulting virtual alterations cutter...</p>
                </div>
              ) : aiResult ? (
                <div className="space-y-6">
                  {/* Title */}
                  <div className="border-b border-atelier-border pb-4">
                    <span className="text-[10px] font-mono tracking-widest text-atelier-accent uppercase block">AI ANALYSIS SUMMARY</span>
                    <h3 className="font-serif text-2xl font-medium text-stone-800 mt-1">Sartorial Repair Proposal</h3>
                  </div>

                  {/* Pricing and time summary */}
                  <div className="grid grid-cols-3 gap-4 bg-stone-50 p-4 border border-stone-200 text-center">
                    <div>
                      <span className="block text-[9px] font-mono text-stone-400 uppercase">COST ESTIMATE</span>
                      <span className="text-lg font-serif font-bold text-stone-800">${aiResult.costEstimate}</span>
                    </div>
                    <div>
                      <span className="block text-[9px] font-mono text-stone-400 uppercase">DURATION</span>
                      <span className="text-xs font-serif font-bold text-stone-800">{aiResult.timeEstimate}</span>
                    </div>
                    <div>
                      <span className="block text-[9px] font-mono text-stone-400 uppercase">COMPLEXITY</span>
                      <span className="text-xs font-serif font-bold text-atelier-accent">{aiResult.complexity}</span>
                    </div>
                  </div>

                  {/* Recommendation text */}
                  <div>
                    <span className="block text-[9px] font-mono text-stone-400 uppercase mb-1">RECOMMENDED EXPERTISE</span>
                    <p className="text-xs text-stone-600 leading-relaxed font-serif italic">"{aiResult.tailorRecommendation}"</p>
                  </div>

                  {/* Step list */}
                  <div>
                    <span className="block text-[9px] font-mono text-stone-400 uppercase mb-2">DRAFT REPAIR PROTOCOL</span>
                    <ol className="text-xs text-stone-500 space-y-1.5 list-decimal list-inside pl-1">
                      {aiResult.repairSteps?.map((step: string, idx: number) => (
                        <li key={idx} className="leading-relaxed">{step}</li>
                      ))}
                    </ol>
                  </div>

                  {/* Care Tip */}
                  <div className="bg-atelier-bg p-3 text-xs border border-atelier-border text-stone-500 italic">
                    💡 <strong>Caring Tip:</strong> {aiResult.caringTip}
                  </div>

                  {/* Part 2: Pickup details */}
                  <div className="pt-6 border-t border-atelier-border space-y-4">
                    <h4 className="font-serif text-lg font-medium text-stone-800">2. Collection Options</h4>
                    <div className="grid grid-cols-3 gap-2">
                      {["Customer drop-off", "Courier collection", "Home pickup"].map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setPickupOption(opt)}
                          className={`p-3 text-[10px] text-center border font-mono uppercase tracking-[0.12em] cursor-pointer transition-all duration-300 ${
                            pickupOption === opt ? "border-atelier-accent bg-atelier-accent/5 text-atelier-accent" : "border-stone-200 text-stone-500"
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="w-full bg-atelier-text hover:bg-atelier-accent text-white font-semibold text-xs py-4 tracking-[0.15em] uppercase rounded-none cursor-pointer flex items-center justify-center space-x-1 shadow-lg transition-all duration-300"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Mending Ticket creation...</span>
                        </>
                      ) : (
                        <>
                          <span>Approve & Request Pickup</span>
                          <ArrowRight className="w-4 h-4 text-atelier-accent" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : error ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
                  <span className="text-red-500 text-2xl">⚠️</span>
                  <h4 className="font-serif text-lg font-medium">Assessment Failed</h4>
                  <p className="text-xs text-stone-400 max-w-xs">{error}</p>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center text-stone-400 py-16">
                  <Wrench className="w-10 h-10 text-stone-300 stroke-[1.2] mb-3" />
                  <h4 className="font-serif text-lg font-medium">Alteration Estimator Slate</h4>
                  <p className="text-xs max-w-xs leading-relaxed mt-2">
                    Submit your garment specifications and mending directives on the left panel, and request an AI estimation to view costs, timelines, complexity, and custom protocols.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
