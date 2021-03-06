/* jshint strict: true, esnext: true, newcap: false,
   globalstrict: true, node: true */

"use strict";

const tabs = require("sdk/tabs"),
      { data } = require("sdk/self"),
      notifications = require("sdk/notifications"),
      { prefs } = require("sdk/simple-prefs");

const database = require('./service/database');
const { match } = require('./service/match');
const { log } = require('./utils/log');
const { LEVEL_D, TEXT, higherThan, iconURL } = require('./ratings');

function notify(url, service) {
  
  if(!prefs.notificationsEnabled){
    return;
  }
  
  if (higherThan(service.tosdr.rated, LEVEL_D)) {
    return;
  }
    
  database.services.notificationOutdated(service.id).then(null,
	  function outdated() {
		  log("NOTIFY", url, service, LEVEL_D);
		  createNotification(service);
	  }
  );

}

function createNotification(service) {
  notifications.notify({
    title: service.name,
    text: TEXT[service.tosdr.rated],
    iconURL : iconURL(service.tosdr.rated),
    onClick: function (data) {
      tabs.open("https://tosdr.org/#" + service.id);
    }
  });
  database.services.notified(service.id);
}

function onTab({ url }) {
  let { valid, service } = match(url);
  if (valid && service !== null) {
    notify(url, service);
  }
}

// Listen for "pageshow" which triggered on page load, ready or retrieval from the bfcache. 
tabs.on('pageshow', onTab);

// Listen for tab activation.
tabs.on('activate', onTab);
