const jwt = require("jsonwebtoken");

const authMiddleware=((req,res,next)=>{
const authHeader = req.headers['authorization'];
const token = authHeader && authHeader.split(' ')[1];
if(!token)
  return res.status(401).json({message:"Unauthorized- No token"});
try{
const decoded=jwt.verify(token,process.env.JWT_SECRET_KEY);
req.user=decoded;
next();
}catch(err){
  res.status(401).json({message:"Unauthorized - Invalid token"});
}
})

module.exports = authMiddleware;
