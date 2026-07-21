"use client";

import { useState, useCallback } from "react";
import {
  Plus,
  Trash2,
  Circle,
  CircleCheckBig,
  Refrigerator,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import type { Product } from "@/lib/models";

interface FridgeManagerProps {
  initialProducts: Product[];
}

export function FridgeManager({ initialProducts }: FridgeManagerProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [newName, setNewName] = useState("");
  const [newQuantity, setNewQuantity] = useState("");

  const fetchProducts = useCallback(async () => {
    const res = await fetch("/api/products");
    if (res.ok) {
      const data = await res.json();
      setProducts(data.products);
    }
  }, []);

  const activeProducts = products.filter((p) => !p.isFinished);
  const finishedProducts = products.filter((p) => p.isFinished);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const trimmedName = newName.trim();
    const trimmedQuantity = newQuantity.trim();

    if (!trimmedName || !trimmedQuantity) {
      toast.error("Заполните название и количество");
      return;
    }

    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: trimmedName, quantity: trimmedQuantity }),
    });

    if (!res.ok) {
      const data = await res.json();
      toast.error(data.error || "Ошибка при добавлении");
      return;
    }

    setNewName("");
    setNewQuantity("");
    toast.success("Продукт добавлен");
    await fetchProducts();
  }

  async function handleFinish(id: string) {
    const res = await fetch(`/api/products?id=${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isFinished: true }),
    });

    if (!res.ok) {
      toast.error("Ошибка при обновлении");
      return;
    }

    toast.success("Продукт закончился");
    await fetchProducts();
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/products?id=${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      toast.error("Ошибка при удалении");
      return;
    }

    toast.success("Продукт удалён");
    await fetchProducts();
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleAdd} className="flex gap-2">
        <Input
          placeholder="Название продукта"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="flex-1"
        />
        <Input
          placeholder="Количество"
          value={newQuantity}
          onChange={(e) => setNewQuantity(e.target.value)}
          className="w-28"
        />
        <Button type="submit" size="icon" className="shrink-0">
          <Plus className="h-4 w-4" />
        </Button>
      </form>

      <div className="grid gap-3 sm:grid-cols-2">
        {activeProducts.map((product) => (
          <div
            key={product.id}
            className="flex items-center justify-between rounded-lg border bg-card px-4 py-3"
          >
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={() => handleFinish(product.id)}
                className="shrink-0"
                title="Отметить как закончившийся"
              >
                <Circle className="h-4 w-4 fill-primary/10 text-primary/30 hover:fill-primary/30 hover:text-primary/50 transition-colors" />
              </button>
              <div className="min-w-0">
                <div className="text-sm font-medium truncate">
                  {product.name}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {product.category}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 ml-2">
              <span className="text-sm tabular-nums text-muted-foreground">
                {product.quantity}
              </span>
              <button
                type="button"
                onClick={() => handleDelete(product.id)}
                className="shrink-0 text-muted-foreground hover:text-destructive transition-colors"
                title="Удалить продукт"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}

        {activeProducts.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-10 text-muted-foreground">
            <Refrigerator className="h-8 w-8 mb-2 opacity-40" />
            <p className="text-sm">Холодильник пуст</p>
            <p className="text-xs">Добавьте продукты выше</p>
          </div>
        )}
      </div>

      {finishedProducts.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground font-medium">
            Закончились ({finishedProducts.length})
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {finishedProducts.map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between rounded-lg border bg-card px-4 py-2.5 opacity-60"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <CircleCheckBig className="h-4 w-4 shrink-0 text-muted-foreground/50" />
                  <div className="min-w-0">
                    <div className="text-sm text-muted-foreground line-through truncate">
                      {product.name}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(product.id)}
                  className="shrink-0 text-muted-foreground/50 hover:text-destructive transition-colors ml-2"
                  title="Удалить"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
