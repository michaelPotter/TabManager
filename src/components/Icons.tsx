'use strict';

declare type Clickable = {
	onClick?: () => void,
};

export function Trash(props: Clickable) {
	return (
		<i
			className="button-icon material-icons trash"
			onClick={props.onClick}
			>
			delete
		</i>
	)
}

export function Pencil(props: Clickable) {
	return (
		<i
			className="button-icon float-right material-icons pencil"
			onClick={props.onClick}
			>
			edit
		</i>
	)
}
