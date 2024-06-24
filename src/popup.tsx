import ReactDOM from 'react-dom';
import { observer } from "mobx-react";

import _ from 'lodash';

import Window from './js/model/Window';
import WindowManager from './js/WindowManager';
import WindowComponent from './components/Window';
import PopupStore from './popupStore';

// Pull in the styles ...
import './scss/root.scss';

const App = observer(() => {
	let windowsMap = WindowManager.windows;
	let windows = Object.values(windowsMap).sort(Window.accessCompare);

	return (
		<>
			<div id="header">
				<a onClick={() => PopupStore.setPage("alltabs")}>all tabs</a>
				{" | "}
				<a onClick={() => PopupStore.setPage("archive")}>archive</a>
				<i id="popout_button" onClick={open_in_window} className="material-icons">open_in_new</i>
				<i id="refresh_button" onClick={() => location.reload()} className="material-icons">refresh</i>
			</div>
			<div id="body">
			{ PopupStore.page == "alltabs"
				&&
					windows.map(w =>
						<WindowComponent
							window={w}
							tabs={w.tabs}
							key={w.id}
							onCloseClick={() => WindowManager.closeWindow(w.id)}
							/>
				   )
				||
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

