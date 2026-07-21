export interface Product {
  id: string;
  name: string;
  quantity: string;
  category: string;
  isFinished: boolean;
}

export interface ShoppingItem {
  id: string;
  name: string;
  quantity: string;
  isBought: boolean;
}

export interface Ingredient {
  name: string;
  quantity: string;
}

export interface Dish {
  id: string;
  name: string;
  ingredients: Ingredient[];
}

export interface DishCategory {
  id: string;
  name: string;
  dishes: Dish[];
}

export interface Suggestion {
  id: string;
  dishName: string;
  status: "ready" | "missing_1" | "missing_2";
  missingProducts: string[];
}

export const fridgeProducts: Product[] = [
  {
    id: "p1",
    name: "Яйца",
    quantity: "6 шт",
    category: "Молочные",
    isFinished: false,
  },
  {
    id: "p2",
    name: "Молоко",
    quantity: "1 л",
    category: "Молочные",
    isFinished: false,
  },
  {
    id: "p3",
    name: "Куриное филе",
    quantity: "400 г",
    category: "Мясо",
    isFinished: false,
  },
  {
    id: "p4",
    name: "Огурцы",
    quantity: "3 шт",
    category: "Овощи",
    isFinished: false,
  },
  {
    id: "p5",
    name: "Сыр",
    quantity: "200 г",
    category: "Молочные",
    isFinished: true,
  },
  {
    id: "p6",
    name: "Хлеб",
    quantity: "½ булки",
    category: "Выпечка",
    isFinished: false,
  },
];

export const shoppingList: ShoppingItem[] = [
  { id: "s1", name: "Молоко", quantity: "1 л", isBought: false },
  { id: "s2", name: "Сыр", quantity: "200 г", isBought: false },
  { id: "s3", name: "Помидоры", quantity: "3 шт", isBought: true },
  { id: "s4", name: "Сметана", quantity: "200 г", isBought: false },
  { id: "s5", name: "Картофель", quantity: "1 кг", isBought: false },
];

export const dishCategories: DishCategory[] = [
  {
    id: "dc1",
    name: "Завтраки",
    dishes: [
      {
        id: "d1",
        name: "Омлет",
        ingredients: [
          { name: "Яйца", quantity: "3 шт" },
          { name: "Молоко", quantity: "50 мл" },
        ],
      },
      {
        id: "d2",
        name: "Гренки",
        ingredients: [
          { name: "Хлеб", quantity: "3 ломтика" },
          { name: "Яйца", quantity: "2 шт" },
          { name: "Молоко", quantity: "30 мл" },
        ],
      },
    ],
  },
  {
    id: "dc2",
    name: "Супы",
    dishes: [
      {
        id: "d3",
        name: "Куриный суп",
        ingredients: [
          { name: "Куриное филе", quantity: "300 г" },
          { name: "Картофель", quantity: "3 шт" },
          { name: "Морковь", quantity: "1 шт" },
          { name: "Лук", quantity: "1 шт" },
        ],
      },
    ],
  },
  {
    id: "dc3",
    name: "Салаты",
    dishes: [
      {
        id: "d4",
        name: "Огуречный салат",
        ingredients: [
          { name: "Огурцы", quantity: "2 шт" },
          { name: "Сметана", quantity: "2 ст. л." },
        ],
      },
    ],
  },
];

export const suggestions: Suggestion[] = [
  { id: "sg1", dishName: "Омлет", status: "ready", missingProducts: [] },
  {
    id: "sg2",
    dishName: "Гренки",
    status: "missing_1",
    missingProducts: ["Молоко"],
  },
  {
    id: "sg3",
    dishName: "Огуречный салат",
    status: "missing_2",
    missingProducts: ["Сметана"],
  },
  {
    id: "sg4",
    dishName: "Куриный суп",
    status: "missing_2",
    missingProducts: ["Картофель", "Морковь", "Лук"],
  },
];
