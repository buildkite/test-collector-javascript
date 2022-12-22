import React from 'react'

export default function Component(props) {
	return (
		<div>
			<label id='label' htmlFor='input'>{props.label}</label>
			<input id='input' value={props.value} />
		</div>
	)
}
