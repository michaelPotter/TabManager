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
import {
	MdArrowDropDown,
	MdArrowRight,
} from "react-icons/md";
import {
	FaEllipsisV,
} from "react-icons/fa";

import WindowStore from './state/WindowStore';
import WindowGroupStore from '../js/model/windowGroup/WindowGroupStore';
import Tab from './Tab.jsx';
import { Trash } from './Icons';

import type TabModel from '../js/model/tab/Tab';
import type WindowModel from '../js/model/window/Window';

// TODO this should probably go somewhere else??
// NOTE: there's a sort of animation bug here where the tabs jump around...
// When you drag a tab in the list, we call the browser "move" api to perform
// the actual tab move, which then turns around and calls our callback causing a re-render.
// It'd be better to update our internal list of tabs with the new ordering,
// and somehow ignore the browser callback.
function onDragEnd(
	evt: any, // TODO
) {
	let tabId = parseInt(evt.item.id);
	let destinationWindow = parseInt(evt.to.id);
	// console.log(evt);
	browser.tabs.move(
		tabId,
		{
			windowId: destinationWindow,
			index: evt.newIndex
		},
		// @ts-ignore
		function(tab) {}
	);
}

/**
 * Represents a window.
 */
const Window = (
	props : {
		window: WindowModel,
		tabs: TabModel[],
		/** A callback to be triggered when the user clicks window close */
		onCloseClick: () => void,
	}
) => {
	const [isHover, setIsHover] = useState(false);
	const handleMouseEnter = () => setIsHover(true);
	const handleMouseLeave = () => setIsHover(false);
	const store = useMemo(() => new WindowStore(), []);

	const windowClass = isHover ? "window_hover" : ""

	let RollupArrow = store.areTabsRolledUp ? MdArrowRight : MdArrowDropDown;

	return (
		<>
			<ReactSortable
				id={props.window.id.toString()}
				className={`window ${windowClass}`}
				// @ts-ignore
				list={props.tabs}
				// Normally you'd use a state hook and pass "setState" here, but using a state hook interferes with
				// re-rendering due to out-of band tab changes.
				setList={() => {}}
				animation={200}
				onEnd={onDragEnd}
			>

				<Container fluid>
					<Row>
						<Col>
							<RollupArrow onClick={store.toggleTabsRolledUp} />
							{props.window.name != "" &&
								`${props.window.name} - ` }
							<span className="text-muted">
								{props.tabs.length} tabs
							</span>
						</Col>
						<Col sm="auto" className='p-0'>
							<div className="float-end"
								 // Without this, the icon buttons increase the size of the tab line
								 style={{ maxHeight: "24px" }} >
								{/* TODO size/align the ellipse a lil better */}
								{/* FIXME the dropdown hangs off the side */}
								{/* TODO since this component can be displayed in different contexts now (all tabs vs window groups) the dropdown menu should be configurable based on context. E.g. in the window groups page, the dropdown should include "remove from group" */}
								<Dropdown style={{ display: "inline-block" }} id={`window-actions-${props.window.id}`} align="end">
									<Dropdown.Toggle
										as={CustomDropdownToggle}
										variant="icon"
										className="dropdown-no-caret" // This class doens't exist in this code base... but maybe that would be a better approach
										title={`Actions for window`}>
									</Dropdown.Toggle>
									<Dropdown.Menu className="shadow-sm">
										<EditWindowModalButton window={props.window}/>
									</Dropdown.Menu>
								</Dropdown>
								<Trash onClick={props.onCloseClick}/>
							</div>
						</Col>
					</Row>
				</Container>


				<> {
					store.areTabsRolledUp || props.tabs.map((tab) => (
						<Tab
							key={tab.id}
							tab={tab}
							mainClick={() => tab.focus()}
							trashClick={() => tab.close()}
							/>
					))
				} </>
			</ReactSortable>
			<hr/>
		</>
	);
}
export default observer(Window);

// @ts-ignore
const CustomDropdownToggle = React.forwardRef(({ children, onClick }, ref) => (
	<FaEllipsisV
		onClick={onClick}
		className="button-icon material-icons window-edit-button"
	/>
));

/** This component handles the button and modal for editing a window. */
const EditWindowModalButton = (props : {
	window: WindowModel,
}) => {
	const [show, setShow] = useState(false);

	const handleClose = () => setShow(false);
	const handleShow = () => setShow(true);

	const store = new FormStore()
	store.init({
		name: props.window.name,
		windowGroup: "",
	});

	const onSubmit = () => {
		props.window.name = store.formData.name;
		if (store.formData.windowGroup == "__add_new__") {
			WindowGroupStore.addWindowToNewGroup(
				props.window,
				store.formData.newWindowGroupName,
			);
		} else if (store.formData.windowGroup != "") {
			WindowGroupStore.addWindowToGroup(
				props.window,
				store.formData.windowGroup,
			);
		}
		return true;
	}

	return (
		<>
			<Dropdown.Item onClick={handleShow}>Edit Window</Dropdown.Item>

			<Modal show={show} onHide={handleClose}>
				<Modal.Header closeButton>
					<Modal.Title>Edit window</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<EditWindowForm
						store={store}
					/>
				</Modal.Body>
				<Modal.Footer>
					<Button variant="danger" onClick={() => onSubmit() && handleClose()}>
						Confirm
					</Button>
					<Button variant="secondary" onClick={handleClose}>
						Cancel
					</Button>
				</Modal.Footer>
			</Modal>
		</>
	);
}

/** The actual edit window form */
const EditWindowForm = observer((props : {
	store : FormStore,
}) => {
	return (
		<>
			<FloatingLabel
				controlId="floatingInput"
				label="Window Name"
			>
				<Form.Control
					name="name"
					placeholder=""
					value={props.store.formData.name}
				onChange={(e) => props.store.setName((e.target as any).value)}
				/>
			</FloatingLabel>

			<FloatingLabel
				controlId="floatingInput"
				label="Window Group"
				className="mt-3"
			>
				<Form.Select
					name="window-group"
					id="window-group"
					// disabled={!RegToolsStore.optChargesForm.override}
					onChange={(e) => props.store.setWindowGroup((e.target as any).value)}
					value={props.store.formData.windowGroup}
				>
					<option value="">(None)</option>
					<option value="__add_new__">Add New</option>
					{WindowGroupStore.windowGroups.map((windowGroup) => (
						<option key={windowGroup.name} value={windowGroup.name}>{windowGroup.name}</option>
					))}
				</Form.Select>
			</FloatingLabel>

			{/* Only show this if the user has selected "__add_new__" */}
			{ props.store.formData.windowGroup == "__add_new__" &&
				<FloatingLabel
					controlId="floatingInput"
					label="New Window Group Name"
					className="mt-3"
				>
					<Form.Control
						name="new-window-group-name"
						placeholder=""
						value={props.store.formData.newWindowGroupName}
					onChange={(e) => props.store.setNewWindowGroupName((e.target as any).value)}
					/>
				</FloatingLabel>
			}
		</>
	);
})

import { observable, action, makeObservable } from "mobx";

type FormStoreInitArgs = Omit<
	typeof FormStore.prototype.formData,
	"newWindowGroupName"
>

// TODO this should prolly go in its own file
class FormStore {
	formData = {
		name: "",
		windowGroup: "",
		newWindowGroupName: "",
	};

	constructor() {
		makeObservable(this, {
			formData: observable,
			init: action,
			setName: action,
			setNewWindowGroupName: action,
		});
	}

	init(formData: FormStoreInitArgs) {
		this.formData = {
			newWindowGroupName: "",
			...formData
		};
	}

	setName(name: string) {
		this.formData.name = name;
	}
	setWindowGroup(windowGroup: string) {
		this.formData.windowGroup = windowGroup;
	}
	setNewWindowGroupName(newWindowGroupName: string) {
		this.formData.newWindowGroupName = newWindowGroupName;
	}
}
