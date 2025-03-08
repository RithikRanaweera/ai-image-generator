import userModel from "../models/userModel.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.json({ sucess: false, message: 'Missing Details' })
        }

        // Generate a salt (random string) with a cost factor of 10
        const salt = await bcrypt.genSalt(10);
        // Hash the user's password using the generated salt
        const hashedPassword = await bcrypt.hash(password, salt);

        const userData = {
            name,
            email,
            password: hashedPassword
        }

        const newUser = new userModel(userData)
        //If the save is successful, the document is stored in MongoDB and user holds the saved document.
        const user = await newUser.save()

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)
        /*The secret in jwt.sign(payload, secret) is like a password that keeps the token safe. 
            🔑 Why is it needed?
            It locks (signs) the token so that only the server can verify it later.
            If someone tries to change the token, verification will fail because they don't have the secret.*/

        res.json({ sucess: true, token, user: { name: user.name } })

    } catch (error) {
        console.log(error)
        res.json({ sucess: false, message: error.message })
    }
}

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await userModel.findOne({ email })

        if (!user) {
            return res.json({ sucess: false, message: 'User does not exist' })
        }

        /* When a user logs in, the entered password is hashed and compared
         with the hashed password stored in the database.*/
        const isMatch = await bcrypt.compare(password, user.password)

        if (isMatch) {
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)
            res.json({ sucess: true, token, user: { name: user.name } })
        } else {
            return res.json({ sucess: false, message: 'Invalid credentials' })
        }

    } catch (error) {
        console.log(error)
        res.json({ sucess: false, message: error.message })
    }
}

export { registerUser, loginUser };
