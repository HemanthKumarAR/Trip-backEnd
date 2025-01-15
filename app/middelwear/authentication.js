const jwt=require('jsonwebtoken')
const authenticUser=(req,res,next)=>{
    const token=req.headers['authorization'] 
    // const token='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1YmI1ZDU5MTQ3Nzk3YmM1OGI5NTk3MiIsInJvbGUiOiJjdXN0b21lciIsImlhdCI6MTcwODk0MjE0NSwiZXhwIjoxNzEwMTUxNzQ1fQ.7IW7xKysSnm2uvbDMdmc9JVhVzKkwZRFzs6AhAayXIQ'
    // console.log(token)
    if( !token){

        return res.status(400).json({error:'JWT is missing'})
      }
      try{
        const tokenData= jwt.verify(token,process.env.JWT_SECRET)
        // console.log(tokenData)
        // res.json({token:token,data:tokenData}) process.env.JWT_SECRET
        req.user={id:tokenData.id,
                  role:tokenData.role   
                 }
                // console.log(req.user)
         next()
    }catch(e){
        res.status(500).json(e)
    }
}

const authorizeUser = (roles) => {
    return (req, res, next) => {
        if(roles.includes(req.user.role)) {
            next()
        } else {
          res.status(403).json({ error: 'you are not authorized'})
        }
    }
}

module.exports={
    authenticateUser:authenticUser,
    authorizeUser:authorizeUser
}