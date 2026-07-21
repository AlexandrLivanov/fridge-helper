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
} from "@/lib/models";
import {
  inMemoryShoppingItems,
  addShoppingItem,
  removeShoppingItem,
  buyShoppingItem,
} from "@/lib/in-memory-store";

const createShoppingSchema = z.object({
  name: z.string().min(1).max(200),
  quantity: z.string().min(1).max(100),
});

export async function GET() {
  const dbAvailable = await isDatabaseAvailable();

  if (!dbAvailable) {
    return NextResponse.json({ items: inMemoryShoppingItems });
  }

  const items = await getAllShoppingItems();
  return NextResponse.json({ items });
}

export async function POST(request: NextRequest) {
  const parsed = createShoppingSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Некорректные данные", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const dbAvailable = await isDatabaseAvailable();

  if (!dbAvailable) {
    const item = addShoppingItem({
      name: parsed.data.name,
      quantity: parsed.data.quantity,
      isBought: false,
    });
    return NextResponse.json({ item }, { status: 201 });
  }

  const item = await createShoppingItem({
    ...parsed.data,
    isBought: false,
  });
  return NextResponse.json({ item }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const isBought = searchParams.get("isBought") === "true";

  if (!id) {
    return NextResponse.json(
      { error: "Не указан id" },
      { status: 400 }
    );
  }

  const dbAvailable = await isDatabaseAvailable();

  if (!dbAvailable) {
    if (isBought) {
      const result = buyShoppingItem(id);
      if (!result) {
        return NextResponse.json(
          { error: "Не найдено" },
          { status: 404 }
        );
      }
      return NextResponse.json({ item: result });
    }

    return NextResponse.json({ item: { id } });
  }

  const item = await updateShoppingItem(id, { isBought });

  if (isBought) {
    const products = await getAllProducts();
    const existingProduct = products.find(
      (p) => p.name.toLowerCase() === item.name.toLowerCase()
    );

    if (!existingProduct) {
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
      { error: "Не указан id" },
      { status: 400 }
    );
  }

  const dbAvailable = await isDatabaseAvailable();

  if (!dbAvailable) {
    removeShoppingItem(id);
    return NextResponse.json({ success: true });
  }

  await deleteShoppingItem(id);
  return NextResponse.json({ success: true });
}
