// 'use strict';

// const e = React.createElement;
import React from 'react';

export function StarBorder(props) {
	return <i class="material-icons star star_border">star_border</i>
}

export function StarFilled(props) {
	return <i class="material-icons star star_filled">star_filled</i>
}

export function Trash(props) {
	return <i class="material-icons trash">delete</i>
}

export class RTab extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {

		return (
			<div class="row div">
				<div class="row-content div">
					<trash/>
					<star_border/>
					"title"
				</div>
			</div>
		)
	}
}
