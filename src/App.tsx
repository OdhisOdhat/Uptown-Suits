import React from "react";
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
import GalleryView from "./components/GalleryView";
import ReviewsView from "./components/ReviewsView";
import Footer from "./components/Footer";

import { useAppState } from "./hooks/useAppState";

export default function App() {
  const {
    activeView,
    setActiveView,
    user,
    orders,
    repairs,
    wardrobe,
    measurements,
    prefillDesign,
    setPrefillDesign,
    prefillMeasurements,
    setPrefillMeasurements,
    cartCount,
    handleApplyBiometrics,
    handlePlaceCustomOrder,
    handlePlaceRepairRequest,
    handlePurchaseReadyToWear,
    handleUpdateMeasurements,
    handleUpdateOrderStatus,
    handleUpdateRepairStatus,
    handleAssignTeamMember,
    handleAuthSuccess,
    handleLogout
  } = useAppState();

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

          {activeView === "gallery" && (
            <GalleryView user={user} />
          )}

          {activeView === "reviews" && (
            <ReviewsView user={user} />
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
