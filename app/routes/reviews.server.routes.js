const Reviews = require('../controllers/reviews.server.controller');

module.exports = function(app){
    app.route('/api/v1/venues/:id/reviews')
        .get(Reviews.getReview)
        .post(Reviews.postReview);

    app.route('/api/v1/users/:id/reviews')
        .get(Reviews.getUser);

};
