import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import Navbar from "./components/Navbar";
import HomeView from "./components/HomeView";
import StyleFinderView from "./components/StyleFinderView";
import CustomOrderView from "./components/CustomOrderView";
import ShopView from "./components/ShopView";
import RepairsView from "./components/RepairsView";
import WardrobeView from "./components/WardrobeView";
import TailorDashboardView from "./components/TailorDashboardView";
import OrderTrackerView from "./components/OrderTrackerView";
import AuthView from "./components/AuthView";
import Footer from "./components/Footer";

import {
  INITIAL_ORDERS,
  INITIAL_REPAIRS,
  INITIAL_WARDROBE,
  INITIAL_MEASUREMENTS
} from "./data";
import { Order, RepairRequest, WardrobeItem, Measurement, OrderStatus, Product, CustomDesignSpec } from "./types";

export default function App() {
  // Navigation State
  const [activeView, setActiveView] = useState<string>("home");

  // User State
  const [user, setUser] = useState<{ id: string; name: string; email: string; role: "customer" | "admin" } | null>(() => {
    const saved = localStorage.getItem("uptown_user");
    return saved ? JSON.parse(saved) : null;
  });

  // Shared Central State
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [repairs, setRepairs] = useState<RepairRequest[]>(INITIAL_REPAIRS);
  const [wardrobe, setWardrobe] = useState<WardrobeItem[]>(INITIAL_WARDROBE);
  const [measurements, setMeasurements] = useState<Measurement>(INITIAL_MEASUREMENTS);

  // Prefill state for Custom Studio
  const [prefillDesign, setPrefillDesign] = useState<Partial<CustomDesignSpec> | undefined>(undefined);
  const [prefillMeasurements, setPrefillMeasurements] = useState<Partial<Measurement> | undefined>(undefined);

  // Cart / Purchases indicators
  const [cartCount, setCartCount] = useState(0);

  // Load and synchronize user-specific records from database
  useEffect(() => {
    const syncData = async () => {
      try {
        // 1. Fetch Orders
        const ordersUrl = user?.role === "admin"
          ? "/api/orders"
          : `/api/orders?userEmail=${encodeURIComponent(user?.email || "fodhis1@gmail.com")}`;
        const ordersRes = await fetch(ordersUrl);
        if (ordersRes.ok) {
          const ordersData = await ordersRes.json();
          // Filter out orders that belong to other users if we are not admin
          setOrders(ordersData);
        }

        // 2. Fetch Repairs
        const repairsUrl = user?.role === "admin"
          ? "/api/repairs"
          : `/api/repairs?userEmail=${encodeURIComponent(user?.email || "fodhis1@gmail.com")}`;
        const repairsRes = await fetch(repairsUrl);
        if (repairsRes.ok) {
          const repairsData = await repairsRes.json();
          setRepairs(repairsData);
        }

        // 3. Fetch Wardrobe Digital Closet
        const wardrobeRes = await fetch("/api/wardrobe");
        if (wardrobeRes.ok) {
          const wardrobeData = await wardrobeRes.json();
          setWardrobe(wardrobeData);
        }

        // 4. Fetch Master Biometrics Sizing
        const userIdKey = user?.id || "usr-customer";
        const measurementsRes = await fetch(`/api/measurements?userId=${userIdKey}`);
        if (measurementsRes.ok) {
          const measurementsData = await measurementsRes.json();
          setMeasurements(measurementsData);
        }
      } catch (err) {
        console.warn("Could not sync user-specific records from database. Using memory fallback mode:", err);
      }
    };

    syncData();
  }, [user]);

  // Handlers
  const handleApplyBiometrics = (estMeas: any, estDesign: any) => {
    // Save to prefill registers
    setPrefillMeasurements(estMeas);
    setPrefillDesign(estDesign);
    // Move user directly to Custom Configurator Studio
    setActiveView("custom-studio");
  };

  const handlePlaceCustomOrder = async (
    spec: CustomDesignSpec,
    meas: Measurement,
    paymentTerm: string,
    totalPrice: number
  ) => {
    const newOrderId = `A-${Math.floor(Math.random() * 9000 + 1000)}`;
    const customerName = user ? user.name : "Fodhis O.";
    const customerEmail = user ? user.email : "fodhis1@gmail.com";

    const newOrder: Order = {
      id: newOrderId,
      customerName,
      customerEmail,
      type: "custom",
      status: "Pending",
      totalPrice,
      date: new Date().toISOString().split("T")[0],
      customDetails: spec,
      measurements: meas,
      assignedTo: "None"
    };

    // Optimistically update memory states
    setOrders([newOrder, ...orders]);
    setCartCount((c) => c + 1);

    // Persist Custom Order to database
    try {
      await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newOrder)
      });
    } catch (e) {
      console.warn("API order persist failed:", e);
    }

    // Also add to physical digital wardrobe closet!
    const newWardrobeItem: WardrobeItem = {
      id: `WRD-${Math.floor(Math.random() * 900 + 100)}`,
      name: spec.designName || `Custom ${spec.category}`,
      category: spec.category,
      type: "custom",
      color: spec.color,
      fabric: spec.fabric,
      image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=200",
      dateAdded: new Date().toISOString().split("T")[0],
      status: "Commissioned"
    };
    setWardrobe([newWardrobeItem, ...wardrobe]);

    try {
      await fetch("/api/wardrobe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newWardrobeItem)
      });
    } catch (e) {
      console.warn("API wardrobe persist failed:", e);
    }
  };

  const handlePlaceRepairRequest = async (repair: RepairRequest) => {
    const updatedRepair = {
      ...repair,
      customerName: user ? user.name : repair.customerName,
      customerEmail: user ? user.email : repair.customerEmail
    };

    setRepairs([updatedRepair, ...repairs]);

    try {
      await fetch("/api/repairs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedRepair)
      });
    } catch (e) {
      console.warn("API repair request failed:", e);
    }
  };

  const handlePurchaseReadyToWear = async (product: Product, size: string) => {
    const newOrderId = `A-${Math.floor(Math.random() * 9000 + 1000)}`;
    const customerName = user ? user.name : "Fodhis O.";
    const customerEmail = user ? user.email : "fodhis1@gmail.com";

    const newOrder: Order = {
      id: newOrderId,
      customerName,
      customerEmail,
      type: "ready-made",
      productName: product.name,
      status: "Pending",
      totalPrice: product.price,
      date: new Date().toISOString().split("T")[0],
      assignedTo: "None",
      productId: product.id,
      productImage: product.image,
      productCategory: product.category
    };

    setOrders([newOrder, ...orders]);
    setCartCount((c) => c + 1);

    try {
      await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newOrder)
      });
    } catch (e) {
      console.warn("API order placement failed:", e);
    }

    // Add to Digital Wardrobe closet
    const newWardrobeItem: WardrobeItem = {
      id: `WRD-${Math.floor(Math.random() * 900 + 100)}`,
      name: product.name,
      category: product.category,
      type: "purchased",
      color: "Standard",
      fabric: product.fabricInfo || "Standard Italian Wool",
      image: product.image,
      dateAdded: new Date().toISOString().split("T")[0],
      status: "Bespoke Fitting Logged"
    };
    setWardrobe([newWardrobeItem, ...wardrobe]);

    try {
      await fetch("/api/wardrobe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newWardrobeItem)
      });
    } catch (e) {
      console.warn("API wardrobe placement failed:", e);
    }
  };

  const handleUpdateMeasurements = async (newMeas: Measurement) => {
    setMeasurements(newMeas);

    try {
      await fetch("/api/measurements", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user ? user.id : "usr-customer",
          ...newMeas
        })
      });
    } catch (e) {
      console.warn("API biometric update failed:", e);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    setOrders(
      orders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );

    try {
      await fetch(`/api/orders/${orderId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
    } catch (e) {
      console.warn("API order status update failed:", e);
    }
  };

  const handleUpdateRepairStatus = async (repairId: string, newStatus: any) => {
    setRepairs(
      repairs.map((r) => (r.id === repairId ? { ...r, status: newStatus } : r))
    );

    try {
      await fetch(`/api/repairs/${repairId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
    } catch (e) {
      console.warn("API repair status update failed:", e);
    }
  };

  const handleAssignTeamMember = async (orderId: string, role: "Cutter" | "Sewer" | "Finisher" | "None") => {
    setOrders(
      orders.map((o) => (o.id === orderId ? { ...o, assignedTo: role } : o))
    );

    try {
      await fetch(`/api/orders/${orderId}/assign`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignedTo: role })
      });
    } catch (e) {
      console.warn("API order assigning failed:", e);
    }
  };

  const handleAuthSuccess = (authenticatedUser: any) => {
    setUser(authenticatedUser);
    localStorage.setItem("uptown_user", JSON.stringify(authenticatedUser));
    // Route user based on their login role
    if (authenticatedUser.role === "admin") {
      setActiveView("tailor-dashboard");
    } else {
      setActiveView("wardrobe");
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("uptown_user");
    setActiveView("home");
  };

  return (
    <div className="bg-atelier-bg min-h-screen font-sans text-atelier-text">
      {/* Dynamic Header/Navbar bar */}
      <Navbar
        activeTab={activeView}
        setActiveTab={(view) => {
          setActiveView(view);
          // Clear prefilled values when manually moving out of the customizers
          if (view !== "custom-studio") {
            setPrefillDesign(undefined);
            setPrefillMeasurements(undefined);
          }
        }}
        cartCount={cartCount}
        user={user}
        onLogout={handleLogout}
        onOpenAuth={() => setActiveView("auth")}
      />

      {/* Main Multi-Screen Switch Board */}
      <main className="pb-20">
        <motion.div
          key={activeView}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          {activeView === "home" && (
            <HomeView onNavigate={setActiveView} />
          )}

          {activeView === "auth" && (
            <AuthView onAuthSuccess={handleAuthSuccess} />
          )}

          {activeView === "style-finder" && (
            <StyleFinderView
              onApplyMeasurements={handleApplyBiometrics}
              savedMeasurements={measurements}
            />
          )}

          {activeView === "custom-studio" && (
            <CustomOrderView
              initialDesign={prefillDesign}
              initialMeasurements={prefillMeasurements || measurements}
              onSubmitOrder={handlePlaceCustomOrder}
            />
          )}

          {activeView === "shop" && (
            <ShopView
              onPurchaseProduct={handlePurchaseReadyToWear}
              user={user}
            />
          )}

          {activeView === "repairs" && (
            <RepairsView onSubmitRepair={handlePlaceRepairRequest} />
          )}

          {activeView === "wardrobe" && (
            <WardrobeView
              wardrobe={wardrobe}
              measurements={measurements}
              onUpdateMeasurements={handleUpdateMeasurements}
            />
          )}

          {activeView === "tracker" && (
            <OrderTrackerView orders={orders} />
          )}

          {activeView === "tailor-dashboard" && (
            <TailorDashboardView
              orders={orders}
              repairs={repairs}
              onUpdateOrderStatus={handleUpdateOrderStatus}
              onUpdateRepairStatus={handleUpdateRepairStatus}
              onAssignTeam={handleAssignTeamMember}
            />
          )}
        </motion.div>
      </main>

      {/* Luxury Copyright Footer */}
      <Footer />
    </div>
  );
}
