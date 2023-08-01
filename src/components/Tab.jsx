import React, {useState} from 'react';
import classnames from 'classnames';
import {Trash} from './Trash';

/*
 * A Tab component.
 * TODO:
 *  - row middle click
 *  - container tab color
 */
export default function Tab(props) {
	const [isBookmarked, setBookmarked] = useState(false);
	const [tabContext, setTabContext] = useState({});
	props.tab.isBookmarked().then(setBookmarked);
	// TODO things get reaally slow with this enabled...
	// props.tab.get_container().then(setTabContext);
	return (
		<div
			id={props.tab.id}
			className={classnames("row div tab", {"active":props.tab.active})}
		>
			{/* TODO these should go AFTER */}
			{/* TODO This closes the tab, but doesn't remove tab from the list */}
			<Trash onClick={props.trashClick}/>
			<Star filled={isBookmarked}/>
			<div className="row-content div" onClick={props.mainClick}>
				<ContextMarker context={tabContext} />
				<Favicon src={props.tab.favIconUrl}/>
				{" " + props.tab.title}
			</div>
		</div>
	)
}

function Star(props) {
	if (props.filled) {
		return <i className="material-icons star star_filled">star</i>
	} else {
		return <i className="material-icons star star_border">star_border</i>
	}
}

function ContextMarker(props) {
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

function Favicon(props) {
	let re_avoid = /^chrome:\/\/.*\.svg$/
	let src = re_avoid.test(props.src) ? "undefined" : props.src
	return <img src={src} height="20em"/>
}
