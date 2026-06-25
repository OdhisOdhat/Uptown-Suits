import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import pkg from "pg";

const { Pool } = pkg;
dotenv.config();

const app = express();
const PORT = 3000;

// Connect to Neon PostgreSQL database
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : undefined,
  connectionTimeoutMillis: 5000,
});

let dbAvailable = false;

// Robust fallback in-memory data tables
let memUsers = [
  { id: "usr-admin", name: "Master Tailor Admin", email: "tailor@uptown.com", password: "admin", role: "admin" },
  { id: "usr-customer", name: "Fodhis O.", email: "fodhis1@gmail.com", password: "password", role: "customer" }
];

let memProducts = [
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
  {
    id: "prod-6",
    category: "traditional",
    name: "The Royal Senator Agbada Set",
    price: 680,
    description: "A magnificent three-piece traditional African ensemble consisting of an inner long-sleeve shirt, trousers, and a flowing outer Agbada robe. Hand-embroidered with classic gold thread detailing.",
    image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=600",
    stock: 6,
    rating: 5.0,
    sizeGuide: ["Medium (40)", "Large (42)", "XL (44)"],
    fabricInfo: "Luxury Cotton Guinea Brocade"
  },
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

let memGallery = [
  {
    id: "gal-1",
    type: "suit",
    title: "The Mayfair Midnight Tuxedo",
    description: "A gorgeous modern custom 3-piece tuxedo design featuring peak lapels in black grosgrain silk, constructed from premium Super 120s Italian wool.",
    image: "https://images.unsplash.com/photo-1593032465175-481ac7f401a0?auto=format&fit=crop&q=80&w=600",
    clientName: ""
  },
  {
    id: "gal-2",
    type: "suit",
    title: "The Kensington Prince of Wales",
    description: "A sharp double-breasted suit crafted from English flannel wool in an elegant grey glen plaid.",
    image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=600",
    clientName: ""
  },
  {
    id: "gal-3",
    type: "suit",
    title: "The Amalfi Summer Sand",
    description: "Lightweight, unlined Neapolitan-style suit in pure Italian linen. Perfect for warm-weather destination weddings.",
    image: "https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&q=80&w=600",
    clientName: ""
  },
  {
    id: "gal-4",
    type: "client",
    title: "Marcus Henderson on His Big Day",
    description: "Marcus looks absolutely stunning on his wedding day wearing our hand-tailored Midnight Blue Wool Suit. 'The fit was so precise, I felt incredible! Highly recommended.'",
    image: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=600",
    clientName: "Marcus Henderson"
  },
  {
    id: "gal-5",
    type: "client",
    title: "Sarah's Gala Debut",
    description: "Sarah commanding the room at the annual charity gala in her custom-tailored Victoria Tuxedo Gown. 'The satin lapel accents are beautifully detailed!'",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=600",
    clientName: "Sarah Jenkins"
  },
  {
    id: "gal-6",
    type: "client",
    title: "David & Charles - Groom & Best Man",
    description: "A perfectly matched groom party. Both wearing our bespoke peak lapel double-breasted blazers. 'Uptown Suits made the fitting process seamless for my entire party.'",
    image: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=600",
    clientName: "David & Charles"
  }
];

let memOrders = [
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
      category: "dress",
      fabric: "Heavyweight Silk Satin",
      color: "Sartorial Black",
      pattern: "Solid",
      lapelStyle: "Shawl Collar",
      additionalNotes: "Audrey style elegant crossover tailored gown with premium black silk finish."
    }
  },
  {
    id: "A-5912",
    customerName: "Fodhis O.",
    customerEmail: "fodhis1@gmail.com",
    type: "ready-made",
    status: "Cutting",
    productName: "The Mayfair Midnight Navy Suit",
    totalPrice: 850,
    date: "2026-06-24",
    assignedTo: "Cutter"
  }
];

let memRepairs = [
  {
    id: "REP-401",
    customerName: "Fodhis O.",
    customerEmail: "fodhis1@gmail.com",
    garmentType: "Suit Jacket",
    issueType: "Linings & Pockets",
    description: "Satin pocket lining has detached on the left interior pocket. Requesting a premium silk-blend re-lining.",
    costEstimate: 75,
    timeEstimate: "3-5 business days",
    complexity: "Moderate",
    status: "In repair",
    date: "2026-06-23",
    pickupOption: "Courier collection"
  }
];

let memWardrobe = [
  {
    id: "WRD-1",
    type: "owned",
    name: "Classic Charcoal Blazer",
    category: "jackets",
    color: "Charcoal Grey",
    fabric: "Merino Wool",
    image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&q=80&w=200",
    dateAdded: "2026-06-01"
  }
];

let memMeasurements: Record<string, any> = {
  "usr-customer": {
    chest: 40,
    waist: 34,
    hips: 41,
    neck: 16,
    sleeveLength: 33,
    inseam: 31
  }
};

async function initDB() {
  if (!process.env.DATABASE_URL) return;
  try {
    const client = await pool.connect();
    
    // Create Users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(100) NOT NULL,
        role VARCHAR(20) DEFAULT 'customer',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create Products table
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(50) PRIMARY KEY,
        category VARCHAR(50) NOT NULL,
        name VARCHAR(100) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        description TEXT,
        image TEXT,
        stock INT DEFAULT 10,
        rating DECIMAL(3, 2) DEFAULT 5.0,
        size_guide TEXT,
        fabric_info TEXT
      );
    `);

    // Create Orders table
    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(50) PRIMARY KEY,
        customer_name VARCHAR(100),
        customer_email VARCHAR(100),
        type VARCHAR(20) NOT NULL,
        status VARCHAR(50) NOT NULL,
        total_price DECIMAL(10, 2),
        date VARCHAR(20),
        assigned_to VARCHAR(50),
        product_id VARCHAR(50),
        product_name VARCHAR(100),
        product_image TEXT,
        product_category VARCHAR(50),
        custom_details TEXT,
        measurements TEXT
      );
    `);

    // Create Repairs table
    await client.query(`
      CREATE TABLE IF NOT EXISTS repairs (
        id VARCHAR(50) PRIMARY KEY,
        customer_name VARCHAR(100),
        customer_email VARCHAR(100),
        garment_type VARCHAR(100),
        issue_type VARCHAR(100),
        description TEXT,
        image_url TEXT,
        cost_estimate DECIMAL(10, 2),
        time_estimate VARCHAR(100),
        complexity VARCHAR(20),
        status VARCHAR(50),
        date VARCHAR(20),
        pickup_option VARCHAR(50)
      );
    `);

    // Create Wardrobe table
    await client.query(`
      CREATE TABLE IF NOT EXISTS wardrobe (
        id VARCHAR(50) PRIMARY KEY,
        type VARCHAR(20),
        name VARCHAR(100),
        category VARCHAR(50),
        fabric VARCHAR(100),
        color VARCHAR(50),
        pattern VARCHAR(100),
        image TEXT,
        date_added VARCHAR(20),
        status VARCHAR(50)
      );
    `);

    // Create Measurements table
    await client.query(`
      CREATE TABLE IF NOT EXISTS measurements (
        user_id VARCHAR(50) PRIMARY KEY,
        chest DECIMAL(5, 2),
        waist DECIMAL(5, 2),
        hips DECIMAL(5, 2),
        neck DECIMAL(5, 2),
        sleeve_length DECIMAL(5, 2),
        inseam DECIMAL(5, 2)
      );
    `);

    // Create Gallery table
    await client.query(`
      CREATE TABLE IF NOT EXISTS gallery (
        id VARCHAR(50) PRIMARY KEY,
        type VARCHAR(20) NOT NULL,
        title VARCHAR(100) NOT NULL,
        description TEXT,
        image TEXT NOT NULL,
        client_name VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Seed products table if empty
    const prodCheck = await client.query("SELECT COUNT(*) FROM products");
    if (parseInt(prodCheck.rows[0].count) === 0) {
      console.log("Seeding products into Neon DB...");
      for (const p of memProducts) {
        await client.query(
          `INSERT INTO products (id, category, name, price, description, image, stock, rating, size_guide, fabric_info)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [p.id, p.category, p.name, p.price, p.description, p.image, p.stock, p.rating, JSON.stringify(p.sizeGuide), p.fabricInfo]
        );
      }
    }

    // Seed gallery table if empty
    const galCheck = await client.query("SELECT COUNT(*) FROM gallery");
    if (parseInt(galCheck.rows[0].count) === 0) {
      console.log("Seeding gallery into Neon DB...");
      for (const g of memGallery) {
        await client.query(
          `INSERT INTO gallery (id, type, title, description, image, client_name)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [g.id, g.type, g.title, g.description, g.image, g.clientName || null]
        );
      }
    }

    client.release();
    console.log("Neon DB Schema Initialized Successfully!");
  } catch (err) {
    console.warn("DB table initialization failed, operating in memory backup:", err);
    dbAvailable = false;
  }
}

// Body parsing with higher limit for image uploads (base64)
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ limit: "15mb", extended: true }));

// Lazy-initialized Gemini Client helper
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required. Please set it in the Secrets panel.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}


// 1. STYLE CHAT ASSISTANT
app.post("/api/gemini/style-chat", async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const ai = getGeminiClient();
    
    // Format previous history into system context or let chat build it
    const systemInstruction = `You are Uptown Suits' Senior Style Consultant & Wardrobe advisor.
You help clients select fine fabrics (Super 120s wool, Italian linen, Egyptian cotton, silk blends), collar styles, lapels, patterns, accessories, and guide them for special occasions (weddings, galas, boardrooms, casual elegant).
Keep your tone sophisticated, warm, professional, and refined. Act like an elite bespoke Savile Row tailor.
Keep recommendations realistic, focusing on bespoke styling, coordinate choices, and garment styling rules.
Be concise but descriptive. Speak in the voice of an elite bespoke atelier.`;

    // We can run a direct text query or a simple chat
    // Since the history is simple, let's bundle it into contents
    const contents = [];
    if (history && Array.isArray(history)) {
      for (const h of history) {
        contents.push({
          role: h.role === "user" ? "user" : "model",
          parts: [{ text: h.text }]
        });
      }
    }
    contents.push({ role: "user", parts: [{ text: message }] });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    res.json({ text: response.text || "I am here to guide your style journey." });
  } catch (error: any) {
    console.warn("Gemini style-chat error, using robust fallback:", error);
    const fallbackResponses = [
      "Welcome to Uptown Suits. For a truly refined look, I suggest selecting a classic Italian Super 120s Navy Wool fabric with peak lapels.",
      "Indeed, a bespoke suit is an investment in your personal style. Pinstripe charcoal wool offers unmatched boardroom elegance.",
      "For warmer climates or summer galas, a fine beige Italian linen blazer paired with off-white trousers strikes the perfect casual-elegant balance."
    ];
    const randomResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
    res.json({ text: `[Bespoke Assistant] ${randomResponse}` });
  }
});

// 2. AI STYLE FINDER / BODY ANALYSIS
app.post("/api/gemini/analyze-body", async (req, res) => {
  const { frontImage, sideImage, heightCategory, preferredStyle } = req.body;
  try {
    const ai = getGeminiClient();

    const parts: any[] = [];
    
    // If the user uploaded images (base64) we pass them as parts to Gemini!
    if (frontImage) {
      const base64Data = frontImage.split(",")[1] || frontImage;
      parts.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: base64Data
        }
      });
    }
    if (sideImage) {
      const base64Data = sideImage.split(",")[1] || sideImage;
      parts.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: base64Data
        }
      });
    }

    const promptText = `Analyze this body profile for custom tailoring.
Height Category requested: ${heightCategory || "Not specified"}.
Customer's style preference: ${preferredStyle || "Traditional / Modern Classic"}.

Determine:
1. Estimated Body Shape (e.g., Trapezoid, Rectangle, Inverted Triangle, Oval, Hourglass)
2. Structural insights (Waist proportion, Shoulder-to-hip ratio, posture characteristics)
3. Estimated tailor chest, waist, and hip size adjustments (compared to standard proportions)
4. Tailoring recommendations (specific lapel width, jacket length, double vs single-breasted, shoulder padding)
5. Suggested garments & complete looks (including color palettes matching typical skin undertones if detectable)

Respond ONLY with a JSON object in this exact structure:
{
  "bodyShape": "Trapezoid | Rectangle | Inverted Triangle | Oval | Hourglass",
  "shoulderProportion": "Broad | Balanced | Sloped",
  "waistProportion": "Slim | Balanced | Prominent",
  "estimatedMeasurements": {
    "chest": "38-40 in",
    "waist": "32-34 in",
    "hips": "39-41 in",
    "neck": "15.5 in",
    "sleeveLength": "33 in"
  },
  "stylingInsights": "A detailed explanation of the proportions and structural tailoring advice.",
  "recommendedSuits": ["Navy peak lapel double-breasted suit", "Charcoal grey single-breasted tailored suit"],
  "recommendedFabrics": ["Super 120s Navy Wool", "Mid-grey Herringbone Tweed"],
  "colorPalette": ["Deep Navy", "Forest Green", "Rich Burgundy", "Champagne"]
}`;

    parts.push({ text: promptText });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            bodyShape: { type: Type.STRING },
            shoulderProportion: { type: Type.STRING },
            waistProportion: { type: Type.STRING },
            estimatedMeasurements: {
              type: Type.OBJECT,
              properties: {
                chest: { type: Type.STRING },
                waist: { type: Type.STRING },
                hips: { type: Type.STRING },
                neck: { type: Type.STRING },
                sleeveLength: { type: Type.STRING }
              }
            },
            stylingInsights: { type: Type.STRING },
            recommendedSuits: { type: Type.ARRAY, items: { type: Type.STRING } },
            recommendedFabrics: { type: Type.ARRAY, items: { type: Type.STRING } },
            colorPalette: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["bodyShape", "shoulderProportion", "waistProportion", "estimatedMeasurements", "stylingInsights", "recommendedSuits", "recommendedFabrics", "colorPalette"]
        }
      }
    });

    res.json(JSON.parse(response.text || "{}"));
  } catch (error: any) {
    console.warn("Gemini body analysis error, using robust fallback:", error);
    const isShort = heightCategory === "Short (< 5'7\")";
    const isTall = heightCategory === "Tall (> 6'1\")";
    const shape = preferredStyle?.toLowerCase().includes("double") ? "Trapezoid" : "Rectangle";

    const fallback = {
      bodyShape: shape,
      shoulderProportion: "Balanced",
      waistProportion: "Balanced",
      estimatedMeasurements: {
        chest: isTall ? "42-44 in" : isShort ? "36-38 in" : "38-40 in",
        waist: isTall ? "34-36 in" : isShort ? "30-32 in" : "32-34 in",
        hips: isTall ? "41-43 in" : isShort ? "37-39 in" : "39-41 in",
        neck: isTall ? "16 in" : "15.5 in",
        sleeveLength: isTall ? "35 in" : isShort ? "31 in" : "33 in"
      },
      stylingInsights: `Based on your profile, we recommend structured tailoring that accentuates your shoulder line. For ${preferredStyle || "Modern Classic"} styles, a slightly cinched waist will create an elegant, commanding silhouette.`,
      recommendedSuits: [
        "Navy peak lapel bespoke suit",
        "Charcoal grey single-breasted tailored suit"
      ],
      recommendedFabrics: [
        "Super 120s Midnight Blue Wool",
        "Mid-grey Herringbone Tweed"
      ],
      colorPalette: ["Deep Navy", "Burgundy", "Slate Grey", "Warm Ivory"]
    };
    res.json(fallback);
  }
});

// 3. AI GARMENT DESIGN SPECIFICATION GENERATOR
app.post("/api/gemini/design-spec", async (req, res) => {
  const { category, fabric, color, pattern, collar, cuffs, lapel, pockets, prompt } = req.body;
  try {
    const ai = getGeminiClient();

    const systemPrompt = `You are a legendary Savile Row fashion designer.
Based on the selected components:
Category: ${category}
Fabric: ${fabric}
Color: ${color}
Pattern: ${pattern}
Collar/Lapel: ${collar || lapel}
Cuffs/Pockets: ${cuffs || pockets}
Additional Custom Prompts: ${prompt || "None"}

Create a luxury tailoring specification and a description of the completed masterpiece.
Return ONLY a JSON object in this format:
{
  "designName": "Name of the design, e.g. The Dorchester Peak",
  "luxuriousDescription": "A beautiful, evocative description of how this piece feels, falls, and suits the wearer.",
  "recommendedOccasions": ["Formal Gala", "Boardroom Presentation"],
  "technicalDetails": [
    "Peak lapel with subtle topstitching",
    "Premium bemberg luxury lining",
    "Horn buttons",
    "Functional surgeon cuffs"
  ],
  "coordinateAdvice": "What shirts, ties, trousers, or shoes go with this piece.",
  "fabricVibe": "An elegant description of the textile choice and its draping."
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: systemPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            designName: { type: Type.STRING },
            luxuriousDescription: { type: Type.STRING },
            recommendedOccasions: { type: Type.ARRAY, items: { type: Type.STRING } },
            technicalDetails: { type: Type.ARRAY, items: { type: Type.STRING } },
            coordinateAdvice: { type: Type.STRING },
            fabricVibe: { type: Type.STRING }
          },
          required: ["designName", "luxuriousDescription", "recommendedOccasions", "technicalDetails", "coordinateAdvice", "fabricVibe"]
        }
      }
    });

    res.json(JSON.parse(response.text || "{}"));
  } catch (error: any) {
    console.warn("Gemini design spec error, using robust fallback:", error);
    let fallbackName = `The Uptown ${fabric || "Wool"} ${lapel || collar || "Classic"} Edition`;
    let fallbackDesc = `A masterful bespoke commission featuring a ${color || "classic"} hue on premium ${fabric || "mill-spun"} fabric, adorned with a ${pattern || "subtle"} design pattern. This garment drapes flawlessly, exuding pure sartorial confidence.`;
    let fallbackOccasions = [
      "High-Profile Boardroom Meetings",
      "Evening Galas and Art Openings",
      "Refined Private Dinners"
    ];
    let fallbackDetails = [
      `Hand-rolled ${lapel || collar || "notch"} design detailing`,
      `Premium contrast silk lining matched to ${color || "the primary tone"}`,
      "Reinforced natural horn buttons",
      "Fully functional surgeon cuffs and pick-stitching"
    ];
    let fallbackCoord = `Pair with a crisp Egyptian cotton white shirt, polished black calf leather oxford shoes, and a hand-rolled silk pocket square matching the ${color || "primary"} accent.`;
    let fallbackVibe = `The fine ${fabric || "textile"} provides exceptional breathability and structural integrity, promising a perfect drape that contours comfortably with natural body heat.`;

    if (category === "shoes") {
      fallbackName = `The Regent custom ${fabric || "Hand-painted Leather"} Shoe`;
      fallbackDesc = `Individually lasted dress shoes featuring hand-selected ${fabric || "French calf leather"} with a deep ${color || "burnished"} patina. Crafted to perfection, providing unparalleled arch support and peerless executive elegance.`;
      fallbackOccasions = ["Formal Galas", "Executive Boardrooms", "High-Society Weddings"];
      fallbackDetails = [
        "Traditional Goodyear welt construction",
        "Channel-stitched Oak Bark leather soles",
        "Hand-painted custom heel stacks",
        "Fully leather-lined interior for breathability"
      ];
      fallbackCoord = `Pairs flawlessly with our bespoke three-piece suits in dark navy or charcoal, and a matching full-grain burnished leather belt.`;
      fallbackVibe = "Premium French calf leather that softens with wear, establishing an exquisite, glove-like molding of the wearer's foot trace.";
    } else if (category === "accessories") {
      fallbackName = `The Savile Row custom ${fabric || "Mulberry Silk"} Accessory`;
      fallbackDesc = `Hand-finished accessories crafted from the finest materials. This bespoke ${fabric || "Mulberry Silk"} item introduces the perfect touch of sprezzatura to any custom tailored attire.`;
      fallbackOccasions = ["Sartorial Dinners", "Formal Soirées", "Black Tie Weddings"];
      fallbackDetails = [
        "Unlined hand-rolled hand-sewn hem finishing",
        "7-Fold luxury self-tipped folding specification",
        "Solid brass and gold-gilded hardware detailing",
        "Signature Uptown discreet monogram stamp"
      ];
      fallbackCoord = `Matches perfectly with our custom tuxedo, double-breasted navy blazers, or silk lapel dinner jackets.`;
      fallbackVibe = "Woven from heavy-weight mulberry silk on historic looms, promising a resilient drape, sharp dimples, and lasting shape retention.";
    }

    const fallback = {
      designName: fallbackName,
      luxuriousDescription: fallbackDesc,
      recommendedOccasions: fallbackOccasions,
      technicalDetails: fallbackDetails,
      coordinateAdvice: fallbackCoord,
      fabricVibe: fallbackVibe
    };
    res.json(fallback);
  }
});

// 4. CLOTHING REPAIR & ALTERATION AI ASSESSMENT
app.post("/api/gemini/repair-assess", async (req, res) => {
  const { issueType, garmentType, description, image } = req.body;
  try {
    const ai = getGeminiClient();

    const parts: any[] = [];
    if (image) {
      const base64Data = image.split(",")[1] || image;
      parts.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: base64Data
        }
      });
    }

    const promptText = `Assess this garment repair/alteration request.
Garment: ${garmentType}
Reported Issue: ${issueType}
Description: ${description || "Not provided"}

Based on this, estimate:
1. Average cost (in USD)
2. Average duration (time in days)
3. Expert tailor recommendations for this specific problem (e.g. re-weaving vs patching, invisible zippers)
4. Step-by-step description of how the master tailor will complete the job.

Return ONLY a JSON object:
{
  "costEstimate": 45,
  "timeEstimate": "3-4 business days",
  "complexity": "Simple | Moderate | Complex",
  "tailorRecommendation": "We recommend our Senior Master Tailor specializing in delicate lining repair.",
  "repairSteps": [
    "Prepare matching silk thread and anchor points",
    "Dismantle damaged area under high precision magnification",
    "Reconstruct structural weave or seam line",
    "Hand-finish and hot press"
  ],
  "isFeasible": true,
  "caringTip": "Keep the garment hanging in a breathable linen bag away from direct heat."
}`;

    parts.push({ text: promptText });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            costEstimate: { type: Type.NUMBER },
            timeEstimate: { type: Type.STRING },
            complexity: { type: Type.STRING },
            tailorRecommendation: { type: Type.STRING },
            repairSteps: { type: Type.ARRAY, items: { type: Type.STRING } },
            isFeasible: { type: Type.BOOLEAN },
            caringTip: { type: Type.STRING }
          },
          required: ["costEstimate", "timeEstimate", "complexity", "tailorRecommendation", "repairSteps", "isFeasible", "caringTip"]
        }
      }
    });

    res.json(JSON.parse(response.text || "{}"));
  } catch (error: any) {
    console.warn("Gemini repair assessment error, using robust fallback:", error);
    const cost = issueType === "Hems & Seams" ? 35 : issueType === "Rips & Tears" ? 45 : 75;
    const complexVal = issueType === "Re-lining" ? "Complex" : "Moderate";
    const fallback = {
      costEstimate: cost,
      timeEstimate: "3-5 business days",
      complexity: complexVal,
      tailorRecommendation: `Our master tailoring artisans will meticulously restore this ${garmentType || "piece"}. We will use high-precision stitching matching the original weave density.`,
      repairSteps: [
        "Analyze the structural integrity of the damaged fiber pattern under magnification",
        "Prepare identical fiber-matched premium French thread",
        `Execute seamless restoration of the ${issueType || "concern"} with invisible lockstitches`,
        "Steam block, dry-press, and inspect under professional grade lighting"
      ],
      isFeasible: true,
      caringTip: "Avoid localized spot cleaning. Hang on wide-shoulder cedar hangers to maintain structural shape."
    };
    res.json(fallback);
  }
});

// 5. AI FABRIC ADVISOR & MATCHING SERVICE
app.post("/api/gemini/fabric-advisor", async (req, res) => {
  const { weather, occasion, budget, suitColor } = req.body;
  try {
    const ai = getGeminiClient();

    const prompt = `Provide luxury fabric and matching coordinates based on:
Weather/Climate: ${weather}
Occasion: ${occasion}
Target Budget Category: ${budget}
Suit/Base Color: ${suitColor || "Grey or Navy"}

Recommend:
1. Ideal primary fabric (fabric mill type, weight, weave)
2. Reasons for choice (breathability, draping, status)
3. Complete accessories coordinates (perfect matching tie, pocket square, shirt, and shoe recommendations)

Return ONLY a JSON object:
{
  "fabricName": "E.g. Loro Piana Super 130s Merino Wool",
  "fabricWeight": "E.g. Light-medium (240g/m)",
  "vibeReason": "Why it suits the climate and occasion beautifully",
  "recommendedTie": "Burgundy silk grenadine tie with classic hand-rolled edges",
  "recommendedShirt": "Crisp white Egyptian cotton herringbone double-cuff shirt",
  "recommendedShoes": "Dark brown leather museum calf double-monk straps",
  "accessoryDetails": "A beautiful coordinator summary describing the complete styled look."
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            fabricName: { type: Type.STRING },
            fabricWeight: { type: Type.STRING },
            vibeReason: { type: Type.STRING },
            recommendedTie: { type: Type.STRING },
            recommendedShirt: { type: Type.STRING },
            recommendedShoes: { type: Type.STRING },
            accessoryDetails: { type: Type.STRING }
          },
          required: ["fabricName", "fabricWeight", "vibeReason", "recommendedTie", "recommendedShirt", "recommendedShoes", "accessoryDetails"]
        }
      }
    });

    res.json(JSON.parse(response.text || "{}"));
  } catch (error: any) {
    console.warn("Gemini fabric advisor error, using robust fallback:", error);
    const isHot = weather?.toLowerCase().includes("warm") || weather?.toLowerCase().includes("summer");
    const fallback = {
      fabricName: isHot ? "Solbiati Italian Linen & Silk Blend" : "Loro Piana Super 130s Tasmanian Merino Wool",
      fabricWeight: isHot ? "Lightweight (180g/m)" : "Mediumweight (260g/m)",
      vibeReason: `Perfect for ${weather} conditions. It provides exceptional comfort and effortless drape for the ${occasion || "event"}.`,
      recommendedTie: `Bespoke hand-rolled ${suitColor || "Navy"}-complimentary silk jacquard tie`,
      recommendedShirt: "Classic white double-cuff sea island cotton shirt",
      recommendedShoes: "Meticulously burnished dark brown calf leather oxfords",
      accessoryDetails: `A harmonized look designed for ${occasion}. The ${suitColor || "base"} suit is elevated by textural contrast in the luxury shirt and artisan footwear.`
    };
    res.json(fallback);
  }
});


// --- USER AUTHENTICATION ENDPOINTS ---

app.post("/api/auth/register", async (req, res) => {
  const { email, password, name, role } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ error: "Email, password, and name are required" });
  }

  const normalizedRole = role === "admin" || role === "tailor" ? "admin" : "customer";
  const userId = `usr-${Math.floor(Math.random() * 900000 + 100000)}`;

  if (dbAvailable) {
    try {
      const existRes = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
      if (existRes.rows.length > 0) {
        return res.status(400).json({ error: "Email already registered" });
      }

      const insertRes = await pool.query(
        "INSERT INTO users (id, name, email, password, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role",
        [userId, name, email, password, normalizedRole]
      );
      
      if (normalizedRole === "customer") {
        await pool.query(
          "INSERT INTO measurements (user_id, chest, waist, hips, neck, sleeve_length, inseam) VALUES ($1, $2, $3, $4, $5, $6, $7)",
          [userId, 40, 34, 41, 16, 33, 31]
        );
      }

      return res.json({ user: insertRes.rows[0] });
    } catch (err: any) {
      console.warn("Auth register SQL failed, using memory:", err);
    }
  }

  // Memory fallback
  const userExists = memUsers.some((u) => u.email.toLowerCase() === email.toLowerCase());
  if (userExists) {
    return res.status(400).json({ error: "Email already registered" });
  }

  const newUser = { id: userId, name, email, password, role: normalizedRole };
  memUsers.push(newUser);
  if (normalizedRole === "customer") {
    memMeasurements[userId] = { chest: 40, waist: 34, hips: 41, neck: 16, sleeveLength: 33, inseam: 31 };
  }

  res.json({ user: { id: userId, name, email, role: normalizedRole } });
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  if (dbAvailable) {
    try {
      const loginRes = await pool.query("SELECT * FROM users WHERE email = $1 AND password = $2", [email, password]);
      if (loginRes.rows.length === 0) {
        return res.status(401).json({ error: "Invalid email or password" });
      }
      const u = loginRes.rows[0];
      return res.json({ user: { id: u.id, name: u.name, email: u.email, role: u.role } });
    } catch (err) {
      console.warn("Auth login SQL failed, using memory:", err);
    }
  }

  const u = memUsers.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
  if (!u) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  res.json({ user: { id: u.id, name: u.name, email: u.email, role: u.role } });
});


// --- PRODUCTS MARKETPLACE ENDPOINTS ---

app.get("/api/products", async (req, res) => {
  if (dbAvailable) {
    try {
      const prodRes = await pool.query("SELECT * FROM products ORDER BY id ASC");
      const mapped = prodRes.rows.map((row) => ({
        id: row.id,
        category: row.category,
        name: row.name,
        price: parseFloat(row.price),
        description: row.description,
        image: row.image,
        stock: row.stock,
        rating: parseFloat(row.rating),
        sizeGuide: row.size_guide ? JSON.parse(row.size_guide) : [],
        fabricInfo: row.fabric_info
      }));
      return res.json(mapped);
    } catch (err) {
      console.warn("Get products SQL failed, using memory:", err);
    }
  }
  res.json(memProducts);
});

app.post("/api/products", async (req, res) => {
  const { category, name, price, description, image, stock, rating, sizeGuide, fabricInfo } = req.body;
  const newId = `prod-${Date.now()}`;
  const sizeGuideStr = sizeGuide ? JSON.stringify(sizeGuide) : "[]";

  if (dbAvailable) {
    try {
      await pool.query(
        `INSERT INTO products (id, category, name, price, description, image, stock, rating, size_guide, fabric_info)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [newId, category, name, price, description, image || "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&q=80&w=600", stock || 10, rating || 5.0, sizeGuideStr, fabricInfo || ""]
      );
      return res.json({ success: true, id: newId });
    } catch (err) {
      console.warn("Post product SQL failed, using memory:", err);
    }
  }

  const newProd = {
    id: newId,
    category,
    name,
    price: parseFloat(price),
    description,
    image: image || "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&q=80&w=600",
    stock: stock || 10,
    rating: rating || 5.0,
    sizeGuide: sizeGuide || [],
    fabricInfo: fabricInfo || ""
  };
  memProducts.push(newProd);
  res.json({ success: true, product: newProd });
});

app.put("/api/products/:id", async (req, res) => {
  const { id } = req.params;
  const { name, price, description, image, stock, fabricInfo, category, sizeGuide } = req.body;
  const sizeGuideStr = sizeGuide ? JSON.stringify(sizeGuide) : "[]";

  if (dbAvailable) {
    try {
      await pool.query(
        `UPDATE products SET name = $1, price = $2, description = $3, image = $4, stock = $5, fabric_info = $6, category = $7, size_guide = $8 WHERE id = $9`,
        [name, price, description, image, stock, fabricInfo, category, sizeGuideStr, id]
      );
      return res.json({ success: true });
    } catch (err) {
      console.warn("Update product SQL failed, using memory:", err);
    }
  }

  const idx = memProducts.findIndex((p) => p.id === id);
  if (idx !== -1) {
    memProducts[idx] = { 
      ...memProducts[idx], 
      name, 
      price: parseFloat(price), 
      description, 
      image, 
      stock, 
      fabricInfo,
      category: category || memProducts[idx].category,
      sizeGuide: sizeGuide || memProducts[idx].sizeGuide
    };
    return res.json({ success: true, product: memProducts[idx] });
  }
  res.status(404).json({ error: "Product not found" });
});

app.delete("/api/products/:id", async (req, res) => {
  const { id } = req.params;

  if (dbAvailable) {
    try {
      await pool.query("DELETE FROM products WHERE id = $1", [id]);
      return res.json({ success: true });
    } catch (err) {
      console.warn("Delete product SQL failed, using memory:", err);
    }
  }

  memProducts = memProducts.filter((p) => p.id !== id);
  res.json({ success: true });
});


// --- LOOKBOOK & GALLERY ENDPOINTS ---

app.get("/api/gallery", async (req, res) => {
  if (dbAvailable) {
    try {
      const galRes = await pool.query("SELECT * FROM gallery ORDER BY id DESC");
      const mapped = galRes.rows.map((row) => ({
        id: row.id,
        type: row.type,
        title: row.title,
        description: row.description,
        image: row.image,
        clientName: row.client_name || ""
      }));
      return res.json(mapped);
    } catch (err) {
      console.warn("Get gallery SQL failed, using memory:", err);
    }
  }
  res.json(memGallery);
});

app.post("/api/gallery", async (req, res) => {
  const { type, title, description, image, clientName } = req.body;
  if (!title || !type || !image) {
    return res.status(400).json({ error: "Type, Title, and Image are required." });
  }

  const newId = `gal-${Date.now()}`;

  if (dbAvailable) {
    try {
      await pool.query(
        `INSERT INTO gallery (id, type, title, description, image, client_name)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [newId, type, title, description || "", image, clientName || null]
      );
      return res.json({ success: true, id: newId });
    } catch (err) {
      console.warn("Post gallery SQL failed, using memory:", err);
    }
  }

  const newItem = {
    id: newId,
    type,
    title,
    description: description || "",
    image,
    clientName: clientName || ""
  };
  memGallery.unshift(newItem);
  res.json({ success: true, item: newItem });
});

app.put("/api/gallery/:id", async (req, res) => {
  const { id } = req.params;
  const { type, title, description, image, clientName } = req.body;

  if (dbAvailable) {
    try {
      await pool.query(
        `UPDATE gallery SET type = $1, title = $2, description = $3, image = $4, client_name = $5 WHERE id = $6`,
        [type, title, description, image, clientName || null, id]
      );
      return res.json({ success: true });
    } catch (err) {
      console.warn("Update gallery SQL failed, using memory:", err);
    }
  }

  const idx = memGallery.findIndex((g) => g.id === id);
  if (idx !== -1) {
    memGallery[idx] = {
      ...memGallery[idx],
      type,
      title,
      description,
      image,
      clientName: clientName || ""
    };
    return res.json({ success: true, item: memGallery[idx] });
  }
  res.status(404).json({ error: "Gallery item not found" });
});

app.delete("/api/gallery/:id", async (req, res) => {
  const { id } = req.params;

  if (dbAvailable) {
    try {
      await pool.query("DELETE FROM gallery WHERE id = $1", [id]);
      return res.json({ success: true });
    } catch (err) {
      console.warn("Delete gallery SQL failed, using memory:", err);
    }
  }

  memGallery = memGallery.filter((g) => g.id !== id);
  res.json({ success: true });
});


// --- ORDERS ENDPOINTS ---

app.get("/api/orders", async (req, res) => {
  const { userEmail } = req.query;

  if (dbAvailable) {
    try {
      let ordersQuery;
      let params = [];
      if (userEmail) {
        ordersQuery = "SELECT * FROM orders WHERE customer_email = $1 ORDER BY id DESC";
        params.push(userEmail);
      } else {
        ordersQuery = "SELECT * FROM orders ORDER BY id DESC";
      }

      const ordersRes = await pool.query(ordersQuery, params);
      const mapped = (ordersRes.rows as any[]).map((row: any) => ({
        id: row.id,
        customerName: row.customer_name,
        customerEmail: row.customer_email,
        type: row.type,
        status: row.status,
        totalPrice: parseFloat(row.total_price),
        date: row.date,
        assignedTo: row.assigned_to,
        productId: row.product_id,
        productName: row.product_name,
        productImage: row.product_image,
        productCategory: row.product_category,
        customDetails: row.custom_details ? JSON.parse(row.custom_details) : undefined,
        measurements: row.measurements ? JSON.parse(row.measurements) : undefined
      }));
      return res.json(mapped);
    } catch (err) {
      console.warn("Get orders SQL failed, using memory:", err);
    }
  }

  if (userEmail) {
    const filtered = memOrders.filter((o) => o.customerEmail?.toLowerCase() === (userEmail as string).toLowerCase());
    return res.json(filtered);
  }
  res.json(memOrders);
});

app.post("/api/orders", async (req, res) => {
  const { id, customerName, customerEmail, type, status, totalPrice, date, assignedTo, productId, productName, productImage, productCategory, customDetails, measurements } = req.body;
  
  const customDetailsStr = customDetails ? JSON.stringify(customDetails) : null;
  const measurementsStr = measurements ? JSON.stringify(measurements) : null;

  if (dbAvailable) {
    try {
      await pool.query(
        `INSERT INTO orders (id, customer_name, customer_email, type, status, total_price, date, assigned_to, product_id, product_name, product_image, product_category, custom_details, measurements)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
        [id, customerName, customerEmail, type, status, totalPrice, date, assignedTo || "None", productId || null, productName || null, productImage || null, productCategory || null, customDetailsStr, measurementsStr]
      );
      return res.json({ success: true });
    } catch (err) {
      console.warn("Post order SQL failed, using memory:", err);
    }
  }

  const newOrder = {
    id,
    customerName,
    customerEmail,
    type,
    status,
    totalPrice: parseFloat(totalPrice),
    date,
    assignedTo: assignedTo || "None",
    productId,
    productName,
    productImage,
    productCategory,
    customDetails,
    measurements
  };
  memOrders.unshift(newOrder);
  res.json({ success: true, order: newOrder });
});

app.put("/api/orders/:id/status", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (dbAvailable) {
    try {
      await pool.query("UPDATE orders SET status = $1 WHERE id = $2", [status, id]);
      return res.json({ success: true });
    } catch (err) {
      console.warn("Update order status SQL failed, using memory:", err);
    }
  }

  const idx = memOrders.findIndex((o) => o.id === id);
  if (idx !== -1) {
    memOrders[idx].status = status;
    return res.json({ success: true, order: memOrders[idx] });
  }
  res.status(404).json({ error: "Order not found" });
});

app.put("/api/orders/:id/assign", async (req, res) => {
  const { id } = req.params;
  const { assignedTo } = req.body;

  if (dbAvailable) {
    try {
      await pool.query("UPDATE orders SET assigned_to = $1 WHERE id = $2", [assignedTo, id]);
      return res.json({ success: true });
    } catch (err) {
      console.warn("Assign order SQL failed, using memory:", err);
    }
  }

  const idx = memOrders.findIndex((o) => o.id === id);
  if (idx !== -1) {
    memOrders[idx].assignedTo = assignedTo;
    return res.json({ success: true, order: memOrders[idx] });
  }
  res.status(404).json({ error: "Order not found" });
});


// --- REPAIRS ENDPOINTS ---

app.get("/api/repairs", async (req, res) => {
  const { userEmail } = req.query;

  if (dbAvailable) {
    try {
      let q = "SELECT * FROM repairs ORDER BY id DESC";
      let params = [];
      if (userEmail) {
        q = "SELECT * FROM repairs WHERE customer_email = $1 ORDER BY id DESC";
        params.push(userEmail);
      }
      const repRes = await pool.query(q, params);
      const mapped = repRes.rows.map((r) => ({
        id: r.id,
        customerName: r.customer_name,
        customerEmail: r.customer_email,
        garmentType: r.garment_type,
        issueType: r.issue_type,
        description: r.description,
        imageUrl: r.image_url,
        costEstimate: parseFloat(r.cost_estimate),
        timeEstimate: r.time_estimate,
        complexity: r.complexity,
        status: r.status,
        date: r.date,
        pickupOption: r.pickup_option
      }));
      return res.json(mapped);
    } catch (err) {
      console.warn("Get repairs SQL failed, using memory:", err);
    }
  }

  if (userEmail) {
    const filtered = memRepairs.filter((r) => r.customerEmail?.toLowerCase() === (userEmail as string).toLowerCase());
    return res.json(filtered);
  }
  res.json(memRepairs);
});

app.post("/api/repairs", async (req, res) => {
  const { id, customerName, customerEmail, garmentType, issueType, description, imageUrl, costEstimate, timeEstimate, complexity, status, date, pickupOption } = req.body;

  if (dbAvailable) {
    try {
      await pool.query(
        `INSERT INTO repairs (id, customer_name, customer_email, garment_type, issue_type, description, image_url, cost_estimate, time_estimate, complexity, status, date, pickup_option)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
        [id, customerName, customerEmail, garmentType, issueType, description, imageUrl || null, costEstimate, timeEstimate, complexity, status, date, pickupOption]
      );
      return res.json({ success: true });
    } catch (err) {
      console.warn("Post repair SQL failed, using memory:", err);
    }
  }

  const newRepair = {
    id,
    customerName,
    customerEmail,
    garmentType,
    issueType,
    description,
    imageUrl,
    costEstimate: parseFloat(costEstimate),
    timeEstimate,
    complexity,
    status,
    date,
    pickupOption
  };
  memRepairs.unshift(newRepair);
  res.json({ success: true, repair: newRepair });
});

app.put("/api/repairs/:id/status", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (dbAvailable) {
    try {
      await pool.query("UPDATE repairs SET status = $1 WHERE id = $2", [status, id]);
      return res.json({ success: true });
    } catch (err) {
      console.warn("Update repair status SQL failed, using memory:", err);
    }
  }

  const idx = memRepairs.findIndex((r) => r.id === id);
  if (idx !== -1) {
    memRepairs[idx].status = status;
    return res.json({ success: true, repair: memRepairs[idx] });
  }
  res.status(404).json({ error: "Repair not found" });
});


// --- WARDROBE ENDPOINTS ---

app.get("/api/wardrobe", async (req, res) => {
  if (dbAvailable) {
    try {
      const wardRes = await pool.query("SELECT * FROM wardrobe ORDER BY id DESC");
      const mapped = wardRes.rows.map((w) => ({
        id: w.id,
        type: w.type,
        name: w.name,
        category: w.category,
        fabric: w.fabric,
        color: w.color,
        pattern: w.pattern,
        image: w.image,
        dateAdded: w.date_added,
        status: w.status
      }));
      return res.json(mapped);
    } catch (err) {
      console.warn("Get wardrobe SQL failed, using memory:", err);
    }
  }
  res.json(memWardrobe);
});

app.post("/api/wardrobe", async (req, res) => {
  const { id, type, name, category, fabric, color, pattern, image, dateAdded, status } = req.body;

  if (dbAvailable) {
    try {
      await pool.query(
        `INSERT INTO wardrobe (id, type, name, category, fabric, color, pattern, image, date_added, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [id, type, name, category, fabric || null, color, pattern || null, image, dateAdded, status || null]
      );
      return res.json({ success: true });
    } catch (err) {
      console.warn("Post wardrobe SQL failed, using memory:", err);
    }
  }

  const newItem = { id, type, name, category, fabric, color, pattern, image, dateAdded, status };
  memWardrobe.unshift(newItem);
  res.json({ success: true, wardrobeItem: newItem });
});


// --- MEASUREMENTS ENDPOINTS ---

app.get("/api/measurements", async (req, res) => {
  const { userId } = req.query;
  const key = (userId as string) || "usr-customer";

  if (dbAvailable) {
    try {
      const measRes = await pool.query("SELECT * FROM measurements WHERE user_id = $1", [key]);
      if (measRes.rows.length > 0) {
        const m = measRes.rows[0];
        return res.json({
          chest: parseFloat(m.chest),
          waist: parseFloat(m.waist),
          hips: parseFloat(m.hips),
          neck: parseFloat(m.neck),
          sleeveLength: parseFloat(m.sleeve_length),
          inseam: parseFloat(m.inseam)
        });
      }
    } catch (err) {
      console.warn("Get measurements SQL failed, using memory:", err);
    }
  }

  const m = memMeasurements[key] || { chest: 40, waist: 34, hips: 41, neck: 16, sleeveLength: 33, inseam: 31 };
  res.json(m);
});

app.put("/api/measurements", async (req, res) => {
  const { userId, chest, waist, hips, neck, sleeveLength, inseam } = req.body;
  const key = userId || "usr-customer";

  if (dbAvailable) {
    try {
      await pool.query(
        `INSERT INTO measurements (user_id, chest, waist, hips, neck, sleeve_length, inseam)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (user_id)
         DO UPDATE SET chest = EXCLUDED.chest, waist = EXCLUDED.waist, hips = EXCLUDED.hips, neck = EXCLUDED.neck, sleeve_length = EXCLUDED.sleeve_length, inseam = EXCLUDED.inseam`,
        [key, chest, waist, hips, neck, sleeveLength, inseam]
      );
      return res.json({ success: true });
    } catch (err) {
      console.warn("Update measurements SQL failed, using memory:", err);
    }
  }

  memMeasurements[key] = { chest, waist, hips, neck, sleeveLength, inseam };
  res.json({ success: true });
});


// Serve static frontend assets and index fallback in Production or Vite in Dev
async function startServer() {
  if (process.env.DATABASE_URL) {
    try {
      const client = await pool.connect();
      dbAvailable = true;
      client.release();
      console.log("Database available on startup. Running initDB...");
      await initDB();
    } catch (err) {
      console.warn("Could not connect to Neon DB on startup. Operating in memory mode:", err);
      dbAvailable = false;
    }
  } else {
    console.warn("No DATABASE_URL configured. Operating in memory mode.");
    dbAvailable = false;
  }

  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in development mode with Vite middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in production mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Uptown Suits Express Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
