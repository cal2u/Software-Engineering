angular.module('listings')
.controller('ListingsController', ['$scope', '$sce', '$timeout', 'Listings',
  function($scope, $sce, $timeout, Listings) {
    for (var i = 0; i < Listings.length; i++) {
      Listings[i].index = i;
    }
    $scope.listings = Listings;
    $scope.filteredListings = Listings;
    $scope.searchInput = '';
    $scope.detailedInfo = undefined;
    $scope.adding = false;
    // Create an iframe URL for the selected building's OpenStreetMap display
    $scope.genMapUrl = function() {
      if ($scope.selectedBuilding && $scope.selectedBuilding.coordinates) {
        var lat = $scope.selectedBuilding.coordinates.latitude;
        var long = $scope.selectedBuilding.coordinates.longitude;
        var windowHoriz = .001;
        var windowVert = .001;
        // bottom left, upper right
        var coords = [
            long - (windowHoriz/2),
            lat - (windowVert/2),
            long + (windowHoriz/2),
            lat + (windowVert/2)];
        return $sce.trustAsResourceUrl(`http://www.openstreetmap.org/export/embed.html?`+
               `bbox=${coords[0]}%2C${coords[1]}%2C${coords[2]}%2C${coords[3]}`+
               `&amp;layer=mapnik`);
      }
      return "";
    };

    // Show only the desired listings
    $scope.filterListings = function() {
      function isStringMatch(a, b) {
        return a.toLowerCase().indexOf(b.toLowerCase()) != -1;
      }

      function isListingMatch(searchInput, listing) {
        return isStringMatch(listing.name, searchInput)
            || isStringMatch(listing.code, searchInput);
      }

      // Filter the list if the user has started to search for something
      $scope.filteredListings =
          $scope.searchInput == ''
              ? Listings
              : Listings.filter(isListingMatch.bind(null, $scope.searchInput));
    };

    $scope.addListing = function() {
      $scope.listings.push({
        index: $scope.listings.length,
        name: $scope.newListingName,
        code: $scope.newListingCode,
        address: $scope.newListingAddress,
        coordinates: {
          latitude: $scope.newListingLat,
          longitude: $scope.newListingLong
        }
      })
    };

    $scope.deleteListing = function(listingIndex, filterIndex) {
      $scope.listings.splice(listingIndex, 1);
      $scope.filteredListings.splice(filterIndex, 1);

      for (var i = listingIndex; i < $scope.listings.length; i++) {
        $scope.listings[i].index -= 1;
      }
      for (i = filterIndex; i < $scope.filteredListings.length; i++) {
        $scope.filteredListings[i].index -= 1;
      }
    };

    $scope.showDetails = function(index) {
      $scope.selectedBuilding = $scope.listings[index];
    };

    $scope.showDetails(0);
  }
])
.directive('myMap', ['$document', function($document) {
  return {
    link: function(scope, element, attr) {
      var transitionMilis = 300;
      var state = "hidden";

      element.css({
             position: 'relative',
             'margin-top': '1em',
             position: 'relative',
             transition: `left ${transitionMilis}ms, opacity ${transitionMilis}ms`,
             left: '60  0px'
            });

      element.on('load', function(event) {
        showMap();
      });

      element.on('transitionend', function(event) {
        // If we just finished hiding the map, try to show the new map
        if (element.css('left') == "600px" && event.originalEvent.propertyName == 'left') {
          state = "hidden";
          updateMap();
        }
      })

      function loadMap() {
        if (scope.selectedBuilding && scope.selectedBuilding.coordinates) {
          state = "loading";
          element.attr('src',scope.genMapUrl());
        }
      }

      function showMap() {
        state = "showing";
        element.css({left: '0px', opacity:1});
      }

      function hideMap() {
        state = "hiding";
        if (element.css('left') == '600px') {
          state = "hidden";
          updateMap();
        }
        element.css({left: '600px', opacity:0});
      }

      function updateMap() {
        if (state == "showing" || state == "loading" || state == "hiding") {
          hideMap();
        } else if (state == "hidden") {
          loadMap();
        }
      }
      scope.$watch('selectedBuilding', updateMap);
    }
  }
}]);
