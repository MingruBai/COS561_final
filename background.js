// Process a domain name
function processURL(requestDetails) {
	const url = new URL(requestDetails.url);
	
	if (url.hostname.includes("ipinfo.io")) {
		return;
	}
	
	console.log("Processing: " + url.hostname);
	loadDubious()
	// Issue traceRoute command to retrieve a list of IPs:
	var ips = traceRoute(url.hostname);	
	// Use ipinfo API to retrieve details for each IP:
	translate(ips);
	

}

// TODO: implement traceRoute command:
function traceRoute(hostname) {
// 	var ips = ["192.168.0.1", "68.173.207.89", "68.173.198.16", "107.14.19.24", "66.109.6.27", "66.109.1.59", "209.51.175.37", "216.66.49.74", "128.112.12.130", "140.180.223.42"];
	var ips = ["68.173.207.89", "140.180.223.42"];
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
			"message":  "Web content delivered through dubious AS " + asnString
		});
  	}
  	
  	// alert if dubious geo:
  	var countryString = response["country"];
  	if (dubiousGeo.indexOf(countryString) > -1) {
  		browser.notifications.create({
	    	"type": "basic",
			"title": "Dubious Geo Alert!",
			"message":  "Web content delivered through dubious geo " + countryString
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
}

var ipDetails = [];
var dubiousGeo = [];
var dubiousAsn = [];
// always use full address (with www.)
browser.webRequest.onBeforeRequest.addListener(
	processURL,
	{urls: ["*://*/"]}
)