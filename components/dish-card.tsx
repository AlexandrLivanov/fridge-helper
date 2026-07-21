"use client";

import { Trash2, Pencil, Utensils } from "lucide-react";
import type { Dish } from "@/lib/models";

interface Props {
  dish: Dish;
  onDelete: (id: string) => void;
}

export function DishCard({ dish, onDelete }: Props) {
  return (
    <div className="group relative rounded-xl border bg-card p-4 transition-all hover:shadow-md">
      <button
        onClick={() => onDelete(dish.id)}
        className="absolute top-2 right-2 rounded-md p-1.5 text-muted-foreground opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
        title="Удалить блюдо"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>

      <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-xl bg-muted text-3xl">
        {dish.photoUrl ? (
          <img
            src={dish.photoUrl}
            alt={dish.name}
            className="h-full w-full rounded-xl object-cover"
          />
        ) : (
          <Utensils className="h-6 w-6 text-muted-foreground" />
        )}
      </div>

      <h4 className="mb-2 text-sm font-semibold">{dish.name}</h4>

      <ul className="space-y-0.5">
        {dish.ingredients.map((ing, i) => (
          <li key={i} className="text-xs text-muted-foreground">
            {ing.name} — {ing.quantity}
          </li>
        ))}
      </ul>
    </div>
  );
}
