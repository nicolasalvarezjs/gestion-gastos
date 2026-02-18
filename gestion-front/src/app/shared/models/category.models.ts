export interface Category {
  _id: string;
  mainPhone: string;
  name: string;
  description: string;
}

export interface CreateCategoryDto {
  name: string;
  description?: string;
}

export interface UpdateCategoryDto {
  name?: string;
  description?: string;
}