import React from 'react';
import { NavLink } from 'react-router-dom';

import MobileToggle from '../MobileToggle/MobileToggle';
import Logo from '../../Logo/Logo';
import NavigationItems from '../NavigationItems/NavigationItems';
import Search from '../../Search/Search';

import styles from './MainNavigation.module.css';

const mainNavigation = props => (
  <nav className={styles.mainNav}>
    <MobileToggle onOpen={props.onOpenMobileNav} />
    <div className={styles.mainNav__logo} >
      <NavLink to="/">
        <Logo />
      </NavLink>
    </div>
    <div className={styles.spacer} />
    <div className={styles.mainNav__logo} >
        <Search isAuth={props.isAuth} token={props.token} history={props.history} />
    </div>
    <div className={styles.spacer} />
    <ul className={styles.mainNav__items}>
      <NavigationItems userId={props.userId} isAuth={props.isAuth} onLogout={props.onLogout} />
    </ul>
  </nav>
);

export default mainNavigation;
