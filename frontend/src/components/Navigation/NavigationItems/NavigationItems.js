import React, {Component} from 'react';
import { NavLink } from 'react-router-dom';

import './NavigationItems.css';

class NavigationItems extends Component {

  render() {

    const navItems = [
      { id: 'feed', text: 'Feed', link: '/', auth: true },
      { id: 'Profile', text: 'Profile', link: '/profile/' + this.props.userId, auth: true },
      { id: 'login', text: 'Login', link: '/', auth: false },
      { id: 'signup', text: 'Signup', link: '/signup', auth: false }
    ];

    return( [
      ...navItems.filter(item => item.auth === this.props.isAuth).map(item => (
        <li
          key={item.id}
          className={['navigation-item', this.props.mobile ? 'mobile' : ''].join(' ')}
        >
          <NavLink to={item.link} exact onClick={this.props.onChoose}>
            {item.text}
          </NavLink>
        </li>
      )),
      this.props.isAuth && (
        <li className="navigation-item" key="logout">
          <button onClick={this.props.onLogout}>Logout</button>
        </li>
      )
    ] );
  }

}


export default NavigationItems;
