import ReactDOM from 'react-dom';
import { observer } from "mobx-react";

import _ from 'lodash';

import WindowComponent from './components/Window';
import WindowGroupComponent from './components/WindowGroup';
import PopupStore, { Page } from './js/appState/PopupStore';
import WindowStore from './js/appState/WindowStore';
import WindowGroupStore from './js/appState/WindowGroupStore';
import ArchivedWindowGroupStore from './js/model/archivedWindowGroup/ArchivedWindowGroupStore';

// Pull in the styles ...
import './scss/root.scss';
import ArchivedWindowGroup from './components/archive/ArchivedWindowGroup';

const App = observer(() => {
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
			{ PopupStore.page == "alltabs" && <AllTabs/> }
			{ PopupStore.page == "active_groups" && <ActiveGroups/> }
			{ PopupStore.page == "archive" && <TheArchive/> }
			</div>
		</>
	)
})

const AllTabs = observer(() => {
	let windows = _.chain(WindowStore.windows)
				.sortBy("last_accessed")
				.reverse()
				.value();

	return (
		<>
			{windows.map(w =>
				<WindowComponent window={w} key={w.id}/>
			)}
		</>
	)
})

const ActiveGroups = observer(() => {
	return (
		<div>
			<p>{WindowGroupStore.windowGroups.length == 0 && "(no groups)" || "Groups:"}</p>
			{WindowGroupStore.windowGroups.map(g => (
				<WindowGroupComponent key={g.name} windowGroup={g}/>
			))}
		</div>
	)
});

const TheArchive = observer(() => {
	return (
		<div>
			<p> The Archive </p>
			<p>{ "len: " +
				ArchivedWindowGroupStore.archivedWindowGroups.length
			}</p>
			{ArchivedWindowGroupStore.archivedWindowGroups.map(g => (
				<ArchivedWindowGroup key={g.name} archivedWindowGroup={g}/>
			))}
		</div>
	)
});

document.addEventListener('DOMContentLoaded', async function() {
	// Render the app
	ReactDOM.render(<App/>, document.getElementById('main'));
});

function open_in_window() {
	var win: browser.windows._CreateCreateData = {
		url:"popup.html?type=popout",
		type:"popup"
	}
	browser.windows.create(win);
}

