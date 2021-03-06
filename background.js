// Process a domain name
function processURL(requestDetails) {
	const url = new URL(requestDetails.url);
	
	if (url.hostname.includes("ipinfo.io")) {
		return;
	}
		
	console.log("Processing: " + url.hostname);
	loadDubious();
	// Issue traceRoute command to retrieve a list of IPs:
	traceRoute(url);
}

// Completed: implement traceRoute command:
function traceRoute(url) {
	var hostname = url.hostname;
	var myRequest = new Request("http://cos432-assn3.cs.princeton.edu/traceroute?q=" + hostname);	
	fetch(myRequest).then(function(response) {
  		return response.text();
	}).then(function(response) {
		var ips = response.split(",");
		console.log(hostname + " goes through: " + ips);
		translate(ips, hostname);
		compareHistory(url, ips);
	});
}

function translationCallback(countries, ases, response, hostname) {
	if (response['loc'] == undefined) return;
	if (response['org'] == undefined) return;
	ipDetails.push(response);
	browser.storage.local.set({
    	ipDetails: ipDetails
  	});

  	// store coordinate in history
  	var loc = response["loc"].split(",");
  	var latitude = parseFloat(loc[0]);
    var longitude = parseFloat(loc[1]);
  	var newSize = coordinateHistory.unshift([latitude, longitude]);
        
    console.log(coordinateHistory.length);
  	if (newSize > 1000) {
  		coordinateHistory.pop();
  	}
    localStorage.setItem("coordinate", coordinateHistory);
  	
  	// alert if dubious geo:
  	var countryCode = response["country"];
  	// look up country name from country code
  	var countryString = this.countryNames[countryCode];

  	if (!countries.has(countryString)) {
  		countries.add(countryString);
	  	if (dubiousGeo.indexOf(countryCode) > -1 || dubiousGeo.indexOf(countryString) > -1) {
  			browser.notifications.create({
	   	 		"type": "basic",
				"title": "Dubious Geo Alert!",
				"message":  "Web content delivered to " + hostname + " through dubious geo " + countryString + "."
			});
  		}
  	}
  	
  	// alert if dubious asn:
  	var asString = response["org"].split(" ")[0];
  	var asnString = asString.substring(2); 
  	if (!ases.has(asnString)) {
  		ases.add(asnString);
  		if (dubiousAsn.indexOf(asnString) > -1) {
  			browser.notifications.create({
	    		"type": "basic",
				"title": " Dubious AS Alert!",
				"message":  "Web content delivered to " + hostname + " through dubious AS " + asnString + "."
			});
  		}
  	}
}

// Completed: use ipinfo.io to retrieve IP details:
function translate(ips, hostname) {
	ipDetails = [];
	countries = new Set();
	ases = new Set();
	for (var i = 0; i < ips.length; i++) {
		var ip = ips[i];
		var myRequest = new Request("http://ipinfo.io/" + ip + "/json");	
		fetch(myRequest).then(function(response) {
  			return response.json();
		}).then(function(response) {
			translationCallback(countries, ases, response, hostname);
		});
	}
}

function loadDubious() {
  var gettingItem = browser.storage.local.get('geo');
  gettingItem.then((res) => {
    var dubiousGeoString = res.geo || 'North Korea, Russia';
    dubiousGeo = dubiousGeoString.split(", ");
    console.log("dubious geo: " + dubiousGeo)
  });
  
  gettingItem = browser.storage.local.get('asn');
  gettingItem.then((res) => {
    var dubiousAsnString = res.asn || '1000, 1101, 1200';
    dubiousAsn = dubiousAsnString.split(", ");
    console.log("dubious asn: " + dubiousAsn)
  });
}

function compareHistory(url, ips) {
	console.log(ips);
	// Load existent stats with the storage API.
	var gettingStoredRoute = browser.storage.local.get("hostNavigationRoute");
	gettingStoredRoute.then(results => {
  		// Initialize the saved stats if not yet initialized.
  		if (!results.hostNavigationRoute) {
    		results = {
      		hostNavigationRoute: {}
    		};
  		}
  		const {hostNavigationRoute} = results;
  		var flag = true;
  		if (hostNavigationRoute[url.hostname]) {
  			console.log("History loaded: ");
  			console.log(hostNavigationRoute[url.hostname]);
			if (hostNavigationRoute[url.hostname].length != ips.length){
				flag = false;
			} else {
				for (var i = 0; i < ips.length; i++) {
					if (ips[i] != hostNavigationRoute[url.hostname][i]) flag = false;
				}
			}
  		} 
		hostNavigationRoute[url.hostname] = ips;
		browser.storage.local.set(results);
		
		if (!flag) {
		  	browser.notifications.create({
	    	"type": "basic",
			"title": "Routing Path Change Alert!",
			"message":  "Routing path changed for " + url.hostname + "."
			});
		}
  	});
}

// Load country names from json. This should only need to be called once.
function loadCountryNames() {
	var xhttp = new XMLHttpRequest();
  	xhttp.open("GET", "resources/countryNames.json", false);
  	xhttp.send();
  	return JSON.parse(xhttp.responseText);
}

function toggleHeatmap() {
	var heatmap = document.getElementById('heatmap');
	var button = document.getElementById("heatmapButton");
    if (heatmap.style.display === 'none') {
        console.log(localStorage.getItem("coordinate"));
        coordinateHistory = localStorage.getItem("coordinate").split(",").map(Number);
        /*
    	var xhttp = new XMLHttpRequest();
  	    xhttp.open("GET", "research/locations.txt", false);
  	    xhttp.send();
        coordinateHistory = xhttp.responseText.split(",").map(Number);
        console.log(coordinateHistory);
        console.log(coordinateHistory.length);
        */
    	
		var heatmapData = [];
		for(i = 0; i < coordinateHistory.length; i = i + 2) {
            heatmapData.push(new google.maps.LatLng(coordinateHistory[i], coordinateHistory[i + 1]));
        }
        console.log(coordinateHistory.length);

		var usCenter= new google.maps.LatLng(39, -98);

		var map = new google.maps.Map(document.getElementById('map'), {
		  center: usCenter,
		  zoom: 3,
		  mapTypeId: 'satellite'
		});

		var heatmap_layer = new google.maps.visualization.HeatmapLayer({
		  data: heatmapData
		});
		heatmap_layer.setMap(map);

    	button.innerHTML = "Show Traceroute Path"
        heatmap.style.display = 'block'; // unhide
    } else {
		initMap();
		
    	button.innerHTML = "Show Heatmap"
        heatmap.style.display = 'none'; // hide
    }
}

var ipDetails = [];
var dubiousGeo = [];
var dubiousAsn = [];
var countryNames = loadCountryNames();
var coordinateHistory = new Array(); // history of all coordinates, to be used in heat map

// always use full address (e.g. admissions.duke.edu, www.google.com)
browser.webRequest.onBeforeRequest.addListener(
	processURL,
	{urls: ["*://*/"]}, // match pattern: https or http://anyhost
	["blocking"]
)

document.getElementById("heatmapButton").addEventListener("click", toggleHeatmap);
