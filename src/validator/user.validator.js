import joi from "joi"

function userValidator(userData) {

    const registerSchema = joi.object({
        fullName: joi.string().min(3).required().trim(),
        phone: joi.string().min(10).max(10).required(),
        email: joi.string().email().required().lowercase(),
        password: joi.string().required().min(8),
        gender: joi.string().default("male").required(),
    })

    const loginSchema = joi.object({
        emailorphone: joi.string().required(),
        password: joi.string().required().min(8),
    })

    return { registerValidator: registerSchema.validate(userData), loginValidator: loginSchema.validate(userData) }
}

export default userValidator;