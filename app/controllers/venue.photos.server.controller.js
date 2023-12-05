const Venue = require('../models/venue.server.model');
const User = require('../models/user.server.model');
const UserPhotos = require('../models/user.photos.server.model');
const VenuePhotos = require('../models/venue.photos.server.model');
const multer = require("multer");
const fs = require("fs");

var storage = multer.diskStorage({

    destination: function (req, file, cb) {
        cb(null, 'photos/')
    },

    filename: function (req, file, cb) {
        var fileFormat = (file.originalname).split(".");
        cb(null, file.fieldname + '-' + Date.now() + "." + fileFormat[fileFormat.length - 1]);
    }
});

var upload = multer({
    storage: storage
}).single("photo");


exports.postPhoto = function(req, res){
    let xAuth = req.headers["x-authorization"];
    let venueId = req.params.id;

    Venue.venueCheck(venueId, function(VenueinDb){
        if(VenueinDb) {
            Venue.getAdminId(venueId, function(id){
        User.ifValidId(id, function(ifValidId) {
            if (ifValidId) {

                User.authCheck(xAuth, function (ifAuth) {

                    if (ifAuth) {

                        User.checkIfSelf(xAuth, id, function (isSelf) {

                            if (isSelf) {
                                upload(req, res, function(err){
                                   let photoName = req.file.filename;
                                   let desc = req.body.description;
                                   let primary = req.body.makePrimary;
                                   let type = req.file.mimetype.split('/')[1];

                                    if(desc === undefined){
                                        res.sendStatus(400);
                                    } else if (primary !== "false" && primary !== "true"){
                                        res.sendStatus(400);
                                    } else {
                                        VenuePhotos.primaryCheck(venueId, function(havePrimary){
                                        if(havePrimary){
                                            if(primary === "false"){
                                                VenuePhotos.postPhoto(venueId, photoName, desc,0,  function(){});
                                                res.sendStatus(201);
                                            }else{
                                                VenuePhotos.setNoPrimary( venueId, function(err){

                                                    VenuePhotos.postPhoto(venueId, photoName, desc,1,  function(){});
                                                });
                                                res.sendStatus(201);
                                            }
                                        }else{
                                            VenuePhotos.postPhoto(venueId, photoName, desc,1,  function(){});
                                            res.sendStatus(201);
                                        }
                                        });
                                    }
                                });
                            } else {
                                res.sendStatus(403);
                            }
                        });
                    } else {
                        res.sendStatus(401);
                    }
                });
            } else {
                res.sendStatus(404);
            }
        });
    });
    }else {
        res.sendStatus(404);

    }
});
};


exports.getPhoto = function(req, res){
    let venueId = req.params.id;
    let photoFilename = req.params.photoFilename;
    let xAuth = req.headers["x-authorization"];

    Venue.venueCheck(venueId, function(VenueinDb){
        if(VenueinDb) {

            VenuePhotos.photoCheck(photoFilename, venueId, function(existPhoto){

                if(existPhoto){


                let extend = photoFilename.split('.')[1];
                if(extend === "png") {
                    fs.readFile('photos/' + photoFilename, function (err, data) {
                        res.setHeader("content-type", "image/png");
                        res.status(200).send(data);
                    });
                } else {
                    fs.readFile('photos/' + photoFilename, function (err, data) {
                        res.setHeader("content-type", "image/jpeg");
                        res.status(200).send(data);

                    });
                }
                } else {
                    res.sendStatus(404);
                }
            });
        }else {
            res.sendStatus(404);

        }
    });
};


exports.deletePhoto = function(req, res){
    let xAuth = req.headers["x-authorization"];
    let venueId = req.params.id;
    let photoFilename = req.params.photoFilename;

    Venue.venueCheck(venueId, function(VenueinDb){
        if(VenueinDb) {

            VenuePhotos.photoCheck(photoFilename, venueId, function(existPhoto){
                if(existPhoto){
            Venue.getAdminId(venueId, function(id){
                User.ifValidId(id, function(ifValidId) {
                    if (ifValidId) {

                        User.authCheck(xAuth, function (ifAuth) {

                            if (ifAuth) {

                                User.checkIfSelf(xAuth, id, function (isSelf) {

                                    if (isSelf) {


                                        VenuePhotos.deletePhoto(venueId, photoFilename ,function(){});
                                        VenuePhotos.primaryCheck(venueId, function(havePrimary){
                                            if (!havePrimary){
                                                VenuePhotos.setNextPrimary(venueId, function(){});
                                            }
                                        });
                                        res.sendStatus(200);

                                    } else {
                                        res.sendStatus(403);
                                    }
                                });
                            } else {
                                res.sendStatus(401);
                            }
                        });
                    } else {
                        res.sendStatus(404);
                    }
                });
            });

        } else {
            res.sendStatus(404);
        }
    });
        }else {
            res.sendStatus(404);

        }
    });
};


exports.setPrimary = function(req, res){
    let xAuth = req.headers["x-authorization"];
    let venueId = req.params.id;
    let photoFilename = req.params.photoFilename;

    Venue.venueCheck(venueId, function(VenueinDb){
        if(VenueinDb) {

            VenuePhotos.photoCheck(photoFilename, venueId, function(existPhoto){
                if(existPhoto){
                    Venue.getAdminId(venueId, function(id){
                        User.ifValidId(id, function(ifValidId) {
                            if (ifValidId) {

                                User.authCheck(xAuth, function (ifAuth) {

                                    if (ifAuth) {

                                        User.checkIfSelf(xAuth, id, function (isSelf) {

                                            if (isSelf) {

                                                VenuePhotos.setPrimary(venueId, photoFilename, function(){});
                                                VenuePhotos.setOtherPrimaryZero(venueId, photoFilename, function(){});


                                                res.sendStatus(200);
                                            } else {
                                                res.sendStatus(403);
                                            }
                                        });
                                    } else {
                                        res.sendStatus(401);
                                    }
                                });
                            } else {
                                res.sendStatus(404);
                            }
                        });
                    });

                } else {
                    res.sendStatus(404);
                }
            });
        }else {
            res.sendStatus(404);
        }
    });
};

