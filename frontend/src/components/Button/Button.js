import React from 'react';
import { Link } from 'react-router-dom';

import './Button.css';

// button component for whether the button should act as a link or actual button
const button = props =>
  !props.link ? (
    <button
      className={[
        'button',
        `button--${props.design}`,
        `button--${props.mode}`
      ].join(' ')}
      onClick={props.onClick}
      disabled={props.disabled || props.loading}
      // href={props.link}
    >
      {props.loading ? 'Loading...' : props.children}
    </button>
  ) : (
    <Link
      className={[
        'button',
        `button--${props.design}`,
        `button--${props.mode}`
      ].join(' ')}
      to={`/${props.link}`}
    >
      {props.children}
    </Link>
  );

export default button;
