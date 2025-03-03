
const _ = require('lodash')
const Trip = require('../models/tripModel');
const Vehicle = require('../models/vehicleModel')
const User = require('../models/userModel')
const nodemailer = require('nodemailer');
const tripCltr = {}
const geolib = require('geolib');

// import { intervalToDuration } from 'date-fns';
const { intervalToDuration, differenceInHours, differenceInDays, parseISO } = require('date-fns')


async function distanceBtwThem(source, dest) {
  const distanceInMeters = geolib.getDistance((source), (dest));
  const distanceInKilometers = distanceInMeters / 1000; // Convert meters to kilometers
  return distanceInKilometers;
}



tripCltr.estimateAmount = async (req, res) => {
  console.log('api is working')
  const body = _.pick(req.body, [
    "vehicleId", "tripStartDate", "tripEndDate", "pickUplocation", "dropOfflocation"
  ])
  //  console.log(body, 'body')
  // console.log(body.pickUplocation.latlon)
  const startDate = parseISO(body.tripStartDate);
  const endDate = parseISO(body.tripEndDate);
  const hours = differenceInHours(endDate, startDate);
  const days = differenceInDays(endDate, startDate);
  const totalDistanceToTravel = await distanceBtwThem(body.pickUplocation.pickCoordinate, body.dropOfflocation.dropCoordinate)

  body.totalDistance = totalDistanceToTravel

  const vehicle = await Vehicle.findById(body.vehicleId)
  body.pricePerKm = vehicle.pricePerKm
  body.driverId = vehicle.driverId

  if (days == 0 && hours < 8) {
    res.status(400).json({ errors: "Trips should br minimum 8 hours long" })
  } else if (days == 0 && hours > 8) {
    const driverAmount = vehicle.wages * 1
    body.totalwages = driverAmount
    const distanceAmount = totalDistanceToTravel * vehicle.pricePerKm
    const totalAmount = new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(distanceAmount + driverAmount)
    body.totalAmount = totalAmount
    body.totalHours = hours
    res.json(body)
  }
  else if (days > 0) {
    const driverAmount = vehicle.wages * days
    body.totalwages = driverAmount
    const distanceAmount = totalDistanceToTravel * vehicle.pricePerKm
    // const totalAmount = new Intl.NumberFormat("en-IN", {
    //   style: "currency",
    //   currency: "INR",
    // }).format(distanceAmount + driverAmount)

    body.totalAmount = distanceAmount + driverAmount
    body.totalDays = days
    res.json(body)
    console.log(body)
  }

}


tripCltr.book = async (req, res) => {
  // console.log(req.body)
  console.log('api is working', '75')
  const body = _.pick(req.body, [
    "vehicleId", "driverId", "tripStartDate", "tripEndDate", "pickUplocation", "dropOfflocation", "totalDistance", "totalAmount"
  ])

  const { vehicleId, driverId, tripStartDate, tripEndDate, pickUplocation, dropOfflocation, totalDistance, totalAmount } = req.body
  body.customerId = req.user.id

  try {
    console.log(body, '83')
    const trip = new Trip(body)
    const book = await trip.save()
    const driver = await User.findById(body.driverId)
    console.log(driver)
    if (!driver) {
      return res.status(404).json({ error: "Driver not found" })
    }
    console.log('email')

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: driver.email, // Change to user.email if you want to send it to the user's email
      subject: 'MyTrip- new trip arr',
      // text: `please click the following link - http://localhost:3000/restaurant/${approved._id}`
      text: `new order is arrived please check in following link- http://localhost:3000/myorder`
    }

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error sending email' });
      } else {
        console.log('Email sent successfully');
        return res.status(200).json({ status: 'Email sent successfully' });
      }
    });


    console.log('email end')

    // console.log(book)
    // console.log(book._id)
    const book1 = await Trip.findById(book._id)
      .populate('customerId')
      .populate('driverId')
      .populate('vehicleId')

    console.log(book1, '94')

    res.status(201).json(book1)
  } catch (e) {
    console.log(e)
    res.status(500).json(e)
  }
}



tripCltr.mytrip = async (req, res) => {
  console.log('api is working');
  const customerId = req.user.id; // Assuming req.user.id is the customerId
  try {
    const myTrips = await Trip.find({ customerId: customerId })
    .populate('customerId')
    .populate({
      path: 'vehicleId',
      populate: {
        path: 'ratings',
        model: 'Review' // Make sure the model is correctly specified
      }
    })
    .populate('driverId');
    res.json(myTrips); // Sending the trip data as response
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: "Internal server error" });
  }
};



tripCltr.myOrder = async (req, res) => {
  console.log('helo')
  console.log('API is working');
  const driverId = req.user.id;
  const sortBy = req.query.sortBy || 'createdAt';
  const order = req.query.order || 'desc'; // Default to descending order
  let page = parseInt(req.query.page) || 1;
  let limit = parseInt(req.query.limit) || 2; // Default limit to 10 items per page
  console.log(limit, 'limit')
  const sortQuery = {};
  sortQuery[sortBy] = order === 'asc' ? 1 : -1; // Adjust sorting order
   
  try {
    const myOrder = await Trip.find({ driverId: driverId })
      .sort(sortQuery)
      .skip((page - 1) * limit)
      .limit(limit);
      // console.log(myOrder) 
    res.json(myOrder);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// tripCltr.myOrder = async (req, res) => {
//   console.log('API is working 186');
//   const driverId = req.user.id;

//   try {
//     const myOrder = await Trip.find({ driverId: driverId });
//     console.log("Found orders:191", myOrder); // Log the fetched orders
//     res.json(myOrder);
//   } catch (error) {
//     console.error("Error fetching orders:", error); // Log any errors
//     res.status(500).json({ error: "Internal server error" });
//   }
// };






tripCltr.driverConfirm = async (req, res) => {
  console.log('API is working');
  // console.log(req.body)
  // const {tripId} = req.body// Assuming your tripId is in req.body
  // console.log(tripId)
  const tripId = req.params.id
  console.log(tripId)
  const driverId = req.user.id;
  console.log(driverId)
  try {
    const trip = await Trip.findByIdAndUpdate(tripId, { driverId: driverId, tripStatus: 'driverConfirm' }, { new: true }).populate('customerId');
    // { new: true } option returns the modified document instead of the original

    // console.log(trip, '174');

    const customerEmail = trip.customerId.email;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: customerEmail, // Change to user.email if you want to send it to the user's email
      subject: 'MyTrip- new trip arr',
      // text: `please click the following link - http://localhost:3000/restaurant/${approved._id}`
      text: `Your trip has been confirmed by the driver please do the payment :- http://localhost:3000/myTrip`
    }

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error sending email' });
      } else {
        console.log('Email sent successfully');
        return res.status(200).json({ status: 'Email sent successfully' });
      }
    });

    res.status(200).json(trip);
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: "Internal server error" });
  }
};



tripCltr.driverReject = async (req, res) => {
  console.log('api is working')

  // const tripId = req.body.tripId; // Assuming your tripId is in req.body
  const tripId = req.params.id
  const driverId = req.user.id;
  const rejectReason = req.body.rejectReason;
  console.log(rejectReason)
  try {
    const trip = await Trip.findByIdAndUpdate(tripId, { driverId: driverId, tripStatus: 'driverDelyed', rejectReason: rejectReason }, { new: true }).populate('customerId');
    // { new: true } option returns the modified document instead of the original



    const customerEmail = trip.customerId.email;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASSWORD,
      },
    });
    

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: customerEmail, // Change to user.email if you want to send it to the user's email
      subject: 'MyTrip- new trip arr',
      // text: `please click the following link - http://localhost:3000/restaurant/${approved._id}`
      text: `driver rejected the your order please check other vehicle :-http://localhost:3000/uhome`
    }

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error sending email' });
      } else {
        console.log('Email sent successfully');
        return res.status(200).json({ status: 'Email sent successfully' });
      }
    });

    res.status(200).json(trip);
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: "Internal server error" });
  }


}


const generateOTP = () => {
  const otp = `${Math.floor(1000 + Math.random() * 9000)}`;
  return otp;
};


tripCltr.tripStart = async (req, res) => {
  console.log('api is working')
  const otp = generateOTP();
  // console.log(otp)
  const tripId = req.params.id
  const driverId = req.user.id;

  try {
    // const trip = await Trip.findByIdAndUpdate(tripId, { driverId: driverId, tripStatus: 'driverConfirm' }, { new: true }).populate('customerId');
    const trip = await Trip.findById(tripId).populate("customerId")
    if (trip.driverId.toString() !== driverId) {
      // console.log(trip.driverId.toString(),driverId,'driverID')
      return res.status(400).json('your not authorized')
    }
    //  console.log(trip)
    //  console.log(trip.customerId.email)
    //need to slove mailer bug

    const customerEmail = trip.customerId.email;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: customerEmail, // Change to user.email if you want to send it to the user's email
      subject: 'MyTrip- Start-Trip-OTP',
      text: `please verify your OTP:${otp}`
    }

    transporter.sendMail(mailOptions, async (error, info) => {
      if (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error sending email' });
      } else {
        const trip = await Trip.findByIdAndUpdate(tripId, { startOtp: otp }, { new: true })
        console.log(trip)
        console.log('Email sent successfully');
        return res.status(200).json({ status: 'Email sent successfully' });
        // return res.status(200).json(trip)
        // res.status(200).json(trip);
      }
    });

  } catch (e) {
    console.log(e ,"error")
  }

}


tripCltr.otpVerification = async (req, res) => {

  console.log(req.user.id, 'api is working')
  console.log(req.body, 'body')

  const body = _.pick(req.body, ["otp", "tripId"]);
  console.log(body.tripId)
  try {
    // const trip = await Trip.findById(body.id)
    const trip = await Trip.findById(body.tripId)

    if (trip.driverId.toString() !== req.user.id) {
      return res.status(400).json('your not authorized')
    }

    if (body.otp != trip.startOtp) {
      return res.status(400).json({ error: "invalid OTP" });
    }
    const tripUpdate = await Trip.findByIdAndUpdate(body.tripId, { tripStatus: 'inProgress', startOtp: null }, { new: true });
    console.log(tripUpdate)
    res.status(201).json({ message: 'trip is verified', tripUpdate });

  } catch (error) {
    console.log(error)
    res.status(500).json({ error });

  }

  // const body = _.pick(req.body, ["otp", "email"]);
}




tripCltr.endOtpVerification = async (req, res) => {
  console.log('api is working')
  // const tripId = req.body.id
  // // const driverId = req.user.id;
  // const otp = req.body.otp;

  const body = _.pick(req.body, ["otp", "tripId"]);
  console.log(req.body.tripId)
  console.log(body.tripId)
  try {
    // const trip = await Trip.findById(body.id)
    const trip = await Trip.findById(body.tripId)

    if (trip.driverId.toString() !== req.user.id) {
      return res.status(400).json('your not authorized')
    }

    console.log(trip)
    if (body.otp != trip.startOtp) {
      return res.status(400).json({ error: "invalid OTP" });
    }
    const tripUpdate = await Trip.findByIdAndUpdate(body.tripId, { tripStatus: 'Completed', startOtp: null }, { new: true });
    // res.json({ message: 'trip is verified', tripUpdate});
    console.log(tripUpdate,'end trip')
    res.status(201).json({ message: 'trip is verified', tripUpdate });


  } catch (e) {
    res.status(500).json(e);
  }

  // const body = _.pick(req.body, ["otp", "email"]);
}














































tripCltr.getTotalAmountEarnedByDriver = async (req, res) => {
  console.log('API is working');
  try {
    const driverId = req.user.id; // Ensure req.user.id holds the correct value
    console.log('Driver ID:', driverId);

    // Aggregate pipeline to calculate total amount earned by the driver
    const totalAmountResult = await Trip.aggregate([
      {
        $match: { driverId: driverId } // Use the driverId variable here
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$totalAmount" }
        }
      }
    ]);

    console.log('Total amount result:', totalAmountResult);

    if (totalAmountResult.length > 0) {
      console.log('Total amount:', totalAmountResult[0].totalAmount);
      return res.json(totalAmountResult[0].totalAmount);
    } else {
      console.log('No trips found for the driver.');
      return res.json(0);
    }
  } catch (error) {
    console.error('Error while fetching total amount earned by driver:', error);
    return res.status(500).json({ error: 'Internal server error' }); // Return a proper error response
  }
}


tripCltr.gettotalTrip = async (req, res) => {
  console.log('api working ')
  const driverId = req.user.id
  try {
    // Counting the total number of trips for the driver
    const totalTrips = await Trip.countDocuments({ driverId: driverId });
    console.log(totalTrips)
    return totalTrips;
  } catch (error) {
    console.error("Error while fetching total number of trips for driver:", error);
    throw error;
  }


}



module.exports = tripCltr




