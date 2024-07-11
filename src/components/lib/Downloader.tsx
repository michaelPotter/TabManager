import React from 'react';

/**
 * A wrapper component that triggers a download when clicked.
 */
export default function Downloader(
	props: {
		data: any;
		filename: string;
		children: React.ReactNode;
	}
) {
	return (
		<div onClick={() => {
			const data = typeof props.data === 'function' ? props.data() : props.data;
			const json = JSON.stringify(data);
			const blob = new Blob([json], { type: 'application/json' });
			const url = URL.createObjectURL(blob);
			
			const link = document.createElement('a');
			link.href = url;
			link.setAttribute('download', props.filename);
			
			document.body.appendChild(link);
			
			link.click();
			
			URL.revokeObjectURL(url);
			document.body.removeChild(link);
		}}>
			{props.children}
		</div>
	)
}
