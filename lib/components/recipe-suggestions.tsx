"use client";

import { useState, useEffect } from "react";
import {
  ChefHat,
  CircleCheck,
  CircleAlert,
  ShoppingCart,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { DishSuggestion } from "@/lib/models";

interface RecipeSuggestionsProps {
  initialSuggestions: DishSuggestion[];
}

export function RecipeSuggestions({
  initialSuggestions,
}: RecipeSuggestionsProps) {
  const [suggestions, setSuggestions] =
    useState<DishSuggestion[]>(initialSuggestions);

  useEffect(() => {
    fetch("/api/suggestions")
      .then((res) => res.json())
      .then((data) => setSuggestions(data.suggestions))
      .catch(() => {});
  }, []);

  const ready = suggestions.filter((s) => s.status === "ready");
  const missingSome = suggestions.filter(
    (s) => s.status === "missing_1" || s.status === "missing_2"
  );

  if (suggestions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
        <ChefHat className="mb-2 size-8 opacity-40" />
        <p className="text-sm">Нет подходящих блюд</p>
        <p className="text-xs">
          Добавьте продукты в холодильник или создайте новые блюда
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {ready.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-emerald-600" />
            <h3 className="text-sm font-medium text-emerald-700">
              Можно приготовить
            </h3>
            <Badge variant="secondary" className="ml-auto">
              {ready.length}
            </Badge>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {ready.map((s) => (
              <div
                key={s.dishId}
                className="rounded-lg border bg-card px-4 py-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <CircleCheck className="size-4 shrink-0 text-emerald-500" />
                      <span className="text-sm font-medium truncate">
                        {s.dishName}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground pl-6">
                      {s.categoryName} &middot; {s.availableIngredients}/
                      {s.totalIngredients} продуктов
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {missingSome.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <ShoppingCart className="size-4 text-amber-600" />
            <h3 className="text-sm font-medium text-amber-700">
              Добавьте 1-2 продукта
            </h3>
            <Badge variant="secondary" className="ml-auto">
              {missingSome.length}
            </Badge>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {missingSome.map((s) => (
              <div
                key={s.dishId}
                className="rounded-lg border bg-card px-4 py-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <CircleAlert className="size-4 shrink-0 text-amber-500" />
                      <span className="text-sm font-medium truncate">
                        {s.dishName}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground pl-6">
                      {s.categoryName} &middot; {s.availableIngredients}/
                      {s.totalIngredients} продуктов
                    </p>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5 pl-6">
                  {s.missingProducts.map((p) => (
                    <Badge
                      key={p}
                      variant="outline"
                      className="text-xs text-amber-700 border-amber-200 bg-amber-50"
                    >
                      {p}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
