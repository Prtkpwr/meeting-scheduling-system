const mongoose = require('mongoose');
const shortid = require('shortid');
const time = require('./../libs/timeLib');
const response = require('./../libs/responseLib')
const logger = require('./../libs/loggerLib');
const validateInput = require('../libs/validationLib')
const check = require('../libs/checkLib')
const passwordLib = require('./../libs/generatePasswordLib');
const token = require('../libs/tokenLib')
const mail = require('../libs/emailLib')
// const redis = require("./../libs/redisLib.js")
// const User = require('./../models/User');


/* Models */
const UserModel = mongoose.model('User')


let signUpFunction = (req, res) => {
    let checkEmail = () => {
        return new Promise((resolve, reject) => {
            if (req.body.email) {
                    if (!validateInput.Email(req.body.email)) {
                        let apiResponse = response.generate(true, 'Email Does not meet the requirement', 400, null)
                        reject(apiResponse)
                    }
                    else if (check.isEmpty(req.body.password)) {
                        let apiResponse = response.generate(true, 'Password field empty', 400, null)
                        reject(apiResponse)
                    }
                    else {
                        resolve(req)
                    }
            }
            else {
                logger.error('Field Missing During User Creation', 'userController: createUser()', 5)
                let apiResponse = response.generate(true, 'One or More Parameter(s) is missing', 400, null)
                reject(apiResponse)
            }
        })
    }

    let checkUserName = (req,res) => {
        console.log("here inside username function")
        return new Promise((resolve,reject)=>{
            UserModel.findOne({userName:req.body.userName})
            .exec((err,result) => {
                if(err){
                    let apiResponse = response.generate(true, 'Failed To Create User', 500, null)
                    reject(apiResponse)
                }
                else if (result) {
                    let apiResponse = response.generate(true, 'username already taken', 400, null)
                    reject(apiResponse)
                }
                else {
                    console.log("resolve1",req)
                    resolve(req)
                }
            })
        })
    }

    let createUser = (req, res) => {
        console.log("here inside crete function")
        return new Promise((resolve, reject) => {
            UserModel.findOne({ email: req.body.email })
                .exec((err, result) => {
                    if (err) {
                        logger.error(err.message, 'userController: createUser', 10)
                        let apiResponse = response.generate(true, 'Failed To Create User', 500, null)
                        reject(apiResponse)
                    }
                    else if (check.isEmpty(result)) {                        
                        let newUser = new UserModel({
                            userId: shortid.generate(),
                            fullName: `${req.body.firstName} ${req.body.lastName}`,
                            firstName: req.body.firstName,
                            lastName: req.body.lastName,
                            email: req.body.email.toLowerCase(),
                            mobileNumber: req.body.mobileNumber,
                            countryCode: req.body.countryCode,
                            password: passwordLib.hashpassword(req.body.password),
                            createdOn: time.now()
                        })
                        newUser.save((err, result) => {
                            if (err) {
                                logger.error(err.message, 'userController: createUser', 10)
                                let apiResponse = response.generate(true, 'Failed to create new User', 500, null)
                                reject(apiResponse)
                            }
                            else {
                                let newUserObj = result.toObject();
                                resolve(newUserObj)
                                console.log("resolve2",newUserObj)
                            }
                        })
                    }
                    else {
                        logger.error('User Cannot Be Created.User Already Present', 'userController: createUser', 4)
                        let apiResponse = response.generate(true, 'User Already Present With this Email', 403, null)
                        reject(apiResponse)
                    }

                })
        })

    }

    checkEmail(req, res)
        .then(checkUserName)
        .then(createUser)
        .then((resolve) => {
            delete resolve.password
            console.log("333aaaaaaaaaaaaaaaaaaaaaaa33",resolve)
            let apiResponse = response.generate(false, 'User created', 200, resolve)
            res.send(apiResponse);
            setTimeout(function () {
                mail.welcomeMail(resolve)
            }, 1000)
        })
        .catch((err) => {
            res.send(err);
        })
}

let loginFunction = (req, res) => {
    console.log(req.body)
    let findUser = () => {
        return new Promise((resolve, reject) => {
            if (req.body.email) {
                if (!validateInput.Email(req.body.email)) {
                    let apiResponse = response.generate(true, 'Email Does not meet the requirement', 400, null)

                    reject(apiResponse)
                }
                else {
                    UserModel.findOne({ email: req.body.email })
                        .exec((err, result) => {
                            if (err) {
                                logger.error('Failed To Retrieve User Data', 'userController: findUser()', 10)
                                let apiResponse = response.generate(true, 'Failed To Find User Details', 500, null)
                                reject(apiResponse)
                            }
                            else if (check.isEmpty(result)) {
                                logger.error('No User Found', 'userController: findUser()', 7)
                                let apiResponse = response.generate(true, 'No User Details Found', 404, null)
                     
                                reject(apiResponse)
                            }
                            else {
                                logger.info('User Found', 'userController: findUser()', 10)
                                resolve(result)
                             
                            }
                        })
                }
            }
            else {
                let apiResponse = response.generate(true, '"email" parameter is missing', 400, null)
                reject(apiResponse)
            }
        })
    }

    let checkPassword = (userDetails) => {
        return new Promise((resolve, reject) => {
            passwordLib.comparePassword(req.body.password, userDetails.password, (err, isMatch) => {
                if (err) {
                    logger.error(err.message, 'userController: checkePassword()', 10)
                    let apiResponse = response.generate(true, 'Login Failed', 500, null)
                    reject(apiResponse)
                }
                else if (isMatch) {
                    let allDetails = userDetails.toObject();

                    delete allDetails.password;
                    delete allDetails._id
                    delete allDetails.__v
                    delete allDetails.createdOn
                    delete allDetails.modifiedOn
                    resolve(allDetails)
                }
                else {
                    logger.info('Login Failed Due To Invalid Password', 'userController: validatePassword()', 10)
                    let apiResponse = response.generate(true, 'Wrong Password.Login Failed', 400, null)
                    reject(apiResponse)
                }
            })
        })
    }

    let generateToken = (userDetails) => {
        return new Promise((resolve, reject) => {
            token.generateToken(userDetails, (err, tokenDetails) => {
                if (err) {
                    let apiResponse = response.generate(true, 'Failed To Generate Token', 500, null)
                    reject(apiResponse)
                } else {
                    tokenDetails.userDetails = userDetails
                    resolve(tokenDetails)
                }
            })
        })
    }

    // let removeToken = (userDetails) => {
    //     return new Promise((resolve, reject) => {
    //         if (check.isEmpty(userDetails)) {
    //             let apiResponse = response.generate(true, 'no details', 500, null)
    //             reject(apiResponse)
    //         }
    //         else {
    //             delete userDetails.token
    //             resolve(userDetails)
    //         }
    //     })
    // }

    findUser(req, res)
        .then(checkPassword)
        .then(generateToken)
        // .then(removeToken)
        .then((resolve) => {
            let apiResponse = response.generate(false, 'Login Successful', 200, resolve)
            res.status(200)
            res.send(apiResponse)
        }
        ).catch((err) => {
            res.status(err.status)
            res.send(err)
        })

}

let forgotPassword = (req, res) => {
    let email = req.body.email;
    let checkEmail = () => {
        return new Promise((resolve, reject) => {
            if (req.body.email) {
                    if (!validateInput.Email(req.body.email)) {
                        let apiResponse = response.generate(true, 'Email Does not meet the requirement', 400, null)
                        reject(apiResponse)
                    }
                    else if (check.isEmpty(req.body.email)) {
                        let apiResponse = response.generate(true, 'Email field empty', 400, null)
                        reject(apiResponse)
                    }
                    else {
                        resolve(req)
                    }
            }
            else {
                logger.error('Field Missing', 'userController: forgotPassword()', 5)
                let apiResponse = response.generate(true, 'One or More Parameter(s) is missing', 400, null)
                reject(apiResponse)
            }
        })
    }
    let findEmail = () => {
        return new Promise((resolve, reject) => {
            UserModel.findOne({ email })
                .exec((err, result) => {
                    if (err) {
                        logger.error(err.message, 'user Controller: forgotPassword', 10)
                        let apiResponse = response.generate(true, `error occurred: ${err.message}`, 500, null)
                        reject(apiResponse)
                    }
                    else if (check.isEmpty(result)) {
                        logger.info("Create account, No user found")
                        let apiResponse = response.generate(true, `Create account, No user found in database`, 404, null)
                        reject(apiResponse)
                    }
                    else {
                        resolve(result)
                    }
                })
        })
    }
    let generateToken = (result) => {
        return new Promise((resolve, reject) => {
            token.generateToken(result, (err, tokenDetails) => {
                if (err) {
                    let apiResponse = response.generate(true, 'Failed To Generate Token', 500, null)
                    reject(apiResponse)
                } else {
                    tokenDetails.userId = result.userId
                    tokenDetails.email = result.email,
                    tokenDetails.fullName = result.fullName
                    resolve(tokenDetails)
                }
            })
        })
    }

    checkEmail(req, res)
        .then(findEmail)
        .then(generateToken)
        .then((resolve) => {
            let apiResponse = response.generate(false,'', 200, resolve)
            res.send(apiResponse) 
            mail.passResetMail(resolve)  
        })
        .catch((err) => {
            res.status(err.status)
            res.send(err)
        })

}

let changePassword = (req, res) => {

    let newPassword = () => {
            let userToken = req.params.token
            let email = req.body.email
            let newPassword = req.body.password
            
            return new Promise((resolve, reject) => {
                token.verifyClaimWithoutSecret(userToken,(err, decodedToken) => {
                    if (err) {
                        logger.error(`${err}`, 'userController: UpdatePassword', 10)
                        let apiResponse = response.generate(true, 'Unauthorized Access', 401, null)
                        reject(apiResponse)
                    }
                    else {
                        console.log(decodedToken)
                        UserModel.findOne({ email:decodedToken.data.email })
                            .exec((err, result) => {
                                if (err) {
                                    logger.error(err.message, 'user Controller: changePassword', 10)
                                    let apiResponse = response.generate(true, `error occurred: ${err.message}`, 500, null)
                                    reject(apiResponse)
                                }
                                else {
                                    result.password = passwordLib.hashpassword(newPassword),
                                        result.save(function (err, result) {
                                            if (err) {
                                                logger.error(`${err}`, 'userController: newPassword', 10)
                                                let apiResponse = response.generate(true, 'Failed', 500, null)
                                                reject(apiResponse)
                                            }
                                            else {
                                                let finalResult = result.toObject()
                                                delete finalResult.password
                                                delete finalResult._id
                                                delete finalResult.__v
                                                delete finalResult.createdOn
                                                resolve(finalResult)
                                                console.log(finalResult);
                                                
                                            }
                                        })
                                }
                            })
                    }
                })
            })
    }

    newPassword(req, res)
        .then((resolve) => {
            let apiResponse = response.generate(false, 'Password updated', 200, resolve)
            res.status(200)
            res.send(apiResponse)
        })
        .catch((err) => {
            res.status(err.status)
            res.send(err)
        })
}

let allUsers = (req, res) => {
    UserModel.find()
        .select('-__v -_id -password')
        .lean()
        .exec((err, result) => {
            if (err) {
                console.log("error akll users")
                logger.error(`${err}`, 'userController: allUsers', 10)
                let apiResponse = response.generate(true, 'Failed To Find Users', 500, null)
                res.send(apiResponse)
            }
            else if (check.isEmpty(result)) {
                logger.info('No Users Found', 'userController: allUsers')
                let apiResponse = response.generate(true, 'No users Found ', 404, null)
                res.send(apiResponse)
            }
            else {
                let apiResponse = response.generate(false, 'All Users', 200, result)
                res.send(apiResponse)
            }
        })
}


module.exports = {
    signUpFunction: signUpFunction,
    loginFunction: loginFunction,
    forgotPassword: forgotPassword,
    changePassword: changePassword,
    allUsers: allUsers
}