import { config } from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
config({ path: resolve(dirname(fileURLToPath(import.meta.url)), "../../../.env") });

// Dynamic import after dotenv loads
const { db, pool } = await import("./index");
const { restaurantsTable, menuItemsTable, ordersTable, driversTable } = await import("./schema");

export async function main() {
  console.log("Seeding database...");

  // Clear existing data in FK order
  await db.delete(ordersTable);
  await db.delete(menuItemsTable);
  await db.delete(driversTable);
  await db.delete(restaurantsTable);

  // Seed restaurants
  const [ember, sakura, verde, fuego, lemongrass, aegean] = await db
    .insert(restaurantsTable)
    .values([
      {
        name: "Ember & Co.",
        description:
          "Wood-fired American classics with a modern twist. Signature smash burgers, crispy wings, and hand-cut fries in a cozy industrial setting.",
        imageUrl:
          "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=500&fit=crop",
        cuisineType: "American",
        deliveryTime: 25,
        rating: 4.7,
      },
      {
        name: "Sakura Ramen House",
        description:
          "Authentic Japanese ramen crafted with 18-hour pork bone broth. Handmade noodles, premium toppings, and traditional appetizers.",
        imageUrl:
          "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&h=500&fit=crop",
        cuisineType: "Japanese",
        deliveryTime: 35,
        rating: 4.8,
      },
      {
        name: "Verde Pizza Kitchen",
        description:
          "Neapolitan-style pizzas baked in a 900\u00B0F wood-fired oven. Fresh mozzarella, San Marzano tomatoes, and seasonal Italian ingredients.",
        imageUrl:
          "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=500&fit=crop",
        cuisineType: "Italian",
        deliveryTime: 30,
        rating: 4.6,
      },
      {
        name: "Fuego Cantina",
        description:
          "Bold Mexican flavors with a contemporary edge. Slow-smoked meats, house-made salsas, handcrafted tortillas, and an extensive mezcal collection.",
        imageUrl:
          "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&h=500&fit=crop",
        cuisineType: "Mexican",
        deliveryTime: 30,
        rating: 4.7,
      },
      {
        name: "Lemongrass & Co.",
        description:
          "Refined Thai cuisine balancing sweet, sour, salty, and spicy. Fragrant curries, wok-fired noodles, and fresh herbs from our rooftop garden.",
        imageUrl:
          "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&h=500&fit=crop",
        cuisineType: "Thai",
        deliveryTime: 35,
        rating: 4.9,
      },
      {
        name: "Aegean Table",
        description:
          "Sun-drenched Mediterranean flavors inspired by the Greek coast. Grilled seafood, mezze platters, olive oil-drenched salads, and house-baked pita.",
        imageUrl:
          "https://images.unsplash.com/photo-1544148103-0773bf10d330?w=800&h=500&fit=crop",
        cuisineType: "Mediterranean",
        deliveryTime: 40,
        rating: 4.8,
      },
    ])
    .returning();

  // Seed menu items for Ember & Co.
  await db.insert(menuItemsTable).values([
    {
      restaurantId: ember.id,
      name: "Classic Smash Burger",
      description: "Double smashed patties, American cheese, pickles, and signature Ember sauce on a brioche bun.",
      price: 12.99,
      category: "Burgers",
      imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop",
    },
    {
      restaurantId: ember.id,
      name: "Ember Signature Burger",
      description: "Wagyu beef, smoked gouda, caramelized onions, truffle aioli, and arugula.",
      price: 17.99,
      category: "Burgers",
      imageUrl: "https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400&h=300&fit=crop",
    },
    {
      restaurantId: ember.id,
      name: "Buffalo Wings (8pc)",
      description: "Crispy fried wings tossed in house buffalo sauce, served with ranch and celery.",
      price: 13.49,
      category: "Wings",
      imageUrl: "https://images.unsplash.com/photo-1608039829572-9b0193862d29?w=400&h=300&fit=crop",
    },
    {
      restaurantId: ember.id,
      name: "Loaded Truffle Fries",
      description: "Hand-cut fries, truffle oil, parmesan, chives, and garlic aioli.",
      price: 8.99,
      category: "Sides",
      imageUrl: "https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?w=400&h=300&fit=crop",
    },
    {
      restaurantId: ember.id,
      name: "Onion Rings",
      description: "Beer-battered thick-cut onion rings with smoky chipotle dipping sauce.",
      price: 7.49,
      category: "Sides",
      imageUrl: "https://images.unsplash.com/photo-1639024471283-03518883512d?w=400&h=300&fit=crop",
    },
    {
      restaurantId: ember.id,
      name: "Craft Cola Float",
      description: "House-made cola with a generous scoop of vanilla bean ice cream.",
      price: 5.99,
      category: "Drinks",
      imageUrl: "https://images.unsplash.com/photo-1561758033-7e924f619b47?w=400&h=300&fit=crop",
    },
  ]);

  // Seed menu items for Sakura Ramen House
  await db.insert(menuItemsTable).values([
    {
      restaurantId: sakura.id,
      name: "Tonkotsu Ramen",
      description: "Rich 18-hour pork bone broth, chashu pork, soft-boiled egg, bamboo shoots, and scallions.",
      price: 15.99,
      category: "Ramen",
      imageUrl: "https://images.unsplash.com/photo-1557872943-16a5ac26437e?w=400&h=300&fit=crop",
    },
    {
      restaurantId: sakura.id,
      name: "Spicy Miso Ramen",
      description: "White miso broth with chili oil, ground pork, corn, bean sprouts, and nori.",
      price: 16.49,
      category: "Ramen",
      imageUrl: "https://images.unsplash.com/photo-1591814468924-caf88d1232e1?w=400&h=300&fit=crop",
    },
    {
      restaurantId: sakura.id,
      name: "Shoyu Ramen",
      description: "Clear soy-based broth with chicken, menma, naruto, and a delicate dashi flavor.",
      price: 14.99,
      category: "Ramen",
      imageUrl: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=300&fit=crop",
    },
    {
      restaurantId: sakura.id,
      name: "Gyoza (6pc)",
      description: "Pan-fried pork and cabbage dumplings with a crispy golden bottom, served with ponzu.",
      price: 8.99,
      category: "Appetizers",
      imageUrl: "https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=400&h=300&fit=crop",
    },
    {
      restaurantId: sakura.id,
      name: "Edamame",
      description: "Steamed soybeans with flaky sea salt and a squeeze of lemon.",
      price: 5.49,
      category: "Appetizers",
      imageUrl: "https://images.unsplash.com/photo-1564834744159-ff0ea41ba4b9?w=400&h=300&fit=crop",
    },
    {
      restaurantId: sakura.id,
      name: "Karaage Chicken",
      description: "Japanese-style fried chicken thighs marinated in ginger-soy, served with kewpie mayo.",
      price: 10.99,
      category: "Appetizers",
      imageUrl: "https://images.unsplash.com/photo-1562967914-608f82629710?w=400&h=300&fit=crop",
    },
    {
      restaurantId: sakura.id,
      name: "Matcha Latte",
      description: "Ceremonial-grade matcha whisked with steamed oat milk.",
      price: 5.99,
      category: "Drinks",
      imageUrl: "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=400&h=300&fit=crop",
    },
  ]);

  // Seed menu items for Verde Pizza Kitchen
  await db.insert(menuItemsTable).values([
    {
      restaurantId: verde.id,
      name: "Margherita Pizza",
      description: "San Marzano tomato sauce, fresh mozzarella di bufala, basil, and extra virgin olive oil.",
      price: 14.99,
      category: "Pizza",
      imageUrl: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=300&fit=crop",
    },
    {
      restaurantId: verde.id,
      name: "Diavola Pizza",
      description: "Spicy salami, roasted red peppers, mozzarella, and chili-infused honey drizzle.",
      price: 16.99,
      category: "Pizza",
      imageUrl: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&h=300&fit=crop",
    },
    {
      restaurantId: verde.id,
      name: "Truffle Mushroom Pizza",
      description: "Wild mushroom medley, fontina, truffle cream, thyme, and shaved parmesan.",
      price: 18.49,
      category: "Pizza",
      imageUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop",
    },
    {
      restaurantId: verde.id,
      name: "Caesar Salad",
      description: "Crisp romaine, house-made Caesar dressing, croutons, and aged parmigiano.",
      price: 10.99,
      category: "Salads",
      imageUrl: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&h=300&fit=crop",
    },
    {
      restaurantId: verde.id,
      name: "Garlic Knots (6pc)",
      description: "Freshly baked dough knots tossed in garlic butter and parsley, with marinara dip.",
      price: 7.49,
      category: "Sides",
      imageUrl: "https://images.unsplash.com/photo-1619535860434-ba1d8fa12536?w=400&h=300&fit=crop",
    },
    {
      restaurantId: verde.id,
      name: "Tiramisu",
      description: "Classic Italian dessert with espresso-soaked ladyfingers, mascarpone, and cocoa.",
      price: 9.49,
      category: "Desserts",
      imageUrl: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&h=300&fit=crop",
    },
    {
      restaurantId: verde.id,
      name: "Limonata",
      description: "Sparkling Italian lemonade with fresh mint and a touch of elderflower.",
      price: 4.99,
      category: "Drinks",
      imageUrl: "https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=400&h=300&fit=crop",
    },
    {
      restaurantId: verde.id,
      name: "Burrata Caprese",
      description: "Creamy burrata over heirloom tomatoes, fresh basil, and aged balsamic reduction.",
      price: 12.99,
      category: "Salads",
      imageUrl: "https://images.unsplash.com/photo-1608897013039-887f21d8c804?w=400&h=300&fit=crop",
    },
  ]);

  // Seed menu items for Fuego Cantina
  await db.insert(menuItemsTable).values([
    {
      restaurantId: fuego.id,
      name: "Birria Tacos (3pc)",
      description: "Slow-braised beef birria in crispy corn tortillas, melted cheese, cilantro, onion, and consomme for dipping.",
      price: 14.99,
      category: "Tacos",
      imageUrl: "https://images.unsplash.com/photo-1599974579688-8dbdd335c77f?w=400&h=300&fit=crop",
    },
    {
      restaurantId: fuego.id,
      name: "Carne Asada Burrito",
      description: "Grilled skirt steak, Mexican rice, black beans, pico de gallo, guacamole, and crema in a flour tortilla.",
      price: 15.99,
      category: "Burritos",
      imageUrl: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&h=300&fit=crop",
    },
    {
      restaurantId: fuego.id,
      name: "Guacamole & Chips",
      description: "Tableside-style guacamole with ripe avocados, lime, cilantro, jalapeno, and warm tortilla chips.",
      price: 9.99,
      category: "Starters",
      imageUrl: "https://images.unsplash.com/photo-1615870216519-2f9fa575fa5c?w=400&h=300&fit=crop",
    },
    {
      restaurantId: fuego.id,
      name: "Elote (Street Corn)",
      description: "Grilled corn on the cob with chipotle mayo, cotija cheese, lime, and chili powder.",
      price: 6.99,
      category: "Starters",
      imageUrl: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=400&h=300&fit=crop",
    },
    {
      restaurantId: fuego.id,
      name: "Churros con Chocolate",
      description: "Crispy cinnamon-sugar churros served with warm Mexican chocolate dipping sauce.",
      price: 7.99,
      category: "Desserts",
      imageUrl: "https://images.unsplash.com/photo-1624371414361-e670edf4caaf?w=400&h=300&fit=crop",
    },
    {
      restaurantId: fuego.id,
      name: "Horchata",
      description: "Traditional Mexican rice milk drink with cinnamon, vanilla, and a touch of sweetness.",
      price: 4.99,
      category: "Drinks",
      imageUrl: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&h=300&fit=crop",
    },
  ]);

  // Seed menu items for Lemongrass & Co.
  await db.insert(menuItemsTable).values([
    {
      restaurantId: lemongrass.id,
      name: "Pad Thai",
      description: "Wok-fried rice noodles with prawns, tofu, bean sprouts, peanuts, and tamarind sauce.",
      price: 14.99,
      category: "Noodles",
      imageUrl: "https://images.unsplash.com/photo-1559314809-0d155014e29e?w=400&h=300&fit=crop",
    },
    {
      restaurantId: lemongrass.id,
      name: "Green Curry",
      description: "Fragrant coconut green curry with chicken, Thai basil, bamboo shoots, and jasmine rice.",
      price: 15.99,
      category: "Curries",
      imageUrl: "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=400&h=300&fit=crop",
    },
    {
      restaurantId: lemongrass.id,
      name: "Massaman Curry",
      description: "Rich and creamy curry with slow-cooked beef, potatoes, roasted peanuts, and cardamom.",
      price: 16.99,
      category: "Curries",
      imageUrl: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop",
    },
    {
      restaurantId: lemongrass.id,
      name: "Tom Yum Soup",
      description: "Hot and sour prawn soup with lemongrass, galangal, kaffir lime leaves, and chili.",
      price: 10.99,
      category: "Starters",
      imageUrl: "https://images.unsplash.com/photo-1548943487-a2e4e43b4853?w=400&h=300&fit=crop",
    },
    {
      restaurantId: lemongrass.id,
      name: "Mango Sticky Rice",
      description: "Sweet glutinous rice with fresh ripe mango, coconut cream, and toasted sesame seeds.",
      price: 8.99,
      category: "Desserts",
      imageUrl: "https://images.unsplash.com/photo-1621236378699-8597faf6a176?w=400&h=300&fit=crop",
    },
    {
      restaurantId: lemongrass.id,
      name: "Thai Iced Tea",
      description: "Strong brewed Ceylon tea with star anise, sweetened condensed milk, and crushed ice.",
      price: 5.49,
      category: "Drinks",
      imageUrl: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=300&fit=crop",
    },
    {
      restaurantId: lemongrass.id,
      name: "Spring Rolls (4pc)",
      description: "Crispy fried spring rolls with glass noodles, vegetables, and sweet chili dipping sauce.",
      price: 7.99,
      category: "Starters",
      imageUrl: "https://images.unsplash.com/photo-1548507200-cf000e4b4884?w=400&h=300&fit=crop",
    },
  ]);

  // Seed menu items for Aegean Table
  await db.insert(menuItemsTable).values([
    {
      restaurantId: aegean.id,
      name: "Grilled Octopus",
      description: "Charcoal-grilled octopus with olive oil, lemon, capers, and roasted cherry tomatoes.",
      price: 19.99,
      category: "Seafood",
      imageUrl: "https://images.unsplash.com/photo-1565680018093-ebb6b9ab5460?w=400&h=300&fit=crop",
    },
    {
      restaurantId: aegean.id,
      name: "Lamb Souvlaki Plate",
      description: "Herb-marinated lamb skewers with tzatziki, warm pita, Greek salad, and lemon potatoes.",
      price: 18.99,
      category: "Mains",
      imageUrl: "https://images.unsplash.com/photo-1529694157872-4e0c0f3b238b?w=400&h=300&fit=crop",
    },
    {
      restaurantId: aegean.id,
      name: "Mezze Platter",
      description: "Hummus, baba ganoush, tabbouleh, feta, olives, stuffed grape leaves, and warm pita bread.",
      price: 16.99,
      category: "Starters",
      imageUrl: "https://images.unsplash.com/photo-1541014741259-de529411b96a?w=400&h=300&fit=crop",
    },
    {
      restaurantId: aegean.id,
      name: "Mediterranean Salad",
      description: "Crisp greens, cucumber, tomato, red onion, Kalamata olives, feta, and herb vinaigrette.",
      price: 11.99,
      category: "Salads",
      imageUrl: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&h=300&fit=crop",
    },
    {
      restaurantId: aegean.id,
      name: "Baklava",
      description: "Layers of flaky phyllo pastry, chopped walnuts and pistachios, drenched in honey syrup.",
      price: 8.99,
      category: "Desserts",
      imageUrl: "https://images.unsplash.com/photo-1598110750624-207050c4f28c?w=400&h=300&fit=crop",
    },
    {
      restaurantId: aegean.id,
      name: "Greek Coffee",
      description: "Traditional unfiltered coffee brewed in a briki, served with a glass of cold water.",
      price: 4.49,
      category: "Drinks",
      imageUrl: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefda?w=400&h=300&fit=crop",
    },
  ]);

  // Seed drivers
  await db.insert(driversTable).values([
    {
      name: "Marcus Rivera",
      phone: "+1 (555) 234-5678",
      vehicle: "Honda Civic 2022",
      avatarUrl: "https://api.dicebear.com/9.x/avataaars/svg?seed=Marcus",
    },
    {
      name: "Priya Sharma",
      phone: "+1 (555) 345-6789",
      vehicle: "Toyota Corolla 2023",
      avatarUrl: "https://api.dicebear.com/9.x/avataaars/svg?seed=Priya",
    },
    {
      name: "Jake Thompson",
      phone: "+1 (555) 456-7890",
      vehicle: "Subaru Impreza 2021",
      avatarUrl: "https://api.dicebear.com/9.x/avataaars/svg?seed=Jake",
    },
  ]);

  console.log("Seeded:");
  console.log("  - 6 restaurants");
  console.log("  - 40 menu items");
  console.log("  - 3 drivers");
  console.log("Done!");
}

main()
  .then(() => pool.end())
  .catch((err) => {
    console.error("Seed failed:", err);
    pool.end();
    process.exit(1);
  });
