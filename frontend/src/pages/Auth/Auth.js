import React from 'react';

import styles from './Auth.module.css';

const auth = props => <section className={styles.authForm}>{props.children}</section>;

export default auth;
