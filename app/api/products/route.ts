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
import { mockProducts } from "@/lib/mock-data";

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
    return NextResponse.json({ products: mockProducts });
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
    return NextResponse.json(
      { error: "База данных недоступна" },
      { status: 503 }
    );
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
    return NextResponse.json(
      { error: "База данных недоступна" },
      { status: 503 }
    );
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
    return NextResponse.json(
      { error: "База данных недоступна" },
      { status: 503 }
    );
  }

  await deleteProduct(id);
  return NextResponse.json({ success: true });
}
