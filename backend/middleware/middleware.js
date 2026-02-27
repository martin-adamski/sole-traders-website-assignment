const xss = require('xss');

exports.sanitiseInput = (req, res, next) => {
    if (req.body) {
        for (let key in req.body) {
            if (typeof req.body[key] === 'string') {
                req.body[key] = xss(req.body[key]);
            }
        }
    }
    next();
};

exports.verifyApiKey = (req, res, next) => {

    const incomingKey = req.headers['x-api-key'];

    if (!incomingKey || incomingKey !== process.env.API_KEY) {
        return res.status(403).json({
            status: 'error',
            message: 'Forbidden: Invalid API Key'
        });
    }
    next();
};