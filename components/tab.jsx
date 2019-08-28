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
	// return <div className="contextMarker" minWidth="30px" minHeight="30px" height="30px" width="30px" style={{borderRadius:"50%"}} backgroundColor={props.color} >testa</div>
	// .circle{width:50%;height:0;font-size:20px;color:#fff;text-align:center;line-height:0;padding:25% 0;border-radius:50%;background:#09f}

	return (
		<svg className="contextMarker" viewBox="0 -2 10 10" height="28px" width="10px">
		<path d="M0,0 L0,27 A3,3 0 0,0 3,30 L7,30 A3,3 0 0,0 10,27 L10,0 Z" />

		</svg>
			// <rect height="28" width="5" y="-11" rx="10px" ry="10px" fill={props.color}/>
			// <rect height="28" width="3" y="-11" x="2" fill={props.color}/>
		//
			// <rect height="28" width="5" x="5" y="-11" rx="5" ry="3" fill={props.color}/>
			// <rect height="28" width="3" x="5" y="-11" fill={props.color}/>
			// <rect height="28" width="5" x="5" y="-11" fill="blue"/>
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
