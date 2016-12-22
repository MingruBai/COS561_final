function handleClick() {
	browser.runtime.openOptionsPage();
}

// Process a domain name
function processURL(requestDetails) {
	const url = new URL(requestDetails.url);
	
	if (url.hostname.includes("ipinfo.io")) {
		return;
	}
	
	console.log("Processing: " + url.hostname);
	
	// Issue traceRoute command to retrieve a list of IPs:
	var ips = traceRoute(url.hostname);
	console.log(ips);
	
	// Use ipinfo API to retrieve details for each IP:
	var ipDetails = translate(ips);
	console.log(ipDetails);
}

// TODO: implement traceRoute command:
function traceRoute(hostname) {
	var ips = ["140.180.223.22", "31.13.74.36"];
	return ips;
}

// Completed: use ipinfo.io to retrieve IP details:
function translate(ips) {
	var ipDetails = new Array();
	var i;
	for (i = 0; i < ips.length; i++) {
		var ip = ips[i];
		var myRequest = new Request("http://ipinfo.io/" + ip + "/json");	
		fetch(myRequest).then(function(response) {
  			return response.json();
		}).then(function(response) {
			ipDetails.push(response);
		});
	}	
	return ipDetails;
}

browser.browserAction.onClicked.addListener(handleClick);
// always use full address (with www.)
browser.webRequest.onBeforeRequest.addListener(
	processURL,
	{urls: ["*://*/"]}
)