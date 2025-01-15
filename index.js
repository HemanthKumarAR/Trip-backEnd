//dependices
require ('dotenv').config()

const express=require('express')
const cors=require('cors')
const { checkSchema } = require('express-validator')

const ConfigDB=require('./config/db')

const app=express()

app.use(express.static("public"))
//multer
const multer=require('multer')
const path=require('path')
const storage = multer.diskStorage({
  destination:(req,file,cb)=>{
      cb(null,'upload/image')
  },
  filename:(req,file,cb)=>{
      const uniqueDateName = `${Date.now() }__${file.originalname}`
      cb(null,uniqueDateName)
  }   
})

const staticpath=path.join(__dirname, '/upload')
app.use('/upload',express.static(staticpath))
const upload=multer({storage:storage})



//converting recieved data into json
app.use(express.json()) 
//cors enabled
app.use(cors())
const PORT=3044






const usersCltr=require('./app/controller/usersCltr')
const vehicleCltr=require('./app/controller/vehicleCltr')
const tripCltr=require('./app/controller/tripCltr')
const reviewCltr=require('./app/controller/reviewCltr')
const paymentCltr=require('./app/controller/paymentCltr')

//validations
const {registerSchema,loginSchema,userUpdateSchema}=require('./app/validations/userValidation')
const {vehicleSchema}=require('./app/validations/vehicleValidation')

//Auth
const {authenticateUser,authorizeUser}=require('./app/middelwear/authentication')


//configure database
ConfigDB()

//user register
app.post('/api/register',checkSchema(registerSchema),usersCltr.register)

// user login
app.post('/api/login',checkSchema(loginSchema),usersCltr.login)

//user account
app.get('/api/profile',authenticateUser,authorizeUser(['admin','customer','driver']),usersCltr.profile)

// user update-account
app.put('/api/update-account',authenticateUser,authorizeUser(['admin','customer','driver']),checkSchema(userUpdateSchema),usersCltr.editProfile)

//user list admin can see total number of user
app.get('/api/user/list',authenticateUser,authorizeUser(['admin']),usersCltr.list)

//user search users -admin can serach the user based on id
app.get('/api/admin/:id/search-users', authenticateUser,authorizeUser(['admin']), usersCltr.search)




//vehicle add-details(expect image)
// app.post('/api/add-details',upload.fields([{ name: 'VehicleFile', maxCount: 1 },{ name: 'RcFile', maxCount: 1 }]),authenticateUser,authorizeUser(['driver']),checkSchema(vehicleSchema),vehicleCltr.addVehicle)
app.post('/api/add-details',upload.fields([{ name: 'vehicleImage', maxCount: 1},{ name: 'rcImage', maxCount: 2 },{ name: "licenseImage", maxCount: 2 },{ name: "insuranceImage", maxCount: 2 },]),authenticateUser,authorizeUser(['driver']),checkSchema(vehicleSchema),vehicleCltr.addVehicle)


// vehcile getdatils
app.get('/api/myvehicle',authenticateUser,authorizeUser(['driver']),vehicleCltr.getProfile) //afterword

// delete vehicle 
app.delete('/api/delete-vehicle/:id',authenticateUser,authorizeUser(['driver']),vehicleCltr.removeVehicle)

// vehicle of list for admin which in pending for approve
app.get('/api/vehicle/list',authenticateUser, authorizeUser(['admin']),vehicleCltr.list) //pending for approve

// vechile  admin-approve
app.get('/api/admin/:id/approve',authenticateUser, authorizeUser(['admin']),vehicleCltr.approve)

//vehicle admin reject
app.get('/api/admin/:id/reject',authenticateUser, authorizeUser(['admin']),  vehicleCltr.reject)


// vechile customer can serach vehcile by number of seats and location
app.get('/api/user/search',vehicleCltr.searchBySeat)

//driver dashboard EndPoint
app.get('/api/driver/dashboard',authenticateUser, authorizeUser(['driver']),usersCltr.driverDashBoard)

//trip
app.post('/api/amount',authenticateUser, authorizeUser(['customer']),tripCltr.estimateAmount)

app.post('/api/book',authenticateUser, authorizeUser(['customer']),tripCltr.book)

app.get('/api/mytrip' ,authenticateUser, authorizeUser(['customer']),tripCltr.mytrip)

app.get('/api/myorder',authenticateUser, authorizeUser(['driver']),tripCltr.myOrder)

app.get('/api/accept/:id' ,authenticateUser, authorizeUser(['driver']),tripCltr.driverConfirm)

app.post('/api/reject/:id',authenticateUser, authorizeUser(['driver']),tripCltr.driverReject)

app.get('/api/tripstart/:id',authenticateUser, authorizeUser(['driver']),tripCltr.tripStart)

//start OTP verify ENDPOINT
app.post('/api/start/otp',authenticateUser, authorizeUser(['driver']),tripCltr.otpVerification)

//END OTP verify ENDPOINT
app.post('/api/end/otp',authenticateUser, authorizeUser(['driver']),tripCltr.endOtpVerification)

app.get('/api/getamount',authenticateUser, authorizeUser(['driver']), tripCltr.getTotalAmountEarnedByDriver)

app.get('/api/totalTrip',authenticateUser, authorizeUser(['driver']),tripCltr.gettotalTrip)


//Review
app.post('/api/review/add',authenticateUser, authorizeUser(['customer']),reviewCltr.add)

app.post('/api/booking/:tripId/payment',authenticateUser, authorizeUser(['customer']),paymentCltr.paymentCheckoutSession)
app.put('/api/trip/update-payment',authenticateUser, authorizeUser(['customer']),paymentCltr.updatePayment)




app.listen(PORT,()=>{
    console.log('server is runing in port',PORT)
})


