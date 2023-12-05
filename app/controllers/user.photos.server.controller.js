const Venue = require('../models/venue.server.model');
const User = require('../models/user.server.model');
const UserPhotos = require('../models/user.photos.server.model');
const fs = require("fs");

exports.retrievePhoto = function(req, res){
    let id = req.params.id;
    let xAuth = req.headers["x-authorization"];
    let contentType = req.headers["content-type"];

    User.ifValidId(id, function(ifexist){
    if(ifexist) {
        UserPhotos.getUserPhoto(id, function (photoFilename) {
            if (photoFilename !== null) {
                let extend = photoFilename.split('.')[1];
                if(extend === "png") {
                    fs.readFile('images/' + photoFilename, function (err, data) {
                        res.setHeader("content-type", "image/png");
                        res.status(200).send(data);
                    });
                } else {
                    fs.readFile('images/' + photoFilename, function (err, data) {
                        res.setHeader("content-type", "image/jpeg");
                        res.status(200).send(data);

                    });
                }
            } else {
                res.sendStatus(404);
            }
        });
    } else {
        res.sendStatus(404);
    }
});
};


exports.putPhoto = function(req, res){
    let photo = req.body;
    let id = req.params.id;
    let contentType = req.headers["content-type"];
    let xAuth = req.headers["x-authorization"];

    let extendName = contentType.split("/")[1];

User.ifValidId(id, function(ifValidId) {
    if (ifValidId) {

    User.authCheck(xAuth, function (ifAuth) {

        if (ifAuth) {

            User.checkIfSelf(xAuth, id, function (isSelf) {

                if (isSelf) {
                    UserPhotos.checkProfilePhoto(id, function (havePhoto) {
                        if (havePhoto) {
                            if (extendName === "png") {

                                fs.writeFile('images/' + id + ".png", photo, function (err) {
                                    res.sendStatus(200);
                                    UserPhotos.putPhoto(id, extendName, function () {
                                    });
                                });


                            } else {

                                fs.writeFile('images/' + id + ".jpeg", photo, function (err) {
                                    res.sendStatus(200);
                                    UserPhotos.putPhoto(id, extendName, function () {
                                    });
                                });

                            }

                        } else {
                            if (extendName === "png") {

                                fs.writeFile('images/' + id + ".png", photo, function (err) {
                                    res.sendStatus(201);
                                    UserPhotos.putPhoto(id, extendName, function () {
                                    });
                                });


                            } else {

                                fs.writeFile('images/' + id + ".jpeg", photo, function (err) {
                                    res.sendStatus(201);
                                    UserPhotos.putPhoto(id, extendName, function () {
                                    });
                                });
                            }
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
};


exports.deletePhoto = function(req, res){
    let xAuth = req.headers["x-authorization"];
    let id = req.params.id;

    User.ifValidId(id, function(ifValidId) {
        if (ifValidId) {

            User.authCheck(xAuth, function (ifAuth) {

                if (ifAuth) {

                    User.checkIfSelf(xAuth, id, function (isSelf) {

                        if (isSelf) {
                            UserPhotos.checkProfilePhoto(id, function (havePhoto) {
                                if (havePhoto) {
                                    UserPhotos.deleteProfilePhoto(id, function(){});
                                    res.sendStatus(200);
                                } else {
                                    res.sendStatus(404);
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
};


