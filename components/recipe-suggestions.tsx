"use client";

import { useState } from "react";
import { CheckCircle2, AlertCircle, ChefHat } from "lucide-react";
import type { DishSuggestion } from "@/lib/models";

interface Props {
  initialSuggestions: DishSuggestion[];
}

export function RecipeSuggestions({ initialSuggestions }: Props) {
  const [suggestions] = useState<DishSuggestion[]>(initialSuggestions);

  const ready = suggestions.filter((s) => s.status === "ready");
  const missing = suggestions.filter(
    (s) => s.status === "missing_1" || s.status === "missing_2"
  );

  if (suggestions.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-8 text-center">
        <ChefHat className="h-8 w-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Добавьте продукты в холодильник и блюда в меню, чтобы получить
          подсказки
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {ready.length > 0 && (
        <div className="space-y-2">
          <h3 className="flex items-center gap-2 text-sm font-medium text-emerald-700">
            <CheckCircle2 className="h-4 w-4" />
            Можно приготовить прямо сейчас
          </h3>
          <div className="space-y-1">
            {ready.map((s) => (
              <div
                key={s.dishId}
                className="flex items-center justify-between rounded-lg border border-emerald-100 bg-emerald-50/50 px-4 py-3"
              >
                <div>
                  <span className="text-sm font-medium">{s.dishName}</span>
                  <span className="ml-2 text-xs text-muted-foreground">
                    {s.categoryName}
                  </span>
                </div>
                <span className="text-xs text-emerald-600">
                  {s.availableIngredients}/{s.totalIngredients}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {missing.length > 0 && (
        <div className="space-y-2">
          <h3 className="flex items-center gap-2 text-sm font-medium text-amber-700">
            <AlertCircle className="h-4 w-4" />
            Добавьте 1-2 продукта
          </h3>
          <div className="space-y-1">
            {missing.map((s) => (
              <div
                key={s.dishId}
                className="flex items-center justify-between rounded-lg border border-amber-100 bg-amber-50/50 px-4 py-3"
              >
                <div className="min-w-0">
                  <span className="text-sm font-medium">{s.dishName}</span>
                  <span className="ml-2 text-xs text-muted-foreground">
                    {s.categoryName}
                  </span>
                  <div className="mt-1 text-xs text-amber-600">
                    Не хватает: {s.missingProducts.join(", ")}
                  </div>
                </div>
                <span className="shrink-0 text-xs text-amber-600">
                  {s.availableIngredients}/{s.totalIngredients}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
