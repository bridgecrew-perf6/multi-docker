const keys = require('./keys');

// Express App setup
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Postgres Client Setup
const { Pool, Client } = require('pg');
const pgClient = new Client({
  user: keys.pgUser,
  host: keys.pgHost,
  database: keys.pgDatabase,
  password: keys.pgPassword,
  port: keys.pgPort
});
pgClient.on('error', () => console.log('Lost PG connection'));
connectToPGClient(pgClient);

async function connectToPGClient(client) {
  await client.connect(); 
  client
    .query('CREATE TABLE IF NOT EXISTS values (number INT)')
    .catch((err) => console.log(err));
}

// Redis Client Setup
const redis = require('redis');
const redisClient = redis.createClient({
  host: keys.redisHost,
  port: keys.redisPort,
  retry_strategy: () => 1000
});

// redis requires dedicated connections - one for publish, one for listen, etc.
const redisPublisher = redisClient.duplicate();

// Express Rout Handlers
app.get('/', (req, res) => res.send('Hi'));
app.get('/ping', (req, res) => res.send('ponga'));

app.get('/test', (req, res) => {
  console.log({
    user: keys.pgUser,
    host: keys.pgHost,
    database: keys.pgDatabase,
    password: keys.pgPassword,
    port: keys.pgPort
  });
});

app.get('/values/all', async (req, res) => {
  console.log('get all values from postgres');
  const values = await pgClient.query('SELECT * from values')
  console.log('got the values');
  res.send(values.rows);
});

app.get('/values/current', async (req, res) => {
  redisClient.hgetall('values', (err, values) => {
    res.send(values);
  });
});

app.post('/values', async (req, res) => {
  const index = req.body.index;

  if (parseInt(index) > 40) {
    return res.status(422).send('Index too high');
  }
  // set value in redis
  redisClient.hset('values', index, 'Nothing yet!');
  // trigger worker in redis
  redisPublisher.publish('insert',  index);
  // store in postgres
  pgClient.query('INSERT INTO values(number) VALUES($1)', [index]);

  res.send( { working:  true} );
});

app.listen(5000, err => console.log('Listening on port 5000'));