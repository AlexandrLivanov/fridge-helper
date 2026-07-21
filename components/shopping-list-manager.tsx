"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Check } from "lucide-react";
import type { ShoppingItem } from "@/lib/models";

interface Props {
  initialItems: ShoppingItem[];
}

export function ShoppingListManager({ initialItems }: Props) {
  const [items, setItems] = useState<ShoppingItem[]>(initialItems);
  const [newName, setNewName] = useState("");
  const [newQuantity, setNewQuantity] = useState("");

  const addItem = async () => {
    if (!newName.trim() || !newQuantity.trim()) {
      toast.error("Введите название и количество");
      return;
    }

    const res = await fetch("/api/shopping", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newName.trim(),
        quantity: newQuantity.trim(),
      }),
    });

    if (!res.ok) {
      toast.error("Ошибка при добавлении");
      return;
    }

    const data = await res.json();
    setItems((prev) => [...prev, data.item]);
    setNewName("");
    setNewQuantity("");
    toast.success("Добавлено в список покупок");
  };

  const markBought = async (id: string) => {
    const res = await fetch(`/api/shopping?id=${id}&isBought=true`, {
      method: "PATCH",
    });

    if (!res.ok) {
      toast.error("Ошибка");
      return;
    }

    setItems((prev) => prev.filter((i) => i.id !== id));
    toast.success("Продукт куплен");
  };

  const deleteItem = async (id: string) => {
    const res = await fetch(`/api/shopping?id=${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      toast.error("Ошибка");
      return;
    }

    setItems((prev) => prev.filter((i) => i.id !== id));
    toast.success("Удалено из списка");
  };

  const activeItems = items.filter((i) => !i.isBought);

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
        <button
          onClick={addItem}
          className="inline-flex items-center gap-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Добавить
        </button>
      </div>

      {activeItems.length === 0 && (
        <p className="text-sm text-muted-foreground py-4 text-center">
          Список покупок пуст.
        </p>
      )}

      <div className="space-y-1">
        {activeItems.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between rounded-lg border bg-card px-4 py-3"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-sm font-medium">{item.name}</span>
              <span className="text-xs text-muted-foreground">
                {item.quantity}
              </span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => markBought(item.id)}
                className="rounded-md p-1.5 text-xs text-muted-foreground hover:bg-emerald-50 hover:text-emerald-600"
                title="Куплено"
              >
                <Check className="h-4 w-4" />
              </button>
              <button
                onClick={() => deleteItem(item.id)}
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
