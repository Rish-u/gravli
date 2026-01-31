export interface MenuItem {
  id: string;
  name: string;
  price: number;
}

export interface CafeData {
  name: string;
  items: MenuItem[];
  icon?: string;
  type?: 'food' | 'stationery';
}

const CORNER_CAFE_MENU: MenuItem[] = [
  { id: "cc-1", name: "Aloo Parantha", price: 40 },
  { id: "cc-2", name: "Gobhi Parantha", price: 50 },
  { id: "cc-3", name: "Mix Parantha", price: 60 },
  { id: "cc-4", name: "Paneer Parantha", price: 70 },
  { id: "cc-5", name: "Bread Omelette", price: 60 },
  { id: "cc-6", name: "Tea", price: 20 },
  { id: "cc-7", name: "Coffee", price: 25 },
  { id: "cc-8", name: "Cold Coffee", price: 70 },
  { id: "cc-9", name: "Grilled Sandwich (Brown Bread)", price: 60 },
  { id: "cc-10", name: "Grilled Sandwich (White Bread)", price: 50 },
  { id: "cc-11", name: "Sandwich + Fries", price: 109 },
  { id: "cc-12", name: "Samosa", price: 20 },
  { id: "cc-13", name: "Veg Grilled Burger", price: 60 },
  { id: "cc-14", name: "Cheese Grilled Burger", price: 70 },
  { id: "cc-15", name: "Samosa with Channa", price: 70 },
  { id: "cc-16", name: "French Fries", price: 60 },
  { id: "cc-17", name: "Vada Pav", price: 60 },
  { id: "cc-18", name: "Chhole Bhature", price: 39 },
  { id: "cc-19", name: "Pav Bhaji", price: 99 },
  { id: "cc-20", name: "Amritsari Kulcha + Chole", price: 90 },
  { id: "cc-21", name: "Veg Thali", price: 100 },
  { id: "cc-22", name: "Premium Thali", price: 85 },
  { id: "cc-23", name: "Non-Veg Thali", price: 130 },
  { id: "cc-24", name: "Rajma Rice", price: 150 },
  { id: "cc-25", name: "Kadhi Rice", price: 80 },
  { id: "cc-26", name: "Dal Rice", price: 80 },
  { id: "cc-27", name: "Paneer Rice", price: 100 },
  { id: "cc-28", name: "Butter Chicken (5 pc)", price: 120 },
  { id: "cc-29", name: "Butter Chicken (10 pc)", price: 250 },
  { id: "cc-30", name: "Chicken Curry Half", price: 180 },
  { id: "cc-31", name: "Chicken Curry Full", price: 490 },
  { id: "cc-32", name: "Stuffed Naan + Gravy", price: 120 },
  { id: "cc-33", name: "Veg Biryani", price: 120 },
  { id: "cc-34", name: "Chicken Biryani", price: 120 },
  { id: "cc-35", name: "White Sauce Pasta", price: 140 },
  { id: "cc-36", name: "Red Sauce Pasta", price: 120 },
  { id: "cc-37", name: "Veg Fried Rice", price: 89 },
  { id: "cc-38", name: "Egg Fried Rice", price: 119 },
  { id: "cc-39", name: "Chicken Fried Rice", price: 89 },
  { id: "cc-40", name: "Veg Noodles", price: 109 },
  { id: "cc-41", name: "Egg Noodles", price: 119 },
  { id: "cc-42", name: "Chicken Noodles", price: 139 },
  { id: "cc-43", name: "Chilly Chicken (8 pc)", price: 65 },
  { id: "cc-44", name: "Honey Chilly Potato", price: 75 },
  { id: "cc-45", name: "Honey Chilly Cauliflower", price: 75 },
  { id: "cc-46", name: "Veg Spring Roll", price: 99 },
  { id: "cc-47", name: "Veg Manchurian (Dry/Gravy)", price: 119 },
  { id: "cc-48", name: "Cheese Chilly (Dry/Gravy)", price: 119 },
  { id: "cc-49", name: "Sandwich + Fries + Coke", price: 89 },
  { id: "cc-50", name: "Burger + Fries + Coke", price: 99 },
  { id: "cc-51", name: "Pasta + Garlic Bread + Coke", price: 139 },
  { id: "cc-52", name: "Rajma Rice (Combo)", price: 80 },
  { id: "cc-53", name: "Dal Makhni with Rice", price: 99 },
  { id: "cc-54", name: "Chicken Kathi Roll", price: 99 },
  { id: "cc-55", name: "Paneer Kathi Roll", price: 99 },
  { id: "cc-56", name: "Chilly Paneer Roll", price: 89 },
  { id: "cc-57", name: "Veg Fried Rice + Manchurian Bowl", price: 119 },
  { id: "cc-58", name: "Dal Makhni + Lachha Parantha", price: 99 },
  { id: "cc-59", name: "Kadhi Paneer + Lachha Parantha", price: 99 },
  { id: "cc-60", name: "Butter Chicken + Butter Naan", price: 139 },
  { id: "cc-61", name: "Butter Naan", price: 30 },
  { id: "cc-62", name: "Garlic Naan", price: 40 },
  { id: "cc-63", name: "Lachha Parantha", price: 30 },
  { id: "cc-64", name: "Missi Roti", price: 30 },
  { id: "cc-65", name: "Tandoori Roti", price: 10 },
  { id: "cc-66", name: "Stuffed Roti with Butter", price: 12 },
  { id: "cc-67", name: "Butter Naan + Gravy", price: 120 },
  { id: "cc-68", name: "Amritsari Kulcha + Chole (Bread)", price: 100 },
  { id: "cc-69", name: "Pastry Pineapple", price: 40 },
  { id: "cc-70", name: "Strawberry Pastry", price: 50 },
  { id: "cc-71", name: "Pastry Black Forest", price: 60 },
  { id: "cc-72", name: "Brownie", price: 90 }
];

const HR_CAFE_MENU: MenuItem[] = [
  { id: "hr-1", name: "Masala Dosa", price: 60 },
  { id: "hr-2", name: "Plain Dosa", price: 50 },
  { id: "hr-3", name: "Rava Dosa", price: 70 },
  { id: "hr-4", name: "Onion Uttapam", price: 65 },
  { id: "hr-5", name: "Idli Sambar (2 pcs)", price: 40 },
  { id: "hr-6", name: "Medu Vada (2 pcs)", price: 50 },
  { id: "hr-7", name: "Filter Coffee", price: 30 },
  { id: "hr-8", name: "South Indian Thali", price: 120 },
  { id: "hr-9", name: "Curd Rice", price: 60 },
  { id: "hr-10", name: "Lemon Rice", price: 70 },
  { id: "hr-11", name: "Upma", price: 45 },
  { id: "hr-12", name: "Pongal", price: 55 },
  { id: "hr-13", name: "Mysore Pak", price: 40 },
  { id: "hr-14", name: "Gulab Jamun (2 pcs)", price: 50 },
  { id: "hr-15", name: "Kesari Bath", price: 45 },
];

const THICK_LETTO_MENU: MenuItem[] = [
  { id: "tl-1", name: "Thick Shake - Chocolate", price: 120 },
  { id: "tl-2", name: "Thick Shake - Vanilla", price: 110 },
  { id: "tl-3", name: "Thick Shake - Strawberry", price: 120 },
  { id: "tl-4", name: "Thick Shake - Oreo", price: 140 },
  { id: "tl-5", name: "Thick Shake - KitKat", price: 150 },
  { id: "tl-6", name: "Cold Coffee", price: 90 },
  { id: "tl-7", name: "Iced Latte", price: 110 },
  { id: "tl-8", name: "Frappe - Caramel", price: 130 },
  { id: "tl-9", name: "Frappe - Mocha", price: 130 },
  { id: "tl-10", name: "Hot Chocolate", price: 80 },
  { id: "tl-11", name: "Brownie Shake", price: 160 },
  { id: "tl-12", name: "Mango Smoothie", price: 100 },
  { id: "tl-13", name: "Blueberry Smoothie", price: 110 },
  { id: "tl-14", name: "Ice Cream Sundae", price: 90 },
  { id: "tl-15", name: "Waffle with Ice Cream", price: 150 },
];

const JUICE_BAR_MENU: MenuItem[] = [
  { id: "jb-1", name: "Fresh Orange Juice", price: 60 },
  { id: "jb-2", name: "Watermelon Juice", price: 50 },
  { id: "jb-3", name: "Pineapple Juice", price: 55 },
  { id: "jb-4", name: "Mixed Fruit Juice", price: 70 },
  { id: "jb-5", name: "Apple Juice", price: 65 },
  { id: "jb-6", name: "Pomegranate Juice", price: 80 },
  { id: "jb-7", name: "Mango Juice", price: 60 },
  { id: "jb-8", name: "Sugarcane Juice", price: 40 },
  { id: "jb-9", name: "Lemon Soda", price: 35 },
  { id: "jb-10", name: "Virgin Mojito", price: 70 },
  { id: "jb-11", name: "Blue Lagoon", price: 75 },
  { id: "jb-12", name: "Green Detox Juice", price: 90 },
  { id: "jb-13", name: "Carrot Ginger Juice", price: 65 },
  { id: "jb-14", name: "Banana Shake", price: 70 },
  { id: "jb-15", name: "Coconut Water", price: 50 },
];

const TIBET_KITCHEN_MENU: MenuItem[] = [
  { id: "tk-1", name: "Veg Momos (8 pcs)", price: 80 },
  { id: "tk-2", name: "Chicken Momos (8 pcs)", price: 100 },
  { id: "tk-3", name: "Steamed Momos", price: 70 },
  { id: "tk-4", name: "Fried Momos", price: 90 },
  { id: "tk-5", name: "Tandoori Momos", price: 120 },
  { id: "tk-6", name: "Gravy Momos", price: 110 },
  { id: "tk-7", name: "Thukpa (Veg)", price: 100 },
  { id: "tk-8", name: "Thukpa (Chicken)", price: 130 },
  { id: "tk-9", name: "Tibetan Bread", price: 40 },
  { id: "tk-10", name: "Butter Tea", price: 50 },
  { id: "tk-11", name: "Chowmein (Veg)", price: 80 },
  { id: "tk-12", name: "Chowmein (Chicken)", price: 100 },
  { id: "tk-13", name: "Spring Roll (4 pcs)", price: 70 },
  { id: "tk-14", name: "Momo Platter", price: 200 },
  { id: "tk-15", name: "Special Thali", price: 180 },
];

const STATIONERY_MENU: MenuItem[] = [
  { id: "st-1", name: "B&W Print (per page)", price: 2 },
  { id: "st-2", name: "Color Print (per page)", price: 10 },
  { id: "st-3", name: "Spiral Binding", price: 30 },
  { id: "st-4", name: "Lamination (A4)", price: 20 },
  { id: "st-5", name: "Photocopy B&W (per page)", price: 1 },
  { id: "st-6", name: "Photocopy Color (per page)", price: 5 },
  { id: "st-7", name: "A4 Paper (10 sheets)", price: 10 },
  { id: "st-8", name: "Pen", price: 10 },
  { id: "st-9", name: "Pencil", price: 5 },
  { id: "st-10", name: "Eraser", price: 5 },
  { id: "st-11", name: "Ruler", price: 15 },
  { id: "st-12", name: "Notebook (100 pages)", price: 50 },
  { id: "st-13", name: "File Folder", price: 25 },
  { id: "st-14", name: "Stapler", price: 60 },
  { id: "st-15", name: "Highlighter", price: 20 },
];

export const CAFE_DATA: { [key: string]: CafeData } = {
  "HR1": { name: "Corner Cafe", items: CORNER_CAFE_MENU, icon: "cafe", type: 'food' },
  "HR2": { name: "HR Cafe", items: HR_CAFE_MENU, icon: "restaurant", type: 'food' },
  "TL": { name: "Thick Letto", items: THICK_LETTO_MENU, icon: "ice-cream", type: 'food' },
  "JB": { name: "Juice Bar", items: JUICE_BAR_MENU, icon: "wine", type: 'food' },
  "TK": { name: "Tibet Kitchen", items: TIBET_KITCHEN_MENU, icon: "nutrition", type: 'food' },
  "ST": { name: "Campus Stationery", items: STATIONERY_MENU, icon: "print", type: 'stationery' },
};

// Owner IDs mapped to their cafe
export const OWNER_IDS: { [key: string]: string } = {
  "OWNER001": "HR1",
  "OWNER002": "HR2",
  "OWNER003": "TL",
  "OWNER004": "JB",
  "OWNER005": "TK",
  "OWNER006": "ST",
};

export const BLOCKS = [
  "B1", "B2", "B3", "B4", "G1", "G2", "Main Library", "Admin Block"
];

export const DELIVERY_FEE = 50;
export const PICKUP_FEE = 0; // Self pickup is free

// Generate 4-digit PIN for orders
export const generateOrderPin = (): string => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};
