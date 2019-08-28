// 'use strict';

// const e = React.createElement;
import React from 'react';

export function Star(props) {
	if (props.filled) {
		return <i className="material-icons star star_filled">star</i>
	} else {
		return <i className="material-icons star star_border">star_border</i>
	}
}

export function Trash(props) {
	return <i className="material-icons trash" onClick={props.onClick}>delete</i>
}

/**
 * Shows what tab group a tab is in
 */
export function ContextMarker(props) {
	if (props.color) {
		var opacity="1.0"
	} else {
		var opacity="0.0"
	}

	return (
		<svg className="contextMarker" viewBox="0 0 10 10" height="10px" width="10px">
			<circle cx="5" cy="5" r="5" fill={props.color} fillOpacity={opacity} />
		</svg>
	);
}

export function RTab(props) {

}

export function Favicon(props) {
	var re_avoid = /^chrome:\/\/.*\.svg$/
	if (! re_avoid.test(props.src)) {
		return <img src={props.src} height="20em"/>
	} else {
		return <img height="20em"/>
	}
}

// export class RTab extends React.Component {
// 	constructor(props) {
// 		super(props);
// 	}

// 	render() {
// 		return (
// 			<div className="row div">
// 				<div className="row-content div">
// 					<trash/>
// 					<star_border/>
// 					"title"
// 				</div>
// 			</div>
// 		)
// 	}
// }
