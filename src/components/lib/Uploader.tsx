import React from 'react';

/**
 * A wrapper component that triggers a download when clicked.
 */
export default function Downloader(
	props: {
		onUpload: (data: any) => void;
		children: React.ReactNode;
	}
) {
	return (
		<div onClick={() => {

			const button = document.createElement('input');
			button.setAttribute('type', 'file');
			button.addEventListener('change', (e: any) => {
				const file = e.target.files[0];
				const reader = new FileReader();
				reader.readAsText(file);
				reader.onload = () => {
					const data = JSON.parse(reader.result as string);
					props.onUpload(data);
				}
			});
			
			document.body.appendChild(button);
			
			button.click();
			
			document.body.removeChild(button);
		}}>
			{props.children}
		</div>
	)
}
