'use strict';

declare type Clickable = {
	onClick?: () => void,
};

export function Trash(props: Clickable) {
	return <i
		className="button-icon float-right material-icons trash"
		onClick={props.onClick}>
			delete
		</i>
}
