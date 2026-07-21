import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isDatabaseAvailable } from "@/lib/db";
import {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getAllShoppingItems,
  createShoppingItem,
} from "@/lib/models";
import {
  inMemoryProducts,
  addProduct,
  removeProduct,
  inMemoryShoppingItems,
  addShoppingItem,
} from "@/lib/in-memory-store";

const createProductSchema = z.object({
  name: z.string().min(1).max(200),
  quantity: z.string().min(1).max(100),
  category: z.string().min(1).max(100).default("Прочее"),
  isFinished: z.boolean().default(false),
});

const updateProductSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  quantity: z.string().min(1).max(100).optional(),
  category: z.string().min(1).max(100).optional(),
  isFinished: z.boolean().optional(),
});

export async function GET() {
  const dbAvailable = await isDatabaseAvailable();

  if (!dbAvailable) {
    return NextResponse.json({ products: inMemoryProducts });
  }

  const products = await getAllProducts();
  return NextResponse.json({ products });
}

export async function POST(request: NextRequest) {
  const parsed = createProductSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Некорректные данные", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const dbAvailable = await isDatabaseAvailable();

  if (!dbAvailable) {
    const product = addProduct(parsed.data);
    return NextResponse.json({ product }, { status: 201 });
  }

  const product = await createProduct(parsed.data);
  return NextResponse.json({ product }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "Не указан id продукта" },
      { status: 400 }
    );
  }

  const parsed = updateProductSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Некорректные данные", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const dbAvailable = await isDatabaseAvailable();

  if (!dbAvailable) {
    if (parsed.data.isFinished === true) {
      const product = inMemoryProducts.find((p) => p.id === id);
      if (product) {
        // Добавляем в список покупок, если ещё нет
        const alreadyInList = inMemoryShoppingItems.some(
          (si) => si.name.toLowerCase() === product.name.toLowerCase() && !si.isBought
        );
        if (!alreadyInList) {
          addShoppingItem({
            name: product.name,
            quantity: product.quantity,
            isBought: false,
          });
        }
        removeProduct(id);
      }
      return NextResponse.json({ product: { id } });
    }

    return NextResponse.json({ product: { id } });
  }

  const product = await updateProduct(id, parsed.data);

  if (parsed.data.isFinished === true) {
    const shoppingItems = await getAllShoppingItems();
    const alreadyInList = shoppingItems.some(
      (si) =>
        si.name.toLowerCase() === product.name.toLowerCase() && !si.isBought
    );

    if (!alreadyInList) {
      await createShoppingItem({
        name: product.name,
        quantity: product.quantity,
        isBought: false,
      });
    }
  }

  return NextResponse.json({ product });
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "Не указан id продукта" },
      { status: 400 }
    );
  }

  const dbAvailable = await isDatabaseAvailable();

  if (!dbAvailable) {
    removeProduct(id);
    return NextResponse.json({ success: true });
  }

  await deleteProduct(id);
  return NextResponse.json({ success: true });
}
