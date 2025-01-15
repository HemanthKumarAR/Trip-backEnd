require("dotenv").config()
const { validationResult } = require("express-validator");
const Trip = require('../models/tripModel')
const stripe = require("stripe")(process.env.STRIPE_KEY);
const _ = require("lodash");
// const PaymentModel = require("../models/payment-model");
const Payment = require('../models/paymentModel')
const User = require('../models/userModel')


const paymentCltr = {};

paymentCltr.paymentCheckoutSession = async (req, res) => {
 
  console.log('api is working')
  // const body = _.pick(req.body)

  const { tripId } = req.params
  console.log(tripId, "id")
  try {

    const tripBook = await Trip.findOne({ _id: tripId, customerId: req.user.id }).populate('customerId').populate('vehicleId')
    // console.log(tripBook.totalAmount)
    // console.log(tripBook.pickUplocation)
    // const tripInfo=`from ${tripBook.pickUplocation} to ${tripBook.dropOfflocation}`
    // console.log(tripInfo)
  
    if (!tripBook) {
      return res.status(404).json({ error: tripBook, message: "Cannot find the booked event" });
    }

    const customer = await stripe.customers.create({
      // name: profile.userId.username,
      name: "MyTrip",
      address: {
        line1: 'India',
        postal_code: '560002',
        city: 'Banglore',
        state: 'KA',
        country: 'US',
      },
    })

    const locationDetails = `From  ${tripBook.pickUplocation.address} to${tripBook.dropOfflocation.address} `
   
    console.log('start')
    const session = await stripe.checkout.sessions.create({

      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: locationDetails, // You should replace this with the actual product name
            },
            unit_amount:Math.round(tripBook.totalAmount * 100)// Use totalAmountInPaise as the unit amount
          },
          quantity: 1,
        }
      ],
      customer: customer.id,
      success_url: `${process.env.SERVER_URL}/success`,
      cancel_url: `${process.env.SERVER_URL}/cancel`,
    });
    console.log('end')

    res.json({ id: session.id, url: session.url })

    if (session.id) {
      const paymentPending = new Payment({
        customerId: req.user.id,
        driverId: tripBook.vehicleId.driverId,
        tripId: tripBook._id,
        amount: tripBook.totalAmount,
        paymentType: session.payment_method_types[0],
        transaction_Id: session.id
      })
      await paymentPending.save()

    }

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" })
  }
  // }
};

paymentCltr.updatePayment = async(req,res)=>{
  const {stripeId} = req.body
  try{
    console.log("1",stripeId)
    const payment = await Payment.findOneAndUpdate(
      { transaction_Id: stripeId },
      { status: true },
      { new: true }
    );
        console.log(payment,"paymentInfo")
    if(payment.status === true){
      console.log("2")
      const tripUpdate = await Trip.findOneAndUpdate(
        {_id:payment.tripId},
        {paymentStatus:true,tripStatus:'paymentCompleted'},
        { new: true }
        )
        console.log(tripUpdate._id,"id")

      
      res.status(200).json("Payment Successfull", tripUpdate.totalAmount,"Rs")
    }
    if(!payment) return res.status(404).json("Cannot find the Payment Info")

  } catch(err){
    console.log(err)
    return res.status(500).json(err)
  }
}




// paymentCltr.deletePayment  = async(req,res)=>{
//   const {paymentId} = req.params
//   try{
//     await PaymentModel.findOneAndDelete({userId:req.user.id,transaction_Id:paymentId})
//     return res.status(200).json("Somthing went wrong on the payment")
//   }catch(err){//write the status code for payments
//     return res.json(EvalError)
//   }
// }





module.exports = paymentCltr;
