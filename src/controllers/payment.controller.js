import PaymentService from "../services/payment.service.js";


export const createOrder = async (req, res) => {
    const { amount } = req.body;

    const order = await PaymentService.createOrder(amount);

    res.success(201, "order created", order)
}



export const verifyPayment = async (req, res) => {

    const { verifyPaymentSchema } = paymentValidator()
    const { error } = verifyPaymentSchema.validate(req.body)
    if (error) throw new AppError(400, error.details[0].message)

    const verify = await PaymentService.verifyPayment(req.body, userId)

    res.success(200, "Payment verified successfully.", verify)
}