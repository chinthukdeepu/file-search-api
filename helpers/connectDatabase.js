const mongoose = require('mongoose');

// connect database
mongoose.connect(process.env.MONGO_URL,
    {
        dbName: process.env.DATABASE,
        user: process.env.DATABASE_USER,
        pass: process.env.DATABASE_PASSWORD,
        useNewUrlParser: true,
        useUnifiedTopology: true,
        // useFindAndModify:false,
        // useCreateIndex:true
    },
    (err, data) => {
        if (err) {
            console.log(err.message);
        } else {
            console.log('Database connected');
        }
    }
)

mongoose.connection.on('connected',()=>{
    console.log('mongoose connected to db');
})

mongoose.connection.on('error',(err)=>{
    console.log(err.message);
})

mongoose.connection.on('disconnected',()=>{
    console.log('mongoose  is disconnected');
})

process.on('SIGINT',async()=>{
    await mongoose.connection.close();
    process.exit(0)
})