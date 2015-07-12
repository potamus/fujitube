'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ArtistSchema = new Schema({
  id: Number,
  name: String,
  day: Number,
  stage_id: Number,
  order: Number,
  similar_ids: Array,
  mbid: String,
  image: String,
  info: String,
  top_tracks: Array
});

module.exports = mongoose.model('Artist', ArtistSchema);
