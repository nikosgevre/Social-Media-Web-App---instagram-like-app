import React from 'react'
import { NavLink } from 'react-router-dom';

import './Suggestions.css';

// class Suggestions extends Component {
//   render() {
//     return {
//       <ul>
//       </ul>
//     }
//   }
// }

const Suggestions = (props) => {
  const options = props.results.map(r => (
    <li key={r._id}>
      <NavLink to={'/profile/' + r._id}>{r.name}</NavLink>
    </li>
  ))
  return <ul id="myUL">{options}</ul>
}

export default Suggestions
