const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const bodyParser = require('body-parser');
const redis = require('redis');
const methodOverride = require('method-override');

// Create Redis client
let client = redis.createClient();

client.on('connect', () => {
  console.log('Connected to Redis...');
});

// Set port
const port = 3000;

// Init app
const app = express();

// View Engine
app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

// Body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// method override
app.use(methodOverride('_method'));

// Search Page
app.get('/', function (req, res, next) {
  res.render('searchusers');
});

// Search processing
app.post('/user/search', function (req, res, next) {
  let id = req.body.id;

  client.HGETALL(id, (err, obj) => {
    if (!obj) {
      res.render('searchusers', {
        error: 'User does not exist',
      });
    } else {
      obj.id = id;
      res.render('details', {
        user: obj,
      });
    }
  });
});

// Add user page
app.get('/user/add', function (req, res, next) {
  res.render('adduser');
});

// Add processing
app.post('/user/add', function (req, res, next) {
  const id = req.body.id;
  const first_name = req.body.first_name;
  const second_name = req.body.second_name;
  const email = req.body.email;
  const phone = req.body.phone;

  client.HMSET(
    id,
    [
      'first_name',
      first_name,
      'second_name',
      second_name,
      'email',
      email,
      'phone',
      phone,
    ],
    (err, reply) => {
      if (err) {
        console.log(err);
      }
      console.log(reply);
      res.redirect('/');
    }
  );
});

app.delete('/user/delete/:id', (req, res, next) => {
  // Using params here as id is being sent in the URL...not in the post body
  client.del(req.params.id);
  res.redirect('/');
});

app.listen(port, () => {
  console.log(`Server started on ${port}`);
});
