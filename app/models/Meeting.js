const mongoose = require('mongoose'),
  Schema = mongoose.Schema;

  let meetingSchema = new Schema({
      meetingId: {
          type:String
      },
      createdBy: {
          type: String
      },
      createdAt: {
        type: Date,
        default:Date.now()
      },
      title: {
          type: String
      },
      venue: {
        type:String
      },
      attendee:[],
      start:{
         type:Date 
      },
      end:{
         type:Date 
      }
  })

mongoose.model('MeetingSchema', meetingSchema);
