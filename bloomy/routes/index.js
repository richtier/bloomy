var corsOrigin = process.env.CORS_ORIGIN;
var cors = require('cors');
var express = require('express');
var router = express.Router();
var bloomFilterController = require('./../bloomFilterController');
var corsOptions = {
    origin: corsOrigin.split(','),
    credentials: true
};

router.route('/')
    .get(cors(corsOptions), ExportView)
    .options(cors(corsOptions));  // for pre-flight


/**
 * Render the bloom filter's `filter` as JSON.
 * @param {Object}   req
 * @param {Object}   res
 * @param {Function} next
 */
function ExportView(req, res, next) {
    res.send(bloomFilterController.toJSON());
}


module.exports = router;
