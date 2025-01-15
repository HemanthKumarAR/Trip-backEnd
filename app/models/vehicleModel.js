// const mongoose = require('mongoose')

// const { Schema, model } = mongoose

// const vehcileSchema=new Schema({
//     driverId: {
//         type: Schema.Types.ObjectId,
//         ref: "User",
//       },
      
//     vehcileNumber:String, 

//     rcNumber:String, 

//     licenseNumber:String,

//     vehcileImage:[{ url: String, key: String }],

//     rcImage:[{ url: String, key: String }],

//     licenseImage:[{ url: String, key: String }],

//     vehicleName:String,

//     vehcileModel:String,

//     wages:String,

//     pricePerKm:Number,

//     seating :String,

//     permit:String,
//     ratings: [{
//       type: Schema.Types.ObjectId,
//       ref: 'Review'
//     }],

//     vehicleApproveStatus: {
//       type: Boolean,
//       default: false
//     },
    
//     // vehicleType:String, name

//     // address:{
//     //   district: String,
//     //   taluk:String
//     // }
//     address:String
//     // profilePic:String, 
// },{ timestamps: true })

// const Vehcile=model("Vehcile",vehcileSchema)

// module.exports = Vehcile

//---------------------------------------------------

const mongoose = require('mongoose')

const { Schema, model } = mongoose

const vehicleSchema=new Schema({
    driverId: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
      
    vehicleNumber:String, 

    rcNumber:String, 

    licenseNumber:String,

    images:[{
      tittle:String,
      image:{
          type:String
      }
  },{
    tittle:String,
      image:String 
  },
  {
    tittle:String,
    image:{
      type:String
    }
  },
  {
    tittle:String,
    image:{
      type:String
    }
  }
],

    vehicleName:String,

    vehicleModel:String,

    wages:String,

    pricePerKm:Number,

    seating :String,

    permit:String,
    ratings: [{
      type: Schema.Types.ObjectId,
      ref: 'Review'
    }],

    vehicleApproveStatus: {
      type: Boolean,
      default: false
    },

    travelStatus:{
      type: String,
      enum: ["pending", "booked", "inprogress", "completed"],
      default: "pending"
    },
    
    
    address:String,

  
    
},{ timestamps: true })

const Vehicle=model("Vehicle",vehicleSchema)

module.exports = Vehicle

// pending payment is not completed but this user booked
// booked payment completed
// inprogress driver  currently traveling with confirmed used 
// completed trip is completed 
