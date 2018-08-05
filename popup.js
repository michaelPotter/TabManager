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
			var tv = new tabView(tabs[j]);
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

document.addEventListener('DOMContentLoaded', function() {
	// console.log(window.localStorage.setItem("michael", "potter"));
	// console.log(window.localStorage.getItem("michael"));
	// get all windows
	chrome.windows.getAll(null, function(windows) {
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
		// tb = new TabManager();
		// tb.loadAllTabs()
	});
	// Sortable.create(document.getElementById('main'), {
	// 	animation: 150,
	// 	onEnd: onDragEnd
	// });

	// var popupWindow = window.open(
	// 	chrome.extension.getURL("popup.html"),
	// 	"exampleName",
	// 	"width=400, height=400"
	// );
	// window.close();
});
