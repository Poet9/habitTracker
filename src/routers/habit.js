const express = require('express');
const Habit = require('./habitSchema');
const auth = require('../middleware/authorization');

const router = express.Router({strict: true});

/**** new habit *******/
router.post('/', auth, async (req, res)=>{
   const newHabit = new Habit({...req.body, owner: req.user._id});
   try {
      await newHabit.save();
      res.status(201).send(newHabit);
   } catch(e){
      res.status(400).send({error: e.message});
   }
});
// getting a habit
router.get('/', auth, async (req, res)=>{
   try {
         const habits = await Habit.find({owner: req.user._id},{},{
            limit: parseInt(req.query.limit),
            skip: parseInt(req.query.skip)
         });
         return res.status(200).send(habits);
   } catch(e){
      res.status(500).send({error: e.message});  
   }
});
// update habit
router.patch('/:id', auth, async (req, res)=>{
   const allowedUpdate = ['name', 'doneCount', 'allDays'];
   const updates = Object.keys(req.body);
   isValid = updates.every( update => allowedUpdate.includes(update));
   if(!isValid){
      return res.status(403).send({error: 'Unvaild update.'});
   }
   try {
      const habit = await Habit.findOne({_id: req.params.id, owner: req.user._id});
      if(!habit){
         return res.status(404).send({error: 'Habit not found.'});
      }
      updates.forEach(update=>{
         if(req.body[update] !== habit[update]){
            habit[update] = req.body[update];
         }
      });
      await habit.save();
      res.send(habit);
   } catch(e) {
      res.status(500).send({error: e.message});
   }
});
// delete habit
router.delete('/:id', auth, async (req, res)=>{
   try {
      const habit = await Habit.findOne({_id: req.params.id, owner: req.user._id});
      if(!habit){
         return res.status(404).send({error: 'habit not found.'});
      }
      await habit.remove();
      res.send({res: 'habit deleted'});
   } catch(e) {
      res.status(500).send({error: e.message});
   }
});

module.exports = router;