const db = require('../../config/db');


exports.primaryCheck = function(venueId, done){
  db.getPool().query("select * from VenuePhoto where venue_id = " + venueId + " and is_primary = 1", function(err, primary){
      let havePrimary = primary[0] !== undefined;
      done(havePrimary);
  });

};


exports.postPhoto = function(venueId, photoName, desc, ifPrimary, done){
    db.getPool().query("INSERT INTO VenuePhoto (venue_id, photo_filename, photo_description, is_primary) VALUES (?, ?, ?, ?)",[venueId, photoName, desc, ifPrimary], function(err){
    });
};



exports.setNoPrimary = function(venueId, done){
    db.getPool().query("UPDATE VenuePhoto SET is_primary = 0 where venue_id = ? and is_primary = 1",venueId, function(err){
    done(err);
    });
};


exports.photoCheck = function(photoFilename,venueId, done){
    db.getPool().query("select * from VenuePhoto where photo_filename = ? and venue_id = ?",[photoFilename,venueId], function(err, existPhoto) {
        let ifexist = existPhoto[0] !== undefined;
        done(ifexist);
    });
};


exports.deletePhoto = function(venueId, photoFilename, done){
    db.getPool().query("DELETE FROM VenuePhoto WHERE venue_id = ? AND photo_filename = ?",[venueId, photoFilename], function(err){
    });
};

exports.setNextPrimary = function(venueId, done){
    db.getPool().query("update VenuePhoto set is_primary = 1 where venue_id = ? limit 1",venueId, function(err){
    });
};

exports.setPrimary = function(venueId,photoFilename, done){
    db.getPool().query("update VenuePhoto set is_primary = 1 where venue_id = ? and photo_filename = ?",[venueId, photoFilename], function(err){
    });
};

exports.setOtherPrimaryZero = function(venueId,photoFilename, done){
    db.getPool().query("update VenuePhoto set is_primary = 0 where venue_id = ? and photo_filename != ?",[venueId, photoFilename], function(err){
    });
};