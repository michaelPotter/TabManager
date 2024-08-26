import React, { useState, useMemo } from 'react';
import { observer } from "mobx-react";

import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Form from 'react-bootstrap/Form';
import Dropdown from 'react-bootstrap/Dropdown';
import { ReactSortable } from 'react-sortablejs';

// import WindowGroupStore from '../js/model/windowGroup/WindowGroupStore';
// import Tab from './Tab';
// import { Trash } from './Icons';
import CustomDropdownToggle from '../lib/CustomDropdownToggle';
import RollupArrow from '../lib/RollupArrow';

import type { ArchivedWindow } from '../../js/model/archivedWindowGroup/ArchivedWindowGroup';
import ArchivedTab from './ArchivedTab';


/**
 * Represents a window.
 */
const ArchivedWindow = (
	props : {
		window: ArchivedWindow,
		dropdownMenu?: JSX.Element
	}
) => {
	const [isHover, setIsHover] = useState(false);
	const handleMouseEnter = () => setIsHover(true);
	const handleMouseLeave = () => setIsHover(false);

	const [isRolledUp, setIsRolledUp] = useState(false);
	const toggleIsRolledUp = () => setIsRolledUp(!isRolledUp);

	const windowClass = isHover ? "window_hover" : ""

	return (
		<div className={`window ${windowClass}`}>
			<Container fluid>
				<Row>
					<Col>
						<RollupArrow closed={isRolledUp} onClick={toggleIsRolledUp} />
						{props.window.name != "" &&
							`${props.window.name} - ` }
						<span className="text-muted">
							{props.window.tabs.length} tabs
						</span>
					</Col>
					<Col sm="auto" className='p-0'>
						<div className="float-end"
							 // Without this, the icon buttons increase the size of the tab line
							 style={{ maxHeight: "24px" }} >
							{/* TODO size/align the ellipse a lil better */}
							{/* FIXME the dropdown hangs off the side */}
							{/* TODO since this component can be displayed in different contexts now (all tabs vs window groups) the dropdown menu should be configurable based on context. E.g. in the window groups page, the dropdown should include "remove from group" */}
							{/* TODO look at this...
									https://mdbootstrap.com/docs/react/extended/dropdown-multilevel/#
									it'd be nice if there was an "add to group" option, that would open a sub-menu with all the groups and/or an option to add a new group. */}
							{/* <Dropdown style={{ display: "inline-block" }} id={`window-actions-${props.window.id}`} align="end"> */}
							{/* 	<CustomDropdownToggle */}
							{/* 		title={`Actions for window`}/> */}
							{/* 	{props.dropdownMenu || */}
							{/* 		<Dropdown.Menu className="shadow-sm"> */}
											{/* <Dropdown.Header>Window Group Actions</Dropdown.Header> */}
							{/* 			<EditWindowModalButton window={props.window}/> */}
							{/* 		</Dropdown.Menu> */}
							{/* 	} */}
							{/* </Dropdown> */}
							{/* {/1* For safety, don't allow deleting rolled up windows *1/} */}
							{/* 	{isRolledUp || <Trash onClick={() => WindowManager.closeWindow(props.window.id)}/>} */}
						</div>
					</Col>
				</Row>
			</Container>

			{ isRolledUp ||
				<>
					{/* <ReactSortable */}
					{/* 	id={props.window.id.toString()} */}
					{/* 	// @ts-ignore */}
					{/* 	list={props.window.tabs} */}
					{/* 	// Normally you'd use a state hook and pass "setState" here, but using a state hook interferes with */}
					{/* 	// re-rendering due to out-of band tab changes. */}
					{/* 	setList={() => {}} */}
					{/* 	animation={200} */}
					{/* 	onEnd={onDragEnd} */}
					{/* > */}
						{props.window.tabs.map((tab, i) => (
							<ArchivedTab
								key={i}
								tab={tab}
								/>
						))}
					{/* </ReactSortable> */}
				</>
			}
		</div>
	);
}
export default observer(ArchivedWindow);
