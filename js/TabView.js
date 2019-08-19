import {RTab, Trash, StarFilled, ContextMarker, Favicon} from '../components/tab.jsx';
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

		main.addEventListener("click", function(){rowClick(tab.id, event)}, true);
		main.addEventListener("auxclick", function(){trashClick(tab, event)}, true);
		main.appendChild(getPicture(tab));
		main.appendChild(tabTitle);

		var trash = <Trash onClick={e => {trashClick(tab, event)}}/>
		var contextMarker = <ContextMarker color="blue"/>

		// row.append(trash);
		var items=[trash, contextMarker]
		ReactDOM.render(trash, row);
		ReactDOM.render(items, row);
		row.append(bookmarkStar(tab));
		row.append(main);
		this.setBackgroundToTabId(row);

		main.className = "row-content div";
		row.className = "row div";
		if (tab.active) {
			row.className += " active";
		}
		this.view = row;
	}

	setBackgroundToTabId(elem) {
		var tt = this.tab;
		var prom = this.tab.get_container();
		prom.then( id => {elem.style.backgroundColor = id.color});
		// prom.then( id => {elem.css('background-color', id.color)});

	}
}


// given a tab, returns an element containing the favicon
function getPicture(tab) {
	var elem = document.createElement("img");
	var re_avoid = /^chrome:\/\/.*\.svg$/
	if (! re_avoid.test(tab.favIconUrl)) {
		elem.setAttribute("src", tab.favIconUrl);
	}
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

function closeTab(tab) {
	tab.close();
	var elem = document.getElementById(tab.id);
	elem.parentNode.removeChild(elem);
}

// clicking on a trash should close that tab
function trashClick(tab, event) {
	console.log("clicking trash");
	switch (event.button) {
		case 0:
		case 1:
			closeTab(tab);
		break;
	}
}

/* Takes a tab. Returns a star button with bookmarking behavior
 * if given tab is bookmarked, star is filled.
 */
function bookmarkStar(tab) {
	var star = document.createElement("i");

	if (tab.isBookmarked()) {
		star.className = "material-icons star star_border";
		star.innerHTML = 'star_border';
	} else {
		star.className = "material-icons star star_filled";
		star.innerHTML = 'star';
	}

	return star
}

