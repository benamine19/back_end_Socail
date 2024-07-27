const jwt = require('jsonwebtoken');
require('dotenv').config();

const verifyToken = (req, res, next) => {
    const token = req.headers.token;
    if (!token) {
        return res.status(401).send({ message: 'Access Denied. No token provided.' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        req.user = decoded; // Ajouter l'utilisateur décodé à la requête
        next(); // Continuer le traitement de la requête
    } catch (error) {
        res.status(400).send({ message: 'Invalid Token.' });
    }
};

function verifyTokenandauthoraization(req,res,next) {
    verifyToken(req,res,()=>{
        if(req.params.id === req.user._id){
            next()
        }else{
        return res.status(403).send({ message: 'you are not allowed'});
        }
    })
}
function verifyTokenandauthoraizationTaches(req,res,next) {
    verifyToken(req,res,()=>{
        if(req.body.user === req.user._id){
            next()
        }else{
        return res.status(403).send({ message: 'you are not allowed'});
        }
    })
}







module.exports = {
    verifyToken,
    verifyTokenandauthoraization,
    verifyTokenandauthoraizationTaches

}