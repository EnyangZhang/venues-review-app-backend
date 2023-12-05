const express = require('express');
const bodyParser = require('body-parser');

const allowCrossOriginRequests = function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, X-Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
    next();
};

module.exports = function () {
    const app = express();
    app.rootUrl = '/api/v1';

    // MIDDLEWARE
    app.use(allowCrossOriginRequests);
    app.use(bodyParser.json());
    app.use(bodyParser.raw({ type: 'text/plain' }));  // for the /executeSql endpoint
    app.use(bodyParser.raw({ type: 'image/png', limit:"12mb"}));
    app.use(bodyParser.raw({ type: 'image/jpeg', limit:"12mb"}));

    // ROUTES
    require('../app/routes/backdoor.routes')(app);

    require('../app/routes/user.server.routes')(app);

    require('../app/routes/user.photos.server.routes')(app);

    require('../app/routes/venue.server.routes')(app);

    require('../app/routes/venue.photos.server.routes')(app);

    require('../app/routes/reviews.server.routes')(app);


    // DEBUG (you can remove this)
    app.get('/', function (req, res) {
        res.send({ 'message': 'Hello World!' })
    });

    return app;
};
