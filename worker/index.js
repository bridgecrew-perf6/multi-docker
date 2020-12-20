const keys = require('./keys');
const redis = require('redis');

const redisClient = redis.createClient({
  host: keys.redisHost,
  port: keys.redisPort,
  retry_strategy: () => 1000
});

// Set up redis
const sub = redisClient.duplicate();
sub.on('message', setFibValueInRedis.bind(this));
sub.subscribe('insert');

function setFibValueInRedis(channel, message) {
  const fibValue =  fib(parseInt(message));
  redisClient.hset('values', message, fibValue);
}

// fib function
function fib(index) {
  if (index < 2) return 1;
  return fib(index-1) + fib(index-2);
}