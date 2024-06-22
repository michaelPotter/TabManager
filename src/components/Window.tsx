import React, { useState } from 'react';

import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';


import Tab from './Tab.jsx';
import {
	Trash,
} from './Icons';
import { ReactSortable } from 'react-sortablejs';

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
export default function Window(
	props : {
		window: WindowModel,
		tabs: TabModel[],
		/** A callback to be triggered when the user clicks window close */
		onCloseClick: () => void,
	}
) {
	const [isHover, setIsHover] = useState(false);
	const handleMouseEnter = () => setIsHover(true);
	const handleMouseLeave = () => setIsHover(false);

	const windowClass = isHover ? "window_hover" : ""

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
							{props.tabs.length} tabs
						</Col>
						<Col sm="auto" className='p-0'>
							<div
								className="float-end"
								// Without this, the icon buttons increase the size of the tab line
								style={{ maxHeight: "24px" }}
							>
								<Trash onClick={props.onCloseClick}/>
							</div>
						</Col>
					</Row>
				</Container>

				{
					props.tabs.map((tab) => (
						<Tab
							key={tab.id}
							tab={tab}
							mainClick={() => tab.focus()}
							trashClick={() => tab.close()}
							/>
					))
				}
			</ReactSortable>
			<hr/>
		</>
	);
}
