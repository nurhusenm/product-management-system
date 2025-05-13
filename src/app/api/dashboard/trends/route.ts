import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Transaction from '@/models/Transaction';

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const url = new URL(request.url);
    const range = url.searchParams.get('range') || '7d';

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    if (range === '7d') {
      startDate.setDate(endDate.getDate() - 7);
    } else if (range === '30d') {
      startDate.setDate(endDate.getDate() - 30);
    } else {
      startDate.setDate(endDate.getDate() - 7); // Default to 7 days
    }
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    // Get daily sales and purchases
    const trends = await Transaction.aggregate([
      {
        $match: {
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
            type: '$type',
          },
          total: { $sum: { $multiply: ['$price', '$quantity'] } },
        },
      },
      {
        $group: {
          _id: '$_id.date',
          sales: {
            $sum: {
              $cond: [{ $eq: ['$_id.type', 'sale'] }, '$total', 0],
            },
          },
          purchases: {
            $sum: {
              $cond: [{ $eq: ['$_id.type', 'purchase'] }, '$total', 0],
            },
          },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    // Format the response
    const formattedTrends = trends.map(trend => ({
      date: trend._id,
      sales: trend.sales || 0,
      purchases: trend.purchases || 0,
    }));

    return NextResponse.json(formattedTrends);
  } catch (error) {
    console.error('Dashboard trends error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 