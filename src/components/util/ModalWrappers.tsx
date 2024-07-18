import ReactDOM from 'react-dom';
import React, { useState } from 'react';

import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';


/**
 * A utility function to easily show a confirmation dialog for an action.
 * Wraps a callback in a confirmation dialog. If the user does not confirm, the
 * callback will not be performed.
 *
 * Currently takes one string arg that shows as the body of the modal, but maybe a method overload that takes a title for the modal would be nice.
 */
export const wrapWithConfirm = (
	text: string,
	onConfirm: (a?: any) => void
) => {
	return function() {
		tempRender(props => (
			<MyModal
				onConfirm={onConfirm}
				onClose={props.onClose}
				title="Confirmation required"
			>
				<p>{text}</p>
			</MyModal>
		))
	}
}

export const wrapWithInput = (
	text: string,
	onSubmit: (input: string) => void
) => {
	return function() {
		tempRender(props => {
			const [input, setInput] = useState("");
			let closeModal = () => {};
			return (
				<MyModal
					onConfirm={() => onSubmit(input)}
					onClose={props.onClose}
					confirmButtonText="Submit"
					confirmButtonVariant="primary"
					confirmButtonDisabled={input === ""}
					setCloseModal={f => closeModal = f}
					title={text}
				>

					<Form
						onSubmit={(e: any) => {
							e.preventDefault();
							onSubmit(input);
							closeModal();
					}}>
						<Form.Label>{text}</Form.Label>
						<Form.Control
							autoFocus
							name="input"
							type="text"
							onChange={e => setInput(e.target.value)}
						/>
					</Form>

				</MyModal>
			)
		})
	}
}

type ClosableComponent = React.FC<{onClose: () => void}>

/**
 * Internal helper, render the given component temporarily. It should take an
 * onClose prop, which will be a callback to remove the component from the DOM.
 */
const tempRender = (Component: ClosableComponent) => {
	// This is a little hacky... create a div element on the page, to render a
	// separate react tree. Remove after the modal closes.
	const div = document.createElement('div');
	document.body.appendChild(div);

	let modal = (
		<Component onClose={() => document.body.removeChild(div)} />
	)

	ReactDOM.render(modal, div);
}

const MyModal = (props : {
	onConfirm: (a?: any) => void,
	onClose: () => void,
	title?: string,
	confirmButtonText?: string,
	confirmButtonVariant?: string,
	confirmButtonDisabled?: boolean,
	setCloseModal?: (cb: () => void) => void,
	children: React.ReactNode,
}) => {
	const [show, setShow] = useState(true);
	props.setCloseModal?.(() => setShow(false));

	return (
		<>

			{/* <p>Testing for leaks! Uncomment me to make sure the component */}
			{/* gets cleaned up.</p> */}

			<Modal
				show={show}
				onHide={() => setShow(false)}
				onExited={props.onClose}
			>
				<Modal.Header closeButton>
					<Modal.Title>{props.title}</Modal.Title>
				</Modal.Header>

				<Modal.Body>
					{props.children}
				</Modal.Body>

				<Modal.Footer>
					<Button variant="outline-secondary" onClick={() => setShow(false)}>
						Cancel
					</Button>
					<Button
						variant={props.confirmButtonVariant ?? "outline-danger"}
						disabled={(props.confirmButtonDisabled ?? false)}
						onClick={() => { props.onConfirm(); setShow(false); }}
					>
						{props.confirmButtonText ?? "Confirm"}
					</Button>
				</Modal.Footer>

			</Modal>
		</>
	);
}