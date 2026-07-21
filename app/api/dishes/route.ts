import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isDatabaseAvailable } from "@/lib/db";
import {
  getAllDishes,
  createDish,
  updateDish,
  deleteDish,
} from "@/lib/models";
import { mockDishes } from "@/lib/mock-data";

// In-memory fallback for when DB is not available
let inMemoryDishes = [...mockDishes];
let nextId = 100;

const ingredientSchema = z.object({
  name: z.string().min(1).max(200),
  quantity: z.string().min(1).max(100),
});

const createDishSchema = z.object({
  name: z.string().min(1).max(200),
  categoryId: z.string().min(1),
  ingredients: z.array(ingredientSchema).min(1),
  photoUrl: z.string().max(2000).optional(),
});

const updateDishSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  categoryId: z.string().min(1).optional(),
  ingredients: z.array(ingredientSchema).min(1).optional(),
  photoUrl: z.string().max(2000).optional(),
});

export async function GET() {
  const dbAvailable = await isDatabaseAvailable();

  if (!dbAvailable) {
    return NextResponse.json({ dishes: inMemoryDishes });
  }

  const dishes = await getAllDishes();
  return NextResponse.json({ dishes });
}

export async function POST(request: NextRequest) {
  const parsed = createDishSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Некорректные данные", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const dbAvailable = await isDatabaseAvailable();

  if (!dbAvailable) {
    const now = new Date().toISOString();
    const newDish = {
      id: `memory-${nextId++}`,
      ...parsed.data,
      createdAt: now,
      updatedAt: now,
    };
    inMemoryDishes.push(newDish);
    return NextResponse.json({ dish: newDish }, { status: 201 });
  }

  const dish = await createDish(parsed.data);
  return NextResponse.json({ dish }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "Не указан id блюда" },
      { status: 400 }
    );
  }

  const parsed = updateDishSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Некорректные данные", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const dbAvailable = await isDatabaseAvailable();

  if (!dbAvailable) {
    const index = inMemoryDishes.findIndex((d) => d.id === id);
    if (index === -1) {
      return NextResponse.json(
        { error: "Блюдо не найдено" },
        { status: 404 }
      );
    }
    inMemoryDishes[index] = {
      ...inMemoryDishes[index],
      ...parsed.data,
      updatedAt: new Date().toISOString(),
    };
    return NextResponse.json({ dish: inMemoryDishes[index] });
  }

  const dish = await updateDish(id, parsed.data);
  return NextResponse.json({ dish });
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "Не указан id блюда" },
      { status: 400 }
    );
  }

  const dbAvailable = await isDatabaseAvailable();

  if (!dbAvailable) {
    inMemoryDishes = inMemoryDishes.filter((d) => d.id !== id);
    return NextResponse.json({ success: true });
  }

  await deleteDish(id);
  return NextResponse.json({ success: true });
}
