import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Product from "@/models/Product";

// Sample initial product for testing
const sampleProduct = {
  name: "Royal Embroidered Silk Panjabi (Sample Test)",
  category: "panjabi",
  price: 3450,
  originalPrice: 4200,
  discount: "18% OFF",
  rating: 4.9,
  reviewsCount: 12,
  image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800&auto=format&fit=crop",
  description: "Crafted with pure silk blend fabric, intricate collar embroidery, and tailored regal silhouette for festive occasions.",
  inStock: true,
  stockCount: 15,
  sizes: ["M", "L", "XL", "XXL"],
  colors: ["Deep Navy", "Maroon", "Pearl White"],
  isNewItem: true,
  isFeatured: true,
};

export async function GET(request) {
  try {
    await connectToDatabase();

    // Check if any products exist
    let products = await Product.find({}).sort({ createdAt: -1 });

    // If database is empty, seed our initial sample product
    if (products.length === 0) {
      const created = await Product.create(sampleProduct);
      products = [created];
    }

    return NextResponse.json({
      success: true,
      message: "Connected to MongoDB Atlas successfully!",
      count: products.length,
      data: products,
    });
  } catch (error) {
    console.error("Database error in GET /api/products:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch from MongoDB Atlas",
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectToDatabase();
    const body = await request.json();

    const newProduct = await Product.create(body || sampleProduct);

    return NextResponse.json(
      {
        success: true,
        message: "Sample product inserted successfully into MongoDB Atlas!",
        data: newProduct,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Database error in POST /api/products:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to insert product into MongoDB Atlas",
      },
      { status: 500 }
    );
  }
}
