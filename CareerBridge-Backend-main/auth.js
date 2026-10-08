const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./User'); 
const router = express.Router();

// SIGN UP API
router.post('/signup', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Yeh email pehle se registered hai bhai!" });
        }

        // Encrypt password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            role
        });

        // Save to DB
        await newUser.save();
        res.status(201).json({ message: "Mubarak ho! Naya user successfully save ho gaya! 🎉" });

    } catch (error) {
        console.error("Error aaya: ", error);
        res.status(500).json({ message: "Server mein kuch gadbad hai!" });
    }
});
// 🚀 LOGIN API
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Check karte hain email database mein hai ya nahi
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "this email is not registered , plese signup first." });
        }

        // 2. Password check karte hain
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "entered password is wrong" });
        }

        // 3. User sahi hai toh usko Token (VIP Pass) de do
        const token = jwt.sign({ id: user._id, role: user.role }, "meraSuperSecretKey", { expiresIn: '1d' });

        res.status(200).json({ message: "Login successful! 🎉", token, user });

    } catch (error) {
        console.error("Login mein error: ", error);
        res.status(500).json({ message: "Server error" });
    }
});
// SARE USERS KI LIST NIKALNE WALI API
router.get('/users', async (req, res) => {
    try {
        const users = await User.find({}, { password: 0 }); // password ko chhod kar sab data lao
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: "Data not found" });
    }
});

module.exports = router;
