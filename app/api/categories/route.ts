import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isDatabaseAvailable } from "@/lib/db";
import {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getAllDishes,
  deleteDishesByCategory,
} from "@/lib/models";
import { getMockCategoriesWithDishes } from "@/lib/mock-data";

const createCategorySchema = z.object({
  name: z.string().min(1).max(200),
});

const updateCategorySchema = z.object({
  name: z.string().min(1).max(200),
});

export async function GET() {
  const dbAvailable = await isDatabaseAvailable();

  if (!dbAvailable) {
    return NextResponse.json({ categories: getMockCategoriesWithDishes() });
  }

  const categories = await getAllCategories();
  const dishes = await getAllDishes();

  const categoriesWithDishes = categories.map((cat) => ({
    ...cat,
    dishes: dishes.filter((d) => d.categoryId === cat.id),
  }));

  return NextResponse.json({ categories: categoriesWithDishes });
}

export async function POST(request: NextRequest) {
  const parsed = createCategorySchema.safeParse(await request.json());
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

  if (!(await isDatabaseAvailable())) {
    return NextResponse.json(
      { error: "База данных недоступна" },
      { status: 503 }
    );
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

  if (!(await isDatabaseAvailable())) {
    return NextResponse.json(
      { error: "База данных недоступна" },
      { status: 503 }
    );
  }

  await deleteDishesByCategory(id);
  await deleteCategory(id);
  return NextResponse.json({ success: true });
}
