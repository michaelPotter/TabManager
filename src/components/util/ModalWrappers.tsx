import ReactDOM from 'react-dom';
import React, { useEffect, useRef, useState } from 'react';

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
		tempRender(removeTempRenderTree => () => (
			<MyModal
				onConfirm={onConfirm}
				onClose={removeTempRenderTree}
				title="Confirmation required"
			>
				<p>{text}</p>
			</MyModal>
		))
	}
}

type WrapWithInputOptions = {
	text: string;
	title?: string;
	allowEmpty?: boolean;
	defaultValue?: string;
}

export const wrapWithInput = (
	textOrOpts: string | WrapWithInputOptions,
	onSubmit: (input: string) => void
) => {
	return function() {

		let opts = typeof textOrOpts == 'string' ? {
			text: textOrOpts,
			title: textOrOpts,
			allowEmpty: false,
			defaultValue: "",
		} : {
			text: textOrOpts.text,
			title: textOrOpts.title ?? textOrOpts.text,
			allowEmpty: textOrOpts.allowEmpty ?? false,
			defaultValue: textOrOpts.defaultValue ?? "",
		}

		tempRender(removeTempRenderTree => () => {
			const [input, setInput] = useState(opts.defaultValue);
			const inputRef: React.MutableRefObject<any> = useRef(null);
			useEffect(() => {
				inputRef.current.select();
			}, []);
			const closeModalRef = useRef(() => {});

			return (
				<MyModal
					onConfirm={() => onSubmit(input)}
					onClose={removeTempRenderTree}
					confirmButtonText="Submit"
					confirmButtonVariant="primary"
					confirmButtonDisabled={(!opts.allowEmpty) && input === ""}
					closeModalRef={closeModalRef}
					title={opts.title}
				>

					<Form
						onSubmit={(e: any) => {
							e.preventDefault();
							onSubmit(input);
							closeModalRef.current?.();
					}}>
						<Form.Label>{opts.text}</Form.Label>
						<Form.Control
							autoFocus
							ref={inputRef}
							name="input"
							type="text"
							value={input}
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
 * Internal helper to render a component in a separate, temporary React tree.
 *
 * This function requires as input a "component builder function". The builder
 * function should take a callback and return a React component. The callback
 * will remove the temporary render tree when called.
 */
const tempRender = (buildComponent: (removeTempRenderTree: () => void) => React.FC) => {
	// This is a little hacky... create a div element on the page, to render a
	// separate react tree. Remove after the modal closes.
	const div = document.createElement('div');
	document.body.appendChild(div);

	let Component = buildComponent(() => document.body.removeChild(div));

	ReactDOM.render(<Component/>, div);
}

const MyModal = (props : {
	onConfirm: (a?: any) => void,
	onClose: () => void,
	title?: string,
	confirmButtonText?: string,
	confirmButtonVariant?: string,
	confirmButtonDisabled?: boolean,
	closeModalRef?: React.MutableRefObject<any>
	children: React.ReactNode,
}) => {
	const [show, setShow] = useState(true);
	if (props.closeModalRef) {
		props.closeModalRef.current = () => setShow(false);
	}

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
