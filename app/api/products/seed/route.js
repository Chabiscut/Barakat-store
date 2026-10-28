import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Product from "@/models/Product";
import { initialProducts } from "@/data/products";

export async function POST() {
  try {
    await connectToDatabase();

    // Check count
    const count = await Product.countDocuments();
    if (count > 1) {
      return NextResponse.json({
        success: true,
        message: `Database already populated with ${count} products.`,
      });
    }

    // Prepare products without custom mock id
    const productsToInsert = initialProducts.map((p) => {
      // eslint-disable-next-line no-unused-vars
      const { id, isNew, ...rest } = p;
      return {
        ...rest,
        isNewItem: Boolean(isNew),
      };
    });

    await Product.deleteMany({});
    const created = await Product.insertMany(productsToInsert);

    return NextResponse.json({
      success: true,
      message: `Successfully seeded ${created.length} products to MongoDB Atlas!`,
      count: created.length,
      data: created,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
