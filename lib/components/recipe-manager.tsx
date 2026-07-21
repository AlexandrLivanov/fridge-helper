"use client";

import { useState, useCallback } from "react";
import {
  Plus,
  Trash2,
  Pencil,
  UtensilsCrossed,
  PlusCircle,
  X,
  FolderPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import type { DishCategoryWithDishes, Dish, Ingredient } from "@/lib/models";

interface RecipeManagerProps {
  initialCategories: DishCategoryWithDishes[];
}

export function RecipeManager({ initialCategories }: RecipeManagerProps) {
  const [categories, setCategories] =
    useState<DishCategoryWithDishes[]>(initialCategories);
  const [newCategoryName, setNewCategoryName] = useState("");

  const [editingCategory, setEditingCategory] =
    useState<DishCategoryWithDishes | null>(null);
  const [editCategoryName, setEditCategoryName] = useState("");

  const [dishDialogOpen, setDishDialogOpen] = useState(false);
  const [editingDish, setEditingDish] = useState<Dish | null>(null);
  const [dishCategoryId, setDishCategoryId] = useState("");
  const [dishName, setDishName] = useState("");
  const [dishIngredients, setDishIngredients] = useState<Ingredient[]>([
    { name: "", quantity: "" },
  ]);

  const fetchCategories = useCallback(async () => {
    const res = await fetch("/api/categories");
    if (res.ok) {
      const data = await res.json();
      setCategories(data.categories);
    }
  }, []);

  async function handleAddCategory(e: React.FormEvent) {
    e.preventDefault();
    const name = newCategoryName.trim();
    if (!name) {
      toast.error("Введите название категории");
      return;
    }

    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    if (!res.ok) {
      const data = await res.json();
      toast.error(data.error || "Ошибка при создании категории");
      return;
    }

    setNewCategoryName("");
    toast.success("Категория создана");
    await fetchCategories();
  }

  function openEditCategory(cat: DishCategoryWithDishes) {
    setEditingCategory(cat);
    setEditCategoryName(cat.name);
  }

  async function handleSaveCategory() {
    if (!editingCategory) return;

    const name = editCategoryName.trim();
    if (!name) {
      toast.error("Введите название категории");
      return;
    }

    const res = await fetch(`/api/categories?id=${editingCategory.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    if (!res.ok) {
      toast.error("Ошибка при сохранении");
      return;
    }

    setEditingCategory(null);
    toast.success("Категория сохранена");
    await fetchCategories();
  }

  async function handleDeleteCategory(id: string) {
    const res = await fetch(`/api/categories?id=${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      toast.error("Ошибка при удалении категории");
      return;
    }

    toast.success("Категория удалена");
    await fetchCategories();
  }

  function openAddDish(categoryId: string) {
    setEditingDish(null);
    setDishCategoryId(categoryId);
    setDishName("");
    setDishIngredients([{ name: "", quantity: "" }]);
    setDishDialogOpen(true);
  }

  function openEditDish(dish: Dish) {
    setEditingDish(dish);
    setDishCategoryId(dish.categoryId);
    setDishName(dish.name);
    setDishIngredients(
      dish.ingredients.length > 0
        ? dish.ingredients
        : [{ name: "", quantity: "" }]
    );
    setDishDialogOpen(true);
  }

  function addIngredientRow() {
    setDishIngredients([...dishIngredients, { name: "", quantity: "" }]);
  }

  function removeIngredientRow(index: number) {
    setDishIngredients(dishIngredients.filter((_, i) => i !== index));
  }

  function updateIngredient(
    index: number,
    field: keyof Ingredient,
    value: string
  ) {
    const updated = [...dishIngredients];
    updated[index] = { ...updated[index], [field]: value };
    setDishIngredients(updated);
  }

  async function handleSaveDish() {
    const name = dishName.trim();
    if (!name) {
      toast.error("Введите название блюда");
      return;
    }

    const ingredients = dishIngredients.filter(
      (i) => i.name.trim() && i.quantity.trim()
    );

    if (editingDish) {
      const res = await fetch(`/api/dishes?id=${editingDish.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, ingredients }),
      });

      if (!res.ok) {
        toast.error("Ошибка при сохранении блюда");
        return;
      }

      toast.success("Блюдо сохранено");
    } else {
      const res = await fetch("/api/dishes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryId: dishCategoryId, name, ingredients }),
      });

      if (!res.ok) {
        toast.error("Ошибка при добавлении блюда");
        return;
      }

      toast.success("Блюдо добавлено");
    }

    setDishDialogOpen(false);
    await fetchCategories();
  }

  async function handleDeleteDish(id: string) {
    const res = await fetch(`/api/dishes?id=${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      toast.error("Ошибка при удалении блюда");
      return;
    }

    toast.success("Блюдо удалено");
    await fetchCategories();
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleAddCategory} className="flex gap-2">
        <Input
          placeholder="Новая категория"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" size="icon" className="shrink-0">
          <FolderPlus className="h-4 w-4" />
        </Button>
      </form>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <div key={category.id} className="rounded-lg border bg-card p-4">
            <div className="mb-3 flex items-center justify-between">
              {editingCategory?.id === category.id ? (
                <div className="flex flex-1 gap-2">
                  <Input
                    value={editCategoryName}
                    onChange={(e) => setEditCategoryName(e.target.value)}
                    className="h-8 text-sm"
                    autoFocus
                  />
                  <Button
                    size="sm"
                    variant="default"
                    onClick={handleSaveCategory}
                    className="h-8 shrink-0"
                  >
                    OK
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setEditingCategory(null)}
                    className="h-8 shrink-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <>
                  <h3 className="text-sm font-semibold">{category.name}</h3>
                  <div className="flex gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => openEditCategory(category)}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                      title="Редактировать категорию"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteCategory(category.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                      title="Удалить категорию"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </>
              )}
            </div>

            <div className="space-y-2">
              {category.dishes.map((dish) => (
                <div
                  key={dish.id}
                  className="rounded-md border bg-muted/30 px-3 py-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{dish.name}</span>
                    <div className="flex gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => openEditDish(dish)}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                        title="Редактировать блюдо"
                      >
                        <Pencil className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteDish(dish.id)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                        title="Удалить блюдо"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                  {dish.ingredients.length > 0 && (
                    <div className="mt-1 text-xs text-muted-foreground">
                      {dish.ingredients.map((ing, i) => (
                        <span key={i}>
                          {i > 0 && ", "}
                          {ing.name} ({ing.quantity})
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              <button
                type="button"
                onClick={() => openAddDish(category.id)}
                className="flex w-full items-center justify-center gap-1 rounded-md border border-dashed px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:border-solid transition-colors"
              >
                <PlusCircle className="h-3 w-3" />
                Добавить блюдо
              </button>

              {category.dishes.length === 0 && (
                <div className="flex flex-col items-center justify-center py-4 text-muted-foreground">
                  <UtensilsCrossed className="mb-1 h-6 w-6 opacity-40" />
                  <p className="text-xs">Нет блюд</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {categories.length === 0 && (
        <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
          <UtensilsCrossed className="mb-2 h-8 w-8 opacity-40" />
          <p className="text-sm">Нет категорий</p>
          <p className="text-xs">Создайте первую категорию</p>
        </div>
      )}

      <Dialog open={dishDialogOpen} onOpenChange={setDishDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingDish ? "Редактировать блюдо" : "Добавить блюдо"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">
                Название блюда
              </label>
              <Input
                placeholder="Название"
                value={dishName}
                onChange={(e) => setDishName(e.target.value)}
              />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-sm font-medium">Продукты</label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addIngredientRow}
                >
                  <Plus className="mr-1 h-3 w-3" />
                  Добавить
                </Button>
              </div>
              <div className="space-y-2">
                {dishIngredients.map((ing, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder="Название"
                      value={ing.name}
                      onChange={(e) =>
                        updateIngredient(index, "name", e.target.value)
                      }
                      className="flex-1"
                    />
                    <Input
                      placeholder="Количество"
                      value={ing.quantity}
                      onChange={(e) =>
                        updateIngredient(index, "quantity", e.target.value)
                      }
                      className="w-24"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeIngredientRow(index)}
                      disabled={dishIngredients.length === 1}
                      className="shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDishDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleSaveDish}>
              {editingDish ? "Сохранить" : "Добавить"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
