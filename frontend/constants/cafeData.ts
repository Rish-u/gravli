export interface MenuItem {
  id: string;
  name: string;
  price: number;
}

export interface CafeData {
  name: string;
  items: MenuItem[];
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

function generateMenuItems(cafeId: string, count: number = 15): MenuItem[] {
  const items: MenuItem[] = [];
  for (let i = 1; i <= count; i++) {
    items.push({
      id: `${cafeId.toLowerCase()}-${i}`,
      name: `Item ${i}`,
      price: 100 + (i * 5)
    });
  }
  return items;
}

export const CAFE_DATA: { [key: string]: CafeData } = {
  "HR1": { name: "Corner Cafe", items: CORNER_CAFE_MENU },
  "HR2": { name: "HR Cafe", items: generateMenuItems("HR2", 15) },
  "HR3": { name: "HR3", items: generateMenuItems("HR3", 15) },
  "HR4": { name: "HR4", items: generateMenuItems("HR4", 15) },
  "HR5": { name: "HR5", items: generateMenuItems("HR5", 15) },
  "HR6": { name: "HR6", items: generateMenuItems("HR6", 15) },
  "HR7": { name: "HR7", items: generateMenuItems("HR7", 15) },
  "HR8": { name: "HR8", items: generateMenuItems("HR8", 15) },
  "HR9": { name: "HR9", items: generateMenuItems("HR9", 15) },
  "HR10": { name: "HR10", items: generateMenuItems("HR10", 15) },
  "HR11": { name: "HR11", items: generateMenuItems("HR11", 15) },
  "HR12": { name: "HR12", items: generateMenuItems("HR12", 15) },
};

export const BLOCKS = [
  "B1", "B2", "B3", "B4", "G1", "G2", "Main Library", "Admin Block"
];

export const DELIVERY_FEE = 50;
