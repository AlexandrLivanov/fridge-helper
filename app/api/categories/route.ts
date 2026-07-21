import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isDatabaseAvailable } from "@/lib/db";
import {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  deleteDishesByCategory,
} from "@/lib/models";
import { mockCategories } from "@/lib/mock-data";

let inMemoryCategories = [...mockCategories];
let nextCategoryId = 100;

const createCategorySchema = z.object({
  name: z.string().min(1).max(200),
});

const updateCategorySchema = z.object({
  name: z.string().min(1).max(200).optional(),
});

export async function GET() {
  const dbAvailable = await isDatabaseAvailable();

  if (!dbAvailable) {
    return NextResponse.json({ categories: inMemoryCategories });
  }

  const categories = await getAllCategories();
  return NextResponse.json({ categories });
}

export async function POST(request: NextRequest) {
  const parsed = createCategorySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Некорректные данные", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const dbAvailable = await isDatabaseAvailable();

  if (!dbAvailable) {
    const now = new Date().toISOString();
    const category = {
      id: `memory-${nextCategoryId++}`,
      name: parsed.data.name,
      createdAt: now,
      updatedAt: now,
    };
    inMemoryCategories.push(category);
    return NextResponse.json({ category }, { status: 201 });
  }

  const category = await createCategory(parsed.data);
  return NextResponse.json({ category }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "Не указан id категории" },
      { status: 400 }
    );
  }

  const parsed = updateCategorySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Некорректные данные", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const dbAvailable = await isDatabaseAvailable();

  if (!dbAvailable) {
    const index = inMemoryCategories.findIndex((c) => c.id === id);
    if (index === -1) {
      return NextResponse.json(
        { error: "Категория не найдена" },
        { status: 404 }
      );
    }
    inMemoryCategories[index] = {
      ...inMemoryCategories[index],
      ...parsed.data,
      updatedAt: new Date().toISOString(),
    };
    return NextResponse.json({ category: inMemoryCategories[index] });
  }

  const category = await updateCategory(id, parsed.data);
  return NextResponse.json({ category });
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "Не указан id категории" },
      { status: 400 }
    );
  }

  const dbAvailable = await isDatabaseAvailable();

  if (!dbAvailable) {
    inMemoryCategories = inMemoryCategories.filter((c) => c.id !== id);
    return NextResponse.json({ success: true });
  }

  await deleteDishesByCategory(id);
  await deleteCategory(id);
  return NextResponse.json({ success: true });
}
