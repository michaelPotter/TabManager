// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/* chrome tab type wrapper
 * https://developer.chrome.com/extensions/tabs#type-Tab
 */

import util from './js/util';
import Window from './js/Window';
import Tab from './js/Tab';
import tabView from './js/TabView';
import $ from '../lib/jquery-3.4.1.min';
import Sortable from '../lib/Sortable';
import _ from 'lodash';

import ReactDOM from 'react-dom';
import React from 'react';
import RWindow from './components/Window.jsx';

// chrome.tabs.onActivated.addListener(function(activeInfo) {
// 	$('.active').removeClass('active');
// 	$('#' + activeInfo.tabId).addClass('active');
// });

// chrome.tabs.onCreated.addListener(function(tab) {
// 	// $('#main').css('background-color', 'red');
// });

// chrome.tabs.onRemoved.addListener(function(tab) {
// 	var selector = '#' + tabid
// 	$(selector).remove();
// });


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
		var windowDiv = $("<div>").attr("id", w.id);
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
	var win = {
		url:"popup.html?type=popout",
		type:"popup"
	}
	chrome.windows.create(win);
}

document.addEventListener('DOMContentLoaded', function() {

	// var url = new URL(window.location.href)
	// if (url.searchParams.get("type") != "popout") {
	// 	open_in_window()
	// }

	$("#popout_button").click(open_in_window);
	$("#refresh_button").click(() => location.reload(true));

	reactMain();

	// // get all windows
	// Window.getAll().then(windows => {
	// 	var sorted = windows.sort(Window.accessCompare)
	// 	for (var w of sorted) {
	// 		addAllTabs(w)
	// 	}
	// });

	// // get all windows
	// Window.getAll(function(windows) {
	// 	var sorted = windows.sort(Window.accessCompare)
	// 	tabTest(sorted[0])
	// });

});

async function reactMain() {
	let windows = await Window.getAll()

	let windowsAndTabs = await Promise.all(
		windows.sort(Window.accessCompare).map(w =>
			// fetch browser tabs
			browser.tabs.query({windowId: w.id})
			.then(tabs => tabs.map(t => new Tab(t)))
			.then(tabs => ({window: w, tabs: tabs})))
	);

	/*
	 * A map that holds reference to every tab, for easier access. key'd by tabId
	 * This lets you easily access and modify a tab without having to search through the list,
	 */
	let tabsMap = _(windowsAndTabs).flatMap(wt => wt.tabs).keyBy(tab => tab.id).value()

	/*
	 * Create a closure to re-render, allowing access the window/tab data structures
	 */
	function render() {
		let windowComponents = windowsAndTabs.map(w =>
			<RWindow
				window={w.window}
				tabs={w.tabs}
				key={w.window.id}
				/>
		)

		ReactDOM.render(windowComponents, document.getElementById('main'));
	}

	render();

	chrome.tabs.onActivated.addListener(function(activeInfo) {
		tabsMap[activeInfo.tabId].active = true;
		// tabsMap[activeInfo.previousTabId]?.setActive(false)
		if (tabsMap[activeInfo.previousTabId]) {
			tabsMap[activeInfo.previousTabId].setActive(false)
		}
		render();
	});

	chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
		delete tabsMap[tabId]

		// Delete from the windowsAndTabs structure
		let tabs = windowsAndTabs.filter(wt => wt.window.id == removeInfo.windowId)[0].tabs
		let index = tabs.findIndex(tab => tab.id == tabId)
		tabs.splice(index, 1)

		render();
	});

}
