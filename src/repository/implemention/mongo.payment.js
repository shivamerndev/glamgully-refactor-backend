import PaymentRepository from "../contract/payment.contract.js";
import paymentModel from "../../models/payment.model.js";

class MongoPayment extends PaymentRepository {

    createPayment = async (paymentData) => {
        const payment = new paymentModel(paymentData)
        return await payment.save()
    }

    updatePayment = async (orderId, paymentData) => {
        return await paymentModel.findOneAndUpdate({ razorpayOrderId: orderId }, paymentData, { returnDocument: 'after' })
    }

}

export default new MongoPayment();