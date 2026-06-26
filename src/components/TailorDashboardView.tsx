import React, { useState, useEffect } from "react";
import { ClipboardList, Users, ArrowRight, CheckCircle2, RotateCw, AlertCircle, Wrench, Scissors, MessageSquare, Check, X, Star } from "lucide-react";
import { Order, RepairRequest, OrderStatus, Review } from "../types";

interface TailorDashboardViewProps {
  orders: Order[];
  repairs: RepairRequest[];
  onUpdateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
  onUpdateRepairStatus: (repairId: string, newStatus: any) => void;
  onAssignTeam: (orderId: string, role: "Cutter" | "Sewer" | "Finisher" | "None") => void;
}

export default function TailorDashboardView({
  orders,
  repairs,
  onUpdateOrderStatus,
  onUpdateRepairStatus,
  onAssignTeam,
}: TailorDashboardViewProps) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [activeDashboardTab, setActiveDashboardTab] = useState<"workspace" | "reviews">("workspace");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  // Fetch reviews for admin
  const fetchReviews = async () => {
    try {
      setReviewsLoading(true);
      const res = await fetch("/api/reviews?adminView=true");
      if (res.ok) {
        const data = await res.json();
        setReviews(data);
      }
    } catch (err) {
      console.error("Failed to load reviews inside admin panel", err);
    } finally {
      setReviewsLoading(false);
    }
  };

  useEffect(() => {
    if (activeDashboardTab === "reviews") {
      fetchReviews();
    }
  }, [activeDashboardTab]);

  const handleUpdateReviewStatus = async (id: string, status: "approved" | "rejected") => {
    // Optimistic update
    setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    try {
      await fetch(`/api/reviews/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
    } catch (err) {
      console.error("Failed to update review status", err);
    }
  };

  // Kanban Columns
  const COLUMNS: { id: OrderStatus; label: string; desc: string }[] = [
    { id: "Pending", label: "New Order", desc: "Awaiting fabric check" },
    { id: "Fabric sourcing", label: "Measuring", desc: "Selecting and cutting fibers" },
    { id: "Cutting", label: "Drafting/Cutting", desc: "Hand shearing wool" },
    { id: "Sewing", label: "Sewing", desc: "Stitching and lining work" },
    { id: "Quality check", label: "Quality Check", desc: "Pre-press inspect" },
    { id: "Ready for fitting", label: "Fitting", desc: "Basting and customer fitting" },
    { id: "Completed", label: "Ready", desc: "Final pressing done" },
    { id: "Delivered", label: "Delivered", desc: "Dispatched to courier" },
  ];

  // Tailor assignment options
  const TEAM_ROLES: ("Cutter" | "Sewer" | "Finisher" | "None")[] = ["Cutter", "Sewer", "Finisher", "None"];

  // Quick statistics
  const newOrdersCount = orders.filter((o) => o.status === "Pending").length;
  const fittingCount = orders.filter((o) => o.status === "Ready for fitting").length;
  const activeRepairsCount = repairs.filter((r) => r.status !== "Delivered").length;

  const handleCycleStatus = (order: Order) => {
    const currentIndex = COLUMNS.findIndex((col) => col.id === order.status);
    if (currentIndex < COLUMNS.length - 1) {
      const nextStatus = COLUMNS[currentIndex + 1].id;
      onUpdateOrderStatus(order.id, nextStatus);
    }
  };

  const handleCycleRepair = (repair: RepairRequest) => {
    const repairStages: any[] = ["Submitted", "Courier collection", "In repair", "Quality check", "Ready for pickup", "Delivered"];
    const idx = repairStages.indexOf(repair.status);
    if (idx < repairStages.length - 1) {
      onUpdateRepairStatus(repair.id, repairStages[idx + 1]);
    }
  };

  return (
    <div className="bg-atelier-bg min-h-screen py-12 px-4 lg:px-12 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="border-b border-atelier-border pb-8 mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-xs tracking-[0.25em] font-mono text-stone-400 uppercase">MODULE 9 & KANBAN STATE</span>
          <h1 className="text-4xl lg:text-5xl font-serif text-atelier-text mt-2">The Tailor Dashboard</h1>
          <p className="text-stone-600 text-sm mt-3 max-w-2xl">
            Sartorial administration board. Direct active workshop commissions, manage team tasks (shearing cutters, lining sewers, final press finish finishers), and advance production stages.
          </p>
        </div>
      </div>

      {/* Daily Queue statistics bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white border border-atelier-border p-5 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-stone-100 rounded text-atelier-accent">
            <ClipboardList className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-stone-400 uppercase">AWAITING REVIEW</span>
            <h4 className="text-2xl font-serif font-bold text-stone-800">{newOrdersCount} New Orders</h4>
          </div>
        </div>

        <div className="bg-white border border-atelier-border p-5 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-stone-100 rounded text-atelier-accent">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-stone-400 uppercase">PENDING FITTINGS</span>
            <h4 className="text-2xl font-serif font-bold text-stone-800">{fittingCount} Fittings Scheduled</h4>
          </div>
        </div>

        <div className="bg-white border border-atelier-border p-5 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-stone-100 rounded text-atelier-accent">
            <Wrench className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-stone-400 uppercase">MENDING QUEUE</span>
            <h4 className="text-2xl font-serif font-bold text-stone-800">{activeRepairsCount} Active Repairs</h4>
          </div>
        </div>
      </div>

      {/* Sub-tab Selection */}
      <div className="flex border-b border-atelier-border mb-8 space-x-6">
        <button
          onClick={() => setActiveDashboardTab("workspace")}
          className={`pb-4 text-xs font-mono uppercase tracking-widest font-bold border-b-2 transition-all cursor-pointer ${
            activeDashboardTab === "workspace"
              ? "border-atelier-accent text-stone-900 font-semibold"
              : "border-transparent text-stone-400 hover:text-stone-700"
          }`}
        >
          Workshop Operations
        </button>
        <button
          onClick={() => setActiveDashboardTab("reviews")}
          className={`pb-4 text-xs font-mono uppercase tracking-widest font-bold border-b-2 transition-all cursor-pointer relative ${
            activeDashboardTab === "reviews"
              ? "border-atelier-accent text-stone-900 font-semibold"
              : "border-transparent text-stone-400 hover:text-stone-700"
          }`}
        >
          Review Moderation
          {reviews.filter((r) => r.status === "pending").length > 0 && (
            <span className="absolute -top-1.5 -right-3.5 bg-amber-500 text-stone-950 text-[8px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold">
              {reviews.filter((r) => r.status === "pending").length}
            </span>
          )}
        </button>
      </div>

      {activeDashboardTab === "workspace" ? (
        /* Layout: Left Kanban, Right detail panel */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Kanban Board */}
          <div className="lg:col-span-8 space-y-6">
            <h3 className="font-serif text-xl font-semibold text-stone-800">Production Board</h3>

            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 divide-y divide-[#E7E5E4]">
              {orders.map((order) => (
                <div
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  className={`p-5 bg-white border transition-all duration-300 cursor-pointer flex flex-col sm:flex-row justify-between sm:items-center gap-4 ${
                    selectedOrder?.id === order.id ? "border-atelier-accent shadow-md" : "border-atelier-border hover:border-atelier-accent"
                  }`}
                >
                  {/* Details */}
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono font-bold text-atelier-accent">{order.id}</span>
                      <span className="text-[10px] uppercase font-mono bg-stone-100 text-stone-600 px-2 py-0.5">
                        {order.type}
                      </span>
                    </div>
                    <h4 className="font-serif text-base font-bold text-stone-800">
                      {order.type === "custom"
                        ? order.customDetails?.designName || "Bespoke Suit Draft"
                        : order.productName}
                    </h4>
                    <div className="flex flex-wrap gap-x-4 text-xs text-stone-500 font-mono">
                      <span>Client: {order.customerName}</span>
                      <span>Date: {order.date}</span>
                      <span>Total: ${order.totalPrice}</span>
                    </div>
                  </div>

                  {/* Status Column & Assignment Controls */}
                  <div className="flex flex-col sm:items-end space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] uppercase font-mono text-stone-400">STAGE:</span>
                      <span className="text-xs font-bold text-stone-800 bg-atelier-accent/15 border border-atelier-accent/30 px-2.5 py-1">
                        {order.status}
                      </span>
                    </div>

                    {/* Cycle Status */}
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCycleStatus(order);
                        }}
                        disabled={order.status === "Delivered"}
                        className="text-[10px] font-mono tracking-wider font-bold text-stone-600 hover:text-stone-900 border border-stone-300 bg-stone-50 px-2.5 py-1 disabled:opacity-40 cursor-pointer flex items-center space-x-1"
                      >
                        <RotateCw className="w-3 h-3" />
                        <span>Advance Stage</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Alterations Board List */}
            <div className="pt-8 space-y-4">
              <h3 className="font-serif text-xl font-semibold text-stone-800">Active Alterations & Repairs Queue</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {repairs.map((rep) => (
                  <div key={rep.id} className="bg-white border border-atelier-border p-5 space-y-4 shadow-sm flex flex-col justify-between hover:border-atelier-accent transition-colors duration-300">
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-mono text-stone-400 uppercase font-bold">{rep.id}</span>
                        <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-red-50 text-red-600 font-bold">
                          {rep.status}
                        </span>
                      </div>
                      <h4 className="font-serif text-base font-semibold text-stone-800">{rep.garmentType} - {rep.issueType}</h4>
                      <p className="text-stone-500 text-xs italic">"{rep.description}"</p>
                    </div>

                    <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                      <span className="font-mono text-xs text-atelier-accent">Est: ${rep.costEstimate}</span>
                      <button
                        onClick={() => handleCycleRepair(rep)}
                        disabled={rep.status === "Delivered"}
                        className="text-[9px] font-mono border border-stone-200 px-2 py-1 hover:bg-stone-50 text-stone-600 cursor-pointer"
                      >
                        Cycle Repair Step
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Detail Panel: Commission parameters and measurements */}
          <div className="lg:col-span-4">
            <div className="bg-white border border-atelier-border p-6 shadow-sm min-h-[400px]">
              {selectedOrder ? (
                <div className="space-y-6">
                  {/* Title */}
                  <div className="border-b border-stone-200 pb-4">
                    <span className="text-[9px] font-mono text-atelier-accent uppercase tracking-widest block">TAILOR ASSIGNMENT WORKBENCH</span>
                    <h3 className="font-serif text-2xl font-bold mt-1">{selectedOrder.id} Details</h3>
                  </div>

                  {/* Team Assignment Panel */}
                  <div className="space-y-2">
                    <span className="block text-[10px] font-mono text-stone-400 uppercase">Assigned Workshop Tailor</span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {TEAM_ROLES.map((role) => (
                        <button
                          key={role}
                          onClick={() => onAssignTeam(selectedOrder.id, role)}
                          className={`p-2.5 text-xs font-mono border uppercase tracking-[0.12em] text-center cursor-pointer transition-all duration-300 ${
                            selectedOrder.assignedTo === role
                              ? "border-atelier-accent bg-atelier-accent/10 text-atelier-accent font-bold"
                              : "border-stone-200 text-stone-500 hover:border-atelier-accent"
                          }`}
                        >
                          {role}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Client info */}
                  <div className="bg-stone-50 p-4 border border-stone-200 space-y-2 text-xs">
                    <h5 className="font-mono text-[9px] text-stone-400 uppercase font-bold">CUSTOMER FITTING INFO</h5>
                    <p className="text-stone-700"><strong>Name:</strong> {selectedOrder.customerName}</p>
                    <p className="text-stone-700"><strong>Email:</strong> {selectedOrder.customerEmail}</p>
                    <p className="text-stone-700"><strong>Type:</strong> {selectedOrder.type.toUpperCase()}</p>
                  </div>

                  {/* Custom dimensions if custom */}
                  {selectedOrder.measurements && (
                    <div className="space-y-2">
                      <h5 className="font-mono text-[9px] text-stone-400 uppercase font-bold">CLIENT DIMENSIONS (IN)</h5>
                      <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="border p-1 bg-stone-50">
                          <span className="block text-[8px] font-mono text-stone-400">CHEST</span>
                          <span className="font-mono font-bold">{selectedOrder.measurements.chest}"</span>
                        </div>
                        <div className="border p-1 bg-stone-50">
                          <span className="block text-[8px] font-mono text-stone-400">WAIST</span>
                          <span className="font-mono font-bold">{selectedOrder.measurements.waist}"</span>
                        </div>
                        <div className="border p-1 bg-stone-50">
                          <span className="block text-[8px] font-mono text-stone-400">HIPS</span>
                          <span className="font-mono font-bold">{selectedOrder.measurements.hips}"</span>
                        </div>
                        <div className="border p-1 bg-stone-50">
                          <span className="block text-[8px] font-mono text-stone-400">NECK</span>
                          <span className="font-mono font-bold">{selectedOrder.measurements.neck}"</span>
                        </div>
                        <div className="border p-1 bg-stone-50">
                          <span className="block text-[8px] font-mono text-stone-400">SLEEVE</span>
                          <span className="font-mono font-bold">{selectedOrder.measurements.sleeveLength}"</span>
                        </div>
                        <div className="border p-1 bg-stone-50">
                          <span className="block text-[8px] font-mono text-stone-400">INSEAM</span>
                          <span className="font-mono font-bold">{selectedOrder.measurements.inseam}"</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Design Specifications if custom */}
                  {selectedOrder.customDetails && (
                    <div className="space-y-2 bg-atelier-bg p-3 border border-atelier-border text-xs">
                      <h5 className="font-mono text-[9px] text-atelier-accent uppercase font-bold">
                        {selectedOrder.customDetails.category === "shoes" ? "SHOEFITTING SPECIFICATION" : selectedOrder.customDetails.category === "accessories" ? "ACCESSORY SPECIFICATION" : "GARMENT SPECIFICATION"}
                      </h5>
                      {selectedOrder.customDetails.category === "shoes" ? (
                        <>
                          <p className="text-stone-700"><strong>Shoe Last:</strong> {selectedOrder.customDetails.shoeType}</p>
                          <p className="text-stone-700"><strong>Leather Choice:</strong> {selectedOrder.customDetails.leatherType}</p>
                          <p className="text-stone-700"><strong>Sartorial Color:</strong> {selectedOrder.customDetails.color}</p>
                          <p className="text-stone-700"><strong>US Fitting Size:</strong> US {selectedOrder.customDetails.shoeSize}</p>
                        </>
                      ) : selectedOrder.customDetails.category === "accessories" ? (
                        <>
                          <p className="text-stone-700"><strong>Accessory:</strong> {selectedOrder.customDetails.accessoryType}</p>
                          <p className="text-stone-700"><strong>Color Shade:</strong> {selectedOrder.customDetails.color}</p>
                          <p className="text-stone-700"><strong>Fabrication:</strong> Premium Hand-rolled Selection</p>
                        </>
                      ) : (
                        <>
                          <p className="text-stone-700"><strong>Fabric:</strong> {selectedOrder.customDetails.fabric}</p>
                          <p className="text-stone-700"><strong>Pattern:</strong> {selectedOrder.customDetails.pattern}</p>
                          <p className="text-stone-700"><strong>Lapels:</strong> {selectedOrder.customDetails.lapelStyle || "Standard Notch"}</p>
                          <p className="text-stone-700"><strong>Pockets:</strong> {selectedOrder.customDetails.pocketsStyle || "Flap Pockets"}</p>
                          <p className="text-stone-700"><strong>Cuffs:</strong> {selectedOrder.customDetails.cuffsStyle || "Standard Cuffs"}</p>
                        </>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-24 text-center text-stone-400">
                  <Scissors className="w-10 h-10 text-stone-300 mb-3 stroke-[1.2]" />
                  <h4 className="font-serif text-lg font-medium">Bespoke Workshop Workbench</h4>
                  <p className="text-xs leading-relaxed max-w-xs mt-2">
                    Select an active customer order from the left Kanban board to assign cutters, sewers, or review custom sewing measurements.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Reviews Moderation Tab View */
        <div className="bg-white border border-atelier-border rounded-xl p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 pb-6 mb-6">
            <div>
              <h3 className="font-serif text-2xl tracking-tight text-stone-900">Client Reviews Moderation</h3>
              <p className="text-stone-500 text-xs font-mono mt-1">Approve or reject client testimonials to maintain bespoke standards.</p>
            </div>
            <button
              onClick={fetchReviews}
              className="text-xs font-mono border border-stone-200 px-4 py-2 hover:bg-stone-50 cursor-pointer text-stone-600 transition-colors flex items-center gap-1.5"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Refresh List</span>
            </button>
          </div>

          {reviewsLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="animate-pulse bg-stone-100 h-24 rounded-lg border border-stone-200"></div>
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-16 text-stone-400">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 stroke-[1.2]" />
              <h4 className="font-serif text-lg font-medium text-stone-700">No client reviews submitted yet</h4>
              <p className="text-xs max-w-sm mx-auto mt-1">Once clients submit reviews from the "Client Reviews" tab, they will appear here for your validation.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-stone-200 text-stone-400 font-bold uppercase tracking-wider">
                    <th className="pb-3 pt-2 font-bold">Patron / Sizing</th>
                    <th className="pb-3 pt-2 font-bold">Commentary</th>
                    <th className="pb-3 pt-2 font-bold">Status</th>
                    <th className="pb-3 pt-2 text-right font-bold">Verification Decision</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {reviews.map((review) => (
                    <tr key={review.id} className="hover:bg-stone-50/50 transition-colors">
                      <td className="py-4 pr-4">
                        <div className="font-bold text-stone-900 font-sans text-xs">{review.customerName}</div>
                        <div className="text-[10px] text-stone-400 mt-0.5">{review.customerEmail}</div>
                        <div className="flex items-center text-atelier-accent mt-2">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${i < review.rating ? "fill-atelier-accent text-atelier-accent" : "text-stone-200"}`}
                            />
                          ))}
                        </div>
                      </td>
                      <td className="py-4 pr-4 max-w-xs md:max-w-md">
                        <p className="font-serif text-stone-700 italic text-xs leading-relaxed">
                          "{review.comment}"
                        </p>
                        <span className="text-[10px] text-stone-400 block mt-1.5">{review.date}</span>
                      </td>
                      <td className="py-4 pr-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] uppercase font-bold tracking-wider ${
                          review.status === "approved"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : review.status === "rejected"
                            ? "bg-red-50 text-red-700 border border-red-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}>
                          {review.status}
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          {review.status !== "approved" && (
                            <button
                              onClick={() => handleUpdateReviewStatus(review.id, "approved")}
                              title="Approve Review"
                              className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-md border border-emerald-200 transition-colors cursor-pointer flex items-center justify-center"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                          {review.status !== "rejected" && (
                            <button
                              onClick={() => handleUpdateReviewStatus(review.id, "rejected")}
                              title="Reject Review"
                              className="p-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-md border border-red-200 transition-colors cursor-pointer flex items-center justify-center"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
