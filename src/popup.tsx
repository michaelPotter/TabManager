// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/*
 * browser tab type wrapper
 */

import Window from './js/Window';
import Tab from './js/Tab';
import WindowManager from './js/WindowManager';
import _ from 'lodash';

import ReactDOM from 'react-dom';
import WindowComponent from './components/Window.jsx';

document.addEventListener('DOMContentLoaded', function() {
	reactMain();
});

async function reactMain() {

	await WindowManager.waitForPopulated();
	console.log(`windowsMap: `, WindowManager.windows)  // TODO DELETE ME

	// /*
	//  * A map that holds reference to every tab, for easier access. key'd by tabId
	//  * This lets you easily access and modify a tab without having to search through the list,
	//  */
	// let tabsMap = _(windows).flatMap(w => w.tabs).keyBy((tab: Tab) => tab.id ?? -1).value()


	/*
	 * Create a closure to re-render, allowing access the window/tab data structures
	 */
	function render() {
		let windowsMap = WindowManager.windows;
		let windows = Object.values(windowsMap).sort(Window.accessCompare);
		let windowComponents = windows.map(w =>
			<WindowComponent
				window={w}
				tabs={w.tabs}
				key={w.id}
				onCloseClick={() => WindowManager.closeWindow(w.id)}
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

	WindowManager.onTabChange(render);

	render();

}

function open_in_window() {
	var win: browser.windows._CreateCreateData = {
		url:"popup.html?type=popout",
		type:"popup"
	}
	browser.windows.create(win);
}

