import { db, pool } from "./index";
import { restaurantsTable, menuItemsTable, ordersTable, driversTable } from "./schema";

export async function main() {
  console.log("Seeding database...");

  // Clear existing data in FK order
  await db.delete(ordersTable);
  await db.delete(menuItemsTable);
  await db.delete(driversTable);
  await db.delete(restaurantsTable);

  // Seed restaurants
  const [ember, sakura, verde] = await db
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
          "Neapolitan-style pizzas baked in a 900°F wood-fired oven. Fresh mozzarella, San Marzano tomatoes, and seasonal Italian ingredients.",
        imageUrl:
          "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=500&fit=crop",
        cuisineType: "Italian",
        deliveryTime: 30,
        rating: 4.6,
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
  console.log("  - 3 restaurants");
  console.log("  - 21 menu items");
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
