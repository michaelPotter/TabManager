import React, { useState, useMemo } from 'react';
import { observer } from "mobx-react";

import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import WindowComponent from './Window';
import WindowGroup from '../js/model/windowGroup/WindowGroup';
import Dropdown from 'react-bootstrap/esm/Dropdown';
import CustomDropdownToggle from './lib/CustomDropdownToggle';
import RollupArrow from './lib/RollupArrow';
import WindowGroupStore from '../js/appState/WindowGroupStore';
import { createWindowGroupArchive } from '../js/model/windowGroup/WindowGroupArchiver';
import ArchivedWindowGroupStore from '../js/model/archivedWindowGroup/ArchivedWindowGroupStore';

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
		// TODO do window ids persist between browser reboots? I'm not sure if they come back the same or we'd need some sort of heuristic to re-associate the persisted WGs with the rebuilt/recovered windows
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

										<Dropdown.Item>TODO Rename group</Dropdown.Item>

										<Dropdown.Item onClick={() => {
											let awg = createWindowGroupArchive(props.windowGroup);
											ArchivedWindowGroupStore.addAWG(awg);
											// TODO remove window group when we're sure everythign works
										}}>Copy to Archive (TEMP)</Dropdown.Item>

										{/* <Dropdown.Item onClick={() => {/1* TODO implement *1/}}> */}
										{/* 	TODO Move to Archive */}
										{/* </Dropdown.Item> */}

										<Dropdown.Item onClick={() => props.windowGroup.windows.length > 0 ?
											// TODO it might be better to open a confirm modal instead.
											window.alert("Cannot delete a window group with windows in it. Please close or remove them.") :
											WindowGroupStore.deleteWindowGroup(props.windowGroup.name)}>
											Delete this window group
										</Dropdown.Item>

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
						<WindowComponent
							window={w}
							key={w.id}
							dropdownMenu={
								<Dropdown.Menu className="shadow-sm">
									{/* TODO should we still include the edit option here? */}
									<Dropdown.Item onClick={() => WindowGroupStore.removeWindowFromGroup(w, props.windowGroup.name)}>
										Remove window from group
									</Dropdown.Item>
								</Dropdown.Menu>
							}
						/>
					))}
				</Card.Body>
			}
		</Card>
	)
});
