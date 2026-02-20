export interface UserProfile {
  _id?: string;
  mainPhone: string;
  secondaryPhones: string[];
}

export interface AddSecondaryPhoneDto {
  phone: string;
}