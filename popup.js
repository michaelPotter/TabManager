// Copyright (c) 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * Get the current URL.
 *
 * @param {function(string)} callback - called when the URL of the current tab
 *	 is found.
 */
function getCurrentTabUrl(callback) {
	// Query filter to be passed to chrome.tabs.query - see
	// https://developer.chrome.com/extensions/tabs#method-query
	var queryInfo = {
		active: true,
		currentWindow: true
	};

	chrome.tabs.query(queryInfo, function(tabs) {
		// chrome.tabs.query invokes the callback with a list of tabs that match the
		// query. When the popup is opened, there is certainly a window and at least
		// one tab, so we can safely assume that |tabs| is a non-empty array.
		// A window can only have one active tab at a time, so the array consists of
		// exactly one tab.
		var tab = tabs[0];

		// A tab is a plain object that provides information about the tab.
		// See https://developer.chrome.com/extensions/tabs#type-Tab
		var url = tab.url;

		// tab.url is only available if the "activeTab" permission is declared.
		// If you want to see the URL of other tabs (e.g. after removing active:true
		// from |queryInfo|), then the "tabs" permission is required to see their
		// "url" properties.
		console.assert(typeof url == 'string', 'tab.url should be a string');

		callback(url);
	});

	// Most methods of the Chrome extension APIs are asynchronous. This means that
	// you CANNOT do something like this:
	//
	// var url;
	// chrome.tabs.query(queryInfo, function(tabs) {
	//	 url = tabs[0].url;
	// });
	// alert(url); // Shows "undefined", because chrome.tabs.query is async.
}

/**
 * @param {string} searchTerm - Search term for Google Image search.
 * @param {function(string,number,number)} callback - Called when an image has
 *	 been found. The callback gets the URL, width and height of the image.
 * @param {function(string)} errorCallback - Called when the image is not found.
 *	 The callback gets a string that describes the failure reason.
 */
function getImageUrl(searchTerm, callback, errorCallback) {
	// Google image search - 100 searches per day.
	// https://developers.google.com/image-search/
	var searchUrl = 'https://ajax.googleapis.com/ajax/services/search/images' +
		'?v=1.0&q=' + encodeURIComponent(searchTerm);
	var x = new XMLHttpRequest();
	x.open('GET', searchUrl);
	// The Google image search API responds with JSON, so let Chrome parse it.
	x.responseType = 'json';
	x.onload = function() {
		// Parse and process the response from Google Image Search.
		var response = x.response;
		if (!response || !response.responseData || !response.responseData.results ||
				response.responseData.results.length === 0) {
			errorCallback('No response from Google Image search!');
			return;
		}
		var firstResult = response.responseData.results[0];
		// Take the thumbnail instead of the full image to get an approximately
		// consistent image size.
		var imageUrl = firstResult.tbUrl;
		var width = parseInt(firstResult.tbWidth);
		var height = parseInt(firstResult.tbHeight);
		console.assert(
				typeof imageUrl == 'string' && !isNaN(width) && !isNaN(height),
				'Unexpected respose from the Google Image Search API!');
		callback(imageUrl, width, height);
	};
	x.onerror = function() {
		errorCallback('Network error.');
	};
	x.send();
}

class tabView {

}

function getCurrentTabId(callback) {
	var queryInfo = {
		active: true,
		currentWindow: true
	};

	chrome.tabs.query(queryInfo, function(tabs) {
		var tab = tabs[0];
		callback(tab.id);
	});
}

// given a tab, returns an element containing the favicon
function getPicture(tab) {
	var elem = document.createElement("img");
	elem.setAttribute("src", tab.favIconUrl);
	elem.setAttribute("height", "20em");
	//elem.setAttribute("max-height", 100%);
	return elem;
}

// left click opens that tab
// middle click closes it
function mouseClick(id, event) {
	// if left click
	switch (event.button) {
		case 0:
			chrome.tabs.update(id,{active: true}, null);
			break;
		case 1:
			chrome.tabs.remove(id);
			var elem = document.getElementById(id); 
			elem.parentNode.removeChild(elem);
			break;
	}

}

// clicking on a trash should close that tab
function trashClick(id, event) {
	switch (event.button) {
		case 0:
			chrome.tabs.remove(id);
			var elem = document.getElementById(id); 
			elem.parentNode.removeChild(elem);
			break;
	}
}

function addTabView(tab) {
	var row = document.createElement("div");
	var main = document.createElement("div");
	var trash = document.createElement("i");
	var tabTitle = document.createTextNode(" " + tab.title );
	row.id = tab.id;


	trash.className = "material-icons trash";
	trash.innerHTML = 'delete';
	trash.addEventListener("click", function(){trashClick(tab.id, event)}, true);

	main.addEventListener("click", function(){mouseClick(tab.id, event)}, true);
	main.appendChild(getPicture(tab));
	main.appendChild(tabTitle);

	row.append(trash);
	row.append(main);

	main.className = "row-content div";
	row.className = "row div";
	var currentDiv = document.getElementById('status');
	document.body.insertBefore(row, currentDiv);
}

function addSpacer() {
	var newDiv = document.createElement("hr");
	var currentDiv = document.getElementById('status');
	document.body.insertBefore(newDiv, currentDiv);
}

function addAllTabs(tabs) {
	// for every tab
	for (var j = 0; j < tabs.length; j++) {
		// get its output
		addTabView(tabs[j]);
	}
	addSpacer();
}


document.addEventListener('DOMContentLoaded', function() {
	// get all windows
	chrome.windows.getAll(null, function(windows) {
		getCurrentTabId( function(id) {
			// for every window
			var lastFocusedId = -1;
			chrome.windows.getLastFocused(null, function(window) {
				lastFocusedId = window.id;
				console.log("lastfocused:" + lastFocusedId);
				// get its tabs
				chrome.tabs.query({windowId: window.id}, function(tabs) {
					addAllTabs(tabs);
				});
				for (var i = 0; i < windows.length; i++) {
					// get its tabs
					chrome.tabs.query({windowId: windows[i].id}, function(tabs) {

						console.log("i:" + i);
						console.log("lastfocused:" + lastFocusedId);
						if ( i !== lastFocusedId )
							addAllTabs(tabs);
					});
				}
			});
		});
	});
});
