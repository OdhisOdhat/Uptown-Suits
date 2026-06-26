import React from "react";
import { ShoppingBag, User, Sliders, MapPin, LogOut, LogIn, ShieldAlert } from "lucide-react";

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  cartCount: number;
  user: { id: string; name: string; email: string; role: "customer" | "admin" } | null;
  onLogout: () => void;
  onOpenAuth: () => void;
}

export default function Navbar({
  activeTab,
  setActiveTab,
  cartCount,
  user,
  onLogout,
  onOpenAuth
}: NavbarProps) {
  
  // Custom navigation items based on user role
  const navItems = user?.role === "admin"
    ? [
        { id: "tailor-dashboard", label: "Workspace CRM" },
        { id: "shop", label: "Products Catalog" },
        { id: "custom-studio", label: "Bespoke Configurator" },
        { id: "gallery", label: "Bespoke Gallery" },
        { id: "reviews", label: "Client Reviews" },
      ]
    : [
        { id: "shop", label: "Shop Boutique" },
        { id: "style-finder", label: "AI Style Finder" },
        { id: "custom-studio", label: "Custom Order" },
        { id: "repairs", label: "Repairs & Care" },
        { id: "gallery", label: "Bespoke Gallery" },
        { id: "reviews", label: "Client Reviews" },
        { id: "wardrobe", label: "Customer Closet" },
      ];

  return (
    <header className="sticky top-0 z-50 bg-stone-900 border-b border-stone-800 text-white px-4 lg:px-12 py-4 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Branding */}
        <div 
          className="flex flex-col cursor-pointer"
          onClick={() => setActiveTab("home")}
        >
          <span className="font-serif text-xl lg:text-2xl tracking-wider font-semibold text-white hover:text-stone-200 transition-colors">
            Uptown Suits <span className="font-sans text-[10px] tracking-[0.25em] font-medium text-atelier-accent ml-1">BESPOKE</span>
          </span>
          <span className="text-[9px] tracking-[0.3em] font-mono text-stone-500">EST. 2026</span>
        </div>

        {/* Center Navigation */}
        <nav className="hidden md:flex items-center space-x-6 lg:space-x-8">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`text-xs uppercase tracking-[0.18em] font-bold transition-all duration-200 cursor-pointer ${
                activeTab === item.id
                  ? "text-atelier-accent border-b border-atelier-accent pb-1"
                  : "text-stone-400 hover:text-white"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Right Utilities */}
        <div className="flex items-center space-x-3">
          {/* Tracker Shortcut (Only for customers) */}
          {user?.role !== "admin" && (
            <button
              onClick={() => setActiveTab("tracker")}
              title="Track Order"
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                activeTab === "tracker"
                  ? "bg-stone-800 text-atelier-accent"
                  : "text-stone-400 hover:bg-stone-800 hover:text-white"
              }`}
            >
              <MapPin className="w-4 h-4" />
            </button>
          )}

          {/* Cart Bag (Only for customers) */}
          {user?.role !== "admin" && (
            <button
              onClick={() => setActiveTab("shop")}
              title="Shopping Cart"
              className="p-2 rounded-lg text-stone-400 hover:bg-stone-800 hover:text-white transition-colors relative cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 bg-atelier-accent text-stone-900 text-[8px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </button>
          )}

          {/* User Role Badging */}
          {user ? (
            <div className="flex items-center space-x-3 bg-stone-800 px-3 py-1.5 rounded-lg border border-stone-700">
              <div className="flex flex-col text-right hidden sm:block">
                <span className="text-[10px] font-bold text-white leading-tight block">
                  {user.name}
                </span>
                <span className="text-[8px] font-mono tracking-widest text-stone-400 uppercase leading-none block mt-0.5">
                  {user.role === "admin" ? "Tailor Master" : "Bespoke Club"}
                </span>
              </div>
              
              {/* Tailor Admin Quick Trigger */}
              {user.role === "admin" && (
                <button
                  onClick={() => setActiveTab("tailor-dashboard")}
                  title="Tailor Dashboard"
                  className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                    activeTab === "tailor-dashboard" ? "bg-amber-600 text-white" : "text-stone-400 hover:text-white"
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Logout Button */}
              <button
                onClick={onLogout}
                title="Sign Out"
                className="p-1 text-stone-400 hover:text-red-400 hover:bg-stone-900/40 rounded transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center space-x-1 px-3 py-1.5 bg-atelier-accent hover:bg-amber-600 text-stone-950 font-bold text-xs uppercase tracking-widest rounded-lg transition-colors cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Join Uptown Suits</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

