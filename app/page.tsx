import { isDatabaseAvailable } from "@/lib/db";
import {
  getAllProducts,
  getAllShoppingItems,
  getAllCategories,
  getAllDishes,
  computeSuggestions,
} from "@/lib/models";
import {
  mockProducts,
  mockShoppingItems,
  getMockCategoriesWithDishes,
  mockCategories,
  mockDishes,
} from "@/lib/mock-data";
import { FridgeManager } from "@/components/fridge-manager";
import { ShoppingListManager } from "@/components/shopping-list-manager";
import { RecipeManager } from "@/components/recipe-manager";
import { RecipeSuggestions } from "@/components/recipe-suggestions";
import {
  ShoppingCart,
  UtensilsCrossed,
  ChefHat,
  Refrigerator,
} from "lucide-react";

export default async function HomePage() {
  const dbAvailable = await isDatabaseAvailable();
  const products = dbAvailable ? await getAllProducts() : mockProducts;
  const shoppingItems = dbAvailable
    ? await getAllShoppingItems()
    : mockShoppingItems;
  const categoriesWithDishes = dbAvailable
    ? await (async () => {
        const cats = await getAllCategories();
        const dishes = await getAllDishes();
        return cats.map((cat) => ({
          ...cat,
          dishes: dishes.filter((d) => d.categoryId === cat.id),
        }));
      })()
    : getMockCategoriesWithDishes();

  const productsForSuggestions = dbAvailable
    ? await getAllProducts()
    : mockProducts;
  const dishesForSuggestions = dbAvailable ? await getAllDishes() : mockDishes;
  const catsForSuggestions = dbAvailable
    ? await getAllCategories()
    : mockCategories;
  const suggestions = computeSuggestions(
    productsForSuggestions,
    dishesForSuggestions,
    catsForSuggestions
  );
  const readyCount = suggestions.filter((s) => s.status === "ready").length;
  const missingCount = suggestions.length - readyCount;

  const totalCatDishes = categoriesWithDishes.reduce(
    (s, c) => s + c.dishes.length,
    0
  );

  const featureCards = [
    {
      icon: Refrigerator,
      title: "Холодильник",
      description: "Управляйте продуктами",
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      icon: ShoppingCart,
      title: "Список покупок",
      description: `${shoppingItems.filter((i) => !i.isBought).length} позиций`,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      icon: UtensilsCrossed,
      title: "Мои блюда",
      description: `${categoriesWithDishes.length} категорий, ${totalCatDishes} блюд`,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      icon: ChefHat,
      title: "Что приготовить?",
      description:
        suggestions.length > 0
          ? `${readyCount} готово, ${missingCount} с добавлением`
          : "Нет идей",
      color: "text-rose-600",
      bg: "bg-rose-50",
    },
  ];

  return (
    <div className="space-y-10 pb-16">
      <section className="gradient-hero-vibrant px-4 py-16 text-center">
        <div className="mx-auto max-w-2xl space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-white/70 shadow-sm">
            <Refrigerator className="size-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Холодильник
          </h1>
          <p className="text-lg text-muted-foreground">
            Следите за продуктами, планируйте покупки и готовьте любимые блюда
          </p>
        </div>
      </section>

      <section className="container mx-auto grid gap-4 px-4 sm:grid-cols-2 lg:grid-cols-4">
        {featureCards.map((card) => (
          <div
            key={card.title}
            className="card-hover flex items-center gap-4 rounded-xl border bg-card p-4"
          >
            <div
              className={`flex size-10 items-center justify-center rounded-lg ${card.bg}`}
            >
              <card.icon className={`size-5 ${card.color}`} />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium">{card.title}</div>
              <div className="text-xs text-muted-foreground">
                {card.description}
              </div>
            </div>
          </div>
        ))}
      </section>

      <section className="container mx-auto space-y-6 px-4">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-blue-50">
            <Refrigerator className="size-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Холодильник</h2>
            <p className="text-xs text-muted-foreground">
              Продукты, которые есть в наличии
            </p>
          </div>
        </div>
        <FridgeManager initialProducts={products} />
      </section>

      <section className="container mx-auto space-y-6 px-4">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-50">
            <ShoppingCart className="size-5 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Список покупок</h2>
            <p className="text-xs text-muted-foreground">Что нужно купить</p>
          </div>
        </div>
        <ShoppingListManager initialItems={shoppingItems} />
      </section>

      <section className="container mx-auto space-y-6 px-4">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-amber-50">
            <UtensilsCrossed className="size-5 text-amber-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Мои блюда и категории</h2>
            <p className="text-xs text-muted-foreground">
              Любимые рецепты по категориям
            </p>
          </div>
        </div>
        <RecipeManager initialCategories={categoriesWithDishes} />
      </section>

      <section className="container mx-auto space-y-6 px-4">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-rose-50">
            <ChefHat className="size-5 text-rose-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Что приготовить?</h2>
            <p className="text-xs text-muted-foreground">
              Подборка блюд по продуктам в холодильнике
            </p>
          </div>
        </div>
        <RecipeSuggestions initialSuggestions={suggestions} />
      </section>
    </div>
  );
}
