const db = require('../../config/db');

exports.reviewVenueCheck = function(venueId, done){
  db.getPool().query("select * from Review where reviewed_venue_id = ?", venueId, function(err, result){
      let isVenue = result[0] !== undefined;
      done(isVenue);
  });
};

exports.getReview = function(venueId, done){
    db.getPool().query("select User.username, review_author_id as reviewAuthor, " +
        "review_body as reviewBody, star_rating as starRating, " +
        "cost_rating as costRating, time_posted as timePosted from Review LEFT JOIN User on User.user_id = Review.review_author_id" +
        " where reviewed_venue_id = ? order by time_posted DESC", venueId, function(err, result){
        done(result);
    });
};

exports.ifOwnedVenue = function(venueId, userId, done){
    db.getPool().query("select admin_id from Venue where venue_id = ?", venueId, function(err, adminId){
        let ownVenue = adminId[0].admin_id === userId;
       done(ownVenue);
    });
};


exports.ifReviewed = function(venueId, userId, done){
    db.getPool().query("select * from Review where reviewed_venue_id = ? and review_author_id = ?", [venueId,userId], function(err, result){
        let reviewed = result[0] !== undefined;
        done(reviewed);
    })
};

exports.putReview = function(venueId, userId, reviewBody, starRating, costRating,currDate, done){
    db.getPool().query("INSERT INTO Review (reviewed_venue_id, review_author_id, " +
        "review_body,star_rating, cost_rating, time_posted) VALUES (?, ?, ?, ?, ?, ?)", [venueId,
        userId, reviewBody, starRating, costRating, currDate], function(err){

    })
};


exports.ifIdExist = function(userId, done){
    db.getPool().query("select * from Review where review_author_id = ?", userId, function(err,result){
        let idExist = result[0] !== undefined;
       done(idExist);
    });
};

exports.getReviewUser = function(userId, done){
  db.getPool().query("select Review.review_author_id as reviewAuthor, User.username, Review.review_body as reviewBody," +
      " Review.star_rating as starRating, Review.cost_rating as costRating, time_posted as timePosted, Venue.venue_id, " +
      "VenueCategory.category_name, Venue.venue_name, Venue.city,Venue.short_description, VenuePhoto.photo_filename," +
      " VenuePhoto.is_primary from (((Review LEFT JOIN User on Review.review_author_id = User.user_id) LEFT JOIN Venue " +
      "ON Review.reviewed_venue_id = Venue.venue_id) left JOIN VenueCategory on VenueCategory.category_id = Venue.category_id)" +
      " LEFT JOIN VenuePhoto on Venue.venue_id = VenuePhoto.venue_id where Review.review_author_id = ?", userId, function(err ,ReviewUserTable){
      done(ReviewUserTable);
  });
};

