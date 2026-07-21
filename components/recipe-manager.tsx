"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Plus, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import type { DishCategoryWithDishes } from "@/lib/models";
import { DishCard } from "./dish-card";
import { AddDishDialog } from "./add-dish-dialog";

interface Props {
  initialCategories: DishCategoryWithDishes[];
}

export function RecipeManager({ initialCategories }: Props) {
  const [categories, setCategories] =
    useState<DishCategoryWithDishes[]>(initialCategories);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [newCatName, setNewCatName] = useState("");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );

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

  const openAddDialog = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setAddDialogOpen(true);
  };

  const refreshDishes = async () => {
    const res = await fetch("/api/categories");
    if (res.ok) {
      const data = await res.json();
      const dishesRes = await fetch("/api/dishes");
      if (dishesRes.ok) {
        const dishesData = await dishesRes.json();
        const updated = data.categories.map(
          (cat: { id: string; name: string; createdAt: string; updatedAt: string }) => ({
            ...cat,
            dishes: dishesData.dishes.filter(
              (d: { categoryId: string }) => d.categoryId === cat.id
            ),
          })
        );
        setCategories(updated);
      }
    }
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

      <div className="space-y-4">
        {categories.map((cat) => (
          <div key={cat.id} className="rounded-xl border bg-card">
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
                    openAddDialog(cat.id);
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
              <div className="border-t px-4 py-4">
                {cat.dishes.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-4">
                    Нет блюд. Нажмите «+», чтобы добавить.
                  </p>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {cat.dishes.map((dish) => (
                    <DishCard
                      key={dish.id}
                      dish={dish}
                      onDelete={(id) => deleteDish(cat.id, id)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {selectedCategoryId && (
        <AddDishDialog
          categoryId={selectedCategoryId}
          open={addDialogOpen}
          onOpenChange={setAddDialogOpen}
          onDishAdded={refreshDishes}
        />
      )}
    </div>
  );
}
