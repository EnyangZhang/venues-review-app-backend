const db = require('../../config/db');

exports.getCate = function(done){
    db.getPool().query("select * from VenueCategory", function(err, cate){
        done(cate);
    });
};

exports.getIdCate = function(cateId,done){
    db.getPool().query("select * from VenueCategory where category_id = ?",cateId, function(err, cate){
        done(cate[0]);
    });
};

exports.getBaseVenues = function(sortBy, order,  done){

    db.getPool().query("SELECT Venue.venue_id as venueId, Venue.venue_name as venueName, Venue.category_id as categoryId," +
        " Venue.city, Venue.short_description as shortDescription, Venue.latitude, Venue.longitude, AVG(Review.star_rating)" +
        " as meanStarRating, Review.cost_rating as modeCostRating, VenuePhoto.photo_filename as primaryPhoto from (Venue LEFT JOIN Review " +
        "on Venue.venue_id = Review.reviewed_venue_id) LEFT JOIN VenuePhoto on VenuePhoto.venue_id = Venue.venue_id and" +
        " VenuePhoto.is_primary = 1 GROUP BY Review.reviewed_venue_id order by " + sortBy + " " + order, function(err, basicData) {
        done(basicData);
    });

};

exports.getIdVenues = function(venueId, done){
    db.getPool().query("SELECT Venue.venue_name as venueName, Venue.admin_id as admin, Venue.category_id as category," +
        " Venue.city, Venue.short_description as shortDescription,Venue.long_description as longDescription , Venue.date_added as dateAdded, address, Venue.latitude, Venue.longitude, " +
        "VenuePhoto.photo_filename as photos from (Venue LEFT JOIN Review " +
        "on Venue.venue_id = Review.reviewed_venue_id) LEFT JOIN VenuePhoto on VenuePhoto.venue_id = Venue.venue_id" +
        " where Venue.venue_id = ? GROUP BY Review.reviewed_venue_id order by Review.star_rating DESC", venueId, function(err, basicData) {
        done(basicData[0]);
    });

};

exports.getQBaseVenues = function(q,sortBy, order, done){
    db.getPool().query("SELECT Venue.venue_id as venueId, Venue.venue_name as venueName, Venue.category_id as categoryId," +
        " Venue.city, Venue.short_description as shortDescription, Venue.latitude, Venue.longitude, AVG(Review.star_rating)" +
        " as meanStarRating, Review.cost_rating as modeCostRating, VenuePhoto.photo_filename as primaryPhoto from (Venue LEFT JOIN Review " +
        "on Venue.venue_id = Review.reviewed_venue_id) LEFT JOIN VenuePhoto on VenuePhoto.venue_id = Venue.venue_id and" +
        " VenuePhoto.is_primary = 1 WHERE Venue.venue_name LIKE '%"+ q + "%' GROUP BY Review.reviewed_venue_id order by " + sortBy + " " + order, function(err, basicData) {
        done(basicData);
    });
};

exports.getAdminVenues = function(adminId,done){
    db.getPool().query("select venue_id from Venue where admin_id = ?",[adminId], function(err, adminVid) {
        done(adminVid);
    });
};

exports.getAdminId = function(venueId,done){
    db.getPool().query("select admin_id from Venue where venue_id = ?",[venueId], function(err, adminId) {
        done(adminId[0].admin_id);
    });
};

exports.cateIdCheck = function(categoryId, done){
    if (categoryId !== undefined){
        db.getPool().query("select category_id from VenueCategory where category_id = ?", categoryId, function(err, category){
            let inDb = category.length !== 0;
            done(inDb);
        });
    } else {
        done(false);
    }
};

exports.postVenue = function(item, done){
    let items = [item];
    db.getPool().query("insert into Venue (admin_id, category_id, venue_name,  city, short_description, long_description, date_added ,address,latitude,longitude) values ?", [items] , function(err){
    done(err);
    });
    };

exports.getVenueId = function(done){
    db.getPool().query("SELECT MAX(venue_id) from Venue", function(err, venueId){
        done(venueId);
    });
};

exports.getPhotos = function(venueId, done){
  db.getPool().query("select photo_filename as photoFilename, photo_description as photoDescription, is_primary as isPrimary from VenuePhoto where venue_id = ?", venueId, function(err, photos){
      for(item of photos){
         item.isPrimary = item.isPrimary === 1;
     }
      done(photos);
  });
};

exports.updateVn = function(venueName,venueId, done){
    db.getPool().query("update Venue set venue_name = ? where venue_id = ?", [venueName.toString(),venueId], function(err){});
    };

exports.updateCI = function(categoryId,venueId, done){
    db.getPool().query("update Venue set category_id = ? where venue_id = ?", [categoryId,venueId], function(err){});
};

exports.updateCity = function(city,venueId, done){
    db.getPool().query("update Venue set city = ? where venue_id = ?", [city.toString(),venueId], function(err){});
};

exports.updateSD = function(shortDescription,venueId, done){
    db.getPool().query("update Venue set short_description = ? where venue_id = ?", [shortDescription.toString(),venueId], function(err){});
};

exports.updateLD = function(longDescription ,venueId, done){
    db.getPool().query("update Venue set long_description = ? where venue_id = ?", [longDescription.toString(),venueId], function(err){});
};

exports.updateAd = function(address,venueId, done){
    db.getPool().query("update Venue set address = ? where venue_id = ?", [address.toString(),venueId], function(err){});
};

exports.updateLa = function(latitude,venueId, done){
    db.getPool().query("update Venue set latitude = "+ latitude + " where venue_id = " + venueId, function(err){});
};

exports.updateLo = function(longitude,venueId, done){
    db.getPool().query("update Venue set longitude = "+ longitude +" where venue_id = " + venueId, function(err){});
};

exports.venueCheck = function(venueId, done){
  db.getPool().query("select venue_id from Venue where venue_id = ?", venueId, function(err, id){
      let ifVenueinDb = id[0] !== undefined;
      done(ifVenueinDb);
  });
};

exports.updateVenue = function(venueName, categoryId, city, shortDescription, longDescription, address,
                               latitude, longitude, venueId, done){
    db.getPool().query("update Venue set venue_name = ?, category_id = ?, city =?, short_description = ?, long_description =?, " +
        "address = ?, latitude = ?, longitude = ? where venue_id = ?", [venueName, categoryId, city, shortDescription, longDescription,
        address, latitude, longitude, venueId], function(err){
    });
};