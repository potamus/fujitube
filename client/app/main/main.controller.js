'use strict';

angular.module('FujitubeApp')
  .controller('MainCtrl', function ($scope, $http) {
    var vm = this;
    vm.toggleFilterDate = toggleFilterDate;
    vm.toggleFilterStage = toggleFilterStage;
    vm.openModal = openModal;
    vm.play = play;
    vm.addArtist = addArtist;
    vm.removeArtist = removeArtist;
    vm.showYTplayer = false;

    vm.filterDate = [];
    vm.filterStage = [];
    vm.que = [];
    vm.playArtistList = [];
    vm.currentId = '';
    vm.currentName = '';
    vm.currentImage = '';
    vm.currentInfo = '表示できません';
    vm.currnetTopTracks = [];
    vm.currentSimilarArtists = [];

    $http.get('/api/artists').success(function(artists) {
      vm.artists = artists;
    });

    $scope.$watch(function(){
      return vm.que.length;
    }, function(newVal) {
      if (newVal < 5) {
        loadVideoID();
      }
    });

    $scope.$watch(function(){
      return vm.playArtistList.length;
    }, function() {
        adjustQue();
    });

    function adjustQue(){
      var artistIds = [];
      angular.forEach(vm.playArtistList, function(artist){
        if(artistIds.indexOf(artist.id) === -1){
          artistIds.push(artist.id);
        }
      });

      angular.forEach(vm.que, function(que, index){
        if(artistIds.indexOf(que.id) === -1){
          vm.que.splice(index,1);
        }
      });
    }

    function loadVideoID() {
      //artistslistでまだqueに入っていないやつから取得する
      if(vm.playArtistList.length > 0){
        var searchList = vm.playArtistList.concat();
        angular.forEach(vm.que, function(que){
          angular.forEach(searchList, function(artist, index){
            if (angular.equals(que.id, artist.id)) {searchList.splice(index,1);}
          });
        });

        if(searchList.length === 0) { searchList = vm.playArtistList.concat();}
        var searchId = searchList[Math.floor(Math.random() * (searchList.length))];

        $http.get('/api/artists/' + searchId.id + '/videoid').success(function(video) {
            vm.que.push(video);
        });
      }
    }

    function play(){
      loadVideoID();
      vm.showYTplayer = true;

    }

    function addArtist(id, name, image){
      vm.playArtistList.push({id: id, name: name, image: image});
    }

    function removeArtist(id){
      vm.playArtistList.some(function(v, i){
        if (v.id===id) {vm.playArtistList.splice(i,1);}
      });
    }

    function toggleFilterDate(date){
      if(vm.filterDate.indexOf(date) === -1){
        vm.filterDate.push(date);
      } else {
        vm.filterDate.some(function(v, i){
          if (v === date) {vm.filterDate.splice(i,1);}
        });
      }
    }

    function toggleFilterStage(id){
      if(vm.filterStage.indexOf(id) === -1){
        vm.filterStage.push(id);
      } else {
        vm.filterStage.some(function(v, i){
          if (v === id) {vm.filterStage.splice(i,1);}
        });
      }
    }

    function openModal(id){
      $('#modal1').closeModal();
      $http.get('/api/artists/' + id).success(function(artist) {
        vm.currentId        = artist.id;
        vm.currentName      = artist.name;
        vm.currentInfo      = artist.info;
        vm.currentImage     = artist.image;
        vm.currnetTopTracks = artist.top_tracks;
        vm.currentSimilarArtists = artist.similar_artists
      });
      $('#modal1').openModal();
    }
  });
