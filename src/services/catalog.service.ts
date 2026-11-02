import api from '@/lib/api';
import { Product, Ingredient, Unit, Supplier, Recipe, Menu, ApiResponse } from '@/types';

export const catalogService = {
  // Products
  getProducts: (params?: Record<string, string | number>) =>
    api.get<ApiResponse<Product[]>>('/catalog/products', { params }),

  getProduct: (id: string) =>
    api.get<ApiResponse<Product>>(`/catalog/products/${id}`),

  createProduct: (data: Partial<Product>) =>
    api.post<ApiResponse<Product>>('/catalog/products', data),

  updateProduct: (id: string, data: Partial<Product>) =>
    api.put<ApiResponse<Product>>(`/catalog/products/${id}`, data),

  deleteProduct: (id: string) =>
    api.delete<ApiResponse<null>>(`/catalog/products/${id}`),

  // Ingredients
  getIngredients: () =>
    api.get<ApiResponse<Ingredient[]>>('/catalog/ingredients'),

  createIngredient: (data: Partial<Ingredient>) =>
    api.post<ApiResponse<Ingredient>>('/catalog/ingredients', data),

  updateIngredient: (id: string, data: Partial<Ingredient>) =>
    api.put<ApiResponse<Ingredient>>(`/catalog/ingredients/${id}`, data),

  deleteIngredient: (id: string) =>
    api.delete<ApiResponse<null>>(`/catalog/ingredients/${id}`),

  // Units
  getUnits: () =>
    api.get<ApiResponse<Unit[]>>('/catalog/units'),

  createUnit: (data: Omit<Partial<Unit>, 'type'> & { code?: string; type?: string }) =>
    api.post<ApiResponse<Unit>>('/catalog/units', data),

  updateUnit: (id: string, data: Omit<Partial<Unit>, 'type'> & { code?: string; type?: string }) =>
    api.put<ApiResponse<Unit>>(`/catalog/units/${id}`, data),

  deleteUnit: (id: string) =>
    api.delete<ApiResponse<null>>(`/catalog/units/${id}`),

  // Ingredient Categories
  getIngredientCategories: () =>
    api.get<ApiResponse<any[]>>('/catalog/ingredient-categories'),

  createIngredientCategory: (data: { name: string; code?: string; status?: string; description?: string }) =>
    api.post<ApiResponse<any>>('/catalog/ingredient-categories', data),

  updateIngredientCategory: (id: string, data: { name: string; code?: string; status?: string; description?: string }) =>
    api.put<ApiResponse<any>>(`/catalog/ingredient-categories/${id}`, data),

  deleteIngredientCategory: (id: string) =>
    api.delete<ApiResponse<null>>(`/catalog/ingredient-categories/${id}`),

  // Suppliers
  getSuppliers: () =>
    api.get<ApiResponse<Supplier[]>>('/catalog/suppliers'),

  createSupplier: (data: Partial<Supplier>) =>
    api.post<ApiResponse<Supplier>>('/catalog/suppliers', data),

  // Recipes & Menus
  getRecipes: () =>
    api.get<ApiResponse<Recipe[]>>('/recipes'),

  createRecipe: (data: Partial<Recipe>) =>
    api.post<ApiResponse<Recipe>>('/recipes', data),

  getMenus: () =>
    api.get<ApiResponse<Menu[]>>('/menus'),

  createMenu: (data: Partial<Menu>) =>
    api.post<ApiResponse<Menu>>('/menus', data),
};
