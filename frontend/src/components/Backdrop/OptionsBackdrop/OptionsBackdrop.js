import React from 'react';

import styles from './OptionsBackdrop.module.css';

const OptionsBackdrop = (props) => (
    props.show ? <div className={styles.OptionsBackdrop} onClick={props.clicked}></div> : null
);

export default OptionsBackdrop;