// 'use strict';

// const e = React.createElement;
import React from 'react';

export function Star(props) {
	if (props.type == "border") {
		return <i className="material-icons star star_border">star_border</i>
	} else if (props.type == "filled") {
		return <i className="material-icons star star_filled">star_filled</i>
	} else {
		throw new InvalidArgumentException("supported types are 'border' or 'filled'");
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
		<svg className="contextMarker" viewBox="0 0 10 10" height="8px" width="8px">
			<circle cx="5" cy="5" r="5"/>
		</svg>
	);
}

export function RTab(props) {

}

export function Favicon(props) {
	return <img src={props.src} height="20em"/>
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
