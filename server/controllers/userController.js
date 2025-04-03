import userModel from "../models/userModel.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Stripe from "stripe";
import transactionModel from "../models/transactionModel.js";

const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.json({ success: false, message: 'Missing Details' })
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

        res.json({ success: true, token, user: { name: user.name } })

    } catch (error) {
        console.log(error)
        res.json({ success: false, user: { name: user.name }, message: error.message })
    }
}

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await userModel.findOne({ email })

        if (!user) {
            return res.json({ success: false, message: 'User does not exist' })
        }

        /* When a user logs in, the entered password is hashed and compared
         with the hashed password stored in the database.*/
        const isMatch = await bcrypt.compare(password, user.password)

        if (isMatch) {
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)
            res.json({ success: true, token, user: { name: user.name } })
        } else {
            return res.json({ success: false, message: 'Invalid credentials' })
        }

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

const userCredits = async (req, res) => {
    try {
        const { userId } = req.body

        const user = await userModel.findById(userId)
        res.json({
            success: true,
            credits: user.creditBalance,
            user: { name: user.name }
        })
    } catch (error) {
        console.log(error.message)
        res.json({ success: false, message: error.message })
    }
}


const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);

const paymentStripe = async (req, res) => {
    try {
        const { userId, planId } = req.body

        const userData = await userModel.findById(userId)

        if (!userId || !planId) {
            return res.json({ success: false, message: 'Missing Details' })
        }

        let credits, plan, amount, date

        switch (planId) {
            case 'Basic':
                plan = 'Basic'
                credits = 100
                amount = 10
                break;

            case 'Advanced':
                plan = 'Advanced'
                credits = 500
                amount = 50
                break;

            case 'Business':
                plan = 'Business'
                credits = 5000
                amount = 250
                break;

            default:
                return res.json({success:false, message: 'Plan not found'});
        }

        date = Date.now();

        const transactionData = {
            userId, plan, amount, credits, date
        }

        const newTransaction = await transactionModel.create(transactionData)

        const options = {
            amount: amount * 100,
            currency: process.env.CURRENCY,
            receipt: newTransaction._id,
        }

        await stripeInstance.orders.create(options,(error, order) => {
            if (error) {
                console.log(error);
                return res.json({success: false, message: error})
            }
            res.json({success: true, order})
        })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}




export { registerUser, loginUser, userCredits, paymentStripe };
