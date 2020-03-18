import React from 'react';

import './Input.css';

const input = props => (
  <div >
    {props.label && <label htmlFor={props.id}>{props.label}</label>}
    {props.control === 'input' && (
      <input
        // className={[
        //   !props.valid ? 'invalid' : 'valid',
        //   props.touched ? 'touched' : 'untouched'
        // ].join(' ')}
        className={props.class}
        type={props.type}
        name={props.name}
        id={props.id}
        required={props.required}
        value={props.value}
        placeholder={props.placeholder}
        onChange={e => props.onChange(props.id, e.target.value, e.target.files)}
        onBlur={props.onBlur}
      />
    )}
    {props.control === 'textarea' && (
      <textarea
        className={[
          !props.valid ? 'invalid' : 'valid',
          props.touched ? 'touched' : 'untouched'
        ].join(' ')}
        id={props.id}
        rows={props.rows}
        // cols="50"
        required={props.required}
        value={props.value}
        onChange={e => props.onChange(props.id, e.target.value)}
        onBlur={props.onBlur}
      />
    )}
  </div>
);

export default input;
