"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Ingredient } from "@/lib/models";

interface Props {
  categoryId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDishAdded: () => void;
}

export function AddDishDialog({
  categoryId,
  open,
  onOpenChange,
  onDishAdded,
}: Props) {
  const [name, setName] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { name: "", quantity: "" },
  ]);
  const [saving, setSaving] = useState(false);

  const addIngredientRow = () => {
    setIngredients((prev) => [...prev, { name: "", quantity: "" }]);
  };

  const removeIngredientRow = (index: number) => {
    setIngredients((prev) => prev.filter((_, i) => i !== index));
  };

  const updateIngredient = (
    index: number,
    field: "name" | "quantity",
    value: string
  ) => {
    setIngredients((prev) =>
      prev.map((ing, i) => (i === index ? { ...ing, [field]: value } : ing))
    );
  };

  const resetForm = () => {
    setName("");
    setPhotoUrl("");
    setIngredients([{ name: "", quantity: "" }]);
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Введите название блюда");
      return;
    }

    const validIngredients = ingredients.filter(
      (ing) => ing.name.trim() && ing.quantity.trim()
    );

    if (validIngredients.length === 0) {
      toast.error("Добавьте хотя бы один ингредиент");
      return;
    }

    setSaving(true);

    const res = await fetch("/api/dishes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        categoryId,
        ingredients: validIngredients,
        photoUrl: photoUrl.trim() || undefined,
      }),
    });

    if (!res.ok) {
      toast.error("Ошибка при сохранении");
      setSaving(false);
      return;
    }

    toast.success("Блюдо добавлено");
    resetForm();
    onOpenChange(false);
    onDishAdded();
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Новое блюдо</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="dish-name">Название блюда</Label>
            <Input
              id="dish-name"
              placeholder="Например: Омлет"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dish-photo">Ссылка на фото (необязательно)</Label>
            <Input
              id="dish-photo"
              placeholder="https://example.com/photo.jpg"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Ингредиенты</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={addIngredientRow}
                className="h-7 gap-1 text-xs"
              >
                <Plus className="h-3 w-3" />
                Добавить
              </Button>
            </div>

            <div className="space-y-2">
              {ingredients.map((ing, index) => (
                <div key={index} className="flex items-center gap-2">
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
                  {ingredients.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeIngredientRow(index)}
                      className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? "Сохранение..." : "Добавить"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
