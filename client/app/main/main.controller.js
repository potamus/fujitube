'use strict';

angular.module('FujitubeApp')
  .controller('MainCtrl', function ($scope, $http, $q, $timeout) {
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

    vm.check24 = false;
    vm.check25 = false;
    vm.check26 = false;
    vm.checkGreen = false;
    vm.checkWhite = false;
    vm.checkRed = false;
    vm.checkHeaven = false;

    vm.filterDate = [];
    vm.filterStage = [];
    vm.que = [];
    vm.playArtistList = [];

    vm.playingId = '';
    vm.playingName = '';
    vm.playingImage = '';
    vm.playingTrack = '';

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
      setPlayingInfo(vm.que[0].id, vm.que[0].name, vm.que[0].image, vm.que[0].track);
      player.playVideo();
      vm.showNavbar = false;
    });

    $scope.$on('youtube.player.ended', function($event, player){
      vm.que.splice(0,1);
      vm.videoUrl = vm.que[0].videoId;
      setPlayingInfo(vm.que[0].id, vm.que[0].name, vm.que[0].image, vm.que[0].track);
      player.playVideo();
    });

    function setPlayingInfo(id,name, image, tarck){
      vm.currentId = id;
      vm.playingName = name;
      vm.playingImage = image;
      vm.playingTrack = tarck;
    }

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
      var deferred = $q.defer();
      if(vm.playArtistList.length > 0){
        var searchList = vm.playArtistList.concat();
        angular.forEach(vm.que, function(que){
          angular.forEach(searchList, function(artist, index){
            if (angular.equals(que.id, artist.id)) {searchList.splice(index,1);}
          });
        });

        if(searchList.length === 0) { searchList = vm.playArtistList.concat();}
        var searchId = searchList[Math.floor(Math.random() * (searchList.length))];

        $http.get('/api/artists/' + searchId.id + '/videoid')
          .success(function(data){
            vm.que.push(data);
            deferred.resolve();
          })
          .error(function(){
            deferred.reject();
        });
      } else {
        deferred.reject();
      }
      return deferred.promise;
    }

    function play(){
      if(vm.playArtistList.length > 0){
        Materialize.toast('Now Loading...' , 3000, 'rounded');
        var promise = loadVideoID();
        promise.then(function(){
          vm.showYTplayer = true;
          vm.videoUrl = vm.que[0].videoId;
        }, function(){
          Materialize.toast('error!' , 3000, 'rounded');
        });
      } else {
        Materialize.toast('PlayListに追加してください' , 3000, 'rounded');
      }
    }

    function next(player){
      vm.que.splice(0,1);
      vm.videoUrl = vm.que[0].videoId;
      setPlayingInfo(vm.que[0].id, vm.que[0].name, vm.que[0].image, vm.que[0].track);
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
      Materialize.toast('Add : ' + name , 5000, 'rounded');
    }

    function removeArtist(id){
      vm.playArtistList.some(function(v, i){
        if (v.id===id) {
          vm.playArtistList.splice(i,1);
          Materialize.toast('Delete : ' + v.name , 5000, 'rounded');
        }
      });
    }

    function toggleFilterDate(date){
      if(vm.filterDate.indexOf(date) === -1){
        vm.filterDate.push(date);
        toggleDateClass(date);
      } else {
        vm.filterDate.some(function(v, i){
          if (v === date) {
            vm.filterDate.splice(i,1);
            toggleDateClass(date);
          }
        });
      }
    }

    function toggleFilterStage(id){
      if(vm.filterStage.indexOf(id) === -1){
        vm.filterStage.push(id);
        toggleStageClass(id);
      } else {
        vm.filterStage.some(function(v, i){
          if (v === id) {
            vm.filterStage.splice(i,1);
            toggleStageClass(id);
          }
        });
      }
    }

    function toggleStageClass(id){
      switch (id) {
        case 1:
          vm.checkGreen = !vm.checkGreen;
          break;
        case 2:
          vm.checkWhite = !vm.checkWhite;
          break;
        case 3:
          vm.checkRed = !vm.checkRed;
          break;
        case 4:
          vm.checkHeaven = !vm.checkHeaven;
          break;
      }
    }

    function toggleDateClass(day){
      switch (day) {
        case 1:
          vm.check24 = !vm.check24;
          break;
        case 2:
          vm.check25 = !vm.check25;
          break;
        case 3:
          vm.check26 = !vm.check26;
          break;
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
