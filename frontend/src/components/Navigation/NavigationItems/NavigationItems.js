import React, {Component} from 'react';
import { NavLink } from 'react-router-dom';

import './NavigationItems.css';

class NavigationItems extends Component {

  render() {

    const navItems = [
      { id: 'feed', text: 'Feed', link: '/', auth: true },
      { id: 'Profile', text: 'Profile', link: '/profile/' + this.props.userId, auth: true },
      { id: 'chat', text: 'Chat', link: '/chat', auth: true },
      { id: 'login', text: 'Login', link: '/', auth: false },
      { id: 'signup', text: 'Signup', link: '/signup', auth: false },
      { id: 'logout', text: 'Logout', link: '/', auth: true }
    ];

    return( [
      ...navItems.filter(item => item.auth === this.props.isAuth).map(item => (
        <li
          key={item.id}
          className={['navigation-item', this.props.mobile ? 'mobile' : ''].join(' ')}
        >
          {item.id !== 'logout' ? (<NavLink to={item.link} exact onClick={this.props.onChoose}>{item.text}</NavLink>) : (<NavLink to={item.link} exact onClick={this.props.onLogout}>Logout</NavLink>) }
          
        </li>
      ))
    ] );
    
  }

}


export default NavigationItems;
