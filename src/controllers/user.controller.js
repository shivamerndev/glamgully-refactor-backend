import Customer from "../models/customer.model.js";
import Address from "../models/address.model.js";


const addAddress = async (req, res) => {
    try {
        const newAddress = new Address(req.body);
        await newAddress.save();

        const customer = await Customer.findById(req.user.id);
        customer.address.push(newAddress._id);
        await customer.save();

        res.status(201).json(newAddress);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const getAddresses = async (req, res) => {
    try {
        const customer = await Customer.findById(req.user._id).populate("address");
        if (!customer) return res.status(404).json({ message: "Customer not found" });
        res.status(200).json(customer.address);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const updateAddress = async (req, res) => {
    try {
        const { isDefault } = req.body;
        const { addressId } = req.params;
        if (isDefault) {
            await Address.findOneAndUpdate({ isDefault: true }, { isDefault: false }, { new: true })
        }
        const updatedAddress = await Address.findByIdAndUpdate(addressId, req.body, { new: true });
        if (!updatedAddress) return res.status(404).json({ message: "Address not found" });
        res.status(200).json(updatedAddress);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const removeAddress = async (req, res) => {
    try {
        const { addressId } = req.params;
        await Address.findByIdAndDelete(addressId);

        const customer = await Customer.findById(req.user.id);
        customer.address = customer.address.filter(id => id.toString() !== addressId);
        await customer.save();

        res.status(200).json({ message: "Address removed" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const addToWishlist = async (req, res) => {
    try {
        const { productId } = req.body;
        const customer = await Customer.findById(req.user.id);
        if (!customer.wishlist.includes(productId)) {
            customer.wishlist.push(productId);
            await customer.save();
        }
        res.status(200).json(customer.wishlist);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const getWishlist = async (req, res) => {
    try {
        const customer = await Customer.findById(req.user._id).populate("wishlist");
        if (!customer) return res.status(404).json({ message: "Customer not found" });
        res.status(200).json(customer.wishlist);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const removeFromWishlist = async (req, res) => {
    try {
        const { productId } = req.body;
        const customer = await Customer.findById(req.user.id);
        customer.wishlist = customer.wishlist.filter(id => id.toString() !== productId);
        await customer.save();
        res.status(200).json(customer.wishlist);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



export { getWishlist, getAddresses, removeFromWishlist, addToWishlist, addAddress, updateAddress, removeAddress }