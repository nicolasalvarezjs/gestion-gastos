export interface Category {
  _id: string;
  mainPhone: string;
  name: string;
  description: string;
}

export interface CreateCategoryDto {
  phone?: string;
  name: string;
  description?: string;
}

export interface UpdateCategoryDto {
  phone?: string;
  name?: string;
  description?: string;
}