

const generateToken = async (id) => {

    return jwt.sign({ id }, process.env.USER_SECRET_KEY, { expiresIn: "1d" })

}

const verifyToken = async (token) => {
    return jwt.verify(token, process.env.USER_SECRET_KEY)
}

const createHttpOnlyTokenCookie = (token) => {
    return res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 1 * 24 * 60 * 60 * 1000, // 1 day
    });
};

export { generateToken, verifyToken, createHttpOnlyTokenCookie }