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
	return <RollupArrow
		style={{fontSize: '1.3rem'}}
		className='btn btn-simple p-0'
		onClick={props.onClick}
	/>

}



