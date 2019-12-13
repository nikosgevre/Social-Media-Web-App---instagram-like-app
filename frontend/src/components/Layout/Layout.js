import React, { Fragment } from 'react';

import styles from './Layout.module.css';

const layout = props => (
  <Fragment>
    <header className={styles.mainHeader}>{props.header}</header>
    {props.mobileNav}
    <main className={styles.content}>{props.children}</main>
  </Fragment>
);

export default layout;
