import joi from "joi"

export const createAddressValidator = joi.object({
    fullName: joi.string().min(3).max(25).required().trim(),
    phone: joi.string().min(10).max(10).required(),
    street: joi.string().min(3).max(25).required().trim(),
    city: joi.string().min(3).max(25).required().trim(),
    state: joi.string().min(3).max(25).required().trim(),
    postalCode: joi.string().min(6).max(6).required(),
    country: joi.string().default("India").required(),
    isDefault: joi.boolean().default(false),
})

export const updateAddressValidator = joi.object({
    fullName: joi.string().min(3).max(25).required().trim(),
    phone: joi.string().min(10).max(10).required(),
    street: joi.string().min(3).max(25).required().trim(),
    city: joi.string().min(3).max(25).required().trim(),
    state: joi.string().min(3).max(25).required().trim(),
    postalCode: joi.string().min(6).max(6).required(),
    country: joi.string().default("India").required(),
    isDefault: joi.boolean().default(false),
})