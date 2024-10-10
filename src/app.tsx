import ReactDOM from 'react-dom';
import { observer } from "mobx-react";

import _ from 'lodash';

import WindowComponent from './components/Window';
import WindowGroupComponent from './components/WindowGroup';
import PopupStore, { Page } from './js/appState/PopupStore';
import WindowStore from './js/appState/WindowStore';
import WindowGroupStore from './js/appState/WindowGroupStore';
import ArchivedWindowGroupStore from './js/model/archivedWindowGroup/ArchivedWindowGroupStore';
import type WindowModel from './js/model/window/Window';

// Pull in the styles ...
import './scss/root.scss';
import ArchivedWindowGroup from './components/archive/ArchivedWindowGroup';
import Downloader from './components/lib/Downloader';
import { Button, Alert, Navbar } from 'react-bootstrap';
import Uploader from './components/lib/Uploader';
import { Join } from './components/lib/Join';

import TheArchive2 from './pages/TheArchive2';

const App = observer(() => {
	let QuickLink = ({page: key, text}: {page:Page, text:string}) => (
		<Button variant="simple" onClick={() => PopupStore.setPage(key)}>
			{PopupStore.page === key && <b>{text}</b> || text}
		</Button>
	)

	let params = new URLSearchParams(document.location.search);
	let popStyle = params.get("type") ?? "popup";

	return (
		<div className="d-flex flex-column h-100">
			<Navbar sticky="top" className={`nav-${popStyle}`}>
				<QuickLink page="alltabs" text="All Tabs"/>
				{"|"}
				<QuickLink page="active_groups" text="Active Groups"/>
				{"|"}
				<QuickLink page="archive" text="Archive"/>
				<div style={{flexGrow: 1}}/>
				<i id="refresh_button" onClick={() => location.reload()} className="material-icons">refresh</i>
				<i id="popout_button" onClick={open_in_window} className="material-icons">open_in_new</i>
			</Navbar>
			<div id="body">
				{/* Error */}
				{ PopupStore.errorMessage &&
					<Alert
						variant="danger"
						dismissible
						onClose={() => PopupStore.setErrorMessage(undefined)}
					>{PopupStore.errorMessage}</Alert>
				}

				{/* App page */}
				{ PopupStore.page == "alltabs" && <AllTabs/> }
				{ PopupStore.page == "active_groups" && <ActiveGroups/> }
				{ PopupStore.page == "archive" && <TheArchive2/> }
			</div>
		</div>
	)
})

const AllTabs = observer(() => {
	let windows = _.chain(WindowStore.windows as WindowModel[])
				.sortBy("last_accessed")
				.reverse()
				.value();

	return (
		<Join
			separator={<hr/>}
			items={windows}
			keyBy={w => w.id}
			renderItem={w => <WindowComponent window={w}/>}
			/>
	)
})

const ActiveGroups = observer(() => {
	return (
		<div>
			{
				WindowGroupStore.state == "loaded" &&
				WindowGroupStore.windowGroups.length == 0 && <p>(no groups)</p>}
			{WindowGroupStore.windowGroups.map(g => (
				<WindowGroupComponent key={g.name} windowGroup={g}/>
			))}
		</div>
	)
});

window.onerror = function(message, source, lineno, colno, error) {
	PopupStore.setErrorMessage(message.toString());
}

document.addEventListener('DOMContentLoaded', async function() {
	// Render the app
	ReactDOM.render(<App/>, document.getElementById('main'));
});

function open_in_window() {
	var win: browser.windows._CreateCreateData = {
		url:"popout.html?type=popout",
		type:"popup"
	}
	browser.windows.create(win);
}

