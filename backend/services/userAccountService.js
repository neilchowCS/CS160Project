const { User } = require('../models/User');

async function registerUser(body) {
    // register new account
    try {
        const user = new User({
            firstName: body.first_name,
            lastName: body.last_name,
            email: body.email,
            passwordHash: body.password,
            hashSalt: "temporary-salt-value"
        });
        await user.save();
        return [201, "User registered successfully"];
    } catch (err) {
        if (err.code === 11000) {
            return [409, `Error: Email '${body.email}' already exists`];
        }
        return [400, "Error: " + err.message];
    }

}

module.exports = {
    registerUser,
};