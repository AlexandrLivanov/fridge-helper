"use client";

import { useState, useCallback } from "react";
import {
  Plus,
  Trash2,
  CircleCheckBig,
  ShoppingCart,
  Circle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import type { ShoppingItem } from "@/lib/models";

interface ShoppingListManagerProps {
  initialItems: ShoppingItem[];
}

export function ShoppingListManager({
  initialItems,
}: ShoppingListManagerProps) {
  const [items, setItems] = useState<ShoppingItem[]>(initialItems);
  const [newName, setNewName] = useState("");
  const [newQuantity, setNewQuantity] = useState("");

  const fetchItems = useCallback(async () => {
    const res = await fetch("/api/shopping");
    if (res.ok) {
      const data = await res.json();
      setItems(data.items);
    }
  }, []);

  const unboughtItems = items.filter((i) => !i.isBought);
  const boughtItems = items.filter((i) => i.isBought);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const trimmedName = newName.trim();
    const trimmedQuantity = newQuantity.trim();

    if (!trimmedName || !trimmedQuantity) {
      toast.error("Заполните название и количество");
      return;
    }

    const res = await fetch("/api/shopping", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: trimmedName,
        quantity: trimmedQuantity,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      toast.error(data.error || "Ошибка при добавлении");
      return;
    }

    setNewName("");
    setNewQuantity("");
    toast.success("Добавлено в список покупок");
    await fetchItems();
  }

  async function handleMarkBought(id: string) {
    const res = await fetch(`/api/shopping?id=${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isBought: true }),
    });

    if (!res.ok) {
      toast.error("Ошибка при обновлении");
      return;
    }

    toast.success("Продукт перенесён в холодильник");
    await fetchItems();
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/shopping?id=${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      toast.error("Ошибка при удалении");
      return;
    }

    toast.success("Позиция удалена");
    await fetchItems();
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
        {unboughtItems.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between rounded-lg border bg-card px-4 py-3"
          >
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={() => handleMarkBought(item.id)}
                className="shrink-0"
                title="Отметить как купленное"
              >
                <Circle className="h-4 w-4 fill-primary/10 text-primary/30 hover:fill-primary/30 hover:text-primary/50 transition-colors" />
              </button>
              <div className="text-sm font-medium truncate">{item.name}</div>
            </div>
            <div className="flex items-center gap-2 shrink-0 ml-2">
              <span className="text-sm tabular-nums text-muted-foreground">
                {item.quantity}
              </span>
              <button
                type="button"
                onClick={() => handleDelete(item.id)}
                className="shrink-0 text-muted-foreground hover:text-destructive transition-colors"
                title="Удалить"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}

        {unboughtItems.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-10 text-muted-foreground">
            <ShoppingCart className="h-8 w-8 mb-2 opacity-40" />
            <p className="text-sm">Список покупок пуст</p>
            <p className="text-xs">Добавьте продукты выше</p>
          </div>
        )}
      </div>

      {boughtItems.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground font-medium">
            Купленные ({boughtItems.length})
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {boughtItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-lg border bg-card px-4 py-2.5 opacity-60"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <CircleCheckBig className="h-4 w-4 shrink-0 text-emerald-500" />
                  <div className="text-sm text-muted-foreground line-through truncate">
                    {item.name}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
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
