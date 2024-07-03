const FAVICON_RE_AVOID = /^chrome:\/\/.*\.svg$/
export default function Favicon(props: { src?: string; }) {
	let src = props.src ?? "undefined"
	src = FAVICON_RE_AVOID.test(src) ? "undefined" : src
	return <img src={src} className="favicon"/>
}
