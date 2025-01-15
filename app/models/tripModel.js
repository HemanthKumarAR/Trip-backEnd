const mongoose= require('mongoose')
// const mongoose = require('mongoose')

const { Schema, model } = mongoose
  

const tripSchema=new Schema({
    customerId:{
        type: Schema.Types.ObjectId,
        ref: "User"
    },

    driverId:{
        type: Schema.Types.ObjectId,
        ref: "User"
    },

    vehicleId:{
        type: Schema.Types.ObjectId,
        ref: "Vehicle"
    },
    
    tripStartDate: Date,

    tripEndDate: Date,
    
    pickUplocation:{
        address:String, //address 
        pickCoordinate:[],
       
         
    },
    dropOfflocation:{
        address:String,
        dropCoordinate:[],
       
    },
    
    tripStatus: {
        type: String,
        enum: ["bookingPlaced", "driverConfirm", "driverDelyed", "paymentPending","paymentCompleted",'inProgress','Completed'],
        default: "bookingPlaced"
      },
    totalDistance:Number,

    totalAmount:Number,

      startOtp: {
        type: String,
        default: null,
      },
      
      endOtp:{
        type: String,
        default: null,
      },

    paymentStatus: {
        type:Boolean,
        default:false
    },
    rejectReason:String,

   


    
}, { timestamps: true })

const Trip = model("Trip", tripSchema)
module.exports = Trip

