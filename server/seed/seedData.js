require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const MenuItem = require("../models/menuitem");
const User = require("../models/user");
const Table = require("../models/table");
const QRCode = require("qrcode");

const menuItems = [
  // Starters
  { name: "Paneer Tikka", description: "Grilled cottage cheese with spices", category: "Starters", price: 220, preparationTime: 15, isVeg: true, image: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400" },
  { name: "Chicken Wings", description: "Crispy wings with buffalo sauce", category: "Starters", price: 280, preparationTime: 20, isVeg: false, image: "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=400" },
  { name: "Veg Spring Rolls", description: "Crunchy rolls with mixed vegetables", category: "Starters", price: 160, preparationTime: 12, isVeg: true, image: "https://images.unsplash.com/photo-1544025162-d76538624398?w=400" },
  { name: "Chicken Soup", description: "Hot and sour chicken soup", category: "Starters", price: 140, preparationTime: 10, isVeg: false, image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400" },
  // Main Course
  { name: "Butter Chicken", description: "Tender chicken in rich tomato sauce", category: "Main Course", price: 320, preparationTime: 25, isVeg: false, image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400" },
  { name: "Dal Makhani", description: "Slow-cooked black lentils with cream", category: "Main Course", price: 220, preparationTime: 20, isVeg: true, image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400" },
  { name: "Biryani", description: "Fragrant basmati rice with spices", category: "Main Course", price: 380, preparationTime: 30, isVeg: false, image: "https://images.unsplash.com/photo-1563379091339-03246963d8cc?w=400" },
  { name: "Paneer Butter Masala", description: "Cottage cheese in creamy tomato gravy", category: "Main Course", price: 280, preparationTime: 20, isVeg: true, image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400" },
  { name: "Garlic Naan", description: "Soft bread with garlic and butter", category: "Main Course", price: 50, preparationTime: 8, isVeg: true, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400" },
  // Beverages
  { name: "Mango Lassi", description: "Creamy mango yogurt drink", category: "Beverages", price: 90, preparationTime: 5, isVeg: true, image: "https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=400" },
  { name: "Masala Chai", description: "Traditional spiced Indian tea", category: "Beverages", price: 50, preparationTime: 5, isVeg: true, image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=400" },
  { name: "Fresh Lime Soda", description: "Refreshing lime with soda water", category: "Beverages", price: 70, preparationTime: 3, isVeg: true, image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400" },
  { name: "Cold Coffee", description: "Chilled coffee with milk and ice cream", category: "Beverages", price: 120, preparationTime: 5, isVeg: true, image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400" },
  // Desserts
  { name: "Gulab Jamun", description: "Soft milk dumplings in sugar syrup", category: "Desserts", price: 100, preparationTime: 5, isVeg: true, image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400" },
  { name: "Chocolate Brownie", description: "Warm brownie with vanilla ice cream", category: "Desserts", price: 180, preparationTime: 8, isVeg: true, image: "https://images.unsplash.com/photo-1564355808539-22fda35bed7e?w=400" },
  { name: "Rasgulla", description: "Soft cheese balls in light sugar syrup", category: "Desserts", price: 90, preparationTime: 5, isVeg: true, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400" },
];

const seed = async () => {
  await connectDB();
  await MenuItem.deleteMany();
  await User.deleteMany();
  await Table.deleteMany();

  await MenuItem.insertMany(menuItems);
  console.log("✅ Menu items seeded");

  // Create admin, kitchen, waiter users
  await User.create([
    { name: "Admin User", email: "admin@restaurant.com", password: "admin123", role: "admin" },
    { name: "Kitchen Staff", email: "kitchen@restaurant.com", password: "kitchen123", role: "kitchen" },
    { name: "Waiter", email: "waiter@restaurant.com", password: "waiter123", role: "waiter" },
  ]);
  console.log("✅ Users seeded");

  // Create 8 tables with QR codes
  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
  for (let i = 1; i <= 8; i++) {
    const table = await Table.create({ tableNumber: i, capacity: i <= 4 ? 4 : 6 });
    const menuUrl = `${clientUrl}/menu/${table._id}`;
    const qrCode = await QRCode.toDataURL(menuUrl);
    table.qrCode = qrCode;
    await table.save();
  }
  console.log("✅ Tables seeded");

  console.log("\n🎉 Seed complete!");
  console.log("Admin: admin@restaurant.com / admin123");
  console.log("Kitchen: kitchen@restaurant.com / kitchen123");
  process.exit(0);
};

seed().catch((e) => { console.error(e); process.exit(1); });