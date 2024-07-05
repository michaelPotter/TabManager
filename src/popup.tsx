import ReactDOM from 'react-dom';
import { observer } from "mobx-react";

import _ from 'lodash';

import WindowManager from './js/model/window/WindowManager';
import WindowComponent from './components/Window';
import WindowGroupComponent from './components/WindowGroup';
import PopupStore, { Page } from './js/appState/PopupStore';
import WindowStore from './js/appState/WindowStore';
import WindowGroupStore from './js/appState/WindowGroupStore';

// Pull in the styles ...
import './scss/root.scss';

const App = observer(() => {
	let windows = _.chain(WindowStore.windows)
				.sortBy("last_accessed")
				.reverse()
				.value();

	let QuickLink = ({page: key, text}: {page:Page, text:string}) => (
		<a onClick={() => PopupStore.setPage(key)}>
			{PopupStore.page === key && <b>{text}</b> || text}
		</a>
	)

	return (
		<>
			<div id="header">
				<QuickLink page="alltabs" text="All Tabs"/>
				{" | "}
				<QuickLink page="active_groups" text="Active Groups"/>
				{" | "}
				<QuickLink page="archive" text="Archive"/>
				<i id="popout_button" onClick={open_in_window} className="material-icons">open_in_new</i>
				<i id="refresh_button" onClick={() => location.reload()} className="material-icons">refresh</i>
			</div>
			<div id="body">
			{/* TODO prolly want to split these out into separate components */}
			{ PopupStore.page == "alltabs" &&
					windows.map(w =>
						<WindowComponent window={w} key={w.id}/>
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
	// Render the app
	ReactDOM.render(<App/>, document.getElementById('main'));

	// Set up a callback to trigger a re-render when we get the initial data.
	WindowManager.waitForPopulated().then(() => {
		WindowStore.setWindows(Object.values(WindowManager.windows));
	})
});

function open_in_window() {
	var win: browser.windows._CreateCreateData = {
		url:"popup.html?type=popout",
		type:"popup"
	}
	browser.windows.create(win);
}

