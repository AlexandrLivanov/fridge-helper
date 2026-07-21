import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isDatabaseAvailable } from "@/lib/db";
import { createDish, updateDish, deleteDish } from "@/lib/models";

const createDishSchema = z.object({
  categoryId: z.string().min(1),
  name: z.string().min(1).max(200),
  ingredients: z
    .array(
      z.object({
        name: z.string().min(1).max(200),
        quantity: z.string().min(1).max(100),
      })
    )
    .default([]),
});

const updateDishSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  categoryId: z.string().min(1).optional(),
  ingredients: z
    .array(
      z.object({
        name: z.string().min(1).max(200),
        quantity: z.string().min(1).max(100),
      })
    )
    .optional(),
});

export async function POST(request: NextRequest) {
  const parsed = createDishSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Некорректные данные", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  if (!(await isDatabaseAvailable())) {
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
    return NextResponse.json({ error: "Не указан id блюда" }, { status: 400 });
  }

  const parsed = updateDishSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Некорректные данные", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  if (!(await isDatabaseAvailable())) {
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
    return NextResponse.json({ error: "Не указан id блюда" }, { status: 400 });
  }

  if (!(await isDatabaseAvailable())) {
    return NextResponse.json(
      { error: "База данных недоступна" },
      { status: 503 }
    );
  }

  await deleteDish(id);
  return NextResponse.json({ success: true });
}
