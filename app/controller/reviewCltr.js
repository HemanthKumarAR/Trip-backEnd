const Review=require('../models/reviewModel')
const Vehicle=require('../models/vehicleModel')
const _=require('lodash')



const reviewCltr={}

reviewCltr.add = async (req, res) => {
    console.log(req.body,'review')
  const body = _.pick(req.body, ["vehicleId", "rating", "feedback", "tripId"]);
  const customerId = req.user.id;

  try {
      const reviewFound = await Review.findOne({ customerId: customerId, vehicleId: body.vehicleId, tripId: body.tripId });
      console.log(reviewFound, 'reviewFound')
      if (reviewFound) {
          return res.status(400).json({ error: 'You have already added a review for this trip and vehicle.' });
      }

      const review = new Review(body);
      review.customerId = customerId;
      await review.save();
      console.log(review,'24')


      if (!review._id) {
          return res.status(500).json({ error: 'Unable to create review.' });
      }

      await Vehicle.findOneAndUpdate({ _id: body.vehicleId }, { $push: { ratings: review._id } }, { new: true });

      return res.json(review);
  } catch (error) {
      console.log(error);
      return res.status(500).json({ error: 'Internal server error.' });
  }
};



module.exports = reviewCltr