'use strict';

declare type TrashProps = {
	onClick: () => void,
};

export function Trash(props: TrashProps) {
	return <i className="material-icons trash" onClick={props.onClick}>delete</i>
}
