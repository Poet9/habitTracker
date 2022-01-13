const mongoose = require('mongoose');

const habitSchema = mongoose.Schema({
   name: {
      type: String,
      trim: true,
      required: true
   },
   doneCount : {
      type: Number,
      default: 0
   },
   allDays: {
      type: Number,
      default: 1
   },
   owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User'
   }
}, {
      timeStamp: true
});

const Habit = mongoose.model('Habit', habitSchema);
module.exports = Habit;