function saveOptionsGeo(e) {
  browser.storage.local.set({
    geo: document.querySelector("#geo").value
  });
}

function saveOptionsAsn(e) {
  browser.storage.local.set({
    asn: document.querySelector("#asn").value
  });
}

function restoreOptions() {
  var gettingItem = browser.storage.local.get('geo');
  gettingItem.then((res) => {
    document.querySelector("#geo").value = res.geo || 'North Korea, Russia';
  });
  
  gettingItem = browser.storage.local.get('asn');
  gettingItem.then((res) => {
    document.querySelector("#asn").value = res.asn || '1000, 1101, 1200';
  });
}

function initMap() {
  var map = new google.maps.Map(document.getElementById('map'), {
    zoom: 1,
    center: {lat: 0, lng: 0},
    mapTypeId: 'terrain'
  });
  
  var flightPlanCoordinates = [];
  var gettingItem = browser.storage.local.get('ipDetails');
  gettingItem.then((res) => {
  
  var latlngbounds = new google.maps.LatLngBounds();
  
  	for (var i = 0; i < res.ipDetails.length; i++){
      var loc = res.ipDetails[i]["loc"].split(",");
      var locObj = [];
      locObj["lat"] = parseFloat(loc[0]);
      locObj["lng"] = parseFloat(loc[1]);
      flightPlanCoordinates.push(locObj); 
  	  var marker = new google.maps.Marker({
          position: locObj,
          icon: 'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=' + i + '|1589FF|FFFFFF'     
      });
      marker.setMap(map);
      latlngbounds.extend(locObj);
  	}
  	
  	map.fitBounds(latlngbounds);
  	
  	var flightPath = new google.maps.Polyline({
    	path: flightPlanCoordinates,
    	geodesic: true,
    	strokeColor: '#1589FF',
    	strokeOpacity: 0.8,
    	strokeWeight: 2
  	});
  	flightPath.setMap(map);
  });
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.querySelector("#geo_form").addEventListener("submit", saveOptionsGeo);
document.querySelector("#asn_form").addEventListener("submit", saveOptionsAsn);
