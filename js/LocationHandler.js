var map;
var lastsendTime;
var sendingInterval = 1; // in mins

google.maps.event.addDomListener(window, 'load', setup);

$(document).ready(function(){

	//socketconnection
	GetLastPostions();

	//onclick event
	$('#notifyNewLocaton').on('click',function(){
		OnClickSendLocation();
	});

	//recive new location
	GetNewLocationHandler();
});

function setup() {
    document.addEventListener("deviceready", onDeviceReady, false);

    function onDeviceReady() {
        navigator.geolocation.getCurrentPosition(onSuccess, onError, {enableHighAccuracy:true});
    }
}

function onSuccess(position) {
    var userPosition = GetLocation(position);
    navigator.notification.alert("Found user position");

    initializeMaps(userPosition);
    //$('#map-canvas').css({'height': $(window).height()/2, 'width': '99%'});
}

function onError(error) {
    navigator.notification.alert("code: " + error.code + ",\n" +
                                 "message: " + error.message);
}


function initializeMaps(userPosition) {
    directionsDisplay = new google.maps.DirectionsRenderer();
    directionsService = new google.maps.DirectionsService();

    var myOptions = {
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        center: userPosition
    };

    map = new google.maps.Map(document.getElementById('mapFragment'), myOptions);
    directionsDisplay.setMap(map);

}


function GetLastPostions()
{
	var socket = io.connect('http://localhost');

	//onfirst time starting the application 
	//recieve location from the server
  	socket.on('FirstGetLocation', function (data) {
  		
    	console.log(data);
    	//present the location on the map for each location
    	$.each(data,function(idx,value){
    		ShowTheLocationOnMap(value);	
    	});
  	});

}

// will be remove to new files
// or will stay like this for better preformance

function OnClickSendLocation()
{
	navigator.geolocation.getCurrentPosition(function(position){
		var title = $('#markerTitle').val();
		//need to check sql injection
		var location = GetLocation(position);
		//emit to the server the new location
		socket.emit('SendNewLocation',{location:location,title:title});
	}, onError, {enableHighAccuracy:true});
	
	
}

function GetLocation(position)
{
	return  new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
}


// this function been called when anthoer client send
// policeman location
function GetNewLocationHandler()
{
	//get the new socket
	socket.on('New Location',function(newLocation){
		ShowTheLocationOnMap(newLocation);
	});
}

//set marker on the map for new police officer
//the map is still on you
function ShowTheLocationOnMap(marker)
{
	if (position != '') {
        var userPosMarker = new google.maps.Marker({
            position: marker.location,
            map: map,
            title: marker.title
        });
    }
    else {
        navigator.notification.alert("userPosition is null, check geo");
    }
}
