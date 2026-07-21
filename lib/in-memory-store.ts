// Используется всеми API-роутами

import { mockProducts, mockShoppingItems, mockCategories, mockDishes } from "./mock-data";
import type { Product, ShoppingItem, DishCategory, Dish } from "./models";

// Продукты в холодильнике
export let inMemoryProducts: Product[] = [...mockProducts];
let nextProductId = 100;

// Список покупок
export let inMemoryShoppingItems: ShoppingItem[] = [...mockShoppingItems];
let nextShoppingId = 100;

// Категории
export let inMemoryCategories: DishCategory[] = [...mockCategories];
let nextCategoryId = 100;

// Блюда
export let inMemoryDishes: Dish[] = [...mockDishes];
let nextDishId = 100;

// Продукты
export function addProduct(data: { name: string; quantity: string; category: string; isFinished: boolean }): Product {
  const now = new Date().toISOString();
  const product: Product = {
    id: `mem-prod-${nextProductId++}`,
    ...data,
    createdAt: now,
    updatedAt: now,
  };
  inMemoryProducts.push(product);
  return product;
}

export function removeProduct(id: string): void {
  inMemoryProducts = inMemoryProducts.filter((p) => p.id !== id);
}

export function findProductByName(name: string): Product | undefined {
  return inMemoryProducts.find(
    (p) => p.name.toLowerCase() === name.toLowerCase() && !p.isFinished
  );
}

// Список покупок
export function addShoppingItem(data: { name: string; quantity: string; isBought: boolean }): ShoppingItem {
  const now = new Date().toISOString();
  const item: ShoppingItem = {
    id: `mem-shop-${nextShoppingId++}`,
    ...data,
    createdAt: now,
    updatedAt: now,
  };
  inMemoryShoppingItems.push(item);
  return item;
}

export function removeShoppingItem(id: string): void {
  inMemoryShoppingItems = inMemoryShoppingItems.filter((i) => i.id !== id);
}

export function buyShoppingItem(id: string): ShoppingItem | null {
  const index = inMemoryShoppingItems.findIndex((i) => i.id === id);
  if (index === -1) return null;
  
  const item = inMemoryShoppingItems[index];
  
  // Добавляем в холодильник, если ещё нет
  const existing = findProductByName(item.name);
  if (!existing) {
    addProduct({
      name: item.name,
      quantity: item.quantity,
      category: "Прочее",
      isFinished: false,
    });
  }
  
  // Удаляем из списка покупок
  inMemoryShoppingItems.splice(index, 1);
  return item;
}

// Категории
export function addCategory(name: string): DishCategory {
  const now = new Date().toISOString();
  const category: DishCategory = {
    id: `mem-cat-${nextCategoryId++}`,
    name,
    createdAt: now,
    updatedAt: now,
  };
  inMemoryCategories.push(category);
  return category;
}

export function removeCategory(id: string): void {
  inMemoryCategories = inMemoryCategories.filter((c) => c.id !== id);
  // Удаляем все блюда этой категории
  inMemoryDishes = inMemoryDishes.filter((d) => d.categoryId !== id);
}

// Блюда
export function addDish(data: { name: string; categoryId: string; ingredients: { name: string; quantity: string }[]; photoUrl?: string }): Dish {
  const now = new Date().toISOString();
  const dish: Dish = {
    id: `mem-dish-${nextDishId++}`,
    ...data,
    createdAt: now,
    updatedAt: now,
  };
  inMemoryDishes.push(dish);
  return dish;
}

export function removeDish(id: string): void {
  inMemoryDishes = inMemoryDishes.filter((d) => d.id !== id);
}
