const Venue = require('../models/venue.server.model');
const User = require('../models/user.server.model');
const DateFormat = require("dateformat");
const haversine = require("haversine");

exports.categories = function(req, res){

    Venue.getCate(function (allCate) {
        let newCate = allCate;
        let length = newCate.length;
        for (var i = 0; i < length; i ++){
            newCate[i]["categoryId"] = newCate[i]["category_id"];
            newCate[i]["categoryName"] = newCate[i]["category_name"];
            newCate[i]["categoryDescription"] = newCate[i]["category_description"];
            delete newCate[i].category_id;
            delete newCate[i].category_name;
            delete newCate[i].category_description;
        }
        res.status(200).send(newCate);
    });
};


exports.getVenues = function(req,res) {
    let count = req.query.count;
    let startIndex = req.query.startIndex;
    let categoryId = req.query.categoryId;
    let maxCostRating = req.query.maxCostRating;
    let adminId = req.query.adminId;
    let q = req.query.q;
    let city = req.query.city;
    let minStarRating = req.query.minStarRating;
    let sort = req.query.sortBy;
    let reverseSort = req.query.reverseSort;
    let myLatitude = req.query.myLatitude;
    let myLongitude = req.query.myLongitude;
    let allQuery = req.query;
    let len = Object.keys(allQuery).length;
    let code = 200;
    let order;
    let sortBy;
    if(len !== 0) {

        if(q !== undefined) {
            if(reverseSort !== "true"){
                if(sort === "COST_RATING"){
                    sortBy =  "modeCostRating";
                    order = "ASC";
                } else{
                    sortBy = "meanStarRating";
                    order = "DESC"
                }
            } else {
                if(sort === "COST_RATING"){
                    sortBy =  "modeCostRating";
                    order = "DESC";
                } else{
                    sortBy = "meanStarRating";
                    order = "ASC"
                }
            }
            Venue.getQBaseVenues(q, sortBy, order, function (basicData) {
                if (startIndex !== undefined) {
                    basicData.splice(0, startIndex);
                }

                if (count !== undefined) {
                    basicData.splice(count);
                }

                if (categoryId !== undefined) {
                    var i;
                    var list = [];
                    for (i = 0; i < basicData.length; i++) {
                        if (basicData[i].categoryId == categoryId) {
                            list.push(basicData[i]);
                        }
                    }
                    basicData = list;
                }

                if (minStarRating !== undefined && minStarRating <= 5 && minStarRating >= 0) {
                    var i;
                    var list = [];
                    for (i = 0; i < basicData.length; i++) {
                        if (basicData[i].meanStarRating >= minStarRating) {
                            list.push(basicData[i]);
                        }
                    }
                    basicData = list;
                } else if (minStarRating > 5 || minStarRating < 0) {
                    code = 400
                }

                if(city !== undefined) {
                    var i;
                    var list = [];
                    for (i = 0; i < basicData.length; i++) {
                        if (basicData[i].city === city) {
                            list.push(basicData[i]);
                        }
                    }
                    basicData = list;
                }

                if (maxCostRating !== undefined && maxCostRating <= 5 && maxCostRating >= 0) {
                    var i;
                    var list = [];
                    for (i = 0; i < basicData.length; i++) {
                        if (basicData[i].modeCostRating <= maxCostRating) {
                            list.push(basicData[i]);
                        }
                    }
                    basicData = list;
                } else if (maxCostRating > 5 || maxCostRating < 0) {
                    code = 400
                }

                if(myLongitude !== undefined && myLatitude !== undefined){
                    for(item of basicData) {
                        let latitude = item.latitude;
                        let longitude = item.longitude;

                        var R = 6371e3; // metres
                        var φ1 = myLatitude* Math.PI / 180;
                        var φ2 = latitude* Math.PI / 180;
                        var Δφ = (latitude - myLatitude)* Math.PI / 180;
                        var Δλ = (longitude - myLongitude)* Math.PI / 180;

                        var a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                            Math.cos(φ1) * Math.cos(φ2) *
                            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
                        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

                        var d = R * c;
                        let distance = d;
                        item.distance = distance;
                    }
                }

                if(sort === "DISTANCE"){
                    if(myLongitude !== undefined && myLatitude !== undefined) {
                        if(reverseSort !== "true"){
                            basicData.sort((item1, item2) => (item1.distance > item2.distance) ? 1 : -1);
                        } else {
                            basicData.sort((item1, item2) => (item1.distance > item2.distance) ? -1 : 1);
                        }
                    } else {
                        code = 400;
                    }
                }

                if (code === 200) {
                    if(adminId !== undefined){
                        Venue.getAdminVenues(adminId, function (adminVid) {
                            var i;
                            var list = [];
                            for (i = 0; i < basicData.length; i++) {
                                for(item of adminVid) {
                                    if (basicData[i].venueId == item["venue_id"]) {
                                        list.push(basicData[i]);
                                    }
                                }
                            }
                            basicData = list;


                            res.status(200).send(basicData);
                        });
                    } else {
                        res.status(200).send(basicData);
                    }
                } else {
                    res.sendStatus(400);
                }
            });


        } else {
    if(reverseSort !== "true"){
            if(sort === "COST_RATING"){
                sortBy =  "modeCostRating";
                order = "ASC";
            } else{
                sortBy = "meanStarRating";
                order = "DESC"
            }
    } else {
        if(sort === "COST_RATING"){
            sortBy =  "modeCostRating";
            order = "DESC";
        } else{
            sortBy = "meanStarRating";
            order = "ASC"
        }
    }
            Venue.getBaseVenues(sortBy, order,  function (basicData) {
                if (startIndex !== undefined) {
                    basicData.splice(0, startIndex);
                }

                if (count !== undefined) {
                    basicData.splice(count);
                }

                if (categoryId !== undefined) {
                    var i;
                    var list = [];
                    for (i = 0; i < basicData.length; i++) {
                        if (basicData[i].categoryId == categoryId) {
                            list.push(basicData[i]);
                        }
                    }
                    basicData = list;
                }

                if (minStarRating !== undefined && minStarRating <= 5 && minStarRating >= 0) {
                    var i;
                    var list = [];
                    for (i = 0; i < basicData.length; i++) {
                        if (basicData[i].meanStarRating >= minStarRating) {
                            list.push(basicData[i]);
                        }
                    }
                    basicData = list;

                } else if (minStarRating > 5 || minStarRating < 0) {
                    code = 400
                }

                if(city !== undefined) {
                    var i;
                    var list = [];
                    for (i = 0; i < basicData.length; i++) {
                        if (basicData[i].city === city) {
                            list.push(basicData[i]);
                        }
                    }
                    basicData = list;
                }

                if (maxCostRating !== undefined && maxCostRating <= 5 && maxCostRating >= 0) {
                    var i;
                    var list = [];
                    for (i = 0; i < basicData.length; i++) {
                        if (basicData[i].modeCostRating <= maxCostRating) {
                            list.push(basicData[i]);
                        }
                    }
                    basicData = list;
                } else if (maxCostRating > 5 || maxCostRating < 0) {
                    code = 400
                }

                if(myLongitude !== undefined && myLatitude !== undefined){
                    for(item of basicData) {
                       let latitude = item.latitude;
                       let longitude = item.longitude;

                       var R = 6371e3; // metres
                       var φ1 = myLatitude* Math.PI / 180;
                       var φ2 = latitude* Math.PI / 180;
                       var Δφ = (latitude - myLatitude)* Math.PI / 180;
                       var Δλ = (longitude - myLongitude)* Math.PI / 180;

                       var a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                           Math.cos(φ1) * Math.cos(φ2) *
                           Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
                       var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

                       var d = R * c;
                       let distance = d;
                    item.distance = distance;
                   }
                }

                if(sort === "DISTANCE"){
                    if(myLongitude !== undefined && myLatitude !== undefined) {
                        if(reverseSort !== "true"){
                            basicData.sort((item1, item2) => (item1.distance > item2.distance) ? 1 : -1);
                        } else {
                            basicData.sort((item1, item2) => (item1.distance > item2.distance) ? -1 : 1);
                        }
                    } else {
                        code = 400;
                    }
                }

                if (code === 200) {
                    if(adminId !== undefined){
                        Venue.getAdminVenues(adminId, function (adminVid) {
                            var i;
                            var list = [];
                            for (i = 0; i < basicData.length; i++) {
                                for(item of adminVid) {
                                    if (basicData[i].venueId == item["venue_id"]) {
                                        list.push(basicData[i]);
                                    }
                                }
                            }
                            basicData = list;
                                res.status(200).send(basicData);
                        });
                    } else {
                        res.status(200).send(basicData);
                    }
                } else {
                    res.sendStatus(400);
                }
            });
        }

    } else {

            sortBy = "meanStarRating";
            order = "DESC";

        Venue.getBaseVenues(sortBy, order, function (basicData) {
            res.status(200).send(basicData);
        });
    }
};


exports.postVenues = function(req, res){
    let venueName = req.body.venueName;
    let categoryId = req.body.categoryId;
    let city = req.body.city;
    let shortDescription = req.body.shortDescription;
    let longDescription = req.body.longDescription;
    let address = req.body.address;
    let latitude = req.body.latitude;
    let longitude = req.body.longitude;
    let xAuth = req.headers["x-authorization"];
    let now = new Date();
    let currDate = DateFormat(now, "yyyy-mm-dd");

    User.authCheck(xAuth, function (ifAuth) {
        if(ifAuth) {
            Venue.cateIdCheck(categoryId, function(ifCidValid){

            if(ifCidValid) {
                let code = 201;

                if (city === undefined) {
                    code = 400
                }

                if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
                    code = 400
                }

            if(code === 201){

                User.getUserIdAuth(xAuth, function(userId){
                let item = [[userId[0].user_id], [categoryId], [venueName],  [city], [shortDescription], [longDescription] ,[currDate],[address],[latitude],[longitude]];
                Venue.postVenue(item, function(err){
                    let a = err;
                    Venue.getVenueId(function(venueId){
                        res.status(code).send({"venueId" : venueId[0]["MAX(venue_id)"]});
                    });
                 });
                });


            } else {
                res.sendStatus(code);
            }

            } else {
                res.sendStatus(400);
            }
            });

        } else {
            res.sendStatus(401);
        }
    });
};


exports.getIdVenues = function(req, res){
    let venueId = req.params.id;


    Venue.getIdVenues(venueId, function(idVenue){

        if(idVenue !== undefined) {
            let userId = idVenue.admin;
            let cateId = idVenue.category;
            User.getUsername(userId, function (username) {
                Venue.getIdCate(cateId, function (cateTable) {
                    Venue.getPhotos(venueId, function (photos) {


                        let categoryName = cateTable["category_name"];
                        let categoryDescription = cateTable["category_description"];

                        idVenue.admin = {
                            "userId": userId,
                            "username": username
                        };

                        idVenue.category = {
                            "categoryId": cateId,
                            "categoryName": categoryName,
                            "categoryDescription": categoryDescription
                        };

                        idVenue.photos = photos;


                        res.status(200).send(idVenue);
                    });
                });
            });
        } else {
            res.sendStatus(404);
        }
    });
};


exports.changeDetails = function(req, res){
    let venueId = req.params.id;
    let xAuth = req.headers["x-authorization"];
    let venueName = req.body.venueName;
    let categoryId = req.body.categoryId;
    let city = req.body.city;
    let shortDescription = req.body.shortDescription;
    let longDescription = req.body.longDescription;
    let address = req.body.address;
    let latitude = req.body.latitude;
    let longitude = req.body.longitude;
    let table = req.body;
    Venue.venueCheck(venueId, function(ifVenueinDb){
    if(ifVenueinDb) {
        Venue.getAdminId(venueId, function (adminId) {
            User.authCheck(xAuth, function (ifAuth) {
                if (ifAuth) {
                    User.checkIfSelf(xAuth, adminId, function (ifSameUser) {
                        if (ifSameUser) {
                            if (venueName !== undefined || categoryId !== undefined ||
                                city !== undefined || shortDescription !== undefined ||
                                longDescription !== undefined || address !== undefined
                                || latitude !== undefined || longitude !== undefined) {


                                Venue.getIdVenues(venueId,function(baseVenue){



                                    if (venueName === undefined) {
                                        venueName = baseVenue.venueName;
                                    }


                                    if (categoryId === undefined) {
                                        categoryId = baseVenue.category;
                                    }

                                    if (city === undefined) {
                                        city = baseVenue.city;
                                    }

                                    if (shortDescription === undefined) {
                                        shortDescription = baseVenue.shortDescription;
                                    }

                                    if (longDescription === undefined) {
                                        longDescription = baseVenue.longDescription;
                                    }

                                    if (address === undefined) {
                                        address = baseVenue.address;
                                    }

                                    if (latitude === undefined) {
                                        latitude = baseVenue.latitude;
                                    }

                                    if (longitude === undefined) {
                                        longitude = baseVenue.longitude;
                                    }

                                Venue.updateVenue(venueName, categoryId, city, shortDescription, longDescription,
                                    address, latitude, longitude, venueId, function(){
                                    });
                                    res.sendStatus(200);
                                });

                            } else {
                                res.sendStatus(400);

                            }
                        } else {
                            res.sendStatus(403);
                        }

                    });

                } else {
                    res.sendStatus(401);
                }
            });
        });
    } else {
        res.sendStatus(404);
    }
});
};


