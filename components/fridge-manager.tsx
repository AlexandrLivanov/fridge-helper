"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Circle } from "lucide-react";
import type { Product } from "@/lib/models";

interface Props {
  initialProducts: Product[];
}

export function FridgeManager({ initialProducts }: Props) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [newName, setNewName] = useState("");
  const [newQuantity, setNewQuantity] = useState("");
  const [newCategory, setNewCategory] = useState("Прочее");

  const addProduct = async () => {
    if (!newName.trim() || !newQuantity.trim()) {
      toast.error("Введите название и количество");
      return;
    }

    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newName.trim(),
        quantity: newQuantity.trim(),
        category: newCategory,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      toast.error(data.error || "Ошибка при добавлении");
      return;
    }

    const data = await res.json();
    setProducts((prev) => [...prev, data.product]);
    setNewName("");
    setNewQuantity("");
    toast.success("Продукт добавлен");
  };

  const markFinished = async (id: string) => {
    const res = await fetch(`/api/products?id=${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isFinished: true }),
    });

    if (!res.ok) {
      toast.error("Ошибка");
      return;
    }

    setProducts((prev) => prev.filter((p) => p.id !== id));
    toast.success("Продукт закончился");
  };

  const deleteProduct = async (id: string) => {
    const res = await fetch(`/api/products?id=${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      toast.error("Ошибка");
      return;
    }

    setProducts((prev) => prev.filter((p) => p.id !== id));
    toast.success("Продукт удалён");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <input
          type="text"
          placeholder="Название продукта"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="flex-1 min-w-[140px] rounded-lg border border-input bg-background px-3 py-2 text-sm"
        />
        <input
          type="text"
          placeholder="Количество"
          value={newQuantity}
          onChange={(e) => setNewQuantity(e.target.value)}
          className="w-24 rounded-lg border border-input bg-background px-3 py-2 text-sm"
        />
        <select
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="Прочее">Прочее</option>
          <option value="Молочные">Молочные</option>
          <option value="Овощи">Овощи</option>
          <option value="Фрукты">Фрукты</option>
          <option value="Мясо">Мясо</option>
          <option value="Выпечка">Выпечка</option>
          <option value="Напитки">Напитки</option>
        </select>
        <button
          onClick={addProduct}
          className="inline-flex items-center gap-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Добавить
        </button>
      </div>

      {products.length === 0 && (
        <p className="text-sm text-muted-foreground py-4 text-center">
          Холодильник пуст. Добавьте продукты.
        </p>
      )}

      <div className="space-y-1">
        {products
          .filter((p) => !p.isFinished)
          .map((product) => (
            <div
              key={product.id}
              className="flex items-center justify-between rounded-lg border bg-card px-4 py-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <Circle className="h-2 w-2 shrink-0 fill-primary text-primary" />
                <div className="min-w-0">
                  <span className="text-sm font-medium">{product.name}</span>
                  <span className="ml-2 text-xs text-muted-foreground">
                    {product.quantity}
                  </span>
                  <span className="ml-2 text-xs text-muted-foreground">
                    {product.category}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => markFinished(product.id)}
                  className="rounded-md p-1.5 text-xs text-muted-foreground hover:bg-muted"
                  title="Закончился"
                >
                  <Circle className="h-4 w-4" />
                </button>
                <button
                  onClick={() => deleteProduct(product.id)}
                  className="rounded-md p-1.5 text-xs text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  title="Удалить"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
