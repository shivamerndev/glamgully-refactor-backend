import joi from "joi"

function userValidator(userData) {

    const schema = joi.object({
        fullName: joi.string().min(3).required().trim(),
        phone: joi.string().min(10).max(10).required(),
        email: joi.string().email().required().lowercase(),
        password: joi.string().required().min(8),
        gender: joi.string().default("male").required(),
    })

    return schema.validate(userData)
}

export default userValidator;