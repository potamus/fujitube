'use strict';

angular.module('FujitubeApp')
  .filter('artist', function() {
    return function(artists, date, stage) {
      if(date.length === 0 && stage.length === 0){
        return artists;
      }

      var items = {
        day: date,
        stageID: stage,
        out: []
      };

      angular.forEach(artists, function(value){
        if(this.day.length === 0 && this.stageID.length > 0) {
          if(this.stageID.indexOf(value.stage_id) >= 0) {
            this.out.push(value);
          }
        } else if (this.day.length > 0 && this.stageID.length === 0) {
          if(this.day.indexOf(value.day) >= 0) {
            this.out.push(value);
          }
        } else {
          if(this.day.indexOf(value.day) >= 0 && this.stageID.indexOf(value.stage_id) >= 0) {
            this.out.push(value);
          }
        }
      }, items);
      return items.out;

    };
  });
