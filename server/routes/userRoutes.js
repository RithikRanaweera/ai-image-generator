import express from 'express'
import {registerUser, loginUser, userCredits, paymentStripe} from '../controllers/userController.js'
import userAuth from '../middlewares/auth.js'

const userRouter = express.Router()

userRouter.post('/register', registerUser)
userRouter.post('/login', loginUser)
userRouter.get('/credits', userAuth , userCredits)
userRouter.post('/pay-stripe', userAuth , paymentStripe)

export default userRouter

