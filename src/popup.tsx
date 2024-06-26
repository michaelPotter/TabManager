import ReactDOM from 'react-dom';
import { observer } from "mobx-react";

import _ from 'lodash';

import Window from './js/model/window/Window';
import WindowManager from './js/model/window/WindowManager';
import WindowComponent from './components/Window';
import PopupStore from './popupStore';
import WindowGroupStore from './js/model/windowGroup/WindowGroupStore';

// Pull in the styles ...
import './scss/root.scss';
import WindowGroupComponent from './components/WindowGroup';

const App = observer(() => {
	let windowsMap = WindowManager.windows;
	let windows = Object.values(windowsMap).sort(Window.accessCompare);

	return (
		<>
			<div id="header">
				<a onClick={() => PopupStore.setPage("alltabs")}>All Tabs</a>
				{" | "}
				<a onClick={() => PopupStore.setPage("active_groups")}>Active Groups</a>
				{" | "}
				<a onClick={() => PopupStore.setPage("archive")}>Archive</a>
				<i id="popout_button" onClick={open_in_window} className="material-icons">open_in_new</i>
				<i id="refresh_button" onClick={() => location.reload()} className="material-icons">refresh</i>
			</div>
			<div id="body">
			{ PopupStore.page == "alltabs" &&
					windows.map(w =>
						<WindowComponent
							window={w}
							tabs={w.tabs}
							key={w.id}
							onCloseClick={() => WindowManager.closeWindow(w.id)}
							/>
				   )
			}
			{ PopupStore.page == "active_groups" &&
					<div>
						<p>{WindowGroupStore.windowGroups.length == 0 && "(no groups)" || "Groups:"}</p>
						{WindowGroupStore.windowGroups.map(g => (
							<WindowGroupComponent key={g.name} windowGroup={g}/>
						))}
					</div>
			}
			{ PopupStore.page == "archive" &&
					<p>
						The Archive
					</p>
			}
			</div>
		</>
	)
})

document.addEventListener('DOMContentLoaded', async function() {
	await WindowManager.waitForPopulated();

	/*
	 * Create a closure to re-render, allowing access the window/tab data structures
	 */
	function render() {
		ReactDOM.render(<App/>, document.getElementById('main'));
	}

	WindowManager.onTabChange(render);

	render();
});

function open_in_window() {
	var win: browser.windows._CreateCreateData = {
		url:"popup.html?type=popout",
		type:"popup"
	}
	browser.windows.create(win);
}

