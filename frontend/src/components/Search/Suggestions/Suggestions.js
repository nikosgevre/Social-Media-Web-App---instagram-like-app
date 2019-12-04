import React from 'react'
import { NavLink } from 'react-router-dom';

const Suggestions = (props) => {
  const options = props.results.map(r => (
    <li key={r._id}>
      <NavLink to={'/profile/' + r._id}>{r.name}</NavLink>
    </li>
  ))
  return <ul>{options}</ul>
}

export default Suggestions
