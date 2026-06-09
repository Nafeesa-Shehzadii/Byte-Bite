import { createClient } from "@supabase/supabase-js";
import { logger } from "./logger";

const supabaseUrl = process.env["SUPABASE_URL"];
const supabaseAnonKey = process.env["SUPABASE_ANON_KEY"];

if (!supabaseUrl || !supabaseAnonKey) {
  logger.warn("SUPABASE_URL or SUPABASE_ANON_KEY not set — Supabase client disabled");
}

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false },
    })
  : null;

const CREATE_TABLES_SQL = `
CREATE TABLE IF NOT EXISTS restaurants (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  cuisine_type TEXT,
  delivery_time INTEGER DEFAULT 30,
  rating NUMERIC(3,1) DEFAULT 4.5,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS menu_items (
  id SERIAL PRIMARY KEY,
  restaurant_id INTEGER REFERENCES restaurants(id),
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT,
  available BOOLEAN DEFAULT TRUE,
  ingredients TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  customer_name TEXT NOT NULL,
  restaurant_id INTEGER,
  restaurant_name TEXT NOT NULL,
  driver_name TEXT,
  status TEXT NOT NULL DEFAULT 'placed',
  total INTEGER NOT NULL,
  delivery_address TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]',
  stripe_session_id TEXT,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
`;

export async function trySetupSupabaseTables(): Promise<boolean> {
  if (!supabase) return false;

  try {
    const { error } = await supabase.rpc("exec_sql", { sql: CREATE_TABLES_SQL });
    if (error) {
      logger.warn({ err: error.message }, "exec_sql RPC not available — run the SQL manually in Supabase dashboard");
      logger.info("Required SQL:\n" + CREATE_TABLES_SQL);
      return false;
    }
    logger.info("Supabase tables created/verified via exec_sql");
    return true;
  } catch (e) {
    logger.warn({ err: String(e) }, "Could not auto-create Supabase tables");
    return false;
  }
}

export async function seedSupabaseRestaurant(): Promise<void> {
  if (!supabase) return;

  const { data: existing } = await supabase.from("restaurants").select("id").limit(1);
  if (existing && existing.length > 0) return;

  const { data: rest, error: restErr } = await supabase.from("restaurants").insert({
    name: "Ember & Co.",
    description: "Late-night craft burgers and smash wings, built for the bold. Every bite engineered for maximum satisfaction.",
    image_url: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80",
    cuisine_type: "American",
    delivery_time: 25,
    rating: 4.8,
  }).select().single();

  if (restErr || !rest) {
    logger.warn({ err: restErr?.message }, "Could not seed Supabase restaurant");
    return;
  }

  const menuItems = [
    { name: "Classic Smash Burger", description: "Double smash patty, american cheese, secret sauce, pickles, shredded lettuce on a brioche bun.", price: 1399, category: "Burgers", image_url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80", ingredients: ["beef patty", "american cheese", "secret sauce", "pickles", "lettuce", "brioche bun"] },
    { name: "Ember Signature", description: "Triple smash, aged cheddar, crispy bacon, caramelized onions, truffle aioli.", price: 1799, category: "Burgers", image_url: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&w=400&q=80", ingredients: ["triple beef patty", "aged cheddar", "bacon", "caramelized onion", "truffle aioli"] },
    { name: "Mushroom Melt", description: "Smash patty, swiss cheese, garlic-herb mushrooms, arugula, dijon mayo.", price: 1549, category: "Burgers", image_url: "https://images.unsplash.com/photo-1586816001966-79b736744398?auto=format&fit=crop&w=400&q=80", ingredients: ["beef patty", "swiss cheese", "garlic mushrooms", "arugula", "dijon mayo"] },
    { name: "Spicy Habanero", description: "Smash patty, habanero jack, jalapeños, chipotle slaw, fire sauce.", price: 1599, category: "Burgers", image_url: "https://images.unsplash.com/photo-1565299543923-37dd37887442?auto=format&fit=crop&w=400&q=80", ingredients: ["beef patty", "habanero jack", "jalapeños", "chipotle slaw", "fire sauce"] },
    { name: "Classic Wings", description: "10 crispy wings, your choice of buffalo, honey garlic, or BBQ.", price: 1299, category: "Wings", image_url: "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?auto=format&fit=crop&w=400&q=80", ingredients: ["chicken wings", "buffalo sauce", "celery", "blue cheese dip"] },
    { name: "Dry Rub Wings", description: "10 wings, ember spice rub, smoked paprika, lime wedge.", price: 1349, category: "Wings", image_url: "https://images.unsplash.com/photo-1527477396000-e27163b481c2?auto=format&fit=crop&w=400&q=80", ingredients: ["chicken wings", "ember spice", "smoked paprika", "lime"] },
    { name: "Loaded Fries", description: "Crinkle fries, cheese sauce, bacon bits, green onions, sour cream.", price: 899, category: "Sides", image_url: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=400&q=80", ingredients: ["crinkle fries", "cheese sauce", "bacon", "green onion", "sour cream"] },
    { name: "Truffle Fries", description: "Thin-cut fries, truffle oil, parmesan, fresh herbs.", price: 999, category: "Sides", image_url: "https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=400&q=80", ingredients: ["thin-cut fries", "truffle oil", "parmesan", "fresh herbs"] },
    { name: "Onion Rings", description: "Hand-battered thick-cut onion rings, smoky dipping sauce.", price: 799, category: "Sides", image_url: "https://images.unsplash.com/photo-1639024471283-03518883512d?auto=format&fit=crop&w=400&q=80", ingredients: ["onion rings", "beer batter", "smoky sauce"] },
    { name: "Craft Cola", description: "House-made cola syrup, sparkling water, a squeeze of citrus.", price: 399, category: "Drinks", image_url: "https://images.unsplash.com/photo-1543252164-2c9e6b20e33f?auto=format&fit=crop&w=400&q=80", ingredients: ["cola syrup", "sparkling water", "citrus"] },
    { name: "Ember Lemonade", description: "Fresh lemonade with a hint of smoked salt and basil.", price: 449, category: "Drinks", image_url: "https://images.unsplash.com/photo-1621263764928-df1444c5e859?auto=format&fit=crop&w=400&q=80", ingredients: ["lemon juice", "smoked salt", "basil", "sparkling water"] },
    { name: "Chocolate Shake", description: "Thick dark chocolate milkshake, whipped cream, cocoa dust.", price: 649, category: "Drinks", image_url: "https://images.unsplash.com/photo-1572490122747-3e92e5a35a1f?auto=format&fit=crop&w=400&q=80", ingredients: ["dark chocolate ice cream", "milk", "whipped cream", "cocoa"] },
  ];

  for (const item of menuItems) {
    await supabase.from("menu_items").insert({ ...item, restaurant_id: rest.id });
  }

  logger.info("Supabase seeded with Ember & Co. restaurant and menu items");
}
