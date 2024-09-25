import { Fragment } from "react";

/**
 * Join a list of 
 */
export function Join<T>({
	items,
	separator = <hr/>,
	renderItem,
	keyBy,
} : {
	items: T[];
	separator: JSX.Element;
	renderItem: (item: T) => JSX.Element;
	keyBy: (item: T) => string|number;
}) {
	return (
		<>
			{items.map((item, i) => (
				<Fragment key={keyBy(item) || i}>
					{i != 0 && separator}
					{renderItem(item)}
				</Fragment>
			))}
		</>
	)
}
