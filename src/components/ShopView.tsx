import React, { useState, useEffect } from "react";
import { ShoppingBag, Star, Info, Check, ShieldCheck, X, Plus, Trash2, Edit2, Search, SlidersHorizontal, Upload } from "lucide-react";
import { Product } from "../types";
import { useCurrency } from "../context/CurrencyContext";

interface ShopViewProps {
  onPurchaseProduct: (product: Product, size: string) => void;
  user: { id: string; name: string; email: string; role: "customer" | "admin" } | null;
}

export default function ShopView({ onPurchaseProduct, user }: ShopViewProps) {
  const { formatPrice } = useCurrency();
  const [productsList, setProductsList] = useState<Product[]>([]);

  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  // Admin and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"default" | "price-asc" | "price-desc" | "rating">("default");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // New Product form state
  const [newProdName, setNewProdName] = useState("");
  const [newProdPrice, setNewProdPrice] = useState("");
  const [newProdCategory, setNewProdCategory] = useState<string>("suits");
  const [newProdDesc, setNewProdDesc] = useState("");
  const [newProdImage, setNewProdImage] = useState("");
  const [newProdFabric, setNewProdFabric] = useState("");
  const [newProdSizes, setNewProdSizes] = useState("38R, 40R, 42R, 44R");
  const [formError, setFormError] = useState<string | null>(null);

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setNewProdName("");
    setNewProdPrice("");
    setNewProdCategory("suits");
    setNewProdDesc("");
    setNewProdImage("");
    setNewProdFabric("");
    setNewProdSizes("38R, 40R, 42R, 44R");
    setFormError(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (product: Product, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingProduct(product);
    setNewProdName(product.name);
    setNewProdPrice(product.price.toString());
    setNewProdCategory(product.category);
    setNewProdDesc(product.description || "");
    setNewProdImage(product.image || "");
    setNewProdFabric(product.fabricInfo || "");
    setNewProdSizes(product.sizeGuide ? product.sizeGuide.join(", ") : "");
    setFormError(null);
    setIsAddModalOpen(true);
  };

  const handleProductPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewProdImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const categories = [
    { id: "all", label: "All Items" },
    { id: "suits", label: "Men's Suits" },
    { id: "shirts", label: "Bespoke Shirts" },
    { id: "jackets", label: "Tailored Jackets" },
    { id: "dresses", label: "Women's Formal" },
    { id: "traditional", label: "Traditional Wear" },
    { id: "wedding", label: "Wedding Collection" },
    { id: "shoes", label: "Luxury Shoes" },
    { id: "accessories", label: "Bespoke Accessories" }
  ];

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/products");
      if (res.ok) {
        const data = await res.json();
        setProductsList(data);
      }
    } catch (err) {
      console.error("Could not fetch marketplace products from API:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleOpenDetail = (product: Product) => {
    setActiveProduct(product);
    setSelectedSize(product.sizeGuide?.[0] || "Medium");
    setPurchaseSuccess(false);
  };

  const handleBuy = () => {
    if (!activeProduct) return;
    onPurchaseProduct(activeProduct, selectedSize);
    setPurchaseSuccess(true);
    
    // Decrement stock locally
    setProductsList(
      productsList.map((p) =>
        p.id === activeProduct.id ? { ...p, stock: Math.max(0, p.stock - 1) } : p
      )
    );

    setTimeout(() => {
      setActiveProduct(null);
      setPurchaseSuccess(false);
    }, 2000);
  };

  const handleDeleteProduct = async (prodId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to retire this product from the atelier catalog?")) return;

    try {
      const res = await fetch(`/api/products/${prodId}`, { method: "DELETE" });
      if (res.ok) {
        setProductsList(productsList.filter((p) => p.id !== prodId));
        if (activeProduct?.id === prodId) {
          setActiveProduct(null);
        }
      }
    } catch (err) {
      console.error("Failed to delete product:", err);
    }
  };

  const handleAddProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!newProdName || !newProdPrice || !newProdDesc) {
      setFormError("Product name, price and description are required.");
      return;
    }

    const priceNum = parseFloat(newProdPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      setFormError("Please enter a valid price greater than zero.");
      return;
    }

    const sizesArr = newProdSizes.split(",").map((s) => s.trim()).filter((s) => s.length > 0);

    const payload = {
      name: newProdName,
      price: priceNum,
      category: newProdCategory,
      description: newProdDesc,
      image: newProdImage || "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&q=80&w=600",
      fabricInfo: newProdFabric || "100% Super Merino Wool",
      sizeGuide: sizesArr,
      stock: editingProduct ? editingProduct.stock : 10,
      rating: editingProduct ? editingProduct.rating : 5.0
    };

    try {
      const url = editingProduct ? `/api/products/${editingProduct.id}` : "/api/products";
      const method = editingProduct ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setIsAddModalOpen(false);
        setEditingProduct(null);
        // Reset form
        setNewProdName("");
        setNewProdPrice("");
        setNewProdDesc("");
        setNewProdImage("");
        setNewProdFabric("");
        setNewProdSizes("38R, 40R, 42R, 44R");
        fetchProducts(); // Refresh catalog
      } else {
        const errorData = await res.json();
        setFormError(errorData.error || `Failed to ${editingProduct ? "update" : "create"} product listing.`);
      }
    } catch (err) {
      setFormError("Server error. Please try again.");
    }
  };

  // Filter & Search & Sort logic
  const filteredProducts = productsList
    .filter((p) => {
      const matchesCategory = selectedCategory === "all" || p.category === selectedCategory;
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (p.fabricInfo && p.fabricInfo.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      if (sortBy === "rating") return b.rating - a.rating;
      return 0; // Default ordering
    });

  return (
    <div className="bg-atelier-bg min-h-screen py-12 px-4 lg:px-12 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="border-b border-stone-200 pb-8 mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div>
          <span className="text-xs tracking-[0.25em] font-mono text-stone-400 uppercase font-bold">Uptown Suits Boutique</span>
          <h1 className="text-4xl lg:text-5xl font-serif text-stone-900 mt-2">The Ready-to-Wear Catalogue</h1>
          <p className="text-stone-600 text-sm mt-3 max-w-2xl">
            A tight, highly edited collection of modern classic tailoring, formal shirts, women's tuxedo gowns, and hand-embroidered traditional luxury robes. All garments are crafted from identical Italian mills and are customizable upon order.
          </p>
        </div>

        {/* Tailor Admin: Add Product Trigger */}
        {user?.role === "admin" && (
          <button
            onClick={handleOpenAddModal}
            className="flex items-center space-x-2 bg-stone-900 hover:bg-atelier-accent text-white hover:text-stone-950 font-bold text-xs uppercase tracking-widest py-3.5 px-6 rounded-lg transition-colors shadow-md cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Boutique Item</span>
          </button>
        )}
      </div>

      {/* Filters, Search & Sorters panel */}
      <div className="bg-white border border-stone-200 rounded-xl p-5 mb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-sm">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-stone-400" />
          <input
            type="text"
            placeholder="Search fabrics, names, description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-atelier-accent focus:bg-white transition-all"
          />
        </div>

        {/* Sort selector */}
        <div className="flex items-center space-x-3">
          <SlidersHorizontal className="w-4 h-4 text-stone-500" />
          <span className="text-xs text-stone-500 font-semibold uppercase tracking-wider">Sort By</span>
          <select
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            className="text-xs font-semibold bg-stone-50 border border-stone-200 rounded-lg py-2 px-3 text-stone-700 focus:outline-none focus:border-atelier-accent cursor-pointer"
          >
            <option value="default">Release Date</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-1.5 mb-8 border-b border-stone-100 pb-4">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 text-xs font-mono uppercase tracking-[0.12em] rounded-lg transition-all cursor-pointer ${
              selectedCategory === cat.id
                ? "bg-stone-900 text-white font-bold"
                : "bg-white text-stone-600 border border-stone-200 hover:border-stone-400"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Loading & Empty states */}
      {loading ? (
        <div className="py-24 text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-900 mx-auto" />
          <p className="text-stone-500 text-xs font-mono uppercase tracking-widest">Gathering fine weaves...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="py-24 text-center bg-white border border-stone-200 rounded-xl">
          <p className="text-stone-400 text-sm">No garments found in this category matching your specifications.</p>
        </div>
      ) : (
        /* Products Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((p) => (
            <div
              key={p.id}
              onClick={() => handleOpenDetail(p)}
              className="group bg-white border border-stone-200 overflow-hidden flex flex-col justify-between hover:shadow-lg rounded-xl transition-all duration-300 cursor-pointer"
            >
              {/* Image section */}
              <div className="relative aspect-[3/4] bg-stone-100 overflow-hidden">
                <img
                  src={p.image}
                  alt={p.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                
                {/* Admin actions overlay */}
                {user?.role === "admin" && (
                  <div className="absolute top-2.5 right-2.5 flex space-x-1.5 z-10">
                    <button
                      onClick={(e) => handleOpenEditModal(p, e)}
                      title="Edit Product"
                      className="p-2 bg-white/95 hover:bg-stone-100 text-stone-500 hover:text-stone-900 rounded-lg shadow-md hover:scale-105 transition-all cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteProduct(p.id, e)}
                      title="Retire Product"
                      className="p-2 bg-white/95 hover:bg-red-50 text-stone-500 hover:text-red-600 rounded-lg shadow-md hover:scale-105 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {p.stock < 5 && p.stock > 0 && (
                  <span className="absolute top-2.5 left-2.5 bg-red-600 text-white font-mono text-[9px] px-2.5 py-1 rounded tracking-wider uppercase font-bold">
                    ONLY {p.stock} LEFT
                  </span>
                )}
                {p.stock === 0 && (
                  <span className="absolute inset-0 bg-stone-900/60 flex items-center justify-center text-white font-serif tracking-widest text-sm uppercase">
                    Sold Out
                  </span>
                )}
              </div>

              {/* Details section */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] uppercase font-mono text-stone-400 tracking-wider font-bold">
                      {p.category}
                    </span>
                    <span className="text-[9px] uppercase font-mono text-stone-500 font-semibold bg-stone-100 px-2 py-0.5 rounded">
                      {p.fabricInfo ? p.fabricInfo.split(" ").slice(-1)[0] : "Wool"}
                    </span>
                  </div>
                  <h4 className="font-serif text-base font-semibold text-stone-900 mt-1.5 line-clamp-1 group-hover:text-atelier-accent transition-colors">
                    {p.name}
                  </h4>
                </div>

                <div className="flex items-center justify-between pt-2.5 border-t border-stone-100">
                  <span className="font-serif text-lg font-bold text-stone-900">{formatPrice(p.price)}</span>
                  <div className="flex items-center space-x-1 text-amber-500">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span className="font-mono text-xs text-stone-600 font-semibold">{p.rating}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Boutique Details Modal / Slide Drawer */}
      {activeProduct && (
        <div className="fixed inset-0 z-50 bg-black/55 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl rounded-2xl relative p-6 lg:p-10">
            {/* Close Button */}
            <button
              onClick={() => setActiveProduct(null)}
              className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-800 transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>

            {purchaseSuccess ? (
              <div className="text-center py-16 space-y-4">
                <Check className="w-12 h-12 text-emerald-600 mx-auto bg-emerald-50 rounded-full p-2" />
                <h3 className="font-serif text-2xl font-bold text-stone-900">Bespoke Fitting Logged</h3>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  "{activeProduct.name}" in size {selectedSize} has been charged and added to your wardrobe closet. Access the real-time Order Tracker for fitting coordination.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                {/* Image */}
                <div className="aspect-[3/4] overflow-hidden border border-stone-200 bg-stone-100 rounded-xl shadow-inner">
                  <img src={activeProduct.image} alt={activeProduct.name} className="w-full h-full object-cover" />
                </div>

                {/* Details */}
                <div className="space-y-6">
                  <div>
                    <span className="text-xs font-mono text-stone-400 uppercase tracking-widest font-bold">{activeProduct.category}</span>
                    <h2 className="font-serif text-2xl lg:text-3xl font-semibold mt-1 text-stone-900">{activeProduct.name}</h2>
                    <span className="text-2xl font-serif font-bold text-stone-900 block mt-2">{formatPrice(activeProduct.price)}</span>
                  </div>

                  <p className="text-xs text-stone-600 leading-relaxed">{activeProduct.description}</p>

                  <div className="divide-y divide-stone-150 text-xs">
                    <div className="flex justify-between py-2">
                      <span className="text-stone-400 uppercase font-mono">Fabric origin</span>
                      <span className="font-medium text-stone-800">{activeProduct.fabricInfo || "Fine Luxury Wool Mill"}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-stone-400 uppercase font-mono">Inventory Status</span>
                      <span className="font-medium text-stone-800">
                        {activeProduct.stock > 0 ? (
                          <span className="text-emerald-600 font-bold">{activeProduct.stock} items remaining</span>
                        ) : (
                          <span className="text-red-600 font-bold">Sold Out</span>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Size selector */}
                  {activeProduct.sizeGuide && activeProduct.sizeGuide.length > 0 && (
                    <div className="space-y-2">
                      <span className="block text-[10px] font-mono uppercase text-stone-400 font-bold">Select Tailored Size</span>
                      <div className="flex flex-wrap gap-1.5">
                        {activeProduct.sizeGuide.map((size) => (
                          <button
                            key={size}
                            type="button"
                            onClick={() => setSelectedSize(size)}
                            className={`px-3 py-1.5 text-xs font-mono border rounded-lg cursor-pointer transition-all ${
                              selectedSize === size
                                ? "border-atelier-accent bg-amber-50 text-stone-900 font-bold"
                                : "border-stone-200 hover:border-stone-400 text-stone-600 bg-white"
                            }`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Features bar */}
                  <div className="bg-stone-50 p-3 text-[11px] text-stone-500 rounded-lg border border-stone-200 flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4 text-atelier-accent" />
                    <span>Free complimentary tailoring/adjustments at our physical locations.</span>
                  </div>

                  {/* Buy Button */}
                  <button
                    onClick={handleBuy}
                    disabled={activeProduct.stock === 0}
                    className="w-full bg-stone-900 hover:bg-atelier-accent text-white hover:text-stone-950 disabled:bg-stone-200 disabled:text-stone-400 font-semibold text-xs py-4 uppercase tracking-[0.15em] rounded-xl cursor-pointer flex items-center justify-center space-x-2 shadow-lg transition-colors"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>{activeProduct.stock > 0 ? "Purchase Ready-To-Wear" : "Out of Stock"}</span>
                  </button>

                  {user?.role === "admin" && (
                    <button
                      onClick={() => {
                        const prod = activeProduct;
                        setActiveProduct(null);
                        handleOpenEditModal(prod);
                      }}
                      className="w-full border border-stone-300 hover:bg-stone-50 text-stone-800 font-semibold text-xs py-3.5 uppercase tracking-[0.15em] rounded-xl cursor-pointer flex items-center justify-center space-x-2 transition-colors mt-2"
                    >
                      <Edit2 className="w-4 h-4" />
                      <span>Edit Catalogue Item</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Admin Add/Edit Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/55 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 max-w-lg w-full rounded-2xl shadow-2xl relative p-6 max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-serif text-xl font-bold text-stone-900 mb-2">
              {editingProduct ? "Edit Catalogue Product" : "Create Catalogue Product"}
            </h3>
            <p className="text-xs text-stone-500 mb-6">
              {editingProduct 
                ? "Update pricing, description, fabric source, or upload a new photo for this design."
                : "List a new tailored Ready-to-Wear or Wedding collection design for clients worldwide."}
            </p>

            {formError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg">
                {formError}
              </div>
            )}

            <form onSubmit={handleAddProductSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-mono tracking-wider font-bold text-stone-400 mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  placeholder="E.g. The Dorchester Silk Dinner Jacket"
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-atelier-accent focus:bg-white transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-mono tracking-wider font-bold text-stone-400 mb-1">Retail Price ($)</label>
                  <input
                    type="number"
                    required
                    placeholder="950"
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-atelier-accent focus:bg-white transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-mono tracking-wider font-bold text-stone-400 mb-1">Category</label>
                  <select
                    value={newProdCategory}
                    onChange={(e) => setNewProdCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-atelier-accent focus:bg-white transition-colors"
                  >
                    <option value="suits">Men's Suits</option>
                    <option value="shirts">Bespoke Shirts</option>
                    <option value="jackets">Tailored Jackets</option>
                    <option value="dresses">Women's Formal</option>
                    <option value="traditional">Traditional Wear</option>
                    <option value="wedding">Wedding Collection</option>
                    <option value="shoes">Luxury Shoes</option>
                    <option value="accessories">Bespoke Accessories</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-mono tracking-wider font-bold text-stone-400 mb-1">Fabric & Mill Detail</label>
                <input
                  type="text"
                  placeholder="E.g. 100% Japanese Silk Satin Trims, Scabal Wool"
                  value={newProdFabric}
                  onChange={(e) => setNewProdFabric(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-atelier-accent focus:bg-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-mono tracking-wider font-bold text-stone-400 mb-1">Size Guide (comma separated)</label>
                <input
                  type="text"
                  placeholder="E.g. 38R, 40R, 42R, 44R, 46R"
                  value={newProdSizes}
                  onChange={(e) => setNewProdSizes(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-atelier-accent focus:bg-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-mono tracking-wider font-bold text-stone-400 mb-1">Product Image</label>
                
                {/* File Upload Area */}
                <div className="mb-2">
                  <label className="border-2 border-dashed border-stone-200 hover:border-atelier-accent bg-stone-50 cursor-pointer h-24 flex flex-col items-center justify-center p-3 transition-colors rounded-xl">
                    {newProdImage ? (
                      <div className="flex items-center space-x-3">
                        <img src={newProdImage} alt="Product Preview" className="w-14 h-14 object-cover border rounded-lg" />
                        <div className="text-left">
                          <span className="text-[10px] font-mono text-emerald-600 block">Image loaded successfully</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              setNewProdImage("");
                            }}
                            className="text-[10px] text-red-500 underline hover:text-red-700 mt-0.5 cursor-pointer"
                          >
                            Clear Image
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Upload className="w-5 h-5 text-stone-400 mx-auto mb-1" />
                        <span className="text-[11px] text-stone-500 block">Click to upload product image</span>
                        <span className="text-[9px] text-stone-400">PNG, JPG, or GIF</span>
                      </div>
                    )}
                    <input type="file" accept="image/*" onChange={handleProductPhotoUpload} className="hidden" />
                  </label>
                </div>

                {/* URL Input alternative */}
                <input
                  type="url"
                  placeholder="Or paste an image URL (e.g. https://images.unsplash.com/...)"
                  value={newProdImage.startsWith("data:") ? "" : newProdImage}
                  onChange={(e) => setNewProdImage(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-atelier-accent focus:bg-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-mono tracking-wider font-bold text-stone-400 mb-1">Product Description</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe the styling cuts, pocket style, lapel details, and fit profile..."
                  value={newProdDesc}
                  onChange={(e) => setNewProdDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-atelier-accent focus:bg-white transition-colors"
                />
              </div>

              <div className="pt-2 flex space-x-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-3 text-xs uppercase tracking-widest font-semibold border border-stone-200 text-stone-600 rounded-lg hover:bg-stone-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 text-xs uppercase tracking-widest font-semibold bg-stone-900 text-white rounded-lg hover:bg-atelier-accent hover:text-stone-950 transition-colors cursor-pointer"
                >
                  {editingProduct ? "Save Product Changes" : "Publish Listing"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

