// Мок-данные для статического режима (без БД)
// Используются когда USE_DATABASE=false или БД недоступна

import {
  Service,
  Product,
  ShoppingItem,
  DishCategory,
  Dish,
  DishCategoryWithDishes,
} from "./models";

export const mockServices: Service[] = [
  {
    id: "mock-service-1",
    name: "API Gateway",
    description: "Шлюз для микросервисной архитектуры",
    status: "active",
    url: "https://api.example.com",
    createdAt: new Date("2024-01-15").toISOString(),
    updatedAt: new Date("2024-01-15").toISOString(),
  },
  {
    id: "mock-service-2",
    name: "Auth Service",
    description: "Сервис аутентификации и авторизации",
    status: "active",
    url: "https://auth.example.com",
    createdAt: new Date("2024-02-01").toISOString(),
    updatedAt: new Date("2024-02-01").toISOString(),
  },
  {
    id: "mock-service-3",
    name: "ML Pipeline",
    description: "Пайплайн для обработки данных с AI",
    status: "deploying",
    url: undefined,
    createdAt: new Date("2024-03-10").toISOString(),
    updatedAt: new Date("2024-03-10").toISOString(),
  },
];

export const mockProducts: Product[] = [
  {
    id: "mock-prod-1",
    name: "Яйца",
    quantity: "6 шт",
    category: "Молочные",
    isFinished: false,
    createdAt: new Date("2025-01-01").toISOString(),
    updatedAt: new Date("2025-01-01").toISOString(),
  },
  {
    id: "mock-prod-2",
    name: "Молоко",
    quantity: "1 л",
    category: "Молочные",
    isFinished: false,
    createdAt: new Date("2025-01-01").toISOString(),
    updatedAt: new Date("2025-01-01").toISOString(),
  },
  {
    id: "mock-prod-3",
    name: "Хлеб",
    quantity: "½ булки",
    category: "Выпечка",
    isFinished: false,
    createdAt: new Date("2025-01-01").toISOString(),
    updatedAt: new Date("2025-01-01").toISOString(),
  },
  {
    id: "mock-prod-4",
    name: "Огурцы",
    quantity: "3 шт",
    category: "Овощи",
    isFinished: false,
    createdAt: new Date("2025-01-01").toISOString(),
    updatedAt: new Date("2025-01-01").toISOString(),
  },
];

export function getMockCategoriesWithDishes(): DishCategoryWithDishes[] {
  return mockCategories.map((cat) => ({
    ...cat,
    dishes: mockDishes.filter((d) => d.categoryId === cat.id),
  }));
}

export const mockShoppingItems: ShoppingItem[] = [
  {
    id: "mock-shop-1",
    name: "Молоко",
    quantity: "1 л",
    isBought: false,
    createdAt: new Date("2025-01-01").toISOString(),
    updatedAt: new Date("2025-01-01").toISOString(),
  },
  {
    id: "mock-shop-2",
    name: "Сыр",
    quantity: "200 г",
    isBought: false,
    createdAt: new Date("2025-01-01").toISOString(),
    updatedAt: new Date("2025-01-01").toISOString(),
  },
  {
    id: "mock-shop-3",
    name: "Помидоры",
    quantity: "3 шт",
    isBought: true,
    createdAt: new Date("2025-01-01").toISOString(),
    updatedAt: new Date("2025-01-01").toISOString(),
  },
  {
    id: "mock-shop-4",
    name: "Сметана",
    quantity: "200 г",
    isBought: false,
    createdAt: new Date("2025-01-01").toISOString(),
    updatedAt: new Date("2025-01-01").toISOString(),
  },
  {
    id: "mock-shop-5",
    name: "Картофель",
    quantity: "1 кг",
    isBought: false,
    createdAt: new Date("2025-01-01").toISOString(),
    updatedAt: new Date("2025-01-01").toISOString(),
  },
];

export const mockCategories: DishCategory[] = [
  {
    id: "mock-cat-1",
    name: "Завтраки",
    createdAt: new Date("2025-01-01").toISOString(),
    updatedAt: new Date("2025-01-01").toISOString(),
  },
  {
    id: "mock-cat-2",
    name: "Супы",
    createdAt: new Date("2025-01-01").toISOString(),
    updatedAt: new Date("2025-01-01").toISOString(),
  },
  {
    id: "mock-cat-3",
    name: "Салаты",
    createdAt: new Date("2025-01-01").toISOString(),
    updatedAt: new Date("2025-01-01").toISOString(),
  },
];

export const mockDishes: Dish[] = [
  {
    id: "mock-dish-1",
    categoryId: "mock-cat-1",
    name: "Омлет",
    ingredients: [
      { name: "Яйца", quantity: "3 шт" },
      { name: "Молоко", quantity: "50 мл" },
    ],
    createdAt: new Date("2025-01-01").toISOString(),
    updatedAt: new Date("2025-01-01").toISOString(),
  },
  {
    id: "mock-dish-2",
    categoryId: "mock-cat-1",
    name: "Гренки",
    ingredients: [
      { name: "Хлеб", quantity: "3 ломтика" },
      { name: "Яйца", quantity: "2 шт" },
      { name: "Молоко", quantity: "30 мл" },
    ],
    createdAt: new Date("2025-01-01").toISOString(),
    updatedAt: new Date("2025-01-01").toISOString(),
  },
  {
    id: "mock-dish-3",
    categoryId: "mock-cat-2",
    name: "Куриный суп",
    ingredients: [
      { name: "Куриное филе", quantity: "300 г" },
      { name: "Картофель", quantity: "3 шт" },
      { name: "Морковь", quantity: "1 шт" },
      { name: "Лук", quantity: "1 шт" },
    ],
    createdAt: new Date("2025-01-01").toISOString(),
    updatedAt: new Date("2025-01-01").toISOString(),
  },
  {
    id: "mock-dish-4",
    categoryId: "mock-cat-3",
    name: "Огуречный салат",
    ingredients: [
      { name: "Огурцы", quantity: "2 шт" },
      { name: "Сметана", quantity: "2 ст. л." },
    ],
    createdAt: new Date("2025-01-01").toISOString(),
    updatedAt: new Date("2025-01-01").toISOString(),
  },
];
