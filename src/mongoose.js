const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URL_LOCAL, {  
      dbName: 'habitTracker',
      useNewUrlParser: true,
      useUnifiedTopology: true,
      keepAlive: true
   })
   .then(()=>console.log("mongoose is connected"))
   .catch((e)=>console.log({Connection: e.message}));