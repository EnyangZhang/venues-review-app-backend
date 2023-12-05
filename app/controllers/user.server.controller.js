const User = require('../models/user.server.model');
const Venue = require('../models/venue.server.model');
const Reviews = require('../models/reviews.server.model');

exports.register = function(req, res){
    let user_data = {
        "username" :req.body.username,
        "email": req.body.email,
        "givenName": req.body.givenName,
        "familyName": req.body.familyName,
        "password": req.body.password
    };
    let username = user_data['username'];
    let email = user_data['email'];
    let givenname = user_data['givenName'];
    let familyname = user_data['familyName'];
    let password = user_data['password'];
    let values = [[username], [email], [givenname], [familyname], [password]];

    let dup = 201;

    if (password === ""){
        dup = 400;
    }

    if (!/[^\s@]+@[^\s@]+\.[^\s@]+/.test(email)){
        dup = 400;
    }

    User.getAllUsername(function(usernames){
        var length = usernames.length;
        for (var i = 0; i < length; i++) {
            if (usernames[i]["username"] === username) {
                dup = 400;
                break
            }
        }
    });

    User.getAllEmail(function(emails)
    {
        var length = emails.length;
        for (var i = 0; i < length; i++) {
            if (emails[i]["email"] === email) {
                dup = 400;
                break
            }
        }

    });

    if (user_data['username'] === undefined) {
        res.sendStatus(400);

    } else if(dup === 201) {
        User.insert(values, function (state) {
            User.getUserId(username, function (userId) {

                 if (dup === 201 && state === 201)  {
                    res.status(201).send({"userId": userId[0]["user_id"]});
                 } else {
                    res.sendStatus(400);
                }

            });

        });
    } else {
        res.sendStatus(400);
    }
};


exports.login = function(req, res) {
    let username = req.body.username;
    let email = req.body.email;
    let password = req.body.password;

    let error = 200;

    var rand = function() {
        return Math.random().toString(36).substr(2);
    };

    let token = function() {return rand() // to make it longer
    };
    let utoken = token();

    /*
    check username and password is valid
     */

    if ((username === undefined) && (email === undefined)){
        res.sendStatus(400);

    } else if(password === undefined) {
        res.sendStatus(400);
    } else if(username !== undefined){
        User.ifValidUsername(username, function(inDb){
                if (inDb) {
                    let idOrEmail = "id";
                    User.passwordCheck(idOrEmail, username, password, function (ifMatch) {
                        if(ifMatch) {
                            User.getUserIdAlter(idOrEmail, username, function(uId) {
                                userId = uId[0]["user_id"];
                                User.insertToken(utoken, userId, function () {
                                });
                                res.status(200).json({"userId": userId, "token": utoken});
                            });
                        } else {
                            res.sendStatus(400);
                        }
                    });
                } else {
                    res.sendStatus(400);
                }
        });
     } else if (email !== undefined){
        User.ifValidEmail(email, function(inDb){
            if (inDb) {
                let idOrEmail = "email";
                User.passwordCheck(idOrEmail, email, password, function (ifMatch) {
                    if(ifMatch) {
                        User.getUserIdAlter(idOrEmail, email, function(uId) {
                            userId = uId[0]["user_id"];
                            User.insertToken(utoken, userId, function () {
                            });
                            res.status(200).json({"userId": userId, "token": utoken});
                        });
                    } else {
                        res.sendStatus(400);
                    }
                });
            } else {
                res.sendStatus(400);
            }
        });
    }
};


exports.logout = function(req, res){
    let xAuth = req.headers["x-authorization"];
    //console.log(xAuth);
    if (xAuth === undefined){
        res.sendStatus(401);
    } else {
        User.authCheck(xAuth, function(ifMatch){
            if(ifMatch) {
                User.Unauthoricate(xAuth, function(){});
                res.sendStatus(200);
            } else {
                res.sendStatus(401);
            }
        });
    }
};


exports.userInfo = function(req,res) {
    let id = req.params.id;
    let xAuth = req.headers["x-authorization"];
    var ifAuth;

    User.authCheck(xAuth, function (inDb) {

        ifAuth = inDb;

        User.ifValidId(id, function (idInDb) {
            if (idInDb) {
                if (ifAuth) {
                    User.checkIfSelf(xAuth, id, function (match) {
                        if (match === true) {
                            User.getUserData(id, function (data) {
                                data[0]['givenName'] = data[0]["given_name"];
                                data[0]['familyName'] = data[0]["family_name"];
                                delete data[0]['given_name'];
                                delete data[0]['family_name'];
                                res.status(200).json(data[0]);
                            });
                        } else if (match !== true) {
                            User.getUserData(id, function (data) {
                                delete data[0].email;
                                data[0]['givenName'] = data[0]["given_name"];
                                data[0]['familyName'] = data[0]["family_name"];
                                delete data[0]['given_name'];
                                delete data[0]['family_name'];
                                res.status(200).json(data[0]);
                            });
                        }
                    });
                } else {
                    User.getUserData(id, function (data) {
                        delete data[0].email;
                        data[0]['givenName'] = data[0]["given_name"];
                        data[0]['familyName'] = data[0]["family_name"];
                        delete data[0]['given_name'];
                        delete data[0]['family_name'];
                        res.status(200).json(data[0]);
                    });
                }
            } else {
                res.sendStatus(404);
            }
        });
    });
};


exports.changeInfo = function(req,res){
    let id = req.params.id;
    let xAuth = req.headers["x-authorization"];
    let givenname = req.body.givenName;
    let familyname = req.body.familyName;
    let password = req.body.password;

    var ifAuth;
    var ifSameUser;
    var ifHasNum = /\d/.test(password);

    User.authCheck(xAuth, function (inDb) {
        ifAuth = inDb;
    if (ifAuth) {

        User.checkIfSelf(xAuth, id, function(same){
            ifSameUser = same;
        if (ifSameUser) {

            if (givenname !== undefined && familyname !== undefined && password !== undefined) {
                if(givenname === "" || familyname === "" || password === "" || ifHasNum) {
                    res.sendStatus(400);
                }else {
                    User.patchData(givenname, familyname, password, id, "all", function (err) {
                        res.sendStatus(200);
                    });
                }
            } else if (givenname === undefined && familyname === undefined && password === undefined) {
                res.sendStatus(400);
            } else {
                let code = 200;

                if ( givenname === "") {
                    code = 400
                } else if(givenname !== undefined) {
                    User.patchData(givenname, familyname, password, id, "gn", function (err) {
                    });
                }

                if ( familyname === "") {
                    code = 400
                } else if (familyname !== undefined) {
                    User.patchData(givenname, familyname, password, id, "fn", function (err) {
                    });
                }

                if ( password === "" || ifHasNum) {
                    code = 400
                } else if (password !== undefined) {
                    User.patchData(givenname, familyname, password, id, "pw", function (err) {
                    });
                }

                res.sendStatus(code);
            }

        } else {
            res.sendStatus(403);
        }
        });
    } else {
        res.sendStatus(401)
    }
    });
};