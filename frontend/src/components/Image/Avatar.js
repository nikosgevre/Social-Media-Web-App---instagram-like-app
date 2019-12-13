import React from 'react';

import Image from './Image';
import styles from './Avatar.module.css';

const avatar = props => (
  <div
    className={styles.avatar}
    style={{ width: props.size + 'rem', height: props.size + 'rem' }}
  >
    <Image imageUrl={props.image} />
  </div>
);

export default avatar;
