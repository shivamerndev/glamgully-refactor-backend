
class IUserRepository {

    async createUser(userData) {
        throw new Error("Method not implemented");
    }

    async findUser(emailOrphone) {
        throw new Error("Method not implemented");
    }

    async findUserByEmail(email) {
        throw new Error("Method not implemented");
    }

    async findUserById(id) {
        throw new Error("Method not implemented");
    }

    async findUserByPhone(phone) {
        throw new Error("Method not implemented");
    }

    async updateUser(id, userData) {
        throw new Error("Method not implemented");
    }

    async blackListToken(token) {
        throw new Error("Method not implemented");
    }

    async findBlackListToken(token) {
        throw new Error("Method not implemented");
    }

}

export default IUserRepository;