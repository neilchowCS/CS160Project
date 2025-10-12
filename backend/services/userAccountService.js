const { User } = require('../models/User');
const bcrypt = require('bcrypt');

async function registerUser(body) {
    // register new account
    try {
        const user = new User({
            firstName: body.first_name,
            lastName: body.last_name,
            email: body.email,
            passwordHash: await bcrypt.hash(body.password, 12) // generate password hash with embedded salt
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