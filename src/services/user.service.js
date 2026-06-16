import MongoUserRepository from "../repository/implemention/mongo.user.js";
import { AppError } from "../utils/error.utils.js";

class UserSevice {

    constructor() {
        this.userRepository = new MongoUserRepository();
    }

    

}

export default new UserSevice();