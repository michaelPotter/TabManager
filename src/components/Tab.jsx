import React, {useState} from 'react';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import classnames from 'classnames';
import {Trash} from './Icons';

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
			className={classnames("tab", {"activeTab":props.tab.active})}
		>

			<Container fluid>
			<Row className='p-0'>
				<Col className='p-0'>
					<ContextMarker context={tabContext} />
					{/* TODO figure out how to center the favicon, without increasing the line height past 24(ish) */}
					{/* TODO here's an idea... when the favicon is hovered, show a checkbox. Once one tab is clicked, the entire page goes into "multi-select" mode until none are selected again. */}
					<Favicon src={props.tab.favIconUrl}/>
					{" " + props.tab.title}
				</Col>
				<Col sm="auto" className='p-0'>
					<div
						className="float-end"
						// Without this, the icon buttons increase the size of the tab line
						style={{ maxHeight: "24px" }}
					>
						<Star filled={isBookmarked}/>
						{/* TODO when the last tab in a window is closed, the window should be removed from the list. That doesn't have to happen here though. */}
						<Trash onClick={props.trashClick}/>
					</div>
				</Col>
			</Row>
			</Container>
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
