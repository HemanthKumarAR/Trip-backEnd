
const User=require('../models/userModel.js')

const nameSchema = {
    notEmpty: {
      errorMessage: "Name should not be empty",
      bail: true
    },
    isLength: {
      options: {min:3  ,max:15 },
      errorMessage: "The name must be limited to a maximum of 50 characters.",
      bail:true
    }
  }

  const emailSchema={
    notEmpty:{
        errorMessage:'email is required',
        bail:true
      },
      isEmail:{
        errorMessage:'invaild email format',
        bail:true
       },
       custom: {
        options: async (value) => {
          try {
            const user = await User.findOne({ email: value });
            if (!user) {
              return true;
            } else {
              throw new Error("email already exists");
            }
          } catch (e) {
            throw new Error(e.message);
          }
        },
      }
  }

  const emailLoginSchema = {
    notEmpty : {
        errorMessage : 'email is reqired',
        bail:true
    },
    isEmail : {
        errorMessage : 'Inavlid email format',
        bail:true
    }
}

  const mobileNumberSchema = {
    isNumeric: {
      errorMessage: "Enter numbers only", 
      bail:true
    },
    isLength: {
      options: { min: 10, max: 10 },
      errorMessage: 'Mobile number should be 10 characters',
      bail:true
    },
    custom: {
        options: async (value) => {
          try {
            const user = await User.findOne({ mobileNumber: value });
            if (user) { 
              throw new Error("mobile number already exists");
            } else {
                return true;
            }
          } catch (e) {
            throw new Error(e.message);
          }
        },
      }
  }


  const roleSchema = {
    notEmpty: {
      errorMessage: "role should not be empty",
      bail: true
    },
    isIn: {
      options: [['driver', 'customer']],
      errorMessage: "Invalid role selection"
    }
  }

const passwordSchema = {
    // notEmpty: notEmptyGenerator("password"),
    notEmpty:{
        errorMessage:'password is required'
      },
    isStrongPassword: {
      errorMessage:
        "password should contain min 8 to max 128 characters with one lowercase , one uppercase, one Number and one Symsbol",
    },
  };

  const loginPasswordSchema = {
    notEmpty: {
      errorMessage: "Password should not be empty"
    }
  }

  const userRegisterValidationSchema={
    username:nameSchema,
    email:emailSchema,
    mobileNumber:mobileNumberSchema,
    role:roleSchema,
    password:passwordSchema 
  }

  const userLoginValidationSchema={
         email:emailLoginSchema,
         password:loginPasswordSchema
  }

  const userUpdateValidation = {
    // firstName: {
    //   notEmpty: {
    //     errorMessage: "First name is required",
    //   }
    // },
    username:{
    notEmpty: {
      errorMessage: "Name should not be empty",
      bail: true
    }
  },
    email: {
      // notEmpty: notEmptyGenerator("Email"),
      // isEmail: {
      //   errorMessage: "invalid email id",
      //   bail: true,
      // },
      notEmpty : {
        errorMessage : 'email is required',
        bail:true
    },
    isEmail : {
        errorMessage : 'Inavlid email format',
        bail:true
    },
      custom: {
        options: async (value, { req }) => {
          try {
            const user = await User.findOne({
              email: value,
              _id: { $ne: req.user.id },
            });
            if (!user) {
              return true;
            } else {
              throw new Error("email already exists");
            }
          } catch (e) {
            throw new Error(e.message);
          }
        },
      },
    },
    mobileNumber: {
     
      isNumeric: {
        errorMessage: "Enter numbers only", 
        bail:true
      },
      isLength: {
        options: { min: 10, max: 10 },
        errorMessage: 'Mobile number should be 10 characters',
        bail:true
      },
      custom: {
        options: async (value, { req }) => {
          try {
            const user = await User.findOne({
              mobileNumber: value,
              _id: { $ne: req.user.id },
            });
            if (!user) {
              return true;
            } else {
              throw new Error("mobile number already exists");
            }
          } catch (e) {
            throw new Error(e.message);
          }
        },
      },
    },
  };

  module.exports={
    registerSchema:userRegisterValidationSchema,
    loginSchema:userLoginValidationSchema,
   userUpdateSchema: userUpdateValidation
}