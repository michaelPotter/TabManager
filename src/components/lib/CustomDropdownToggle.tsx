import React from 'react';
import Dropdown from 'react-bootstrap/esm/Dropdown';
import {
	FaEllipsisV,
} from "react-icons/fa";

/**
 * A custom dropdown toggle, showing just an ellipse icon.
 */
export default (
	props: {
		// id: string;
		title: string;
	}
) => (

	<Dropdown.Toggle
					// id={props.id}
					variant="icon"
					className={[
						// Remove the trailing caret
						"dropdown-no-caret",
						// Strip excess button padding
						"p-0",
					].join(" ")}
					style={{ border: 'none' }}
					title={props.title} >
		<FaEllipsisV className={[
			// Bump up the size a lil
			"fs-5",
			// Fix coloring and hover
			"button-icon",
		].join(" ")}/>
	</Dropdown.Toggle>
)


