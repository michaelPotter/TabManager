import React, { useState, useMemo } from 'react';
import { observer, Observer } from "mobx-react";

import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Form from 'react-bootstrap/Form';
import { ReactSortable } from 'react-sortablejs';
import {
	MdArrowDropDown,
	MdArrowRight,
} from "react-icons/md";

import WindowStore from './state/WindowStore';
import Tab from './Tab.jsx';
import {
	Trash,
	Pencil,
} from './Icons';

import type TabModel from '../js/model/Tab';
import type WindowModel from '../js/model/Window';

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
							<div
								className="float-end"
								// Without this, the icon buttons increase the size of the tab line
								style={{ maxHeight: "24px" }}
							>
								<EditWindowModalButton
									window={props.window}
								/>
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
	});

	const onSubmit = () => {
		props.window.name = store.formData.name;
		return true;
	}

	return (
		<>
			<Pencil onClick={handleShow}/>

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
				// Uncomment this margin setting when other form items get added
				// className="mb-3"
			>
				<Form.Control
					name="name"
					placeholder=""
					value={props.store.formData.name}
				onChange={(e) => props.store.setName((e.target as any).value)}
				/>
			</FloatingLabel>
		</>
	);
})

import { observable, configure, action, flow, makeObservable } from "mobx";

// TODO this should prolly go in its own file
class FormStore {
	formData = {
		name: "",
	};

	constructor() {
		makeObservable(this, {
			formData: observable,
			init: action,
			setName: action,
		});
	}

	init(formData: typeof FormStore.prototype.formData) {
		this.formData = formData;
	}

	setName(name: string) {
		this.formData.name = name;
	}
}
