import React, { useState, useEffect } from "react";
import { 
  Camera, 
  User, 
  Plus, 
  Trash2, 
  Edit2, 
  X, 
  Upload, 
  Check, 
  Sparkles, 
  Quote 
} from "lucide-react";
import { GalleryItem } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface GalleryViewProps {
  user: { id: string; name: string; email: string; role: "customer" | "admin" } | null;
}

export default function GalleryView({ user }: GalleryViewProps) {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [filter, setFilter] = useState<"all" | "suit" | "client">("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  
  const [formType, setFormType] = useState<"suit" | "client">("suit");
  const [formTitle, setFormTitle] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formImage, setFormImage] = useState("");
  const [formClientName, setFormClientName] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Drag and Drop state
  const [isDragging, setIsDragging] = useState(false);

  const fetchGallery = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/gallery");
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      } else {
        setError("Unable to load lookbook gallery.");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setFormType("suit");
    setFormTitle("");
    setFormDesc("");
    setFormImage("");
    setFormClientName("");
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: GalleryItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingItem(item);
    setFormType(item.type);
    setFormTitle(item.title);
    setFormDesc(item.description || "");
    setFormImage(item.image);
    setFormClientName(item.clientName || "");
    setFormError(null);
    setIsModalOpen(true);
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setFormError("Only image files are supported.");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormImage(reader.result as string);
      setFormError(null);
    };
    reader.readAsDataURL(file);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      setFormError("Please enter a title.");
      return;
    }
    if (!formImage) {
      setFormError("Please upload or provide an image.");
      return;
    }
    if (formType === "client" && !formClientName.trim()) {
      setFormError("Please enter the client's name.");
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    const payload = {
      type: formType,
      title: formTitle,
      description: formDesc,
      image: formImage,
      clientName: formType === "client" ? formClientName : ""
    };

    try {
      const url = editingItem ? `/api/gallery/${editingItem.id}` : "/api/gallery";
      const method = editingItem ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchGallery();
      } else {
        const errData = await res.json();
        setFormError(errData.error || "Failed to save lookbook showcase.");
      }
    } catch (err) {
      setFormError("Server connection error.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteItem = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to retire this lookbook showcase item?")) return;

    try {
      const res = await fetch(`/api/gallery/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchGallery();
        if (selectedItem?.id === id) {
          setSelectedItem(null);
        }
      } else {
        alert("Failed to delete item.");
      }
    } catch (err) {
      alert("Error deleting item.");
    }
  };

  const filteredItems = items.filter(item => {
    if (filter === "all") return true;
    return item.type === filter;
  });

  return (
    <div className="bg-atelier-bg min-h-screen py-12 px-4 lg:px-12 max-w-7xl mx-auto">
      {/* Header section */}
      <div className="border-b border-stone-200 pb-8 mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6" id="gallery-header-container">
        <div>
          <span className="text-xs tracking-[0.25em] font-mono text-stone-400 uppercase font-bold">Uptown Suits Lookbook</span>
          <h1 className="text-4xl lg:text-5xl font-serif text-stone-900 mt-2">Bespoke Gallery</h1>
          <p className="text-stone-600 text-sm mt-3 max-w-2xl">
            A continuous showcase of our masterfully hand-cut suits and real moments captured by our distinguished clients around the world.
          </p>
        </div>

        {/* Admin actions trigger */}
        {user?.role === "admin" && (
          <button
            onClick={handleOpenAddModal}
            id="add-gallery-showcase-btn"
            className="flex items-center space-x-2 bg-stone-900 hover:bg-atelier-accent text-white hover:text-stone-950 font-bold text-xs uppercase tracking-widest py-3.5 px-6 rounded-lg transition-colors shadow-md cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Upload Showcase</span>
          </button>
        )}
      </div>

      {/* Filter and Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8" id="gallery-filter-bar">
        {/* Category Pill Filters */}
        <div className="flex flex-wrap gap-2">
          {[
            { id: "all", label: "All Looks" },
            { id: "suit", label: "Suit Gallery", icon: Camera },
            { id: "client", label: "Happy Clients", icon: User }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`flex items-center space-x-1.5 px-4 py-2 text-xs uppercase font-bold tracking-wider rounded-full transition-all duration-300 cursor-pointer border ${
                filter === tab.id
                  ? "bg-stone-900 border-stone-900 text-white shadow-md"
                  : "bg-white border-stone-200 text-stone-500 hover:border-stone-400 hover:text-stone-800"
              }`}
            >
              {tab.icon && <tab.icon className="w-3.5 h-3.5" />}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="text-stone-400 text-[10px] font-mono tracking-widest uppercase">
          Showing {filteredItems.length} of {items.length} designs
        </div>
      </div>

      {/* Main Grid View */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20" id="gallery-loading">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-800"></div>
          <span className="text-xs text-stone-500 font-mono mt-4">RETRIVING LOOKBOOK...</span>
        </div>
      ) : error ? (
        <div className="text-center py-16 bg-red-50 border border-red-100 rounded-2xl" id="gallery-error">
          <p className="text-sm text-red-600 font-medium">{error}</p>
          <button onClick={fetchGallery} className="text-xs text-stone-500 underline mt-2 hover:text-stone-800">Try reloading</button>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-24 bg-white border border-stone-200 rounded-2xl p-6" id="gallery-empty">
          <Camera className="w-8 h-8 text-stone-300 mx-auto mb-3" />
          <p className="text-stone-600 text-sm font-serif">No looks found in this lookbook drawer.</p>
          <p className="text-stone-400 text-xs mt-1">Check back later or upload new showcases.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" id="gallery-grid">
          {filteredItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => setSelectedItem(item)}
              className="group bg-white border border-stone-200/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:border-stone-300 transition-all duration-300 cursor-pointer flex flex-col relative"
            >
              {/* Image box with premium ratio */}
              <div className="aspect-[4/5] overflow-hidden bg-stone-100 relative">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                
                {/* Type Tag Accent */}
                <div className="absolute top-4 left-4">
                  <span className={`text-[9px] font-mono font-bold uppercase tracking-widest px-2.5 py-1 rounded-full shadow-sm ${
                    item.type === "client" 
                      ? "bg-amber-100 text-amber-900 border border-amber-200" 
                      : "bg-stone-900 text-stone-100"
                  }`}>
                    {item.type === "client" ? "Happy Client" : "Bespoke Cut"}
                  </span>
                </div>

                {/* Admin Management Buttons */}
                {user?.role === "admin" && (
                  <div className="absolute top-4 right-4 flex space-x-1.5 z-10">
                    <button
                      onClick={(e) => handleOpenEditModal(item, e)}
                      title="Edit Showcase"
                      className="p-2 bg-white/95 hover:bg-stone-100 text-stone-600 hover:text-stone-900 rounded-lg shadow-md hover:scale-105 transition-all cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteItem(item.id, e)}
                      title="Delete Showcase"
                      className="p-2 bg-white/95 hover:bg-red-50 text-stone-600 hover:text-red-600 rounded-lg shadow-md hover:scale-105 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Elegant overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                  <span className="text-white text-xs font-semibold tracking-wider uppercase">View details</span>
                </div>
              </div>

              {/* Showcase descriptions */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-serif text-lg font-bold text-stone-900 mb-2 line-clamp-1 group-hover:text-atelier-accent transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-stone-500 text-xs leading-relaxed line-clamp-3 mb-4">
                    {item.description}
                  </p>
                </div>

                {/* Client badge or aesthetic details */}
                {item.type === "client" && item.clientName ? (
                  <div className="flex items-center space-x-2 pt-3 border-t border-stone-100">
                    <div className="w-6 h-6 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center">
                      <User className="w-3 h-3 text-amber-700" />
                    </div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-stone-500">{item.clientName}</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1 pt-3 border-t border-stone-100 text-stone-400 text-[10px] font-mono uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-atelier-accent" />
                    <span>Exquisite Craftsmanship</span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Showcase Detail Dialog modal */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-stone-200 max-w-4xl w-full rounded-2xl shadow-2xl overflow-hidden relative"
              id="gallery-detail-modal"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 z-10 p-2.5 bg-black/50 hover:bg-black/80 text-white rounded-full transition-all cursor-pointer shadow-lg"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2">
                {/* Visual Image */}
                <div className="aspect-[4/5] md:aspect-auto md:h-[550px] bg-stone-100 relative">
                  <img src={selectedItem.image} alt={selectedItem.title} className="w-full h-full object-cover" />
                </div>

                {/* Text Content */}
                <div className="p-8 lg:p-10 flex flex-col justify-between bg-stone-50 h-full md:h-[550px] overflow-y-auto">
                  <div>
                    <span className={`text-[10px] font-mono tracking-widest uppercase px-3 py-1 rounded-full border mb-4 inline-block ${
                      selectedItem.type === "client" 
                        ? "bg-amber-50 text-amber-800 border-amber-200" 
                        : "bg-stone-900 text-white border-stone-900"
                    }`}>
                      {selectedItem.type === "client" ? "Distinguished Client Portrait" : "Bespoke Design Cut"}
                    </span>

                    <h3 className="font-serif text-2xl lg:text-3xl font-bold text-stone-900 mb-4 mt-2">
                      {selectedItem.title}
                    </h3>

                    {selectedItem.type === "client" ? (
                      <div className="my-6 relative pl-8 border-l-2 border-amber-400 italic text-stone-700 text-sm leading-relaxed">
                        <Quote className="w-6 h-6 text-amber-200 absolute -top-4 -left-2 rotate-180" />
                        <p>{selectedItem.description}</p>
                      </div>
                    ) : (
                      <p className="text-stone-600 text-sm leading-relaxed mb-6">
                        {selectedItem.description}
                      </p>
                    )}
                  </div>

                  {/* Footer details */}
                  <div className="border-t border-stone-200 pt-6 mt-6">
                    {selectedItem.type === "client" ? (
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-amber-100 border border-amber-200 flex items-center justify-center">
                          <User className="w-5 h-5 text-amber-800" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-stone-900 uppercase tracking-wide">Client Profile</p>
                          <p className="text-sm font-serif text-stone-600">{selectedItem.clientName}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <span className="text-[10px] font-mono uppercase text-stone-400 block tracking-widest">PRODUCTION STANDARD</span>
                        <p className="text-xs text-stone-600 font-sans leading-relaxed">
                          Hand-stitched in our premium physical workshop. Double horn buttons, high armholes, and canvassed chest drape.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Admin Add/Edit Showcase Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/55 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 max-w-lg w-full rounded-2xl shadow-2xl relative p-6 max-h-[90vh] overflow-y-auto" id="gallery-form-modal">
            {/* Close Button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-900 rounded-full hover:bg-stone-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-serif text-xl font-bold text-stone-900 mb-2">
              {editingItem ? "Edit Lookbook Showcase" : "Publish Lookbook Showcase"}
            </h3>
            <p className="text-xs text-stone-500 mb-6">
              Share exquisite tailoring commissions or happy customer portraits and reviews on our global public lookbook.
            </p>

            {formError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Showcase Type Selector */}
              <div>
                <label className="block text-[10px] uppercase font-mono tracking-wider font-bold text-stone-400 mb-2">Showcase Type</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setFormType("suit");
                      setFormError(null);
                    }}
                    className={`py-3 px-4 rounded-xl border font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 cursor-pointer transition-all ${
                      formType === "suit"
                        ? "bg-stone-950 border-stone-950 text-white shadow-sm"
                        : "bg-stone-50 border-stone-200 text-stone-500 hover:bg-stone-100"
                    }`}
                  >
                    <Camera className="w-4 h-4" />
                    <span>Bespoke Suit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFormType("client");
                      setFormError(null);
                    }}
                    className={`py-3 px-4 rounded-xl border font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 cursor-pointer transition-all ${
                      formType === "client"
                        ? "bg-amber-600 border-amber-600 text-white shadow-sm"
                        : "bg-stone-50 border-stone-200 text-stone-500 hover:bg-stone-100"
                    }`}
                  >
                    <User className="w-4 h-4" />
                    <span>Happy Client</span>
                  </button>
                </div>
              </div>

              {/* Title Field */}
              <div>
                <label className="block text-[10px] uppercase font-mono tracking-wider font-bold text-stone-400 mb-1">Showcase Title</label>
                <input
                  type="text"
                  placeholder={formType === "client" ? "e.g., Marcus's Magical Wedding Day" : "e.g., The Mayfair Navy Tweed Cut"}
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-stone-400 focus:bg-white transition-colors"
                  required
                />
              </div>

              {/* Client Name Field (Only if happy client type is selected) */}
              {formType === "client" && (
                <div>
                  <label className="block text-[10px] uppercase font-mono tracking-wider font-bold text-stone-400 mb-1">Client Name</label>
                  <input
                    type="text"
                    placeholder="e.g., Marcus Henderson"
                    value={formClientName}
                    onChange={(e) => setFormClientName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-stone-400 focus:bg-white transition-colors"
                    required
                  />
                </div>
              )}

              {/* Image upload area with drag and drop support */}
              <div>
                <label className="block text-[10px] uppercase font-mono tracking-wider font-bold text-stone-400 mb-1">Showcase Image</label>
                
                {/* Drag & Drop Upload Container */}
                <div className="mb-2">
                  <label 
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-xl h-28 flex flex-col items-center justify-center p-3 transition-colors cursor-pointer ${
                      isDragging 
                        ? "border-amber-600 bg-amber-50/50" 
                        : "border-stone-200 hover:border-stone-400 bg-stone-50"
                    }`}
                  >
                    {formImage ? (
                      <div className="flex items-center space-x-3 w-full px-3">
                        <img src={formImage} alt="Showcase Preview" className="w-16 h-16 object-cover border border-stone-200 rounded-lg shrink-0" />
                        <div className="text-left overflow-hidden">
                          <span className="text-[10px] font-mono text-emerald-600 font-bold block truncate">Image loaded successfully</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              setFormImage("");
                            }}
                            className="text-[10px] text-red-500 underline hover:text-red-700 mt-1 cursor-pointer font-bold block"
                          >
                            Clear Image
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Upload className="w-6 h-6 text-stone-400 mx-auto mb-1" />
                        <span className="text-xs text-stone-600 block font-medium">Drag & drop photo here or click to upload</span>
                        <span className="text-[9px] text-stone-400">PNG, JPG, JPEG, or WEBP formats</span>
                      </div>
                    )}
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                  </label>
                </div>

                {/* Alternative Direct URL link */}
                <input
                  type="url"
                  placeholder="Or paste an image URL (e.g. https://images.unsplash.com/...)"
                  value={formImage.startsWith("data:") ? "" : formImage}
                  onChange={(e) => setFormImage(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-stone-400 focus:bg-white transition-colors"
                />
              </div>

              {/* Description field */}
              <div>
                <label className="block text-[10px] uppercase font-mono tracking-wider font-bold text-stone-400 mb-1">
                  {formType === "client" ? "Customer Review / Testimonial Quote" : "Design Specification / Description"}
                </label>
                <textarea
                  rows={4}
                  placeholder={
                    formType === "client" 
                      ? "Include the customer's quote, how they felt about the fit, their wedding/event experience, etc." 
                      : "Describe the cut, fabric, details like buttons and lapels, and recommended occasion styling."
                  }
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-stone-400 focus:bg-white transition-colors resize-none"
                />
              </div>

              {/* Modal controls */}
              <div className="flex space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 text-xs uppercase tracking-widest font-bold border border-stone-200 text-stone-500 rounded-lg hover:bg-stone-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 text-xs uppercase tracking-widest font-bold bg-stone-900 hover:bg-atelier-accent hover:text-stone-950 text-white rounded-lg transition-colors cursor-pointer disabled:bg-stone-400"
                >
                  {isSubmitting ? "Saving..." : editingItem ? "Save Changes" : "Publish Showcase"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
