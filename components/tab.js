'use strict';

const e = React.createElement;
class RTab extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		function star_border(props) {
			return <i class="material-icons star star_border">star_border</i>
		}

		function star_filled(props) {
			return <i class="material-icons star star_filled">star_filled</i>
		}

		function trash(props) {
			return <i class="material-icons trash">delete</i>
		}

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
