import React from 'react';
import { NavLink } from 'react-router-dom';

import MobileToggle from '../MobileToggle/MobileToggle';
import Logo from '../../Logo/Logo';
import NavigationItems from '../NavigationItems/NavigationItems';
import Search from '../../Search/Search';

import './MainNavigation.css';

const mainNavigation = props => (
  <nav className="main-nav">
    <MobileToggle onOpen={props.onOpenMobileNav} />
    <div className="main-nav__logo">
      <NavLink to="/">
        <Logo />
      </NavLink>
    </div>
    <div className="spacer" />
    <div className="main-nav__logo">
        <Search isAuth={props.isAuth} />
    </div>
    <div className="spacer" />
    <ul className="main-nav__items">
      <NavigationItems userId={props.userId} isAuth={props.isAuth} onLogout={props.onLogout} />
    </ul>
  </nav>
);

export default mainNavigation;
