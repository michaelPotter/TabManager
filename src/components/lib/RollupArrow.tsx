import {
	MdArrowDropDown,
	MdArrowRight,
} from "react-icons/md";

// TODO make the arrow a lil bigger. Maybe use a more > shaped arrow.
export default (
	props: {
		closed: boolean,
		onClick: () => void,
	}
) => {
	let RollupArrow = props.closed ? MdArrowRight : MdArrowDropDown;
	return <RollupArrow onClick={props.onClick} />

}



