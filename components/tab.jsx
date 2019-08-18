// 'use strict';

// const e = React.createElement;
import React from 'react';

export function StarBorder(props) {
	return <i className="material-icons star star_border">star_border</i>
}

export function StarFilled(props) {
	return <i className="material-icons star star_filled">star_filled</i>
}

export function Trash(props) {
	return <i className="material-icons trash">delete</i>
}

export class RTab extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<div className="row div">
				<div className="row-content div">
					<trash/>
					<star_border/>
					"title"
				</div>
			</div>
		)
	}
}
