import React, { useState, useMemo } from 'react';
import { observer } from "mobx-react";

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Badge from 'react-bootstrap/Badge';
import Dropdown from 'react-bootstrap/Dropdown';
import { ReactSortable } from 'react-sortablejs';

import WindowGroupStore from '../js/appState/WindowGroupStore';
import Tab from './Tab';
import { Trash } from './Icons';
import CustomDropdownToggle from './lib/CustomDropdownToggle';
import RollupArrow from './lib/RollupArrow';
import WindowStore from '../js/appState/WindowStore';
import { wrapWithInput } from './util/ModalWrappers';

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
		dropdownMenu?: JSX.Element,
		showGroupBadge?: boolean,
	}
) => {
	const [isRolledUp, setIsRolledUp] = useState(false);
	const toggleIsRolledUp = () => setIsRolledUp(!isRolledUp);

	return (
		<div className="window">
			<Container fluid>
				<Row>

					<Col>
						<RollupArrow closed={isRolledUp} onClick={toggleIsRolledUp} />
						{props.window.name != "" &&
							`${props.window.name} - ` }
						<span className="text-muted">
							{props.window.tabs.length} tabs
						</span>
						{(props.showGroupBadge ?? true) && props.window.windowGroups.map((windowGroup) => (
							<Badge bg="secondary" className="ms-2" key={windowGroup}>
							{windowGroup}
							</Badge>
						))}
					</Col>

					<Col xs='auto' className="p-0">
						{/* TODO size/align the ellipse a lil better */}
						<Dropdown align="end">
							<CustomDropdownToggle
								// id="actions-for-window"
								title="Actions for window"
								/>
							{props.dropdownMenu ||
								<Dropdown.Menu
									renderOnMount={true}
									className="shadow-sm"
								>
									<Dropdown.Header>Window Actions</Dropdown.Header>

									<RenameWindowDropdownItem window={props.window}/>

									<Dropdown drop="start">
										<Dropdown.Toggle variant="outline-primary">Add to Group</Dropdown.Toggle>
										{/* TODO maybe look at this for a better implementation...
										https://mdbootstrap.com/docs/react/extended/dropdown-multilevel/#
										*/}
										<Dropdown.Menu>
											{WindowGroupStore.windowGroups.map((windowGroup) => (
												<Dropdown.Item
													key={windowGroup.name}
													onClick={() => WindowGroupStore.addWindowsToGroup([props.window], windowGroup.name)}
												>
													{windowGroup.name}
												</Dropdown.Item>
											))}
											<Dropdown.Divider />
											<Dropdown.Item onClick={
												wrapWithInput("New Group Name", (newGroupName) => {
													WindowGroupStore.addWindowsToNewGroup([props.window], newGroupName);
												})
											}>New Group</Dropdown.Item>
										</Dropdown.Menu>
									</Dropdown>
								</Dropdown.Menu>
							}
							</Dropdown>
							</Col>

					<Col xs='auto' className="p-0">
					{/* For safety, don't allow deleting rolled up windows */}
						{isRolledUp || <Trash onClick={() => WindowStore.closeWindow(props.window.id)}/>}
					</Col>

				</Row>
			</Container>

			{ isRolledUp ||
				<>
					<ReactSortable
						id={props.window.id.toString()}
						// @ts-ignore
						list={props.window.tabs}
						// Normally you'd use a state hook and pass "setState" here, but using a state hook interferes with
						// re-rendering due to out-of band tab changes.
						setList={() => {}}
						animation={200}
						onEnd={onDragEnd}
					>
						{props.window.tabs.map((tab) => (
							<Tab
								key={tab.id}
								tab={tab}
								mainClick={() => tab.focus()}
								trashClick={() => tab.close()}
								/>
						))}
					</ReactSortable>
				<hr/>
				</>
			}
		</div>
	);
}
export default observer(Window);

/**
	* A re-usable dropdown item that allows the user to rename the given window-like object.
	*/
	// TODO add this to the Archived version of a window. The data model over there might need some tweaking though.
export const RenameWindowDropdownItem = observer((
	props: {
		window: {
			name: string;
			setName: (s: string) => void;
		};
	}
) => {
	let text = props.window.name == "" ? "Name Window" : "Rename Window";
	return (
		<Dropdown.Item onClick={
			wrapWithInput({
				text,
				allowEmpty: true,
				defaultValue: props.window.name,
			}, (newWindowName) => {
				props.window.setName(newWindowName);
			})
		}>{text}</Dropdown.Item>
	)
})

