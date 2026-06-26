import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Globe, ArrowLeftRight, Coins, TrendingUp, Calculator, Check } from "lucide-react";
import { useCurrency, SUPPORTED_CURRENCIES } from "../context/CurrencyContext";

interface CurrencyWidgetProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CurrencyWidget({ isOpen, onClose }: CurrencyWidgetProps) {
  const { currency, setCurrency, currencyInfo, convertArbitrary } = useCurrency();
  
  // Local states for the Interactive Converter
  const [calcAmount, setCalcAmount] = useState<number>(1000);
  const [calcFrom, setCalcFrom] = useState<string>("USD");
  const [calcTo, setCalcTo] = useState<string>("EUR");
  const [calcResult, setCalcResult] = useState<number>(920);

  // Sync calculation when inputs change
  useEffect(() => {
    const result = convertArbitrary(calcAmount, calcFrom, calcTo);
    setCalcResult(result);
  }, [calcAmount, calcFrom, calcTo, currency]); // Also recalculate if global currency changes rates

  const handleSwap = () => {
    const prevFrom = calcFrom;
    setCalcFrom(calcTo);
    setCalcTo(prevFrom);
  };

  const formatCalcResult = (val: number, code: string) => {
    const sym = SUPPORTED_CURRENCIES[code]?.symbol || "";
    if (code === "JPY") {
      return `${sym}${Math.round(val).toLocaleString()}`;
    }
    return `${sym}${val.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-stone-950 z-50 cursor-pointer"
          />

          {/* Slide-out Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-stone-900 border-l border-stone-800 text-stone-100 z-50 flex flex-col shadow-2xl overflow-hidden font-sans"
          >
            {/* Header */}
            <div className="p-6 border-b border-stone-800 flex items-center justify-between bg-stone-950">
              <div className="flex items-center space-x-2.5">
                <Globe className="w-5 h-5 text-atelier-accent" />
                <div>
                  <h3 className="font-serif text-lg tracking-wider text-white">Atelier Currency Suite</h3>
                  <p className="text-[10px] font-mono uppercase tracking-widest text-stone-500">Uptown Suits Pricing & Exchange</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-stone-800 text-stone-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Drawer Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
              
              {/* Section 1: Set Active Boutique Currency */}
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <Coins className="w-4 h-4 text-atelier-accent" />
                  <h4 className="font-serif text-sm tracking-widest text-stone-200 uppercase">Boutique Store Currency</h4>
                </div>
                <p className="text-xs text-stone-400 mb-4 leading-relaxed">
                  Select your local currency. All suite tailoring prices, bespoke estimator items, and custom order payments will convert instantly.
                </p>

                <div className="grid grid-cols-2 gap-2.5">
                  {Object.values(SUPPORTED_CURRENCIES).map((curr) => {
                    const isSelected = currency === curr.code;
                    return (
                      <button
                        key={curr.code}
                        onClick={() => setCurrency(curr.code)}
                        className={`p-3 rounded-lg border text-left flex items-center justify-between transition-all cursor-pointer ${
                          isSelected
                            ? "bg-atelier-accent/15 border-atelier-accent text-white font-semibold shadow-inner"
                            : "bg-stone-950/40 border-stone-800/80 text-stone-300 hover:bg-stone-800 hover:border-stone-700"
                        }`}
                      >
                        <div className="flex items-center space-x-2.5">
                          <span className="text-lg">{curr.flag}</span>
                          <div className="flex flex-col">
                            <span className="text-xs font-bold font-mono tracking-wider">{curr.code}</span>
                            <span className="text-[9px] text-stone-500 truncate max-w-[100px]">{curr.name}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1.5">
                          <span className="text-xs font-mono font-bold text-atelier-accent">{curr.symbol}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-atelier-accent fill-atelier-accent/20" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Section 2: Interactive Currency Converter */}
              <div className="p-5 rounded-xl border border-stone-800 bg-stone-950/60 shadow-md">
                <div className="flex items-center space-x-2 mb-4">
                  <Calculator className="w-4 h-4 text-atelier-accent" />
                  <h4 className="font-serif text-sm tracking-widest text-stone-200 uppercase font-medium">Bespoke Rate Calculator</h4>
                </div>

                {/* Amount input */}
                <div className="mb-4">
                  <label className="block text-[10px] font-mono uppercase tracking-widest text-stone-500 mb-1.5">Convert Amount</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={calcAmount}
                      onChange={(e) => setCalcAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-full bg-stone-900 border border-stone-800 rounded-lg px-4 py-2.5 font-mono text-xs text-white focus:outline-none focus:border-atelier-accent"
                      placeholder="1,000"
                    />
                    <span className="absolute right-4 top-2.5 text-xs font-mono text-stone-500">{calcFrom}</span>
                  </div>
                </div>

                {/* Select dropdowns with swap */}
                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 mb-5">
                  {/* From Currency */}
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-widest text-stone-500 mb-1">From</label>
                    <select
                      value={calcFrom}
                      onChange={(e) => setCalcFrom(e.target.value)}
                      className="w-full bg-stone-900 border border-stone-800 rounded-lg px-2.5 py-2 font-sans text-xs text-white focus:outline-none focus:border-atelier-accent"
                    >
                      {Object.values(SUPPORTED_CURRENCIES).map((c) => (
                        <option key={c.code} value={c.code} className="bg-stone-900 text-stone-100">
                          {c.flag} {c.code}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Swap Button */}
                  <div className="pt-4">
                    <button
                      onClick={handleSwap}
                      title="Swap currencies"
                      className="p-2 rounded-lg bg-stone-900 hover:bg-stone-800 border border-stone-800 hover:border-stone-700 text-stone-400 hover:text-white transition-all duration-300 cursor-pointer"
                    >
                      <ArrowLeftRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* To Currency */}
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-widest text-stone-500 mb-1">To</label>
                    <select
                      value={calcTo}
                      onChange={(e) => setCalcTo(e.target.value)}
                      className="w-full bg-stone-900 border border-stone-800 rounded-lg px-2.5 py-2 font-sans text-xs text-white focus:outline-none focus:border-atelier-accent"
                    >
                      {Object.values(SUPPORTED_CURRENCIES).map((c) => (
                        <option key={c.code} value={c.code} className="bg-stone-900 text-stone-100">
                          {c.flag} {c.code}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Calculation Output Panel */}
                <div className="bg-stone-900 p-4 rounded-lg border border-stone-850 text-center">
                  <span className="text-[10px] font-mono text-stone-500 uppercase tracking-widest block mb-1">Converted Value</span>
                  <div className="font-serif text-xl font-bold text-white tracking-wide">
                    {calcAmount.toLocaleString()} {calcFrom} =
                  </div>
                  <div className="font-serif text-2xl font-bold text-atelier-accent tracking-wide mt-1">
                    {formatCalcResult(calcResult, calcTo)}
                  </div>
                  <span className="text-[9px] font-mono text-stone-500 block mt-2 tracking-wider">
                    Rate: 1 {calcFrom} = {((SUPPORTED_CURRENCIES[calcTo]?.rate || 1) / (SUPPORTED_CURRENCIES[calcFrom]?.rate || 1)).toFixed(4)} {calcTo}
                  </span>
                </div>
              </div>

              {/* Section 3: Exchange Rate Ledger */}
              <div className="border border-stone-800 rounded-xl overflow-hidden bg-stone-950/30">
                <div className="p-4 bg-stone-950/80 border-b border-stone-800 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-3.5 h-3.5 text-atelier-accent" />
                    <span className="font-serif text-xs uppercase tracking-widest text-stone-300">Live Atelier Ledgers (1 USD)</span>
                  </div>
                  <span className="text-[8px] font-mono bg-stone-900 px-2 py-0.5 rounded text-stone-500 uppercase font-bold">Standard Reference</span>
                </div>
                <div className="divide-y divide-stone-850">
                  {Object.values(SUPPORTED_CURRENCIES).map((c) => (
                    <div key={c.code} className="p-3 flex items-center justify-between text-xs font-mono">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">{c.flag}</span>
                        <span className="text-stone-300 font-bold">{c.code}</span>
                        <span className="text-stone-500 text-[10px] hidden sm:inline">- {c.name}</span>
                      </div>
                      <div className="text-stone-300">
                        1.00 USD = <span className="text-white font-bold">{c.symbol}{c.rate.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Sticky Foot */}
            <div className="p-4 bg-stone-950 border-t border-stone-800 flex items-center justify-between">
              <span className="text-[10px] font-mono text-stone-500 uppercase tracking-wider">
                Active Client Currency:
              </span>
              <div className="flex items-center space-x-1.5 bg-stone-900 border border-stone-800 px-2.5 py-1 rounded text-xs font-mono font-bold text-white">
                <span>{currencyInfo.flag}</span>
                <span className="text-atelier-accent">{currencyInfo.code}</span>
                <span className="text-stone-500">({currencyInfo.symbol})</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
