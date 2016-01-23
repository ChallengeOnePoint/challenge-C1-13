// server.js

// BASE SETUP
// =============================================================================
// call the packages we need
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');
var fs = require('fs');

fs.readFile('./json/contacts.json', 'utf8', function (err, data) {
    if (err) {
        return console.log(err);
    }

    var data = JSON.parse(data);

    function saveList (callback) {
        fs.writeFile('./json/contacts.json', JSON.stringify(data), function(err) {
            if (err) {
                return console.log(err);
            }

            if (callback) {
                callback(err);
            }
        });
    }
    function getContactIndex (id) {
        var contact, i;

        for (i = 0 ; i <  data.contacts.length; ++i) {
            contact = data.contacts[i];
            if (contact.id = id) {
                return i;
            }
        }

        return null
    }
    function getContact (id) {
        var index = getContactIndex(id);
        return data.contacts[index] || null;
    }

    // configure app to use bodyParser()
    // this will let us get the data from a POST
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());

    var port = process.env.PORT || 8080;        // set our port

    // ROUTES FOR OUR API
    // =============================================================================
    var router = express.Router();              // get an instance of the express Router



    // middleware to use for all requests
    router.use(function(req, res, next) {
        // do logging
        console.log('Something is happening.');
        next(); // make sure we go to the next routes and don't stop here
    });



    // test route to make sure everything is working (accessed at GET http://localhost:8080/api)
    router.get('/', function(req, res) {
        res.json({ message: 'hooray! welcome to our api!' });
    });

    router.route('/contacts')

        .post(function(req, res) {
            contact = req.query;

            contact.id = ++data.lastId;
            data.contacts.push(contact);
            saveList(function () {
                res.json({
                    'success' : true,
                    'id' : data.lastId,
                    'contact' : contact
                });
            });
        })
        .get(function (req, res) {
            res.json({
                'success' : true,
                'list' : data.contacts
            });
        })
        .put(function () {
            var id = req.query.id,
                contact = getContact(req.query.id);

            if (contact != null) {
                contact.firstname = req.query.firstname || contact.firstname;
                contact.lastname = req.query.lastname || contact.lastname;
                contact.postcode = req.query.postcode || contact.postcode;
                contact.street = req.query.street || contact.street;
                contact.city =  req.query.city || contact.city;
                contact.number =  req.query.number || contact.number;

                saveList(function () {
                    res.json({
                        'success' : true,
                        'contact' : contact
                    });
                });
            }
            else {
                res.json({
                    'success' : false,
                    'msg' : 'not found'
                });
            }
        })
        .delete(function () {
            var id = req.query.id,
                index = getContactIndex(req.query.id);

            if (index != null) {
                data.contacts.splice(index, 1);

                saveList(function () {
                    res.json({
                        'success' : true,
                        'contact' : contact
                    });
                });
            }
            else {
                res.json({
                    'success' : false,
                    'msg' : 'not found'
                });
            }
        });


    // REGISTER OUR ROUTES -------------------------------
    // all of our routes will be prefixed with /api
    app.use('/api', router);

    // START THE SERVER
    // =============================================================================
    app.listen(port);
    console.log('Magic happens on port ' + port);


});
