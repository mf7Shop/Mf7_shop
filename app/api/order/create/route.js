import { inngest } from "@/config/inngest"
import Product from "@/models/Product"
import User from "@/models/User"
import { getAuth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

export async function POST(request) {
    try {
        const { userId } = getAuth(request)
        const { address, items } = await request.json()

        if (!address || !items || items.length === 0) {
            return NextResponse.json({ success: false, message: 'Invalid data' })
        }

        // calculate amount using items
        let amount = 0;
        for (const item of items) {
            const product = await Product.findById(item.product);
            amount += product.offerPrice * item.quantity;
        }

        await inngest.send({
            name: 'order/created',
            data: {
                userId,
                items,
                amount: amount + Math.floor(amount * 0.02),
                address, // <-- include address here
                date: Date.now()
            }
        });

        // clear user cart
        const user = await User.findById(userId)
        user.cartItems = {}
        await user.save()

        return NextResponse.json({ success: true, message: 'Order Placed Successfully' })

    } catch (error) {
        console.error(error)
        return NextResponse.json({ success: false, message: error.message })
    }
}