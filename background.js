// Process a domain name
function processURL(requestDetails) {
	const url = new URL(requestDetails.url);
	
	if (url.hostname.includes("ipinfo.io")) {
		return;
	}
		
	console.log("Processing: " + url.hostname);
	loadDubious();
	// Issue traceRoute command to retrieve a list of IPs:
	var ips = traceRoute(url.hostname);	
	// Use ipinfo API to retrieve details for each IP:
	translate(ips);
	compareHistory(url, ips);
	return {cancel: false}; // TODO: implement request blocking logic
}

// TODO: implement traceRoute command:
function traceRoute(hostname) {
// 	var ips = ["192.168.0.1", "68.173.207.89", "68.173.198.16", "107.14.19.24", "66.109.6.27", "66.109.1.59", "209.51.175.37", "216.66.49.74", "128.112.12.130", "140.180.223.42"];
	var ips = ["140.180.223.42", "209.51.175.37"];
	return ips;
}

function translationCallback(response) {
	if (response['loc'] == undefined) return;
	if (response['org'] == undefined) return;
	ipDetails.push(response);
	browser.storage.local.set({
    	ipDetails: ipDetails
  	});
  	
  	// alert if dubious asn:
  	var asString = response["org"].split(" ")[0];
  	var asnString = asString.substring(2);  	
  	if (dubiousAsn.indexOf(asnString) > -1) {
  		browser.notifications.create({
	    	"type": "basic",
			"title": " Dubious AS Alert!",
			"message":  "Web content delivered through dubious AS " + asnString + "."
		});
  	}
  	
  	// alert if dubious geo:
  	var countryCode = response["country"];
  	// look up country name from country code
  	var countryString = this.countryNames[countryCode];
  	console.log("country: " + countryString);

  	if (dubiousGeo.indexOf(countryString) > -1) {
  		browser.notifications.create({
	    	"type": "basic",
			"title": "Dubious Geo Alert!",
			"message":  "Web content delivered through dubious geo " + countryString + "."
		});
  	}
}

// Completed: use ipinfo.io to retrieve IP details:
function translate(ips) {
	ipDetails = [];
	for (var i = 0; i < ips.length; i++) {
		var ip = ips[i];
		var myRequest = new Request("http://ipinfo.io/" + ip + "/json");	
		fetch(myRequest).then(function(response) {
  			return response.json();
		}).then(function(response) {
			translationCallback(response);
		});
	}
}

function loadDubious() {
  var gettingItem = browser.storage.local.get('geo');
  gettingItem.then((res) => {
    var dubiousGeoString = res.geo || 'North Korea, Russia';
    dubiousGeo = dubiousGeoString.split(", ");
  });
  
  gettingItem = browser.storage.local.get('asn');
  gettingItem.then((res) => {
    var dubiousAsnString = res.asn || '1000, 1101, 1200';
    dubiousAsn = dubiousAsnString.split(", ");
  });
  console.log("dubious geo: " + dubiousGeo)
  console.log("dubious asn: " + dubiousAsn)
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
  	console.log(xhttp.responseText);
  	return JSON.parse(xhttp.responseText);
}

var ipDetails = [];
var dubiousGeo = [];
var dubiousAsn = [];
var countryNames = loadCountryNames();

// always use full address (e.g. admissions.duke.edu, www.google.com)
browser.webRequest.onBeforeRequest.addListener(
	processURL,
	{urls: ["*://*/*"]}, // match pattern: https or http://anyhost/anypath
	["blocking"]
)