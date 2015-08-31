Bloomy is a Node ExpressJS app that maintains a bloomfilter server side, and spits out the properties of 
the bloom filter on an endpoint, allowing the bloom filter to be reconsructed elsewhere (e.g., on the client side).

Items are added to the server-side bloom filter through an Amazon SQS queue.

#Use cases#
- Username uniqueness validation without the need to do round trip to the server each time the user enters a new username.

#Setup/running#
Set the environmental variables listed below then run `npm start`, then go to `localhost:3000` in your browser. Add items to the amazon SQS queue.

#Environment Variables#
- CORS_ORIGIN            # Allowed origins. Comma delimited.
- REDIS_KEY              # Key in redis the items are stored.
- QUEUE_URL              # Amazon SQS queue url. 
- AWS_ACCESS_KEY_ID      # Credentials allowing queue access.
- AWS_SECRET_ACCESS_KEY  # Credentials allowing queue access.

#Usage (client-side)#
First make sure `public/javascripts/BloomFilter.js` is added to your browser app.

```
// popuating the client-side bloom filter
getBloomy().then(function(response) {
    bloomFilter = new BloomFilter({capacity: response.capacity});
    bloomFilter.filter = response.filter;
    bloomFilter.salts = response.salts;
});
// using the client side bloom filter
bloomFilter.check(value) // true or false
```

#Caveats#
- Bloomy was written from perspective of adding items to the SQS queue from a decoupled python app - using Boto, no less. For this reason Bloomy assumes messages are encoeded as base64.
- Bloomy wont really do anything useful unless you add items to the SQS queue :)
- Assumes you won't need more than 10,000 items in the bloom filter. This will eventually be resolved by using a scalable bloom fitler.
- Once an item is added to the bloom filter it cannot be removed without restating the app and removing the entry from redis. This can be resolved by using a Cuckoo Filter.

#Credits
I found `public/javascripts/BloomFilter.js` from [here](http://la.ma.la/misc/js/bloomfilter/bloomfilter.js)