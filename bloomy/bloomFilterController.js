var redisKey = process.env.REDIS_KEY;
var queueUrl = process.env.QUEUE_URL;
var bloomCapacity = 10000;
var filters = require('./public/javascripts/BloomFilter');
var bloomFilter = new filters.BloomFilter({capacity: bloomCapacity});
var redis = require("redis");
var Consumer = require('sqs-consumer');
var sqsConsumer = Consumer.create({
    region: 'eu-west-1',
    queueUrl: queueUrl,
    handleMessage: handleMessage
});

var redisClient = redis.createClient();


/**
 * Retrieve items from redis and add them to the bloom filter.
 * Retreives items from redis and adds them to bloom filter too.
 */
function bootstrap() {
    sqsConsumer.start();
    populateFromRedis();
}


/**
 * Pull values from redis and add them to the bloom filter. We use
 * redis to "remember" the bloom filter contents after the app has
 * been restarted.
 */
function populateFromRedis() {
    redisClient.smembers(redisKey, function(err, values) {
        if (err) {
            return console.log(err);
        }
        values.forEach(function(value) {
            bloomFilter.add(value);
        });
    });
}

/**
 * Adds item to bloom filter then deletes the message.
 * @param  {Error} err
 * @param  {Function} done
 */
function handleMessage(message, done) {
    // assume using python's boto library to add item to the queue - which
    // encodes the message body as base64.
    var item = new Buffer(message.Body, 'base64').toString();
    bloomFilter.add(item);
    redisClient.sadd(redisKey, item);
    done();
}


/**
 * Export properties of bloom filter that can be used by another bloom filter
 * instance to "duplicate" the behaviour of this bloom filter. 
 * @return {string}
 */
function toJSON() {
    return JSON.stringify({
        filter: bloomFilter.filter,
        salts: bloomFilter.salts,
        capacity: bloomCapacity
    });
}


module.exports = {
    toJSON: toJSON,
    bootstrap: bootstrap
};