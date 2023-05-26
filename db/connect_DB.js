const mongoose = require('mongoose')
const url = 'mongodb://127.0.0.1:27017/PRACTICEPORTAL'


const connectDB=()=>{
    return mongoose.connect(url)

.then(()=>{
    console.log("Connected Successfully")
})

.catch((error)=>{
    console.log(error)
})
}

module.exports=connectDB