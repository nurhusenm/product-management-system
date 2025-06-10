import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Transaction from '@/models/Transaction';
import Product from '@/models/product';
import jwt from 'jsonwebtoken';

export async function GET(request: any) {
  try {
    await connectToDatabase();

    // Verify JWT token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const tenantId = decoded.tenantId; // Adjust based on your JWT payload

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get today's sales and purchases for this tenant
    const [salesToday, purchasesToday] = await Promise.all([
      Transaction.aggregate([
        {
          $match: {
            tenantId, // Filter by tenant
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
            tenantId, // Filter by tenant
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

    // Calculate inventory worth and low stock count for this tenant
    const [inventoryStats, lowStockCount] = await Promise.all([
      Product.aggregate([
        { $match: { tenantId } }, // Filter by tenant
        {
          $group: {
            _id: null,
            total: { $sum: { $multiply: ['$price', '$quantity'] } },
          },
        },
      ]),
      Product.countDocuments({
        tenantId, // Filter by tenant
        quantity: { $lt: 10 }, // Low stock threshold
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
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}