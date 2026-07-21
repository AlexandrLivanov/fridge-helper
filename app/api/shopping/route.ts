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
import { mockShoppingItems } from "@/lib/mock-data";

let inMemoryItems = [...mockShoppingItems];
let nextItemId = 100;

const createShoppingSchema = z.object({
  name: z.string().min(1).max(200),
  quantity: z.string().min(1).max(100),
});

export async function GET() {
  const dbAvailable = await isDatabaseAvailable();

  if (!dbAvailable) {
    return NextResponse.json({ items: inMemoryItems });
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
    const now = new Date().toISOString();
    const item = {
      id: `memory-${nextItemId++}`,
      name: parsed.data.name,
      quantity: parsed.data.quantity,
      isBought: false,
      createdAt: now,
      updatedAt: now,
    };
    inMemoryItems.push(item);
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
    const index = inMemoryItems.findIndex((i) => i.id === id);
    if (index === -1) {
      return NextResponse.json(
        { error: "Не найдено" },
        { status: 404 }
      );
    }

    if (isBought) {
      const item = inMemoryItems[index];
      const products = inMemoryProducts || [];
      const existingProduct = products.find(
        (p: any) => p.name.toLowerCase() === item.name.toLowerCase()
      );
      if (!existingProduct) {
        const now = new Date().toISOString();
        const newProduct = {
          id: `memory-${nextProductId++}`,
          name: item.name,
          quantity: item.quantity,
          category: "Прочее",
          isFinished: false,
          createdAt: now,
          updatedAt: now,
        };
        (globalThis as any)._pendingProducts = [
          ...((globalThis as any)._pendingProducts || []),
          newProduct,
        ];
      }
      inMemoryItems.splice(index, 1);
      return NextResponse.json({ item: { id } });
    }

    inMemoryItems[index] = {
      ...inMemoryItems[index],
      updatedAt: new Date().toISOString(),
    };
    return NextResponse.json({ item: inMemoryItems[index] });
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
    inMemoryItems = inMemoryItems.filter((i) => i.id !== id);
    return NextResponse.json({ success: true });
  }

  await deleteShoppingItem(id);
  return NextResponse.json({ success: true });
}
