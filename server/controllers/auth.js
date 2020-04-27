const User = require('../models/user');
const AWS = require('aws-sdk');
const jwt = require('jsonwebtoken');
const { registerEmailParams} = require('../helpers/email')
const shortId = require('shortId')


AWS.config.update({
    accessKeyId: process.env.AWS_SECRET_ACCESSS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY_ID,
    region: process.env.AWS_REGION,
});

const ses = new AWS.SES({ apiVersion: '2010-12-01' });

exports.register = (req, res) => {
    console.log([process.env.EMAIL_TO]);
    const { name, email, password } = req.body;
    // check if user exists in our db

    User.findOne({ email }).exec((err, user) => {
        if (err) {
            console.log(`Email taken: ${err}`);
            return res.status(400).json({
                error: 'This email is already in use.',
            });
        }
        // generate token with user name and password
        const token = jwt.sign({ name, email, password }, process.env.JWT_ACCOUNT_ACTIVATION, {
            expiresIn: '10m',
        });

        const params = registerEmailParams(email, token)

        const sendEmailOnRegister = ses.sendEmail(params).promise();

        sendEmailOnRegister
            .then((data) => {
                console.log('Email submitted to SES', data);
                res.json({
                    message: `Email has been sent to ${email}. Follow the instructions to complete your registration.`
                })
            })
            .catch((error) => {
                console.log('ses email on register', error);
                res.json({
                    message: `We could not verify your email. Please try again.`    
                })
            });
    });
};

exports.registerActivate = (req, res) => {
    const { token } = req.body;
    // console.log(token)
    jwt.verify(token, process.env.JWT_ACCOUNT_ACTIVATION, function(err, decoded) {
        if(err){
            return res.status(401).json({
                error: 'Expired link. Try again.'
            })
        }

        const {name, email, password} = jwt.decode(token)

        const username = shortId.generate()

        User.findOne({email}).exec((err, user) => {
            if(user) {
                return res.status(401).json({
                    error: 'The email is entered is already taken.'
                })
            }

            // Register new user
            const newUser = new User({username, name, email, password})
            newUser.save((err, result) => {
                if(err)({
                    error: 'Error saving user to database. Try again later.'
                })

                return res.json({
                    message: 'Registration success. Please login'
                })
            })
        })
    })

}

exports.login = (req, res) => {
    const {email, password} = req.body
    User.findOne({email}).exec((err, user) => {
        // handle find user
        if(err || !user) {
            return res.status(400).json({
                error: 'User with that email does not exist. Please register'
            })
        }

        //athenticate
        if(!user.authenticate(password)){
            return res.status(400).json({
                error: 'Email and password do not match'
            })
        }

        //generate token and send to client
        const token = jwt.sign({_id: user._id}, process.env.JWT_SECRET, {expiresIn: '7d'})
        const {_id, name, email, password} = user
    })
}

