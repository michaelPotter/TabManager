import {RTab, Trash, Star, ContextMarker, Favicon} from '../components/tab.jsx';
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
		this.row = row
		var main = document.createElement("div");
		var tabTitle = document.createTextNode(" " + tab.title );
		row.id = tab.id;

		main.addEventListener("click", function(){rowClick(tab.id, event)}, true);
		main.addEventListener("auxclick", function(){trashClick(tab, event)}, true);
		this.icon = <Favicon src={tab.favIconUrl} />
		main.appendChild(getPicture(tab));
		// ReactDOM.render(main, this.icon);
		main.appendChild(tabTitle);

		this.trash = <Trash onClick={e => {trashClick(tab, event)}} key="trash"/>
		this.contextMarker = <ContextMarker key="cm"/>
		this.star = <Star key="star"/>
		tab.isBookmarked()
			.then(bookmarked => {
				this.star = <Star filled={bookmarked} key="star"/>
				this.render()
			})

		this.render();
		row.append(main);
		this.setTabColor(row);

		main.className = "row-content div";
		row.className = "row div tab";
		if (tab.active) {
			row.className += " active";
		}
		this.view = row;
	}

	render() {
		var items=[this.trash, this.contextMarker, this.star]
		ReactDOM.render(items, this.row);
	}

	getpic() {
		var src = null
		var re_avoid = /^chrome:\/\/.*\.svg$/
		if (! re_avoid.test(tab.favIconUrl)) {
			src = tab.favIconUrl
		}
		return <Favicon src={src} />
	}

	setTabColor(elem) {
		var tt = this.tab;
		var prom = this.tab.get_container();
		prom.then( id => {
			// elem.style.backgroundColor = id.color
			this.contextMarker = <ContextMarker color={id.color} key="cm"/>
			this.render();
		});

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

