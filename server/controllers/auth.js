const User = require('../models/user');
const AWS = require('aws-sdk');
const jwt = require('jsonwebtoken');
const { registerEmailParams} = require('../helpers/email')

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
