const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const bcrypt = require("bcrypt");
const db = require('../../models');
const User = db.User;

dotenv.config();

const register = (async (req, res) => {
    try{
    const { first_name, last_name, email, password,role } = req.body;
    if (!email || !password)
        return res.status(400).json({ message: "Email & Password required" });
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!pattern.test(email))
        return res.status(400).json({ message: "Enter a valid email" });

    if (!first_name || !last_name)
        return res.status(400).json({ message: "first name and last name does not exist" });

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser)
        return res.status(400).json({ message: "User already exists" });
    const hashedPassword = await bcrypt.hash(password,10);
    const newUser = await User.create({ first_name, last_name, email, password: hashedPassword,role });
    const accessToken = jwt.sign({ id: newUser.id, email: newUser.email }, process.env.JWT_SECRET_KEY, { expiresIn: "1h" });

    res.json({ message: "New User created successfully" });
}catch(error){
    res.status(500).json({message :"Registration Failed"});
}
});

const login = (async (req, res) => {
    try{
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
}catch(error){
    res.status(500).json({message:"Login Failed"});
}
});

module.exports = { register, login };
