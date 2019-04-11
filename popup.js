// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/* chrome tab type wrapper
 * https://developer.chrome.com/extensions/tabs#type-Tab
 */



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

function onDragEnd(evt) {
	var itemEl = evt.item;
	// console.log(evt);
	chrome.tabs.move(
		parseInt(itemEl.id),
		{windowId:parseInt(evt.to.id),
			index:evt.newIndex},
		function(tab) {}
	);
}

function addSpacer() {
	var newDiv = document.createElement("hr");
	$('#main').append(newDiv);
}

// adds all tabs from a single window
function addAllTabs(w) {
	chrome.tabs.query({windowId: w.id}, function(tabs) {
		windowDiv = $("<div>").attr("id", w.id);
		$('#main').append(windowDiv);
		for (var j = 0; j < tabs.length; j++) {
			// get its output
			var tab = new Tab(tabs[j]);
			var tv = new tabView(tab);
			windowDiv.append(tv.getView());
		}
		windowDiv.append("<hr>");
		Sortable.create(document.getElementById(w.id), {
			group: "shared",
			animation: 150,
			onEnd: onDragEnd
		});
		// addSpacer();
	});
}

function open_in_window() {
	win = {
		url:"popup.html",
		type:"popup"
	}
	chrome.windows.create(win);
}

document.addEventListener('DOMContentLoaded', function() {
	tb = new TabManager();

	$("#popout_button").click(open_in_window);

	// get all windows
	// chrome.windows.getAll(null, function(windows) {
	Window.getAll(function(windows) {
		// console.log(windows);
		getCurrentTabId( function(id) {
			// first add the window that is focused
			for (var i = 0; i < windows.length; i++) {
				if (windows[i].focused == true) {
					addAllTabs(windows[i]);
				}
			}
			// then add all other windows
			for (var i = 0; i < windows.length; i++) {
				if (windows[i].focused == false) {
					addAllTabs(windows[i]);
				}
			}
		});
	});

	// chrome.tabs.onActivated.addListener(function (activeInfo) {
	// 	console.log("tabid: " + activeInfo.tabId);
	// 	console.log("winid: " + activeInfo.windowId);
	// });

});
