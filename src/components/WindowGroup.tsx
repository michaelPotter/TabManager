import { useState } from 'react';
import { observer } from "mobx-react";

import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import WindowComponent, { RenameWindowDropdownItem } from './Window';
import type { WindowGroup } from '../js/model/windowGroup/WindowGroup';
import Dropdown from 'react-bootstrap/esm/Dropdown';
import CustomDropdownToggle from './lib/CustomDropdownToggle';
import RollupArrow from './lib/RollupArrow';
import WindowGroupStore from '../js/appState/WindowGroupStore';
import { archiveWindowGroup } from '../js/model/windowGroup/WindowGroupArchiver';
import { wrapWithInput } from './util/ModalWrappers';
import { Join } from './lib/Join';

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
		<Card className="my-1">
			<Card.Header>
				<Container fluid>
					<Row>
						<Col>
							<RollupArrow closed={isRolledUp} onClick={toggleIsRolledUp} />
							{props.windowGroup.name} {" - "}
							<span className="text-muted">
							{props.windowGroup.windows.length} windows
							{" - "} {props.windowGroup.windows.reduce((acc, w) => acc + w.tabs.length, 0)} tabs
							</span>
						</Col>
						<Col sm="auto" className='p-0'>
							<div className="float-end"
								// Without this, the icon buttons increase the size of the tab line
								style={{ maxHeight: "24px" }} >
								<Dropdown style={{ display: "inline-block" }} id={`windowgroup-actions-${props.windowGroup.name}`} align="end">
									<CustomDropdownToggle
										title={`Actions for window-group`}/>
									<Dropdown.Menu className="shadow-sm">
										<Dropdown.Header>Window Group Actions</Dropdown.Header>

										<Dropdown.Item onClick={wrapWithInput({
											text: "Rename Window Group",
											defaultValue: props.windowGroup.name,
										}, (input: string) => {
											WindowGroupStore.renameWindowGroup(props.windowGroup.name, input)
										})}>Rename group</Dropdown.Item>

										<Dropdown.Item onClick={() => archiveWindowGroup(props.windowGroup)}>
											Move to Archive
										</Dropdown.Item>

										<Dropdown.Item onClick={() => props.windowGroup.windows.length > 0 ?
											// TODO it might be better to open a confirm modal instead.
											window.alert("Cannot delete a window group with windows in it. Please close or remove them.") :
											WindowGroupStore.deleteWindowGroup(props.windowGroup.name)}>
											Delete group
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
					<Join
						separator={<hr/>}
						items={props.windowGroup.windows}
						keyBy={w => w.id}
						renderItem={w => (
							<WindowComponent
								window={w}
								key={w.id}
								showGroupBadge={false}
								dropdownMenu={
									<Dropdown.Menu className="shadow-sm">
										<Dropdown.Header>Window Actions</Dropdown.Header>
										<RenameWindowDropdownItem window={w}/>
										<Dropdown.Item onClick={() =>
											WindowGroupStore.removeWindowFromGroup(w, props.windowGroup.name)
										}>
											Remove window from group
										</Dropdown.Item>
									</Dropdown.Menu>
								}/>
						)}/>
				</Card.Body>
			}
		</Card>
	)
});
