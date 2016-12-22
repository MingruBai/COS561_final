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
    document.querySelector("#geo").value = res.colour || 'North Korea, Russia';
  });
  
  gettingItem = browser.storage.local.get('asn');
  gettingItem.then((res) => {
    document.querySelector("#asn").value = res.asn || '1000, 1200, 1301';
  });
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.querySelector("#geo_form").addEventListener("submit", saveOptionsGeo);
document.querySelector("#asn_form").addEventListener("submit", saveOptionsAsn);