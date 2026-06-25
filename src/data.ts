import { Product, Order, RepairRequest, WardrobeItem } from "./types";

export const FABRICS = [
  { id: "wool-120", name: "Super 120s Merino Wool", mill: "Loro Piana (Italy)", type: "Wool", desc: "Silky drape, perfect year-round weight with a subtle luster." },
  { id: "cashmere-silk", name: "Cashmere & Silk Blend", mill: "Ermenegildo Zegna", type: "Blend", desc: "Ultra-luxurious warmth, soft hand-feel, ideal for custom jackets." },
  { id: "cotton-herringbone", name: "Egyptian Cotton Herringbone", mill: "Thomas Mason (UK)", type: "Cotton", desc: "Highly breathable, crisp texture, elegant woven chevron pattern." },
  { id: "irish-linen", name: "Pure Irish Linen", mill: "Spence Bryson", type: "Linen", desc: "Natural texture, relaxed character, excellent cool feel for summer." },
  { id: "silk-satin", name: "Heavyweight Silk Satin", mill: "Kobe Mills (Japan)", type: "Silk", desc: "Luxurious sheen, heavy weight, perfect for dinner jacket lapels or dresses." },
  { id: "african-brocade", name: "Cotton Brocade (Aso Oke / Bazin)", mill: "Heritage Weavers", type: "Cotton", desc: "Stiff luxury traditional weave with metallic gold embroidery accents." }
];

export const COLORS = [
  { name: "Midnight Navy", hex: "#1E293B" },
  { name: "Charcoal Grey", hex: "#334155" },
  { name: "Desert Camel", hex: "#D97706" },
  { name: "Forest Green", hex: "#064E3B" },
  { name: "Crimson Burgundy", hex: "#7F1D1D" },
  { name: "Chalk White", hex: "#F8FAFC" },
  { name: "Royal Gold Accent", hex: "#D97706" },
  { name: "Sartorial Black", hex: "#0F172A" }
];

export const PATTERNS = [
  { name: "Solid", desc: "Classic, uninterrupted weave of solid color" },
  { name: "Chalkstripe", desc: "Sophisticated vertical chalky stripes" },
  { name: "Prince of Wales Check", desc: "Traditional Glen plaid check with subtle color overcheck" },
  { name: "Herringbone", desc: "Chevron woven texture adding depth and character" },
  { name: "Traditional Brocade", desc: "Ornate traditional motifs raised on luxury fabric" }
];

export const COLLARS_LAPELS = [
  { name: "Notch Lapel (Standard)", desc: "Versatile, classic, suits all occasions." },
  { name: "Peak Lapel (Formal)", desc: "Bold, modern, extends upwards to broaden shoulders." },
  { name: "Shawl Collar (Tuxedo)", desc: "Continuous curve, reserved for evening formalwear." },
  { name: "Spread Collar (Shirts)", desc: "Wide gap for substantial tie knots." },
  { name: "Mandarin / Nehru Collar", desc: "Short stand-up collar, sleek traditional silhouette." }
];

export const CUFFS = [
  { name: "Single Button Cuff", desc: "Standard, clean style for daily wear." },
  { name: "Double / French Cuff", desc: "Requires cufflinks, highly formal." },
  { name: "Functional Surgeon Cuffs", desc: "Bespoke working buttons on suit jacket sleeves." },
  { name: "Mitered Cuff", desc: "Slight angle on the button seam for crisp definition." }
];

export const POCKETS = [
  { name: "Flap Pockets", desc: "Horizontal flaps over pockets, versatile classic." },
  { name: "Jetted Pockets", desc: "Sleek, flapless slit, extremely elegant." },
  { name: "Patch Pockets", desc: "Stitched on outside, relaxed, sporty tailoring." },
  { name: "Ticket Pocket", desc: "A double right-hand pocket, traditional British look." }
];

export const PRODUCTS: Product[] = [
  // Men
  {
    id: "prod-1",
    category: "suits",
    name: "The Mayfair Midnight Navy Suit",
    price: 850,
    description: "Crafted from fine Super 120s wool, this tailored suit features a modern slim-fit silhouette, notched lapels, and horn buttons. Perfect for the executive boardroom or a formal evening reception.",
    image: "https://images.unsplash.com/photo-1593032465175-481ac7f401a0?auto=format&fit=crop&q=80&w=600",
    stock: 12,
    rating: 4.9,
    sizeGuide: ["38R", "40R", "42R", "44R", "46R"],
    fabricInfo: "100% Italian Super 120s Wool"
  },
  {
    id: "prod-2",
    category: "shirts",
    name: "Thomas Mason Spread Collar Shirt",
    price: 145,
    description: "An essential white business shirt in a robust herringbone weave. Double cuffs for cufflinks, complete with removable brass collar stays.",
    image: "https://images.unsplash.com/photo-1620012253295-c05518e99309?auto=format&fit=crop&q=80&w=600",
    stock: 25,
    rating: 4.8,
    sizeGuide: ["15.0", "15.5", "16.0", "16.5", "17.0"],
    fabricInfo: "100% Egyptian Cotton Double Ply"
  },
  {
    id: "prod-3",
    category: "jackets",
    name: "The Savile Double-Breasted Camel Coat",
    price: 950,
    description: "A showstopping winter staple. Heavy camelhair cashmere blend, featuring wide peak lapels, double-breasted 6x2 closure, and deep patch pockets.",
    image: "https://images.unsplash.com/photo-1544022613-e87ca75a784a?auto=format&fit=crop&q=80&w=600",
    stock: 8,
    rating: 5.0,
    sizeGuide: ["38", "40", "42", "44"],
    fabricInfo: "90% Cashmere, 10% Virgin Wool"
  },
  // Women
  {
    id: "prod-4",
    category: "dresses",
    name: "The Victoria Tuxedo Gown",
    price: 780,
    description: "A tailored crossover double-breasted tuxedo dress featuring silk satin lapels, structured shoulders, and a sleek modern silhouette.",
    image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=600",
    stock: 5,
    rating: 4.9,
    sizeGuide: ["XS", "S", "M", "L", "XL"],
    fabricInfo: "Stretch Wool Crepe with Japanese Silk accents"
  },
  {
    id: "prod-5",
    category: "jackets",
    name: "The Chelsea Tweed Blazer",
    price: 490,
    description: "A beautifully structured double-breasted tweed blazer in soft cream and gold accents. Intricate hand-woven texture, ideal for styling over silk camisoles.",
    image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&q=80&w=600",
    stock: 14,
    rating: 4.7,
    sizeGuide: ["S", "M", "L"],
    fabricInfo: "80% Wool Tweed, 20% Silk Lurex Thread"
  },
  // Traditional
  {
    id: "prod-6",
    category: "traditional",
    name: "The Royal Senator Agbada Set",
    price: 680,
    description: "A magnificent three-piece traditional African ensemble consisting of an inner long-sleeve shirt, trousers, and a flowing outer Agbada robe. Hand-embroidered with classic gold thread detailing.",
    image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=600", // Representative elegant dress/suit look
    stock: 6,
    rating: 5.0,
    sizeGuide: ["Medium (40)", "Large (42)", "XL (44)"],
    fabricInfo: "Luxury Cotton Guinea Brocade"
  },
  // Wedding
  {
    id: "prod-7",
    category: "wedding",
    name: "The Belgravia Wedding Tuxedo",
    price: 1100,
    description: "Our masterpiece black-tie garment. Deep black mohair and wool blend, paired with a matching black silk shawl lapel, silk satin buttons, and trousers featuring a formal side-stripe.",
    image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80&w=600",
    stock: 10,
    rating: 5.0,
    sizeGuide: ["38R", "40R", "42R", "44R"],
    fabricInfo: "85% Wool, 15% Kid Mohair, 100% Silk Satin trim"
  },
  // Shoes
  {
    id: "prod-8",
    category: "shoes",
    name: "The Regent Wholecut Oxford",
    price: 380,
    description: "Handcrafted from premium full-grain French calfskin. Featuring a clean, seamless wholecut upper, elegant closed channel stitching, and custom-burnished mahogany finish. The peak of formal footwear.",
    image: "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&q=80&w=600",
    stock: 15,
    rating: 4.9,
    sizeGuide: ["8", "8.5", "9", "9.5", "10", "10.5", "11", "12"],
    fabricInfo: "Full-Grain French Calfskin Leather"
  },
  {
    id: "prod-9",
    category: "shoes",
    name: "The Kensington Double-Monk Straps",
    price: 420,
    description: "Constructed from French suede with dual solid brass hand-polished buckles. Goodyear welted, featuring custom fiddleback waist detailing on the leather soles.",
    image: "https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&q=80&w=600",
    stock: 8,
    rating: 5.0,
    sizeGuide: ["8", "8.5", "9", "9.5", "10", "10.5", "11", "11.5", "12"],
    fabricInfo: "Premium French Calf Suede & Solid Brass"
  },
  // Accessories
  {
    id: "prod-10",
    category: "accessories",
    name: "7-Fold Mulberry Silk Tie",
    price: 125,
    description: "Unlined, hand-rolled 7-fold tie crafted from ultra-premium heavy weight jacquard silk. Beautiful deep burgundy self-tipped construction.",
    image: "https://images.unsplash.com/photo-1589756823855-ede1bd52673c?auto=format&fit=crop&q=80&w=600",
    stock: 30,
    rating: 4.8,
    sizeGuide: ["Standard Width (3.25 in)", "Slim Width (3.0 in)"],
    fabricInfo: "100% Mulberry Jacquard Silk"
  },
  {
    id: "prod-11",
    category: "accessories",
    name: "Savile Row Hand-Rolled Pocket Square",
    price: 55,
    description: "Pure white Irish linen with a masterfully hand-rolled forest green contrast border. Adds the perfect nonchalant touch to any bespoke breast pocket.",
    image: "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?auto=format&fit=crop&q=80&w=600",
    stock: 45,
    rating: 5.0,
    sizeGuide: ["One Size (13x13 in)"],
    fabricInfo: "100% Pure Irish Linen"
  },
  {
    id: "prod-12",
    category: "accessories",
    name: "Hand-Burnished Bridle Leather Belt",
    price: 110,
    description: "Full-grain English bridle leather with hand-finished edges and a solid brass, sand-cast buckle. Designed to perfectly match our bespoke tan and mahogany oxfords.",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=600",
    stock: 20,
    rating: 4.7,
    sizeGuide: ["30", "32", "34", "36", "38", "40", "42"],
    fabricInfo: "Full-Grain English Bridle Leather"
  }
];

export const INITIAL_MEASUREMENTS = {
  chest: 40,
  waist: 34,
  hips: 41,
  neck: 16,
  sleeveLength: 33,
  inseam: 31
};

export const INITIAL_ORDERS: Order[] = [
  {
    id: "A-2841",
    customerName: "Audrey Hepburn",
    customerEmail: "audrey@classic.com",
    type: "custom",
    status: "Sewing",
    totalPrice: 1250,
    date: "2026-06-20",
    assignedTo: "Sewer",
    customDetails: {
      category: "suit",
      fabric: "Super 120s Merino Wool",
      color: "Midnight Navy",
      pattern: "Solid",
      lapelStyle: "Peak Lapel (Formal)",
      cuffsStyle: "Functional Surgeon Cuffs",
      pocketsStyle: "Ticket Pocket",
      designName: "Navy three-piece, Super 120s wool"
    },
    measurements: {
      chest: 38,
      waist: 30,
      hips: 39,
      neck: 14.5,
      sleeveLength: 32,
      inseam: 30
    }
  },
  {
    id: "R-7091",
    customerName: "James Bond",
    customerEmail: "007@secret.gov",
    type: "ready-made",
    status: "Completed",
    totalPrice: 1100,
    date: "2026-06-15",
    productId: "prod-7",
    productName: "The Belgravia Wedding Tuxedo",
    productImage: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80&w=600",
    productCategory: "wedding"
  },
  {
    id: "A-3012",
    customerName: "Fodhis O.",
    customerEmail: "fodhis1@gmail.com",
    type: "custom",
    status: "Fabric sourcing",
    totalPrice: 880,
    date: "2026-06-24",
    assignedTo: "Cutter",
    customDetails: {
      category: "jacket",
      fabric: "Pure Irish Linen",
      color: "Desert Camel",
      pattern: "Solid",
      lapelStyle: "Notch Lapel (Standard)",
      pocketsStyle: "Patch Pockets",
      designName: "The Summer Riviera Jacket"
    },
    measurements: {
      chest: 40,
      waist: 34,
      hips: 41,
      neck: 16,
      sleeveLength: 33,
      inseam: 31
    }
  }
];

export const INITIAL_REPAIRS: RepairRequest[] = [
  {
    id: "REP-401",
    customerName: "Audrey Hepburn",
    customerEmail: "audrey@classic.com",
    garmentType: "Tweed Blazer",
    issueType: "Torn seam",
    description: "Right armhole seam is loose and pulling apart after heavy wear.",
    costEstimate: 45,
    timeEstimate: "3 business days",
    complexity: "Simple",
    status: "In repair",
    date: "2026-06-22",
    pickupOption: "Courier collection"
  },
  {
    id: "REP-402",
    customerName: "Steve McQueen",
    customerEmail: "steve@cool.com",
    garmentType: "Leather Jacket",
    issueType: "Zip replacement",
    description: "The main metal zipper tooth is chipped, needs complete new metal heavy duty zipper.",
    costEstimate: 75,
    timeEstimate: "4 business days",
    complexity: "Moderate",
    status: "Courier collection",
    date: "2026-06-24",
    pickupOption: "Home pickup"
  }
];

export const INITIAL_WARDROBE: WardrobeItem[] = [
  {
    id: "ward-1",
    type: "owned",
    name: "Classic Charcoal Blazer",
    category: "jackets",
    fabric: "Super 120s Wool",
    color: "Charcoal Grey",
    pattern: "Solid",
    image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=600",
    dateAdded: "2026-05-10"
  },
  {
    id: "ward-2",
    type: "purchased",
    name: "The Mayfair Midnight Navy Suit",
    category: "suits",
    fabric: "100% Italian Super 120s Wool",
    color: "Midnight Navy",
    image: "https://images.unsplash.com/photo-1593032465175-481ac7f401a0?auto=format&fit=crop&q=80&w=600",
    dateAdded: "2026-06-16"
  }
];
