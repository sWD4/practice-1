const mongoose = require('mongoose')
const url = 'mongodb://127.0.0.1:27017/PRACTICEPORTAL'
const live_url ='mongodb+srv://sujaljha007:sujal007@cluster0.gds6kcb.mongodb.net/admissionportal?retryWrites=true&w=majority'

const connectDB=()=>{
    return mongoose.connect(live_url)

.then(()=>{
    console.log("Connected Successfully")
})

.catch((error)=>{
    console.log(error)
})
}

module.exports=connectDB