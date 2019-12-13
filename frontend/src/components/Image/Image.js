import React from 'react';

import styles from './Image.module.css';

const image = props => (
  <div
    className={styles.image}
    style={{
      backgroundImage: `url('${props.imageUrl}')`,
      backgroundSize: props.contain ? 'contain' : 'cover',
      backgroundPosition: props.left ? 'left' : 'center'
    }}
  />
);

export default image;
