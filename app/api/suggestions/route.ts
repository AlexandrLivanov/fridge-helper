import { NextResponse } from "next/server";
import { isDatabaseAvailable } from "@/lib/db";
import {
  getAllProducts,
  getAllDishes,
  getAllCategories,
  computeSuggestions,
} from "@/lib/models";
import { mockProducts, mockDishes, mockCategories } from "@/lib/mock-data";

export async function GET() {
  const dbAvailable = await isDatabaseAvailable();

  let products = mockProducts;
  let dishes = mockDishes;
  let categories = mockCategories;

  if (dbAvailable) {
    products = await getAllProducts();
    dishes = await getAllDishes();
    categories = await getAllCategories();
  }

  const suggestions = computeSuggestions(products, dishes, categories);

  return NextResponse.json({ suggestions });
}
