const db = require('../../config/db');
const bcrypt = require('bcrypt');


exports.insert = function(user_data, done){
    let values = [user_data];

    let hash = bcrypt.hashSync(values[0][4][0], 10);
    values[0][4][0] = hash;
    db.getPool().query("insert into User (username, email, given_name,family_name, password) values ?", [values] , function(err){
        if (err) return done(400);
        done(201);
    });
};


exports.getUserId = function(username, done){

    db.getPool().query("select user_id from User where username = ?", username , function(err, userId){
        done(userId);
    });
};

exports.getUsername = function(userId, done){
    db.getPool().query("select username from User where user_id = ?", userId , function(err, username){
        done(username[0].username);
    });
};

exports.getUserIdAuth = function(xAuth, done){
    db.getPool().query("select user_id from User where auth_token = ?", xAuth , function(err, userId){
        done(userId);
    });
};

exports.getAllEmail = function(done){
    db.getPool().query("select email from User", function(err, emails){
        done(emails);
    });
};

exports.getAllUsername = function(done){
    db.getPool().query("select username from User", function(err, usernames){
        done(usernames);
    });
};

exports.ifValidUsername = function(username, done){
    db.getPool().query("select * from User where username = ?",[username] , function(err, userdata){
        let inDb = userdata.length !== 0;
        done(inDb);
    });
};

exports.ifValidEmail = function(email, done){
    db.getPool().query("select * from User where email = ?",[email] , function(err, userdata){
        let inDb = userdata.length !== 0;
        done(inDb);
    });
};

exports.ifValidId = function(id, done){
    db.getPool().query("select user_id from User where user_id = ?", [id], function(err, uId) {
        let inDb = uId.length !== 0;
       done(inDb);
    });
};

exports.passwordCheck = function(idOrEmail, loginInfo, password, done){
    if(idOrEmail === "id") {
        db.getPool().query("select password from User where username = ?", loginInfo, function(err, uPassword){
            bcrypt.compare(password, uPassword[0].password, function(err, res){
                done(res);
            });
        });
    } else {
        db.getPool().query("select password from User where email = ?", loginInfo, function(err, uPassword){
            bcrypt.compare(password, uPassword[0].password, function(err, res){
                done(res);
            });
        });
    }
};

exports.getUserIdAlter = function(idOrEmail, loginInfo, done){
    if(idOrEmail === "id") {
        db.getPool().query("select user_id from User where username = ?", loginInfo, function(err, uId){
            done(uId);
        });
    } else {
        db.getPool().query("select user_id from User where email = ?", loginInfo,function(err, uId){
            done(uId);
        });
    }
};

exports.insertToken = function(uToken, userId, done){
    db.getPool().query("UPDATE User set auth_token = '" + uToken + "' where user_id = " + userId, function(err){
    });
};

exports.authCheck = function(xAuth, done){
   if (xAuth !== undefined){
    db.getPool().query("select auth_token from User where auth_token = ?", xAuth, function(err, authData){
    let inDb = authData.length !== 0;
    done(inDb);
    });
   } else {
       done(false);
   }
};

exports.Unauthoricate = function(xAuth, done){
    db.getPool().query("update User set auth_token = NULL where auth_token = ?", xAuth, function(err){
        done(err);
    });
};

exports.checkIfSelf = function(xAuth, id, done){
    db.getPool().query("select user_id from User where auth_token = ?", xAuth, function(err, authData){
        let isSelf = authData[0].user_id == id;//[ RowDataPacket { user_id: 1 } ]
       done(isSelf);
    });
};

exports.getUserData = function(id, done){
  db.getPool().query("select username, email, given_name, family_name from User where user_id = ?", id, function (err, data) {
      done(data);
  });
};

exports.patchData = function(gn, fn, pw, id, state, done){
    if(state === "all"){
    let hash = bcrypt.hashSync(pw, 10);
    pw = hash;
    db.getPool().query("update User set given_name = ?, family_name = ?, password = ? where user_id = ?", [gn,fn,pw,id], function(err){
    done(err)
  });
    } else if(state === "gn"){
        db.getPool().query("update User set given_name = ? where user_id = ?", [gn,id], function(err){
            done(err)
        });
    } else if(state === "fn"){
        db.getPool().query("update User set family_name = ? where user_id = ?", [fn,id], function(err){
            done(err)
        });
    } else if(state === "pw"){
        let hash = bcrypt.hashSync(pw, 10);
        pw = hash;
        db.getPool().query("update User set password = ? where user_id = ?", [pw,id], function(err){
            done(err)
        });
    }
};

