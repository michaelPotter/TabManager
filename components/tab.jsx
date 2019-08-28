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
	var h=28;
	var w=4;
	var arc=4;
	var ap=`${arc},${arc}`;
	// height = 28
	var path=`M0,${arc}  v${h - 2*arc}  a${ap} 0 0,0 ${ap}  h${w-arc}  v-${h}  h-${w-arc}  a${ap} 0 0,0 -${arc},${arc}  Z`;
		// <svg viewBox="-10 -10 100 100"
	return (
		<svg viewBox="0 -2 3 28"
			height="24px"
			width="10px"
			>
			<path d={path} fill="blue" />

		</svg>
	)
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
