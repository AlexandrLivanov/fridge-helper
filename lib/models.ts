import { docClient } from "./db";
import {
  GetCommand,
  PutCommand,
  DeleteCommand,
  QueryCommand,
  ScanCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { TableName, IndexName } from "./schema";

export interface Service {
  id: string;
  name: string;
  description?: string;
  status: "active" | "inactive" | "deploying";
  url?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ShoppingItem {
  id: string;
  name: string;
  quantity: string;
  isBought: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  quantity: string;
  category: string;
  isFinished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Ingredient {
  name: string;
  quantity: string;
}

export interface Dish {
  id: string;
  categoryId: string;
  name: string;
  ingredients: Ingredient[];
  createdAt: string;
  updatedAt: string;
}

export interface DishCategory {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface DishCategoryWithDishes extends DishCategory {
  dishes: Dish[];
}

export async function getServiceById(id: string): Promise<Service | null> {
  const result = await docClient.send(
    new GetCommand({
      TableName: TableName.SERVICES,
      Key: { id },
    })
  );
  return (result.Item as Service) ?? null;
}

export async function getServicesByStatus(status: string): Promise<Service[]> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: TableName.SERVICES,
      IndexName: IndexName.SERVICES_STATUS,
      KeyConditionExpression: "#status = :status",
      ExpressionAttributeNames: {
        "#status": "status",
      },
      ExpressionAttributeValues: {
        ":status": status,
      },
    })
  );
  return (result.Items as Service[]) ?? [];
}

export async function getAllServices(): Promise<Service[]> {
  const result = await docClient.send(
    new ScanCommand({
      TableName: TableName.SERVICES,
    })
  );
  return (result.Items as Service[]) ?? [];
}

export async function createService(
  data: Omit<Service, "createdAt" | "updatedAt">
): Promise<Service> {
  const now = new Date().toISOString();
  const service: Service = {
    ...data,
    createdAt: now,
    updatedAt: now,
  };

  await docClient.send(
    new PutCommand({
      TableName: TableName.SERVICES,
      Item: service,
    })
  );

  return service;
}

export async function updateService(
  id: string,
  data: Partial<Pick<Service, "name" | "description" | "status" | "url">>
): Promise<Service> {
  const updateExpr = [];
  const exprValues: Record<string, unknown> = {};
  const exprNames: Record<string, string> = {};

  if (data.name !== undefined) {
    updateExpr.push("#name = :name");
    exprValues[":name"] = data.name;
    exprNames["#name"] = "name";
  }

  if (data.description !== undefined) {
    updateExpr.push("#description = :description");
    exprValues[":description"] = data.description;
    exprNames["#description"] = "description";
  }

  if (data.status !== undefined) {
    updateExpr.push("#status = :status");
    exprValues[":status"] = data.status;
    exprNames["#status"] = "status";
  }

  if (data.url !== undefined) {
    updateExpr.push("#url = :url");
    exprValues[":url"] = data.url;
    exprNames["#url"] = "url";
  }

  updateExpr.push("updatedAt = :updatedAt");
  exprValues[":updatedAt"] = new Date().toISOString();

  const result = await docClient.send(
    new UpdateCommand({
      TableName: TableName.SERVICES,
      Key: { id },
      UpdateExpression: `set ${updateExpr.join(", ")}`,
      ExpressionAttributeValues: exprValues,
      ExpressionAttributeNames:
        Object.keys(exprNames).length > 0 ? exprNames : undefined,
      ReturnValues: "ALL_NEW",
    })
  );

  return result.Attributes as Service;
}

export async function deleteService(id: string): Promise<void> {
  await docClient.send(
    new DeleteCommand({
      TableName: TableName.SERVICES,
      Key: { id },
    })
  );
}

export async function getAllProducts(): Promise<Product[]> {
  const result = await docClient.send(
    new ScanCommand({
      TableName: TableName.PRODUCTS,
    })
  );
  return (result.Items as Product[]) ?? [];
}

export async function createProduct(
  data: Omit<Product, "id" | "createdAt" | "updatedAt">
): Promise<Product> {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const product: Product = {
    id,
    ...data,
    createdAt: now,
    updatedAt: now,
  };

  await docClient.send(
    new PutCommand({
      TableName: TableName.PRODUCTS,
      Item: product,
    })
  );

  return product;
}

export async function updateProduct(
  id: string,
  data: Partial<Pick<Product, "name" | "quantity" | "category" | "isFinished">>
): Promise<Product> {
  const updateExpr: string[] = [];
  const exprValues: Record<string, unknown> = {};
  const exprNames: Record<string, string> = {};

  if (data.name !== undefined) {
    updateExpr.push("#name = :name");
    exprValues[":name"] = data.name;
    exprNames["#name"] = "name";
  }

  if (data.quantity !== undefined) {
    updateExpr.push("#quantity = :quantity");
    exprValues[":quantity"] = data.quantity;
    exprNames["#quantity"] = "quantity";
  }

  if (data.category !== undefined) {
    updateExpr.push("#category = :category");
    exprValues[":category"] = data.category;
    exprNames["#category"] = "category";
  }

  if (data.isFinished !== undefined) {
    updateExpr.push("#isFinished = :isFinished");
    exprValues[":isFinished"] = data.isFinished;
    exprNames["#isFinished"] = "isFinished";
  }

  updateExpr.push("updatedAt = :updatedAt");
  exprValues[":updatedAt"] = new Date().toISOString();

  const result = await docClient.send(
    new UpdateCommand({
      TableName: TableName.PRODUCTS,
      Key: { id },
      UpdateExpression: `set ${updateExpr.join(", ")}`,
      ExpressionAttributeValues: exprValues,
      ExpressionAttributeNames:
        Object.keys(exprNames).length > 0 ? exprNames : undefined,
      ReturnValues: "ALL_NEW",
    })
  );

  return result.Attributes as Product;
}

export async function deleteProduct(id: string): Promise<void> {
  await docClient.send(
    new DeleteCommand({
      TableName: TableName.PRODUCTS,
      Key: { id },
    })
  );
}

export async function getAllShoppingItems(): Promise<ShoppingItem[]> {
  const result = await docClient.send(
    new ScanCommand({
      TableName: TableName.SHOPPING_ITEMS,
    })
  );
  return (result.Items as ShoppingItem[]) ?? [];
}

export async function createShoppingItem(
  data: Omit<ShoppingItem, "id" | "createdAt" | "updatedAt">
): Promise<ShoppingItem> {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const item: ShoppingItem = {
    id,
    ...data,
    createdAt: now,
    updatedAt: now,
  };

  await docClient.send(
    new PutCommand({
      TableName: TableName.SHOPPING_ITEMS,
      Item: item,
    })
  );

  return item;
}

export async function updateShoppingItem(
  id: string,
  data: Partial<Pick<ShoppingItem, "name" | "quantity" | "isBought">>
): Promise<ShoppingItem> {
  const updateExpr: string[] = [];
  const exprValues: Record<string, unknown> = {};
  const exprNames: Record<string, string> = {};

  if (data.name !== undefined) {
    updateExpr.push("#name = :name");
    exprValues[":name"] = data.name;
    exprNames["#name"] = "name";
  }

  if (data.quantity !== undefined) {
    updateExpr.push("#quantity = :quantity");
    exprValues[":quantity"] = data.quantity;
    exprNames["#quantity"] = "quantity";
  }

  if (data.isBought !== undefined) {
    updateExpr.push("#isBought = :isBought");
    exprValues[":isBought"] = data.isBought;
    exprNames["#isBought"] = "isBought";
  }

  updateExpr.push("updatedAt = :updatedAt");
  exprValues[":updatedAt"] = new Date().toISOString();

  const result = await docClient.send(
    new UpdateCommand({
      TableName: TableName.SHOPPING_ITEMS,
      Key: { id },
      UpdateExpression: `set ${updateExpr.join(", ")}`,
      ExpressionAttributeValues: exprValues,
      ExpressionAttributeNames:
        Object.keys(exprNames).length > 0 ? exprNames : undefined,
      ReturnValues: "ALL_NEW",
    })
  );

  return result.Attributes as ShoppingItem;
}

export async function deleteShoppingItem(id: string): Promise<void> {
  await docClient.send(
    new DeleteCommand({
      TableName: TableName.SHOPPING_ITEMS,
      Key: { id },
    })
  );
}

export async function getAllCategories(): Promise<DishCategory[]> {
  const result = await docClient.send(
    new ScanCommand({
      TableName: TableName.CATEGORIES,
    })
  );
  return (result.Items as DishCategory[]) ?? [];
}

export async function createCategory(
  data: Omit<DishCategory, "id" | "createdAt" | "updatedAt">
): Promise<DishCategory> {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const category: DishCategory = {
    id,
    ...data,
    createdAt: now,
    updatedAt: now,
  };

  await docClient.send(
    new PutCommand({
      TableName: TableName.CATEGORIES,
      Item: category,
    })
  );

  return category;
}

export async function updateCategory(
  id: string,
  data: Partial<Pick<DishCategory, "name">>
): Promise<DishCategory> {
  const updateExpr: string[] = [];
  const exprValues: Record<string, unknown> = {};
  const exprNames: Record<string, string> = {};

  if (data.name !== undefined) {
    updateExpr.push("#name = :name");
    exprValues[":name"] = data.name;
    exprNames["#name"] = "name";
  }

  updateExpr.push("updatedAt = :updatedAt");
  exprValues[":updatedAt"] = new Date().toISOString();

  const result = await docClient.send(
    new UpdateCommand({
      TableName: TableName.CATEGORIES,
      Key: { id },
      UpdateExpression: `set ${updateExpr.join(", ")}`,
      ExpressionAttributeValues: exprValues,
      ExpressionAttributeNames:
        Object.keys(exprNames).length > 0 ? exprNames : undefined,
      ReturnValues: "ALL_NEW",
    })
  );

  return result.Attributes as DishCategory;
}

export async function deleteCategory(id: string): Promise<void> {
  await docClient.send(
    new DeleteCommand({
      TableName: TableName.CATEGORIES,
      Key: { id },
    })
  );
}

export async function getDishesByCategory(categoryId: string): Promise<Dish[]> {
  const result = await docClient.send(
    new ScanCommand({
      TableName: TableName.DISHES,
      FilterExpression: "categoryId = :categoryId",
      ExpressionAttributeValues: {
        ":categoryId": categoryId,
      },
    })
  );
  return (result.Items as Dish[]) ?? [];
}

export async function getAllDishes(): Promise<Dish[]> {
  const result = await docClient.send(
    new ScanCommand({
      TableName: TableName.DISHES,
    })
  );
  return (result.Items as Dish[]) ?? [];
}

export async function createDish(
  data: Omit<Dish, "id" | "createdAt" | "updatedAt">
): Promise<Dish> {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const dish: Dish = {
    id,
    ...data,
    createdAt: now,
    updatedAt: now,
  };

  await docClient.send(
    new PutCommand({
      TableName: TableName.DISHES,
      Item: dish,
    })
  );

  return dish;
}

export async function updateDish(
  id: string,
  data: Partial<Pick<Dish, "name" | "ingredients" | "categoryId">>
): Promise<Dish> {
  const updateExpr: string[] = [];
  const exprValues: Record<string, unknown> = {};
  const exprNames: Record<string, string> = {};

  if (data.name !== undefined) {
    updateExpr.push("#name = :name");
    exprValues[":name"] = data.name;
    exprNames["#name"] = "name";
  }

  if (data.ingredients !== undefined) {
    updateExpr.push("#ingredients = :ingredients");
    exprValues[":ingredients"] = data.ingredients;
    exprNames["#ingredients"] = "ingredients";
  }

  if (data.categoryId !== undefined) {
    updateExpr.push("#categoryId = :categoryId");
    exprValues[":categoryId"] = data.categoryId;
    exprNames["#categoryId"] = "categoryId";
  }

  updateExpr.push("updatedAt = :updatedAt");
  exprValues[":updatedAt"] = new Date().toISOString();

  const result = await docClient.send(
    new UpdateCommand({
      TableName: TableName.DISHES,
      Key: { id },
      UpdateExpression: `set ${updateExpr.join(", ")}`,
      ExpressionAttributeValues: exprValues,
      ExpressionAttributeNames:
        Object.keys(exprNames).length > 0 ? exprNames : undefined,
      ReturnValues: "ALL_NEW",
    })
  );

  return result.Attributes as Dish;
}

export async function deleteDish(id: string): Promise<void> {
  await docClient.send(
    new DeleteCommand({
      TableName: TableName.DISHES,
      Key: { id },
    })
  );
}

export interface DishSuggestion {
  dishId: string;
  dishName: string;
  categoryName: string;
  categoryId: string;
  status: "ready" | "missing_1" | "missing_2";
  missingProducts: string[];
  totalIngredients: number;
  availableIngredients: number;
}

export function computeSuggestions(
  products: Product[],
  dishes: Dish[],
  categories: DishCategory[]
): DishSuggestion[] {
  const availableNames = new Set(
    products
      .filter((p) => !p.isFinished)
      .map((p) => p.name.toLowerCase().trim())
  );

  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

  const suggestions: DishSuggestion[] = [];

  for (const dish of dishes) {
    const missing: string[] = [];

    for (const ingredient of dish.ingredients) {
      if (!availableNames.has(ingredient.name.toLowerCase().trim())) {
        missing.push(ingredient.name);
      }
    }

    if (missing.length > 2) continue;

    const status =
      missing.length === 0
        ? "ready"
        : missing.length === 1
          ? "missing_1"
          : "missing_2";

    suggestions.push({
      dishId: dish.id,
      dishName: dish.name,
      categoryName: categoryMap.get(dish.categoryId) ?? "Без категории",
      categoryId: dish.categoryId,
      status,
      missingProducts: missing,
      totalIngredients: dish.ingredients.length,
      availableIngredients: dish.ingredients.length - missing.length,
    });
  }

  return suggestions;
}

export async function deleteDishesByCategory(
  categoryId: string
): Promise<void> {
  const dishes = await getDishesByCategory(categoryId);
  for (const dish of dishes) {
    await deleteDish(dish.id);
  }
}
