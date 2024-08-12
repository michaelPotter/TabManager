import { useState } from 'react';
import { observer } from "mobx-react";

import Form from 'react-bootstrap/Form';
import classnames from 'classnames';

import TabModel from '../js/model/tab/Tab';
import { Trash } from './Icons';
import Favicon from './lib/Favicon';

/*
 * A Tab component.
 * TODO:
 *  - row middle click
 *  - container tab color
 */
export default observer(function Tab(
	props : {
		tab: TabModel,
		mainClick: () => void,
		trashClick: () => void,
	}
) {
	const [isBookmarked, setBookmarked] = useState(false);
	const [tabContext, setTabContext] = useState({});
	const [isFaviconHover, setIsFaviconHover] = useState(false);
	props.tab.isBookmarked().then(setBookmarked);
	// TODO things get reaally slow with this enabled...
	// props.tab.get_container().then(setTabContext);
	return (
		// FIXME middle click doesn't work
		// FIXME the star button doesn't work
		<div
			id={(props.tab.id ?? -1).toString()}
			className={classnames("tab", {"activeTab":props.tab.active})}
		>

			<ContextMarker context={tabContext} />
			{/* TODO here's an idea... when the favicon is hovered, show a
				checkbox. Once one tab is clicked, the entire page goes into
				"multi-select" mode until none are selected again. */}
			<div
				// onMouseEnter={() => setIsFaviconHover(true)}
				// onMouseLeave={() => setIsFaviconHover(false)}
				style={{display: 'inline'}}
				className="me-1"
			>
				{isFaviconHover
					?
					<Form.Check type={'checkbox'} inline className="m-0"/>
					:
					<Favicon src={props.tab.favIconUrl}/>
				}
			</div>
			<div onClick={props.mainClick} className="tabTitle">
				{props.tab.title}
			</div>

			<Star filled={isBookmarked}/>
			{/* TODO when the last tab in a window is closed, the window should
				be removed from the list. That doesn't have to happen here
				though. */}
			<Trash onClick={props.trashClick}/>
		</div>
	)
});

function Star(props : {
		filled: boolean;
}) {
	if (props.filled) {
		return <i className="material-icons star star_filled">star</i>
	} else {
		return <i className="material-icons star star_border">star_border</i>
	}
}

function ContextMarker(props: { context: { color?: string; }; }) {
	// Note: props.context has a lot more props that could be useful... we
	// could render the shape and color of the container icon, and also have
	// the container name in a hover-over
	let color = props.context.color;
	let opacity = color ? "1.0" : "0.0";

	return (
		<svg className="contextMarker" viewBox="0 0 10 10" height="10px" width="10px">
			<circle cx="5" cy="5" r="5" fill={color} fillOpacity={opacity} />
		</svg>
	);
}
