import { NextResponse } from "next/server";
import { isDatabaseAvailable } from "@/lib/db";
import {
  getAllProducts,
  getAllDishes,
  getAllCategories,
  computeSuggestions,
} from "@/lib/models";
import {
  mockProducts,
  mockDishes,
  mockCategories,
} from "@/lib/mock-data";

export async function GET() {
  const dbAvailable = await isDatabaseAvailable();

  if (!dbAvailable) {
    const suggestions = computeSuggestions(
      mockProducts,
      mockDishes,
      mockCategories
    );
    return NextResponse.json({ suggestions });
  }

  const products = await getAllProducts();
  const dishes = await getAllDishes();
  const categories = await getAllCategories();
  const suggestions = computeSuggestions(products, dishes, categories);

  return NextResponse.json({ suggestions });
}
