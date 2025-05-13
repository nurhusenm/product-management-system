import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Transaction from '@/models/Transaction';

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '5');

    // Get recent transactions with product details
    const transactions = await Transaction.find()
      .populate('productId', 'name')
      .sort({ date: -1 })
      .limit(limit);

    // Format the response
    const formattedTransactions = transactions.map(transaction => ({
      id: transaction._id.toString(),
      type: transaction.type,
      amount: transaction.price * transaction.quantity,
      productName: transaction.productId?.name || 'Unknown Product',
      createdAt: transaction.date.toISOString(),
    }));

    return NextResponse.json(formattedTransactions);
  } catch (error) {
    console.error('Recent transactions error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 