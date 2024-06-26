import React, { useState, useMemo } from 'react';
import Dropdown from 'react-bootstrap/esm/Dropdown';
import {
	FaEllipsisV,
} from "react-icons/fa";

/**
 * A custom dropdown toggle, showing just an ellipse icon.
 */
export default (
	props: {title: string}
) => (
	<Dropdown.Toggle
		as={CustomDropdownToggleIcon}
		variant="icon"
		className="dropdown-no-caret" // This class doens't exist in this code base... but maybe that would be a better approach
		title={props.title}>
	</Dropdown.Toggle>
)


// @ts-ignore
const CustomDropdownToggleIcon = React.forwardRef(({ children, onClick }, ref) => (
	<FaEllipsisV
		onClick={onClick}
		className="button-icon material-icons window-edit-button"
	/>
));

