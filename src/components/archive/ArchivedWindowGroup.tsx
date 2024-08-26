import { useState } from 'react';
import { observer } from "mobx-react";

import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import Dropdown from 'react-bootstrap/esm/Dropdown';
import CustomDropdownToggle from '../lib/CustomDropdownToggle';
import RollupArrow from '../lib/RollupArrow';
import { ArchivedWindowGroup } from '../../js/model/archivedWindowGroup/ArchivedWindowGroup';
import ArchivedWindow from './ArchivedWindow';
import ArchivedWindowGroupStore from '../../js/model/archivedWindowGroup/ArchivedWindowGroupStore';
import { wrapWithConfirm, wrapWithInput } from '../util/ModalWrappers';
import WindowGroupStore from '../../js/appState/WindowGroupStore';
import WindowStore from '../../js/appState/WindowStore';
import WindowModel from '../../js/model/window/Window';
import { unarchiveWindowGroup } from '../../js/model/windowGroup/WindowGroupArchiver';
import { Join } from '../lib/Join';

/**
 * WindowGroup
 */
export default observer((
	props : {
		archivedWindowGroup: ArchivedWindowGroup,
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
							{props.archivedWindowGroup.name} {" - "}
							<span className="text-muted">
							{props.archivedWindowGroup.windows.length} windows
							{" - "} {props.archivedWindowGroup.windows.reduce((acc, w) => acc + w.tabs.length, 0)} tabs
							</span>
						</Col>
						<Col sm="auto" className='p-0'>
							<div>
								<Dropdown style={{ display: "inline-block" }} id={`windowgroup-actions-${props.archivedWindowGroup.name}`} align="end">
									<CustomDropdownToggle
										title={`Actions for window-group`}/>
									<Dropdown.Menu className="shadow-sm">
										<Dropdown.Item onClick={wrapWithInput("Rename Window Group", (input: string) => {
											ArchivedWindowGroupStore.renameAWG(props.archivedWindowGroup.name, input)
										})}>Rename group</Dropdown.Item>
										<Dropdown.Item onClick={() => unarchiveWindowGroup(props.archivedWindowGroup)}>
											Unarchive
										</Dropdown.Item>
										<Dropdown.Item
											onClick={wrapWithConfirm("Are you sure you want to delete this window group?", () => {
													ArchivedWindowGroupStore.deleteAWG(props.archivedWindowGroup.name)
											})}
										>Delete Group</Dropdown.Item>
									</Dropdown.Menu>
								</Dropdown>
							</div>
						</Col>
					</Row>
				</Container>
			</Card.Header>
			{ isRolledUp ||
				<Card.Body>
					<Join
						separator={<hr/>}
						items={props.archivedWindowGroup.windows}
						keyBy={w => w.name}
						renderItem={w => <ArchivedWindow window={w}/>}
						/>
				</Card.Body>
			}
		</Card>
	)
});
