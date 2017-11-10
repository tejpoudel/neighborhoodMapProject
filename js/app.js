
var map;
var clientID;
var clientSecret;
var infowindow;


function mapModel() {
    var self = this;
    this.searchOption = ko.observable("");
    this.markers = [];
    this.initMap = function() {
        var styles = [
          {
            featureType: 'water',
            stylers: [
              { color: '#19a0d8' }
            ]
          },{
            featureType: 'administrative',
            elementType: 'labels.text.stroke',
            stylers: [
              { color: '#ffffff' },
              { weight: 6 }
            ]
          },{
            featureType: 'administrative',
            elementType: 'labels.text.fill',
            stylers: [
              { color: '#e85113' }
            ]
          },{
            featureType: 'road.highway',
            elementType: 'geometry.stroke',
            stylers: [
              { color: '#efe9e4' },
              { lightness: -40 }
            ]
          },{
            featureType: 'transit.station',
            stylers: [
              { weight: 9 },
              { hue: '#e85113' }
            ]
          },{
            featureType: 'road.highway',
            elementType: 'labels.icon',
            stylers: [
              { visibility: 'off' }
            ]
          },{
            featureType: 'water',
            elementType: 'labels.text.stroke',
            stylers: [
              { lightness: 100 }
            ]
          },{
            featureType: 'water',
            elementType: 'labels.text.fill',
            stylers: [
              { lightness: -100 }
            ]
          },{
            featureType: 'poi',
            elementType: 'geometry',
            stylers: [
              { visibility: 'on' },
              { color: '#f0e4d3' }
            ]
          },{
            featureType: 'road.highway',
            elementType: 'geometry.fill',
            stylers: [
              { color: '#efe9e4' },
              { lightness: -30 }
            ]
          }
        ];
        var mapCanvas = document.getElementById('map');
        var mapOptions = {
            center: new google.maps.LatLng(38.440429, -122.71405479999999),
            zoom: 12,
            styles: styles
        };
        // Constructor creates a new map - only center and zoom are required.
        map = new google.maps.Map(mapCanvas, mapOptions);

        var stops = [
            { title: 'Greyhound:Bus Stop', lat: 38.4382333, lng:  -122.71320479999997, type: 'Public Transportation'},
            { title: 'Greyhound Lines', lat: 38.395705, lng: -122.71447439999997, type: 'Public Transportation'},
            { title: 'Bus Schedule-Route Information', lat: 38.4379143, lng: -122.71146959999999, type:  'Public Transportation Information'},
            { title: 'Sonoma County Transit', lat: 38.3940118, lng: -122.72268889999998, type:  'Public Transportation'},
            { title: 'Sonoma County Airport Train Stop', lat: 38.510787, lng: -122.78450700000002, type: 'Public Transportation'},
            { title: 'Santa Rosa North Train Stop', lat: 38.4551412, lng: -122.7363881, type: 'Public Transportation'},
            { title: 'Santa Rosa Downtown Train Stop', lat: 38.4370329, lng: -122.7215622, type: 'Public Transportation'}
        ];

        // Set InfoWindow
        infowindow = new google.maps.InfoWindow();

        for (var i = 0; i < stops.length; i++) {
            this.markerTitle = stops[i].title;
            this.markerLat = stops[i].lat;
            this.markerLng = stops[i].lng;
            // Google Maps marker setup
            this.marker = new google.maps.Marker({
                map: map,
                position: {
                    lat: this.markerLat,
                    lng: this.markerLng
                },
                title: this.markerTitle,
                lat: this.markerLat,
                lng: this.markerLng,
                id: i,
                animation: google.maps.Animation.DROP
            });
            this.marker.setMap(map);
            this.markers.push(this.marker);
            this.marker.addListener('click', populateAndBounceMarker);
        }
    };
    this.initMap();

    // lets create the marker
    this.myLocationsFilter = ko.computed(function() {
            var result = [];
            for (var i = 0; i < this.markers.length; i++) {
                var markerLocation = this.markers[i];
                if (markerLocation.title.toLowerCase().includes(this.searchOption()
                        .toLowerCase())) {
                    result.push(markerLocation);
                    this.markers[i].setVisible(true);
                } else {
                    this.markers[i].setVisible(false);
                }
            }
            return result;
        }, this);
    }


googleError = function googleError() {
    alert(
        'Google Maps has failed to load. Please check your internet connection and try again!'
    );
};



var populateInfoWindow = function(marker) {
        if (infowindow.marker != marker) {
            infowindow.setContent('');
            infowindow.marker = marker;
            // Foursquare API Client
            clientID = "P0Q5DZXIZJT3ZJEZHNW5Q2XJAKTEBIIC10Y4NXJ5PBJRY15F";
            clientSecret = "UNMCBVHIGDFLO1YEFPLGK3I3ULKLMWFVYAZ3XNXJPZQEY5QQ";
            // URL for Foursquare API
            var foursquareURL = 'https://api.foursquare.com/v2/venues/search?ll=' +
                marker.lat + ',' + marker.lng + '&client_id=' + clientID +
                '&client_secret=' + clientSecret + '&query=' + marker.title +
                '&v=20170708' + '&m=foursquare';
            // Foursquare API
            $.getJSON(foursquareURL).done(function(marker) {
                var response = marker.response.venues[0];
                self.street = response.location.formattedAddress[0] ?  response.location.formattedAddress[0]  : "No Street";
                self.city = response.location.formattedAddress[1] ? response.location.formattedAddress[1] : "No City";
                self.category = response.categories[0] ? response.categories[0].shortName : "No Category";

                self.htmlContentFoursquare =
                    '<h5 class="iw_subtitle">(' + self.category +
                    ')</h5>' + '<div>' +
                    '<h6 class="iw_address_title"> Address: </h6>' +
                    '<p class="iw_address">' + self.street + '</p>' +
                    '</p>' + '</div>' + '</div>';

                infowindow.setContent(self.htmlContent + self.htmlContentFoursquare);
            }).fail(function() {
                // Send alert
                alert(
                    "There was an error with the Foursquare API call. Please refresh the page and try again to load Foursquare data."
                );
            });

            this.htmlContent = '<div>' + '<h4 class="iw_title">' + marker.title +
                '</h4>';

            infowindow.open(map, marker);

            infowindow.addListener('closeclick', function() {
                infowindow.marker = null;
            });
        }
    };

var populateAndBounceMarker = function() {
        var self = this;
        populateInfoWindow(this);
        this.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout((function() {
            this.setAnimation(null);
        }).bind(this), 1400);
    };


function startApp() {
    ko.applyBindings(new mapModel());




}