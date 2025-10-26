export const PRODUCT_GENDER_OPTIONS = [
  { label: "Men", value: "Men" },
  { label: "Women", value: "Women" },
  { label: "Kids", value: "Kids" },
] as const;

export const PRODUCT_CATEGORY_OPTIONS = ["Shose", "Apparel", "Accessories"] as const;

export const PRODUCT_RATING_OPTIONS = ["up4Star", "up3Star", "up2Star", "up1Star"] as const;

export const PRODUCT_COLOR_OPTIONS = [
  "#FF4842",
  "#1890FF",
  "#FFC0CB",
  "#00AB55",
  "#FFC107",
  "#7F00FF",
  "#000000",
  "#FFFFFF",
] as const;

export const PRODUCT_COLOR_NAME_OPTIONS = [
  { value: "#FF4842", label: "Red" },
  { value: "#1890FF", label: "Blue" },
  { value: "#FFC0CB", label: "Pink" },
  { value: "#00AB55", label: "Green" },
  { value: "#FFC107", label: "Yellow" },
  { value: "#7F00FF", label: "Violet" },
  { value: "#000000", label: "Black" },
  { value: "#FFFFFF", label: "White" },
] as const;

export const PRODUCT_SIZE_OPTIONS = [
  { value: "7", label: "7" },
  { value: "8", label: "8" },
  { value: "8.5", label: "8.5" },
  { value: "9", label: "9" },
  { value: "9.5", label: "9.5" },
  { value: "10", label: "10" },
  { value: "10.5", label: "10.5" },
  { value: "11", label: "11" },
  { value: "11.5", label: "11.5" },
  { value: "12", label: "12" },
  { value: "13", label: "13" },
] as const;

export const PRODUCT_STOCK_OPTIONS = [
  { value: "in stock", label: "In stock" },
  { value: "low stock", label: "Low stock" },
  { value: "out of stock", label: "Out of stock" },
] as const;

export const PRODUCT_PUBLISH_OPTIONS = [
  { value: "published", label: "Published" },
  { value: "draft", label: "Draft" },
] as const;

export const PRODUCT_SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "priceDesc", label: "Price: High - Low" },
  { value: "priceAsc", label: "Price: Low - High" },
] as const;

export const PRODUCT_CATEGORY_GROUP_OPTIONS = [
  { group: "Clothing", classify: ["Shirts", "T-shirts", "Jeans", "Leather", "Accessories"] },
  { group: "Tailored", classify: ["Suits", "Blazers", "Trousers", "Waistcoats", "Apparel"] },
  { group: "Accessories", classify: ["Shoes", "Backpacks and bags", "Bracelets", "Face masks"] },
] as const;
