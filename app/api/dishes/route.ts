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
    return NextResponse.json({ dishes: mockDishes });
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
    return NextResponse.json(
      { error: "База данных недоступна" },
      { status: 503 }
    );
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
    return NextResponse.json(
      { error: "База данных недоступна" },
      { status: 503 }
    );
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
    return NextResponse.json(
      { error: "База данных недоступна" },
      { status: 503 }
    );
  }

  await deleteDish(id);
  return NextResponse.json({ success: true });
}
