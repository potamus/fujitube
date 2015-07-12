'use strict';

angular.module('FujitubeApp')
  .controller('MainCtrl', function ($scope, $http, $timeout) {
    var vm = this;
    vm.toggleFilterDate = toggleFilterDate;
    vm.toggleFilterStage = toggleFilterStage;

    vm.openModal = openModal;
    vm.openAboutModal = openAboutModal;
    vm.openPlayListModal = openPlayListModal;

    vm.play = play;
    vm.next = next;
    vm.addArtist = addArtist;
    vm.removeArtist = removeArtist;

    vm.showYTplayer = false;
    vm.showNavbar = true;

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
    var YTPlayer;

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

    $scope.$on('youtube.player.ready', function ($event, player) {
      YTPlayer = $scope.YTPlayer;
      player.playVideo();
      vm.showNavbar = false;
    });

    $scope.$on('youtube.player.ended', function($event, player){
      vm.que.splice(0,1);
      vm.videoUrl = vm.que[0].videoId;
      player.playVideo();
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
      if(vm.que.length === 0){
        $timeout(function () {
          vm.videoUrl = vm.que[0].videoId;
        }, 1000);
      } else {
        vm.videoUrl = vm.que[0].videoId;
      }
    }

    function next(player){
      vm.que.splice(0,1);
      vm.videoUrl = vm.que[0].videoId;
      YTPlayer.playVideo();
    }

    function addArtist(id, name, image){
      var artistList = [];
      angular.forEach(vm.playArtistList, function(v){
        artistList.push(v.id);
      });
      if(artistList.indexOf(id) === -1){
        vm.playArtistList.push({id: id, name: name, image: image});
      }
      Materialize.toast(name , 5000, 'rounded');
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
      $('#modal-detail').closeModal();
      $('#modal-playlist').closeModal();
      $http.get('/api/artists/' + id).success(function(artist) {
        vm.currentId        = artist.id;
        vm.currentName      = artist.name;
        vm.currentInfo      = artist.info;
        vm.currentImage     = artist.image;
        vm.currnetTopTracks = artist.top_tracks;
        vm.currentSimilarArtists = artist.similar_artists
      });
      $('#modal-detail').openModal();
    }

    function openPlayListModal(){
      $('#modal-playlist').openModal();
    }

    function openAboutModal(){
      $('#modal-about').openModal();
    }

  });
