import mongoose from "mongoose";
import { initialProducts } from "@/data/products";
import Product from "@/models/Product";

export async function resolveOrderItems(items) {
  if (!Array.isArray(items) || items.length === 0 || items.length > 50) {
    throw new Error("Your shopping bag is empty or contains too many items.");
  }

  const resolvedItems = [];
  for (const item of items) {
    const productId = String(item?.id || item?.productId || item?._id || "");
    let product = initialProducts.find((entry) => entry.id === productId);
    let databaseProductId;

    if (!product && mongoose.isValidObjectId(productId)) {
      const dbProduct = await Product.findById(productId).lean();
      if (dbProduct) {
        product = dbProduct;
        databaseProductId = dbProduct._id;
      }
    }

    if (!product || product.inStock === false) {
      throw new Error("One or more products in your bag are unavailable.");
    }

    const quantity = Number(item.quantity);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 50) {
      throw new Error("Please check the quantity for each item.");
    }
    if (Number.isFinite(product.stockCount) && quantity > product.stockCount) {
      throw new Error(`${product.name} does not have enough stock.`);
    }
    if (!Number.isFinite(Number(product.price)) || Number(product.price) <= 0) {
      throw new Error(`${product.name} has an invalid price.`);
    }

    const selectedSize = String(item.selectedSize || product.sizes?.[0] || "Standard");
    const selectedColor = String(item.selectedColor || product.colors?.[0] || "Standard");
    if (product.sizes?.length && !product.sizes.includes(selectedSize)) {
      throw new Error(`Please select a valid size for ${product.name}.`);
    }
    if (product.colors?.length && !product.colors.includes(selectedColor)) {
      throw new Error(`Please select a valid color for ${product.name}.`);
    }

    resolvedItems.push({
      ...(databaseProductId ? { productId: databaseProductId } : {}),
      name: product.name,
      price: Number(product.price),
      quantity,
      selectedSize,
      selectedColor,
      image: product.image || "",
    });
  }

  return resolvedItems;
}
