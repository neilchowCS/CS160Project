const { User } = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

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

async function loginUser(body) {
    try {
        const user = await User.findOne({ email: body.email });
        if (!user) {
            return [404, "Error: User not found"];
        }

        const passwordMatch = await bcrypt.compare(body.password, user.passwordHash);
        if (!passwordMatch) {
            return [401, "Error: Invalid password"];
        }

        const token = jwt.sign(
            { userId: user._id.toString(), email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        return [200, { message: "Login successful", token }];
    } catch (err) {
        return [400, "Error: " + err.message];
    }
}

module.exports = {
    registerUser,
    loginUser,
};
