import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Transaction from '@/models/Transaction';

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '5');

    // Get top selling products
    const topProducts = await Transaction.aggregate([
      {
        $match: {
          type: 'sale',
        },
      },
      {
        $group: {
          _id: '$productId',
          quantitySold: { $sum: '$quantity' },
          revenue: { $sum: { $multiply: ['$price', '$quantity'] } },
        },
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product',
        },
      },
      {
        $unwind: '$product',
      },
      {
        $project: {
          _id: 1,
          name: '$product.name',
          quantitySold: 1,
          revenue: 1,
          trend: {
            $cond: [
              { $gt: ['$quantitySold', 0] },
              'up',
              'neutral',
            ],
          },
        },
      },
      {
        $sort: { revenue: -1 },
      },
      {
        $limit: limit,
      },
    ]);

    // Format the response
    const formattedProducts = topProducts.map(product => ({
      id: product._id.toString(),
      name: product.name,
      quantitySold: product.quantitySold,
      revenue: product.revenue,
      trend: product.trend,
    }));

    return NextResponse.json(formattedProducts);
  } catch (error) {
    console.error('Top products error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 