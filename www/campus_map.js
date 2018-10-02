/*
 * 
 * 
 *
 *
 *
 *
 *
 *
 *
 */
var map;
var myLat = 42.406202;
var myLong = -71.118598;
var myLoc = new google.maps.LatLng(myLat, myLong);
var infowindow = new google.maps.InfoWindow();
var places;
var markerMe;


var myOptions = {
    zoom: 19,
    center: myLoc,
    mapTypeId: google.maps.MapTypeId.ROADMAP
};
var infowindow = new google.maps.InfoWindow();


// Function: init()
// params: none
// Does: Initiates the map Uses setInterval to update location
function init() {
    map = new google.maps.Map(document.getElementById("map"), myOptions);
    setMyLoc();
    request_data();
    setInterval(function(){
        navigator.geolocation.getCurrentPosition(function(position) {
            myLat = position.coords.latitude;
            myLong = position.coords.longitude;
            myLoc = new google.maps.LatLng(myLat, myLong);
            if (markerMe)
                markerMe.setPosition(myLoc);
        });
    }, 1000);
    // show popup on page load
    $('.pref').click();
}

// Function: setMyLoc()
// params: none
// Does: Loads my locations and 
// pans the map to my locations
function setMyLoc() {
    navigator.geolocation.getCurrentPosition(function(position) {
        myLat = position.coords.latitude;
        myLong = position.coords.longitude;
        myLoc = new google.maps.LatLng(myLat, myLong);

        // Removing already existing marker
        if(markerMe != null) {
            markerMe.setMap(null);
        }

        markerMe = new google.maps.Marker({
            position: myLoc,
            title: "<h6>Aspiring Jumbo</h6>",
            icon: "jumbotour_user.png"
        });
        markerMe.setMap(map);
        map.panTo(myLoc);
        google.maps.event.addListener(markerMe, 'click', function() {
            infowindow.setContent(markerMe.title);
            infowindow.open(map, markerMe);
        });
    });
}

// Function: request_data()
// params: callback
// Does: Reads a json file and
// populate the locations in the json on the map
function request_data() 
{
    var hxr = new XMLHttpRequest();
    var url = "https://jumbotour.herokuapp.com/places";
    hxr.open('GET', url, true);
    hxr.onreadystatechange = function() {
        if(hxr.readyState == 4 && hxr.status == 200) {
            places = JSON.parse(hxr.responseText);
            for (var i = 0; i < places.length; i++) {
                var location = new google.maps.LatLng(places[i].lat, places[i].lng);
                var name = places[i].name;
                make_marker(location, name);
            }           
        }
    }
    hxr.send();
}

// Function: make_marker
// params:
// Does: Populate the map with markers representing
// places on campus.
function make_marker(location, name) {
    var marker = new google.maps.Marker({
        position: location,
        icon: "building.png",
        title: name,
    });
    marker.setMap(map);
    get_events(marker, location, name);
}

// Function: get_events()
// params: place
// Returns: JSON containing events
// Does: Request the events from the server
function get_events(marker, location, place) 
{
    var xhr = new XMLHttpRequest();
    var url = "https://jumbotour.herokuapp.com/events";
    var params = "location=" + place;
    xhr.open('POST', url, true);
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

    xhr.onreadystatechange = function() {
        if(xhr.readyState == 4 && xhr.status == 200) {
            
            events = JSON.parse(xhr.responseText);
            var info_content = "<h6>"+marker.title+"</h6>";

            // Add events to info_content
            if(events.length > 0) 
            {
                var event = "<h6>Events: </h6>";
                for(var i = 0; i < events.length; i++) 
                {
                    event += "<h6>"+events[i].title+"</h6>"+"Time: "+events[i].time+"<br>"+"Type: "+events[i].type+"<br><br>";
                }
                info_content += "\n" + event;
                info_content += '<button type="button" class="btn btn-primary btn-sm" onclick="update_loc(\'' + marker.title + '\');">'+'I was here'+'</button>';
            } else {
                info_content += "<br>" + "No events scheduled at this place";
                info_content += '<br><button type="button" class="btn btn-primary btn-sm" onclick="update_loc(\'' + marker.title + '\');">'+'I was here'+'</button>';
            }

            // Makes infowindows with event listener
            google.maps.event.addListener(marker, 'click', function() {
                infowindow.setContent(info_content);
                infowindow.open(map, marker);
            });

        }
    }
    xhr.send(params);    
}


var maxDist = 0.0005;

function nearby_locs(blat, blng, name) {
    var location = new google.maps.LatLng(blat, blng);
    var marker = new google.maps.Marker({
        position: location,
        icon: "buildingnext.png",
        title: name,
    });
    marker.setMap(map);
    get_events(marker, location, name);
    map.panTo(location);
}



