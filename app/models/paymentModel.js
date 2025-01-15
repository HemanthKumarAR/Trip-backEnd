const mongoose=require('mongoose')
const {Schema,model}=mongoose

const paymentSchema=new Schema({
    customerId:{
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    driverId:{
        type: Schema.Types.ObjectId,
        ref: "User"
    },

    tripId:{
        type: Schema.Types.ObjectId,
        ref: "Trip"
    },
    amount:'string',
    status:{
        type:Boolean,   //Payment 
        default:false
    },
    paymentType:String,
    transaction_Id:String

})


const Payment= model('Payment',paymentSchema)

module.exports = Payment