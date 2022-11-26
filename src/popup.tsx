// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/* chrome tab type wrapper
 * https://developer.chrome.com/extensions/tabs#type-Tab
 */

import util from './js/util';
import Window from './js/Window';
import Tab from './js/Tab';
import $ from '../lib/jquery-3.4.1.min';
import Sortable from '../lib/Sortable';
import _ from 'lodash';

import ReactDOM from 'react-dom';
import React from 'react';
import WindowComponent from './components/Window.jsx';

function open_in_window() {
	var win: chrome.windows.CreateData = {
		url:"popup.html?type=popout",
		type:"popup"
	}
	chrome.windows.create(win);
}

document.addEventListener('DOMContentLoaded', function() {

	$("#popout_button").click(open_in_window);
	// @ts-ignore
	$("#refresh_button").click(() => location.reload(true));

	reactMain();

});

async function reactMain() {
	let windows = await Window.getAll()

	let windowsAndTabs = await Promise.all(
		windows.sort(Window.accessCompare).map(async w =>
			// fetch browser tabs
			// @ts-ignore
			browser.tabs.query({windowId: w.id})
			.then((tabs: browser.tabs.Tab[]) => tabs.map(t => new Tab(t)))
			.then((tabs: Tab[]) => ({window: w, tabs: tabs})))
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
			<WindowComponent
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
		// This might not exist if the previous tab was just deleted
		// @ts-ignore
		if (tabsMap[activeInfo.previousTabId]) {
			// @ts-ignore
			tabsMap[activeInfo.previousTabId].active = false
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
