// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

class tabView {
	constructor(tab) {
		this.tab = tab;
		this.view = null;
	}
	
	/* returns the view for this tab
	 */
	getView() {
		if (this.view == null) {
			this.generateView();
		}
		return this.view;
	}

	/* generates the view for this tab
	 */
	generateView() {
		var tab = this.tab;
		console.log("generating view");
		var row = document.createElement("div");
		var main = document.createElement("div");
		var trash = document.createElement("i");
		var tabTitle = document.createTextNode(" " + tab.title );
		row.id = tab.id;


		trash.className = "material-icons trash";
		trash.innerHTML = 'delete';
		trash.addEventListener("click", function(){trashClick(tab.id, event)}, true);

		main.addEventListener("click", function(){mouseClick(tab.id, event)}, true);
		main.addEventListener("auxclick", function(){trashClick(tab.id, event)}, true);
		main.appendChild(getPicture(tab));
		main.appendChild(tabTitle);

		row.append(trash);
		row.append(bookmarkStar(tab));
		row.append(main);

		main.className = "row-content div";
		row.className = "row div";
		if (tab.active) {
			row.className += " active";
		}
		this.view = row;
	}

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
	chrome.tabs.update(id,{active: true}, null);
	chrome.tabs.get(id, function(tab) { 
		chrome.windows.update(tab.windowId, {focused: true});
	});

}

function onDragEnd(evt) {
	var itemEl = evt.item;
	chrome.tabs.move(
		parseInt(itemEl.id),
		{index:evt.newIndex},
		function(tab) {}
	);
}

// clicking on a trash should close that tab
function trashClick(id, event) {
	switch (event.button) {
		case 0:
		case 1:
			chrome.tabs.get(id, function(tab) {
				if (!tab.active) {
					chrome.tabs.remove(id);
					var elem = document.getElementById(id);
					elem.parentNode.removeChild(elem);
				}
			});
		break;
	}
}

/* Takes a tab. Returns a star button with bookmarking behavior
 * if given tab is bookmarked, star is filled. 
 */
function bookmarkStar(tab) {
	var star = document.createElement("i");
	chrome.bookmarks.search({"url":tab.url}, function(array) { 
		if (array.length > 0) {
			star.className = "material-icons star star_filled";
			star.innerHTML = 'star';
		} else {
			star.className = "material-icons star star_border";
			star.innerHTML = 'star_border';
		}
	});
	return star
}

function append(element) {
	var currentDiv = document.getElementById('status');
	document.body.insertBefore(element, currentDiv);
}

function addSpacer() {
	var newDiv = document.createElement("hr");
	$('#main').append(newDiv);
}

function addAllTabs(w) {
	chrome.tabs.query({windowId: w.id}, function(tabs) {
		for (var j = 0; j < tabs.length; j++) {
			// get its output
			var tv = new tabView(tabs[j]);
			append(tv.getView());
		}
		addSpacer();
	});
}

document.addEventListener('DOMContentLoaded', function() {
	// console.log(window.localStorage.setItem("michael", "potter"));
	// console.log(window.localStorage.getItem("michael"));
	// get all windows
	chrome.windows.getAll(null, function(windows) {
		console.log(windows);
		getCurrentTabId( function(id) {
			for (var i = 0; i < windows.length; i++) {
				if (windows[i].focused == true) {
					addAllTabs(windows[i]);
				}
			}
			for (var i = 0; i < windows.length; i++) {
				if (windows[i].focused == false) {
					addAllTabs(windows[i]);
				}
			}
		});
	});
	Sortable.create(document.getElementById('main'), {
		animation: 150,
		onEnd: onDragEnd
	});
});
