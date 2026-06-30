import Razorpay from "razorpay";
import { validatePaymentVerification } from 'razorpay/dist/utils/razorpay-utils.js'
import { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } from "../configs/env.config.js"
import { AppError } from "../utils/error.utils.js";
import mongoPayment from "../repository/implemention/mongo.payment.js";
import MongoUserRepository from "../repository/implemention/mongo.user.js";
import paymentValidator from "../validator/payment.validator.js";



class PaymentService {


    constructor() {

        this.razorpay = new Razorpay({
            key_id: RAZORPAY_KEY_ID,
            key_secret: RAZORPAY_KEY_SECRET
        });


        this.userRepo = new MongoUserRepository()
    }


    createOrder = async (amount) => {

        const orderOptions = {
            amount: amount * 100,
            currency: "INR"
        };

        const order = await this.razorpay.orders.create(orderOptions);

        let payload = {
            razorpayOrderId: order.id,
            products: [
                {
                    productId: "6952bd8b05fbd39e4e16e48b",
                    quantity: 1
                }
            ],
            price: {
                amount: order.amount,
                currency: order.currency
            },
            status: "pending"
        }

        const { error } = paymentValidator().createPaymentSchema.validate(payload)

        if (error) throw new AppError(400, error.details[0].message)

        await mongoPayment.createPayment(payload)

        return order
    }


    verifyPayment = async ({ razorpayPaymentId, razorpayOrderId, razorpaySignature }) => {


        const isPaymentValid = validatePaymentVerification({
            order_id: razorpayOrderId,
            payment_id: razorpayPaymentId
        }, razorpaySignature, RAZORPAY_KEY_SECRET);

        if (!isPaymentValid) {
            await mongoPayment.updatePayment(razorpayOrderId, { status: "failed" });
            throw new AppError(400, "Payment verification failed.");
        }

        await mongoPayment.updatePayment(razorpayOrderId, { status: "completed", razorpayPaymentId, razorpaySignature });

        let user = await this.userRepo.findUserById(userId)
        if (!user) {
            throw new AppError(404, "User not found")
        }

        // ✅ Send WhatsApp Notification to Admin
        await sendAdminWhatsApp(razorpayOrderId, amount);
    }

}

export default new PaymentService();