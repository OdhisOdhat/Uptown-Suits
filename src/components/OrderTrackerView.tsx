import React, { useState } from "react";
import { Clock, MapPin, Truck, AlertCircle, Search, CheckCircle2 } from "lucide-react";
import { Order, OrderStatus } from "../types";

interface OrderTrackerViewProps {
  orders: Order[];
}

export default function OrderTrackerView({ orders }: OrderTrackerViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeOrder, setActiveOrder] = useState<Order | null>(orders[0] || null);
  const [error, setError] = useState<string | null>(null);

  const STAGES: OrderStatus[] = [
    "Pending",
    "Fabric sourcing",
    "Cutting",
    "Sewing",
    "Quality check",
    "Ready for fitting",
    "Completed",
    "Delivered"
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const trimmed = searchQuery.trim().toUpperCase();
    if (!trimmed) return;

    // Locate order
    const found = orders.find((o) => o.id.toUpperCase() === trimmed || o.id.toUpperCase() === `A-${trimmed}` || o.id.toUpperCase() === `R-${trimmed}`);
    if (found) {
      setActiveOrder(found);
    } else {
      setError(`We couldn't locate a tailoring commission matching ticket "${trimmed}". Please double-check your ID.`);
    }
  };

  const getStageIndex = (status: OrderStatus) => {
    return STAGES.indexOf(status);
  };

  const activeStageIndex = activeOrder ? getStageIndex(activeOrder.status) : 0;

  return (
    <div className="bg-atelier-bg min-h-screen py-12 px-4 lg:px-12 max-w-7xl mx-auto">
      {/* Header */}
      <div className="border-b border-atelier-border pb-8 mb-10">
        <span className="text-xs tracking-[0.25em] font-mono text-stone-400 uppercase">MODULE 4</span>
        <h1 className="text-4xl lg:text-5xl font-serif text-atelier-text mt-2">Bespoke Production Tracker</h1>
        <p className="text-stone-600 text-sm mt-3 max-w-2xl">
          Follow your custom garments through our physical production workshops in real-time. Enter your unique commission ticket number below.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Search & Quick select list */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-atelier-border p-6 shadow-sm space-y-4">
            <h3 className="font-serif text-lg font-medium text-stone-800">Search Commission Ticket</h3>
            <form onSubmit={handleSearch} className="flex border border-stone-300">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="E.g., A-2841"
                className="flex-1 p-3 text-xs font-mono focus:outline-none focus:bg-white bg-stone-50 uppercase"
              />
              <button
                type="submit"
                className="bg-atelier-text hover:bg-atelier-accent text-white px-4 cursor-pointer flex items-center justify-center transition-all duration-300"
              >
                <Search className="w-4 h-4 text-atelier-accent" />
              </button>
            </form>

            {error && (
              <div className="flex items-start space-x-2 text-xs text-red-600 bg-red-50 p-3 border border-red-200">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Quick Select Closet Orders */}
          <div className="bg-white border border-atelier-border p-6 shadow-sm space-y-4">
            <h4 className="font-serif text-base font-medium text-stone-500 uppercase tracking-widest">Active Commissions</h4>
            <div className="divide-y divide-stone-100">
              {orders.map((o) => (
                <button
                  key={o.id}
                  onClick={() => {
                    setActiveOrder(o);
                    setError(null);
                    setSearchQuery(o.id);
                  }}
                  className={`w-full py-3 text-left flex items-center justify-between transition-colors cursor-pointer ${
                    activeOrder?.id === o.id ? "text-atelier-accent" : "text-stone-600 hover:text-stone-900"
                  }`}
                >
                  <div className="min-w-0">
                    <span className="font-mono text-xs font-bold block">{o.id}</span>
                    <span className="text-xs truncate block text-stone-400">
                      {o.type === "custom" ? o.customDetails?.designName : o.productName}
                    </span>
                  </div>
                  <span className="text-[10px] uppercase font-mono bg-stone-100 text-stone-500 px-2 py-0.5 rounded ml-2 shrink-0">
                    {o.status}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Production Stepper */}
        <div className="lg:col-span-8">
          <div className="bg-white border border-atelier-border p-6 lg:p-10 shadow-sm">
            {activeOrder ? (
              <div className="space-y-8">
                {/* Stepper Header */}
                <div className="border-b border-stone-200 pb-5 flex flex-col sm:flex-row justify-between sm:items-baseline gap-2">
                  <div>
                    <span className="text-xs font-mono text-atelier-accent uppercase tracking-wider">TICKET STATUS TRACKER</span>
                    <h3 className="font-serif text-2xl font-bold text-stone-800 mt-1">Ticket {activeOrder.id}</h3>
                    <p className="text-xs text-stone-400 mt-1 uppercase font-mono">
                      GARMENT: {activeOrder.type === "custom" ? activeOrder.customDetails?.designName : activeOrder.productName}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="block text-[10px] font-mono text-stone-400 uppercase">CURRENT LOCATION</span>
                    <span className="text-sm font-medium text-stone-800 flex items-center justify-end space-x-1 mt-0.5">
                      <MapPin className="w-4 h-4 text-atelier-accent" />
                      <span>Uptown Workshop A</span>
                    </span>
                  </div>
                </div>

                {/* Vertical Stepper Visualizer */}
                <div className="relative pl-8 space-y-8 py-2">
                  {/* Vertical continuous connector line */}
                  <div className="absolute left-[13px] top-4 bottom-4 w-[2px] bg-stone-200"></div>

                  {STAGES.map((stage, idx) => {
                    const isCompleted = idx < activeStageIndex;
                    const isActive = idx === activeStageIndex;
                    const isUpcoming = idx > activeStageIndex;

                    return (
                      <div key={stage} className="relative flex items-start gap-6">
                        {/* Bullet indicators */}
                        <div
                          className={`absolute left-[-24px] top-1.5 w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all duration-300 z-10 ${
                            isCompleted
                              ? "bg-emerald-600 border-emerald-600 text-white"
                              : isActive
                              ? "bg-white border-atelier-accent text-atelier-accent scale-110 shadow-md ring-4 ring-atelier-accent/10"
                              : "bg-white border-stone-300 text-stone-400"
                          }`}
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="w-3.5 h-3.5 fill-current text-emerald-600 text-white" />
                          ) : (
                            <span className="text-[9px] font-mono font-bold">{idx + 1}</span>
                          )}
                        </div>

                        {/* Content description */}
                        <div className="space-y-1">
                          <h4
                            className={`font-serif text-base font-bold transition-colors ${
                              isCompleted
                                ? "text-stone-400 line-through"
                                : isActive
                                ? "text-stone-900"
                                : "text-stone-500"
                            }`}
                          >
                            {stage.charAt(0).toUpperCase() + stage.slice(1)}
                          </h4>
                          {isActive && (
                            <p className="text-xs text-stone-600 leading-normal bg-atelier-accent/5 border border-atelier-accent/20 p-3 italic">
                              💡 <strong>Tailor Update:</strong> Undergoing active workshops styling. Our assigned tailor is managing details to perfection.
                            </p>
                          )}
                          {isCompleted && (
                            <span className="text-[10px] text-emerald-600 font-mono flex items-center space-x-1">
                              <span>✓ Stage Complete</span>
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Shipping delivery banner if delivered */}
                {activeOrder.status === "Delivered" && (
                  <div className="bg-emerald-50 border border-emerald-200 p-4 flex items-start space-x-3 text-xs text-emerald-800">
                    <Truck className="w-5 h-5 shrink-0" />
                    <div>
                      <strong>Your piece is on its way.</strong> Our premium courier services will deliver to your registered coordinates. Tracking number dispatched to your phone.
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-24 text-stone-400 space-y-4">
                <Clock className="w-12 h-12 text-stone-300 mx-auto stroke-[1.2]" />
                <h4 className="font-serif text-lg font-medium">Production Stepper Desk</h4>
                <p className="text-xs max-w-sm mx-auto leading-relaxed">
                  Please search your unique tailoring commission ticket ID or choose one from the left panel active listing list to inspect the timeline of completed milestones.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
