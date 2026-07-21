import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isDatabaseAvailable } from "@/lib/db";
import {
  getAllShoppingItems,
  createShoppingItem,
  updateShoppingItem,
  deleteShoppingItem,
  getAllProducts,
  createProduct,
  updateProduct,
} from "@/lib/models";
import { mockShoppingItems } from "@/lib/mock-data";

const createShoppingItemSchema = z.object({
  name: z.string().min(1).max(200),
  quantity: z.string().min(1).max(100),
  isBought: z.boolean().default(false),
});

const updateShoppingItemSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  quantity: z.string().min(1).max(100).optional(),
  isBought: z.boolean().optional(),
});

export async function GET() {
  const dbAvailable = await isDatabaseAvailable();

  if (!dbAvailable) {
    return NextResponse.json({ items: mockShoppingItems });
  }

  const items = await getAllShoppingItems();
  return NextResponse.json({ items });
}

export async function POST(request: NextRequest) {
  const parsed = createShoppingItemSchema.safeParse(await request.json());
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

  const item = await createShoppingItem(parsed.data);
  return NextResponse.json({ item }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "Не указан id позиции" },
      { status: 400 }
    );
  }

  const parsed = updateShoppingItemSchema.safeParse(await request.json());
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

  const item = await updateShoppingItem(id, parsed.data);

  if (parsed.data.isBought === true) {
    const allProducts = await getAllProducts();
    const existingProduct = allProducts.find(
      (p) => p.name.toLowerCase() === item.name.toLowerCase()
    );

    if (existingProduct) {
      await updateProduct(existingProduct.id, { isFinished: false });
    } else {
      await createProduct({
        name: item.name,
        quantity: item.quantity,
        category: "Прочее",
        isFinished: false,
      });
    }
  }

  return NextResponse.json({ item });
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "Не указан id позиции" },
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

  await deleteShoppingItem(id);
  return NextResponse.json({ success: true });
}
