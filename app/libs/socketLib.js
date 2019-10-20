const socketio = require('socket.io');
const mongoose = require('mongoose');
const shortid = require('shortid');
const logger = require('./loggerLib.js');
const events = require('events');
const tokenLib = require("./tokenLib.js");
const check = require("./checkLib.js");
const time = require("./timeLib");
const response = require('./responseLib');
const redisLib = require('./redisLib');
const mail = require('./emailLib');
const eventEmitter = new events.EventEmitter();


const setServer = (server) => {
    let io = socketio.listen(server);

    let appSocket = io.of('/');

    appSocket.on('connection', (socket) => {
        socket.on('set-user',(authToken) => {
            tokenLib.verifyClaimWithoutSecret(authToken,(err,user)=>{
                if(err){
                    socket.emit('auth-error', { status: 500, error: 'Please provide correct auth token' })
                }
                else{
                    let currentUser = user.data;
                    socket.userId = currentUser.userId;
                    let fullName = `${currentUser.firstName} ${currentUser.lastName}`;
         
                    redis.appendOnlineUser('onlineUsers',socket.userId,fullName,(err,result) => {
                        if (err) {
                            console.log(err);
                        }
                        else {
                            redis.getOnlineUsers('onlineUsers',(err,result)=> {
                                socket.room = 'allusers'
                                socket.join(socket.room)
                                socket.to(socket.room).broadcast.emit('online-user-list',result);
                            })
                        }
                    })

                }
            })
        })

        socket.on('new-meet-notify',data => {
            socket.to('allusers').broadcast.emit('new-meeting',data);
        });

        socket.on('edit-meet-notify',data => {
            socket.to('allusers').broadcast.emit('edit-meeting',data);
        });

        eventEmitter.once('notify',function(data){
            socket.emit("notify")
        });

        socket.on('disconnect', () => {
            if (socket.userId) {
                redis.removeOnlineUser('onlineUsers', socket.userId)
                redis.getOnlineUsers('onlineUsers', (err, result) => {
                    if (err) {
                        console.log(err)
                    } else {
                        socket.leave(socket.room)
                        socket.to(socket.room).broadcast.emit('online-user-list', result);
                    }
                })
            }
        })

    })

    
}

let newSchedule = (name,date) => {
    console.log("newSchedule");
    let job = schedule.scheduleJob(name,date,function(){
        eventEmitter.emit('notify')
    })
}

let reSchedule = (name,date) => {
    let job = schedule.scheduledJobs[name];
    job.reschedule(date,function(){
        // eventEmitter.emit('alarm',"Meeting will start soon")
    })   
}

let cancelSchedule = (name) => {
    let job = schedule.scheduledJobs[name];
    job.cancel()  
}

module.exports = {
    setServer: setServer,
    newSchedule:newSchedule,
    reSchedule:reSchedule,
    cancelSchedule:cancelSchedule
}