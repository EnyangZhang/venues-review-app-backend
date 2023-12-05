const db = require('../../config/db');


exports.getUserPhoto = function(id, done){
    db.getPool().query("select profile_photo_filename from User where user_id = ?", id, function(err, photoFilename){
        done(photoFilename[0].profile_photo_filename);
    });
};

exports.checkProfilePhoto = function(id, done){
    db.getPool().query("select profile_photo_filename from User where user_id = ?", id, function(err, photoFilename) {
        let inDb = photoFilename[0]["profile_photo_filename"] !== null;
        done(inDb);
    });
};

exports.putPhoto = function(id, extendName, done){
    db.getPool().query("update User set profile_photo_filename = '" + id + "." + extendName + "' where user_id = " + id, function(err) {
    });
};

exports.deleteProfilePhoto = function(id, done){
  db.getPool().query("update User set profile_photo_filename = NULL where user_id =  " + id, function(err){});
};