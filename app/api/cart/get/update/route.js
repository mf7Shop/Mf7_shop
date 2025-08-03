import { NextResponse } from 'next/server';
import connectDB from '@/config/db'
import User from '@/models/User'
import { getAuth } from '@clerk/nextjs/server'

export async function POST(request) {
    try {
        const { userId } = getAuth(request); // Always await!
        const { cartData } = await request.json();
        await connectDB();
        const user = await User.findById(userId);

        if (!user) {
            return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
        }

        user.cartItems = cartData;
        await user.save();

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}