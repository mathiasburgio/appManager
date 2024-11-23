const rateLimit = require("express-rate-limit");

const checkSpam = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
	limit: 5, 
    message: 'Demaciados intentos. Intenta nuevamente en unos minutos.',
	standardHeaders: 'draft-7', 
	legacyHeaders: false,
});

const checkUser = (req, res, next) => {
    if(req?.session?.data?.email !== process.env.EMAIL_SUPER_ADMIN) return res.status(401).send("Usted no es el super-admin.");
    next();
}

module.exports = {
    checkSpam,
    checkUser
}