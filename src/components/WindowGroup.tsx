import React, { useState, useMemo } from 'react';
import { observer } from "mobx-react";

import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import WindowComponent from './Window';
import WindowManager from '../js/model/window/WindowManager';
import WindowGroup from '../js/model/windowGroup/WindowGroup';
import Dropdown from 'react-bootstrap/esm/Dropdown';
import CustomDropdownToggle from './lib/CustomDropdownToggle';
import RollupArrow from './lib/RollupArrow';

/**
 * WindowGroup
 */
export default observer((
	props : {
		windowGroup: WindowGroup,
	}
) => {
	const [isRolledUp, setIsRolledUp] = useState(false);
	const toggleIsRolledUp = () => setIsRolledUp(!isRolledUp);

	return (
		// TODO There's a lot of padding inside the card, seems like it'd be better with more padding around the card instead.
		<Card className="mb-3">
			<Card.Header>
				<Container fluid>
					<Row>
						<Col>
							<RollupArrow closed={isRolledUp} onClick={toggleIsRolledUp} />
							{props.windowGroup.name} {" - "}
							<span className="text-muted">
							{props.windowGroup.windows.length} windows
							</span>
						</Col>
						<Col sm="auto" className='p-0'>
							<div className="float-end"
								// Without this, the icon buttons increase the size of the tab line
								style={{ maxHeight: "24px" }} >
								{/* TODO size/align the ellipse a lil better */}
								{/* FIXME the dropdown hangs off the side */}
								<Dropdown style={{ display: "inline-block" }} id={`windowgroup-actions-${props.windowGroup.name}`} align="end">
									<CustomDropdownToggle
										title={`Actions for window-group`}/>
									<Dropdown.Menu className="shadow-sm">
										<Dropdown.Item>TODO Rename</Dropdown.Item>
										<Dropdown.Item>TODO Move to Archive</Dropdown.Item>
										<Dropdown.Item>TODO Delete this window group (TODO popup an are you sure? message)</Dropdown.Item>
									</Dropdown.Menu>
								</Dropdown>
								{/* For safety, don't allow deleting rolled up windows */}
								{/* {store.areTabsRolledUp || <Trash onClick={props.onCloseClick}/>} */}
							</div>
						</Col>
					</Row>
				</Container>
			</Card.Header>
			{ isRolledUp ||
				<Card.Body>
					{props.windowGroup.windows.map(w => (
						<WindowComponent window={w} key={w.id}/>
					))}
				</Card.Body>
			}
		</Card>
	)
});
