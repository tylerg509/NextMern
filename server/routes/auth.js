const express = require('express');
const router = express.Router()

// validator import
const {userRegisterValidator, userLoginValidator} = require('../validators/auth')
const {runValidation} = require('../validators/index')

// import from controllers
const {register, registerActivate, login, requireSignin } = require('../controllers/auth')

//This will run validators first and if no errors we will run register
router.post('/register', userRegisterValidator, runValidation, register)
router.post('/register/activate', registerActivate)
router.post('/login', userLoginValidator, runValidation, login)
router.get('/secret', requireSignin, (req, res) => {
    res.json({
        data: 'This is secret page for logged in users only'
    })
}) 
module.exports = router; 