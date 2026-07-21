"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Plus,
  Trash2,
  Pencil,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import type { DishCategoryWithDishes, Ingredient } from "@/lib/models";

interface Props {
  initialCategories: DishCategoryWithDishes[];
}

export function RecipeManager({ initialCategories }: Props) {
  const [categories, setCategories] =
    useState<DishCategoryWithDishes[]>(initialCategories);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [newCatName, setNewCatName] = useState("");

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const addCategory = async () => {
    if (!newCatName.trim()) {
      toast.error("Введите название категории");
      return;
    }

    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newCatName.trim() }),
    });

    if (!res.ok) {
      toast.error("Ошибка");
      return;
    }

    const data = await res.json();
    setCategories((prev) => [...prev, { ...data.category, dishes: [] }]);
    setNewCatName("");
    toast.success("Категория создана");
  };

  const deleteCategory = async (id: string) => {
    const res = await fetch(`/api/categories?id=${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      toast.error("Ошибка");
      return;
    }

    setCategories((prev) => prev.filter((c) => c.id !== id));
    toast.success("Категория удалена");
  };

  const addDish = async (categoryId: string) => {
    const name = prompt("Название блюда:");
    if (!name?.trim()) return;

    const ingredientsStr = prompt(
      "Ингредиенты (через запятую, например: Яйца 3 шт, Молоко 50 мл):"
    );
    if (!ingredientsStr?.trim()) return;

    const ingredients: Ingredient[] = ingredientsStr
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => {
        const match = s.match(/^(.+?)\s+(\d+\s*\S*)$/);
        if (match) {
          return { name: match[1].trim(), quantity: match[2].trim() };
        }
        return { name: s, quantity: "" };
      });

    const res = await fetch("/api/dishes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        categoryId,
        ingredients,
      }),
    });

    if (!res.ok) {
      toast.error("Ошибка");
      return;
    }

    const data = await res.json();
    setCategories((prev) =>
      prev.map((c) =>
        c.id === categoryId
          ? { ...c, dishes: [...c.dishes, data.dish] }
          : c
      )
    );
    toast.success("Блюдо добавлено");
  };

  const deleteDish = async (categoryId: string, dishId: string) => {
    const res = await fetch(`/api/dishes?id=${dishId}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      toast.error("Ошибка");
      return;
    }

    setCategories((prev) =>
      prev.map((c) =>
        c.id === categoryId
          ? { ...c, dishes: c.dishes.filter((d) => d.id !== dishId) }
          : c
      )
    );
    toast.success("Блюдо удалено");
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Новая категория"
          value={newCatName}
          onChange={(e) => setNewCatName(e.target.value)}
          className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm"
        />
        <button
          onClick={addCategory}
          className="inline-flex items-center gap-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Категорию
        </button>
      </div>

      {categories.length === 0 && (
        <p className="text-sm text-muted-foreground py-4 text-center">
          Нет категорий. Создайте первую.
        </p>
      )}

      <div className="space-y-2">
        {categories.map((cat) => (
          <div key={cat.id} className="rounded-lg border bg-card">
            <div
              className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-muted/50"
              onClick={() => toggleExpand(cat.id)}
            >
              <div className="flex items-center gap-2">
                {expanded.has(cat.id) ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="text-sm font-medium">{cat.name}</span>
                <span className="text-xs text-muted-foreground">
                  {cat.dishes.length} блюд
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    addDish(cat.id);
                  }}
                  className="rounded-md p-1.5 text-xs text-muted-foreground hover:bg-muted"
                  title="Добавить блюдо"
                >
                  <Plus className="h-4 w-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteCategory(cat.id);
                  }}
                  className="rounded-md p-1.5 text-xs text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  title="Удалить категорию"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {expanded.has(cat.id) && (
              <div className="border-t px-4 py-2 space-y-1">
                {cat.dishes.length === 0 && (
                  <p className="text-xs text-muted-foreground py-2">
                    Нет блюд. Добавьте первое.
                  </p>
                )}
                {cat.dishes.map((dish) => (
                  <div
                    key={dish.id}
                    className="flex items-center justify-between rounded-md px-3 py-2 hover:bg-muted/50"
                  >
                    <div className="min-w-0">
                      <span className="text-sm">{dish.name}</span>
                      <span className="ml-2 text-xs text-muted-foreground">
                        {dish.ingredients
                          .map((i) => `${i.name} ${i.quantity}`)
                          .join(", ")}
                      </span>
                    </div>
                    <button
                      onClick={() => deleteDish(cat.id, dish.id)}
                      className="rounded-md p-1 text-xs text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
