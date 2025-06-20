const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const bcrypt = require("bcrypt");
const db = require('../../models');
const User = db.User;

dotenv.config();

const register = (async (req, res) => {
    const { first_name, last_name, email, password } = req.body;
    console.log("req.body", req.body)
    if (!email || !password)
        return res.status(400).json({ message: "Email & Password required" });
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!pattern.test(email))
        return res.status(400).json({ message: "Enter a valid email" });

    if (!first_name || !last_name)
        return res.status(400).json({ message: "first name and last name does not exist" });

    const existingUser = await User.findOne({ where: { email } });
    console.log("existingUser", existingUser)
    if (existingUser)
        return res.status(400).json({ message: "User already exists" });
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("hashed", hashedPassword)
    const newUser = await User.create({ first_name, last_name, email, password: hashedPassword });
    console.log("new user", newUser)
    const accessToken = jwt.sign({ id: newUser.id, email: newUser.email }, process.env.JWT_SECRET_KEY, { expiresIn: "1h" });

    res.json({ message: "New User created successfully" });
});

const login = (async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password)
        return res.status(400).json({ message: "Email & Password required" });
    const user = await User.findOne({ where: { email } });
    if (!user)
        return res.status(401).json({ message: "User not found" });
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword)
        return res.status(403).json({ message: "Invalid password" });
    const accessToken = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET_KEY, { expiresIn: "1h" });
    res.json({ accessToken });
});

module.exports = { register, login };
