/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /artists              ->  index
 * GET     /artists/:id          ->  show
 */

'use strict';

var _ = require('lodash');
var Artist = require('./artist.model');
var async  = require('async');
var search = require('youtube-search');

// Get list of artists
exports.index = function(req, res) {
  Artist.find(function (err, artists) {
    if(err) { return handleError(res, err); }
    var result = [];
    artists.forEach(function(artist){
      result.push({
        id: artist.id,
        name: artist.name,
        day: artist.day,
        stage_id: artist.stage_id,
        order: artist.order,
        image: artist.image
      });
    });
    return res.json(200, result);
  });
};

// Get a single artist
exports.show = function(req, res) {

  Artist.find({id: req.params.id}, function (err, artist) {
    if(err) { return handleError(res, err); }
    if(!artist) { return res.send(404); }
    //Last.fmから情報を取得する処理
    var result = {
      id: artist[0].id,
      name: artist[0].name,
      image: artist[0].image,
      info: artist[0].info,
      top_tracks: artist[0].top_tracks
    };

    var simArtists =[]
    async.each(artist[0].similar_ids,function(id, callback){
      Artist.find({id: id}, function(err, simArtist){
        if(err) { return handleError(res, err); }
        if(!artist) { return res.send(404); }
        simArtists.push({id: id, name: simArtist[0].name})
        callback();
      });
    }, function(err){
      if(err) { return handleError(res, err); }
      result.similar_artists = simArtists
      return res.json(result);
    });
  });
};

// Get list of artists
exports.videoid = function(req, res) {
  Artist.find({id: req.params.id}, function(err, artist){
    if(err) { return handleError(res, err); }
    if(!artist) { return res.send(404); }

    var keyword = artist[0].name;
    var trackName = '';
    var videoId = '';
    var topTracks = artist[0].top_tracks;
    var count = 10;

    if(topTracks.length > 0){
      trackName = topTracks[Math.floor(Math.random() * (topTracks.length))];
      keyword = keyword + ' ' + trackName;
      count = 1;
    }

    var opts = {
      maxResults: count,
      key: 'AIzaSyC76sCl2fuloeLkkDg7ui34tQWNccrlnWQ'
    };

    search(keyword, opts, function(err, results) {
      if(err) { return handleError(res, err); }
      if(!results) { return res.send(404); }
      var video = results[Math.floor(Math.random() * (results.length))];
      videoId = video.link

      var result = {
        id: artist[0].id,
        name: artist[0].name,
        videoId: videoId,
        track: trackName
      }

      console.log(result);
      return res.json(200, result);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}
