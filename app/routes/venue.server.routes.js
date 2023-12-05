const Venues = require('../controllers/venue.server.controller');


module.exports = function(app){
    app.route('/api/v1/venues')
        .get(Venues.getVenues)
        .post(Venues.postVenues);

    app.route('/api/v1/venues/:id')
        .get(Venues.getIdVenues)
        .patch(Venues.changeDetails);

    app.route('/api/v1/categories')
        .get(Venues.categories);

};
