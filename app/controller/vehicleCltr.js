const _ = require('lodash')
const Vehicle = require('../models/vehicleModel')
const { validationResult } = require('express-validator')
const vehicleCltr = {}

// http://localhost:3044/upload/image/1707109138776__Screenshot%20(28).png


//add vehicle 
vehicleCltr.addVehicle = async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() })
  } else{

  const body = _.pick(req.body, [
    "vehicleNumber",
    'rcNumber',
    'licenseNumber',
    'vehicleName',
    'vehicleModel',
    'wages',
    'seating',
    'pricePerKm',
    'address',
    'vehicleTitle',
    'rcTitle',
    "licenseTitle",
    "insuranceTitle"
  ])
  // console.log(req.files.vehicleImage[0].filename)
  // console.log(req.files.rcImage[0].filename)
  try {
    console.log(body, 'body')
    const vehicle = new Vehicle(body)

    vehicle.driverId = req.user.id
    vehicle.images = [
      {
        tittle: body.vehicleTitle,
        image: req.files.vehicleImage[0].filename
      },
      {
        tittle: body.rcTitle,
        image: req.files.rcImage[0].filename
      },
      {
        tittle: body.licenseTitle,
        image: req.files.licenseImage[0].filename
      },
      {
        tittle: body.insuranceTitle,
        image: req.files.insuranceImage[0].filename
      }
    ]
   const vehicleResponse= await vehicle.save()
    // console.log(vehicleResponse)
    res.status(201).json(vehicleResponse)
  } catch (e) {
    res.status(500).json(e)
  }
}
}






vehicleCltr.getProfile = async (req, res) => {
  console.log('api is working')
  const id = req.user.id

  console.log(id)
  try {
    const driverVehicle = await Vehicle.find({ driverId: req.user.id })
    res.json(driverVehicle)
  } catch (e) {
    res.status(500).json(e)
  }
}

// vehicleCltr.list = async (req, res) => {
//     try {
//       const listVehicles = await Vehicle.find({ vehicleApproveStatus: false }).populate('hostId', ['name', 'city'])
//       res.json(listVehicles)
//     } catch (e) {
//       res.json(e)
//     }
//   }

//getting My vehicle 
vehicleCltr.myVehicle = async (req, res) => {
  console.log('api working')
}



//delete My vehicle 
vehicleCltr.removeVehicle = async (req, res) => {
  console.log('api is working')
  const vehicleId = req.params.id
  try {
    const deletedvehicle = await Vehicle.findOneAndDelete({ _id: vehicleId, driverId: req.user.id })
    return res.json(deletedvehicle)
  } catch (e) {
    res.status(500).json(e)
  }


}


vehicleCltr.list = async (req, res) => {
  console.log('api is working')
  try {
    const listVehicles = await Vehicle.find({ vehicleApproveStatus: false }).populate('driverId')
    res.json(listVehicles)
  } catch (e) {
    res.status(500).json(e)
  }
}
//approve 
vehicleCltr.approve = async (req, res) => {
  try {
    const id = req.params.id
    const vehicle = await Vehicle.findByIdAndUpdate(id)
    vehicle.vehicleApproveStatus = true
    await vehicle.save()
    res.json(vehicle)
  } catch (e) {
    res.status(500).json(e)
  }
}

//reject 
vehicleCltr.reject = async (req, res) => {
  try {
    const id = req.params.id
    const vehicle = await Vehicle.findByIdAndDelete(id)
    res.json(vehicle)
  } catch (e) {
    res.status(500).json(e)
  }
}


//search vehicle 
vehicleCltr.searchBySeat = async (req, res) => {
  console.log('api is working');

  const { location, seats } = req.query;

  if (!location && !seats) {
    return res.status(404).json({ errors: 'Provide at least one valid input' });
  }

  try {
    let results;

    if (location && seats) {

      const locationsArray = location.split(',');
      const seatsArray = seats.split(',');

      results = await Vehicle.find({
        $and: [
          { address: { $in: location.split(',') } },
          { seating: { $in: seats.split(',') } },
          { vehicleApproveStatus: true },
          // { travelStatus: 'completed' }


        ]
      });
    } else if (seats) {

      results = await Vehicle.find({
        $and: [
          { seating: { $all: seats.split(',') } },
          { vehicleApproveStatus: true },// Check for vehicleApproveStatus
          // { travelStatus: 'completed' }

        ]
      })
    } else if (location) {
      const locationsArray = location.split(',');

      // results = await Vehcile.find({ 'address.district': { $in: locationsArray } });
      // results = await Vehcile.find({ address: { $all: location.split(',') } });
      results = await Vehicle.find({
        $and: [
          { address: { $all: locationsArray } },
          { vehicleApproveStatus: true },// Check for vehicleApproveStatus
          // { travelStatus: 'completed' }

        ]
      });
    }

    res.json(results);
    console.log('result')
  } catch (e) {
    // res.status(500).json({ error: 'Internal Server Error' });
    res.status(500).json(e.message);
    console.log('error')
  }


};
module.exports = vehicleCltr


