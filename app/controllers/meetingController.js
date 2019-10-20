const mongoose = require('mongoose');
const shortid = require('shortid');
const check = require('../libs/checkLib')
const events = require('events')
const time = require('./../libs/timeLib');
const mail = require('../libs/emailLib');
const response = require('./../libs/responseLib');
const logger = require('./../libs/loggerLib');
var moment = require('moment');
var schedule = require('./../libs/socketLib');
const MeetingModel = mongoose.model('MeetingSchema')
const UserModel = mongoose.model('User')

moment().format();
shortid.characters('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$@');


var eventEmitter = new events.EventEmitter();

eventEmitter.on('newMeetMail', (data) => {
    UserModel.find({}, { email: 1 })
        .exec((err, result) => {
            for (let i of result) {
                mail.meetingMail(data, i.email)
            }
        })
});

eventEmitter.on('rescheduleMail', (data) => {
    UserModel.find({}, { email: 1 })
        .exec((err, result) => {
            for (let i of result) {
                mail.rescheduleMail(data, i.email)
            }
        })
});

let createMeeting = (req, res) => {
    let newMeeting = new MeetingModel({
        venue: req.body.venue,
        createdBy: req.body.username,
        attendee:req.body.attendee,
        title: req.body.title,
        start: req.body.dateTimeStart,
        end: req.body.dateTimeEnd,
        meetingId: shortid.generate(),
    })

    newMeeting.save((err, result) => {
        if (err) {
            logger.error(err.message, 'meetingController : createMeeting', 10)
            let apiResponse = response.generate(true, 'Failed To create new meeting', 500, null)
            res.send(apiResponse)
        }
        else {
            let apiResponse = response.generate(false, 'meeting created', 200, result)
            let date = moment(req.body.dateTimeStart)

            let dateMinusOneMinute = date.subtract(1, "minutes")
            dateMinusOneMinute = new Date(dateMinusOneMinute)
            schedule.newSchedule(result.meetingId, dateMinusOneMinute)
            eventEmitter.emit('newMeetMail', result)
            for (let i of result.attendee) {
                mail.meetingMail(result, i.email)
            }
            res.send(apiResponse)
        }
    })
}

let editMeeting = (req, res) => {
    MeetingModel.findOne({ meetingId: req.params.id }).exec
        ((err, result) => {
            if (err) {
                logger.error(err.message, 'meetingController: editMeeting', 10)
                let apiResponse = response.generate(true, 'Failed To edit the meeting', 500, null)
                res.send(apiResponse)
            }
            else {

                result.title = req.body.title
                result.start = req.body.start
                result.end = req.body.end
                result.color = req.body.color
                result.venue = req.body.venue

                result.save((err, result2) => {
                    if (err) {
                        logger.error(err.message, 'meetingController: editMeeting', 10)
                        let apiResponse = response.generate(true, 'Failed To edit the meeting', 500, null)
                        res.send(apiResponse)
                    }
                    else {
                        let apiResponse = response.generate(false, 'meeting editted', 200, result2)
                        let date = new Date(req.body.start)
                        schedule.reSchedule(req.params.id, date)
                        eventEmitter.emit('rescheduleMail', result)
                        res.send(apiResponse)
                    }
                })

            }
        })
}

let deleteMeeting = (req, res) => {
    MeetingModel.findOneAndRemove({ meetingId: req.body.meetingId }).exec
        ((err, result) => {
            if (err) {
                logger.error(`${err}`, 'meetingController: deleteMeeting', 10)
                let apiResponse = response.generate(true, 'Failed To delete Meeting', 500, null)
                res.send(apiResponse)
            }
            else {
                let apiResponse = response.generate(false, 'Meeting deleted', 200, result)
                res.send(apiResponse)
                schedule.cancelSchedule(req.body.meetingId)
            }
        })
}

let getAllMeeting = (req, res) => {
    // MeetingModel.remove().exec()
    MeetingModel.find()
        .select('-__v -_id')
        .exec((err, result) => {
            if (err) {
                logger.error(`${err}`, 'meetingController: getAllMeeting', 10)
                let apiResponse = response.generate(true, 'Failed To Find Meeting', 500, null)
                res.send(apiResponse)
            }
            else if (check.isEmpty(result)) {
                logger.info('No Users Found', 'meetingController: getAllMeeting')
                let apiResponse = response.generate(true, 'No meetings Found ', 404, null)
                res.send(apiResponse)
            }
            else {
                let apiResponse = response.generate(false, 'All Meeting', 200, result)
                res.send(apiResponse)
            }
        })
}

module.exports = {
    createMeeting: createMeeting,
    editMeeting: editMeeting,
    deleteMeeting: deleteMeeting,
    getAllMeeting: getAllMeeting
}