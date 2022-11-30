// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/*
 * browser tab type wrapper
 */

import Window from './js/Window';
import Tab from './js/Tab';
import _ from 'lodash';

import ReactDOM from 'react-dom';
import WindowComponent from './components/Window.jsx';

document.addEventListener('DOMContentLoaded', function() {
	reactMain();
});

async function reactMain() {
	let windows = await Window.getAll()

	let windowsAndTabs = await Promise.all(
		windows
			.sort(Window.accessCompare)
			.map(async w => {
				// @ts-ignore there's apparently a case where w.id can be null... but it's never happened before.
				let tabs = await Tab.getAllForWindow(w.id);
				return {
					window: w,
					tabs: tabs,
				}
			})
	);

	/*
	 * A map that holds reference to every tab, for easier access. key'd by tabId
	 * This lets you easily access and modify a tab without having to search through the list,
	 */
	let tabsMap = _(windowsAndTabs).flatMap(wt => wt.tabs).keyBy(tab => tab.id ?? -1).value()

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

		let main = (
			<>
				<div id="header">
					<i id="popout_button" onClick={open_in_window} className="material-icons">open_in_new</i>
					<i id="refresh_button" onClick={() => location.reload()} className="material-icons">refresh</i>
				</div>
				<div id="body">
					{windowComponents}
				</div>
			</>
		)

		ReactDOM.render(main, document.getElementById('main'));
	}

	render();

	browser.tabs.onActivated.addListener(function(activeInfo) {
		tabsMap[activeInfo.tabId].active = true;
		// This might not exist if the previous tab was just deleted
		let prevTabId = activeInfo.previousTabId;
		if (prevTabId && tabsMap[prevTabId]) {
			tabsMap[prevTabId].active = false
		}
		render();
	});

	browser.tabs.onRemoved.addListener(function(tabId, removeInfo) {
		delete tabsMap[tabId]

		// Delete from the windowsAndTabs structure
		let tabs = windowsAndTabs.filter(wt => wt.window.id == removeInfo.windowId)[0].tabs
		let index = tabs.findIndex(tab => tab.id == tabId)
		tabs.splice(index, 1)

		render();
	});

}

function open_in_window() {
	var win: browser.windows._CreateCreateData = {
		url:"popup.html?type=popout",
		type:"popup"
	}
	browser.windows.create(win);
}

