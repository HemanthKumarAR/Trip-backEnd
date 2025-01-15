const vehcileNumberSchema={
    notEmpty:{
        errorMessage:'vehcile number should not be empty'
    }
}
const rcNumberSchema={
    notEmpty:{
        errorMessage:'RC Number Should Not Empty'
    }
}
const licenseNumberSchema={
    notEmpty:{
        errorMessage:'license Number Should be empty'
    }
}

const vehicleNameSchema={
    notEmpty:{
        errorMessage:'vehcile Name Should be empty'
    }
}

const vehcileModel={
    notEmpty:{
        errorMessage:'vehcile model Should be empty'
    }
}

const wages={
    notEmpty:{
        errorMessage:' wages Should be empty',
        bail:true
    },
    isNumeric:{
        errorMessage: "Enter numbers only", 
    },
    custom:{
        options:async(value)=>{
            if(value>750){
                throw new Error('Wages should not be more than 750');
            }
        }    
    }

}
const pricePerKm={
    notEmpty:{
        errorMessage:' price Should be empty'
    }
}
const seating={
    notEmpty:{
        errorMessage:' seating Should be empty'
    }
}

const address={
    notEmpty:{
        errorMessage:' address Should be empty'
    }
}


const addVehicleValidationSchema={
    vehicleNumber:vehcileNumberSchema,
    rcNumber:rcNumberSchema ,
    licenseNumber:licenseNumberSchema,
    vehicleName:vehicleNameSchema,
    vehicleModel:vehcileModel,
    wages:wages,
    pricePerKm:pricePerKm,
    seating:seating,
    address:address,

    // vehcileImage:,
    // rcImage:,
    // licenseImage:,
    //permit

}

module.exports={
  vehicleSchema:addVehicleValidationSchema
}