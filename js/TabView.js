import {RTab, Trash, StarFilled} from '../components/tab.jsx';
import ReactDOM from 'react-dom';
import React from 'react';

export default class TabView {
	constructor(tab) {
		this.tab = tab;
		this.view = null;
	}

	/* returns the view for this tab
	 */
	getView() {
		if (this.view == null) {
			this.generateView();
			// this.view = RTab({});
		}
		return this.view;
	}

	/* generates the view for this tab
	 */
	generateView() {
		var tab = this.tab;
		// console.log("generating view");
		var row = document.createElement("div");
		var main = document.createElement("div");
		var tabTitle = document.createTextNode(" " + tab.title );
		row.id = tab.id;


		var trash = <Trash onClick={function (e) { trashClick(tab.id, event)}}/>
		// trash.addEventListener("click", function(){trashClick(tab.id, event)}, true);

		main.addEventListener("click", function(){rowClick(tab.id, event)}, true);
		main.addEventListener("auxclick", function(){trashClick(tab.id, event)}, true);
		main.appendChild(getPicture(tab));
		main.appendChild(tabTitle);

		// row.append(trash);
		ReactDOM.render(trash, row);
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
function rowClick(id, event) {
	chrome.tabs.update(id,{active: true}, null);
	chrome.tabs.get(id, function(tab) {
		chrome.windows.update(tab.windowId, {focused: true});
	});

}

function closeTab(id) {
	chrome.tabs.get(id, function(tab) {
		if (!tab.active) {
			chrome.tabs.remove(id);
			var elem = document.getElementById(id);
			elem.parentNode.removeChild(elem);
		}
	});
}

// clicking on a trash should close that tab
function trashClick(id, event) {
	console.log("clicking trash");
	switch (event.button) {
		case 0:
		case 1:
			closeTab(id);
		break;
	}
}

/* Takes a tab. Returns a star button with bookmarking behavior
 * if given tab is bookmarked, star is filled.
 */
function bookmarkStar(tab) {
	var star = document.createElement("i");
	try {
		// This has errors on special firefox tabs like about:home or about:config
		chrome.bookmarks.search({"url":tab.url}, function(array) {
			if (array.length > 0) {
				star.className = "material-icons star star_filled";
				star.innerHTML = 'star';
			} else {
				star.className = "material-icons star star_border";
				star.innerHTML = 'star_border';
			}
		});
	} catch (e) {
		// console.log("error at tab: " + tab.url);
		// console.log(e);
		star.className = "material-icons star star_border";
		star.innerHTML = 'star_border';
	}
	return star
}
