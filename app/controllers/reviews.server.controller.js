const Venue = require('../models/venue.server.model');
const User = require('../models/user.server.model');
const UserPhotos = require('../models/user.photos.server.model');
const VenuePhotos = require('../models/venue.photos.server.model');
const Reviews = require('../models/reviews.server.model');
const DateFormat = require("dateformat");


exports.getReview = function(req, res){
    let venueId = req.params.id;
    let xAuth = req.headers["x-authorization"];

    Reviews.reviewVenueCheck(venueId, function(isVenue){
        if(isVenue){
            Reviews.getReview(venueId, function(reviewTable){
                let list = [];
                for (item of reviewTable){
                    let userId = item.reviewAuthor;
                    let userName = item.username;
                    item.reviewAuthor = {
                           "userId": userId,
                           "username": userName
                       };
                    delete item.username;
                    list.push(item);

                }
                res.status(200).send(list);
            });

        } else {
            res.sendStatus(404);
        }
    });
};


exports.postReview = function(req, res){
    let venueId = req.params.id;
    let xAuth = req.headers["x-authorization"];
    let reviewBody = req.body.reviewBody;
    let starRating = req.body.starRating;
    let costRating = req.body.costRating;
    let now = new Date();
    let currDate = DateFormat(now, "yyyy-mm-dd HH:MM:SSZ");

            User.authCheck(xAuth, function (ifAuth) {
                if (ifAuth) {
                User.getUserIdAuth(xAuth, function(userId){
                    Venue.venueCheck(venueId, function(inDb){
                    if(inDb) {
                        Reviews.ifOwnedVenue(venueId, userId[0].user_id, function (ownVenue) {
                            if (!ownVenue) {
                                Reviews.ifReviewed(venueId, userId[0].user_id, function (reviewed) {
                                    if (!reviewed) {
                                        if (starRating === undefined || starRating > 5 || starRating - Math.floor(starRating)
                                            !== 0 || starRating < 0 || costRating < 0 || costRating > 5 || costRating -
                                            Math.floor(costRating) || costRating === undefined) {
                                            res.sendStatus(400);

                                        } else {
                                            Reviews.putReview(venueId, userId[0].user_id, reviewBody, starRating, costRating, currDate, function () {
                                            });

                                            res.sendStatus(201);
                                        }
                                    } else {
                                        res.sendStatus(403)
                                    }
                                });
                            } else {
                                res.sendStatus(403);
                            }
                        });
                    } else {

                        res.sendStatus(404)
                    }
                });
                });
                } else {
                    res.sendStatus(401);
                }
            });
};


exports.getUser = function(req, res){
    let xAuth = req.headers["x-authorization"];
    let userId = req.params.id;

    User.authCheck(xAuth, function (ifAuth) {
        if (ifAuth) {
        Reviews.ifIdExist(userId, function(idExist) {
                if(idExist){
                    Reviews.getReviewUser(userId, function(ReviewUserTable){
                        let list = [];
                        for(item of ReviewUserTable){
                            if (item.is_primary === 1 || item.is_primary === null){
                                let reviewAuthor = item.reviewAuthor;
                                let username = item.username;
                                let reviewBody = item.reviewBody;
                                let starRating = item.starRating;
                                let costRating = item.costRating;
                                let timePosted = item.timePosted;
                                let venue_id = item.venue_id;
                                let category_name = item.category_name;
                                let venue_name = item.venue_name;
                                let city = item.city;
                                let short_description = item.short_description;
                                let photo_filename = item.photo_filename;
                                let is_primary = item.is_primary;
                                item.reviewAuthor = {
                                    "userId": reviewAuthor,
                                    "username": username
                                };
                                delete item.username;
                                item["venue"] = {
                                    "venueId": venue_id,
                                    "venueName": venue_name,
                                    "categoryName": category_name,
                                    "city": city,
                                    "shortDescription": short_description,
                                    "primaryPhoto": photo_filename
                                };
                                delete item.venue_id;
                                delete item.category_name;
                                delete item.venue_name;
                                delete item.city;
                                delete item.short_description;
                                delete item.photo_filename;
                                delete item.is_primary;
                                list.push(item);
                            }
                        }

                    res.status(200).send(list);
                    });
                } else {
                    res.sendStatus(404)
                }
        });
        } else {
            res.sendStatus(401);
        }
    });
};