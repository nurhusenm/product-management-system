import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Transaction from '@/models/Transaction';
import Product from '@/models/product';

// Mock data for development
const mockSummary = {
  salesToday: 1250.75,
  purchasesToday: 850.25,
  profitToday: 400.5,
  inventoryWorth: 15000,
  lowStockCount: 5,
};

export async function GET() {
  try {
    await connectToDatabase();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get today's sales and purchases
    const [salesToday, purchasesToday] = await Promise.all([
      Transaction.aggregate([
        {
          $match: {
            type: 'sale',
            date: { $gte: today },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: { $multiply: ['$price', '$quantity'] } },
          },
        },
      ]),
      Transaction.aggregate([
        {
          $match: {
            type: 'purchase',
            date: { $gte: today },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: { $multiply: ['$price', '$quantity'] } },
          },
        },
      ]),
    ]);

    // Calculate inventory worth and low stock count
    const [inventoryStats, lowStockCount] = await Promise.all([
      Product.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: { $multiply: ['$price', '$quantity'] } },
          },
        },
      ]),
      Product.countDocuments({
        quantity: { $lt: 10 }, // Assuming 10 is the low stock threshold
      }),
    ]);

    const salesTotal = salesToday[0]?.total || 0;
    const purchasesTotal = purchasesToday[0]?.total || 0;
    const inventoryWorth = inventoryStats[0]?.total || 0;

    return NextResponse.json({
      salesToday: salesTotal,
      purchasesToday: purchasesTotal,
      profitToday: salesTotal - purchasesTotal,
      inventoryWorth,
      lowStockCount,
    });
  } catch (error) {
    console.error('Dashboard summary error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 