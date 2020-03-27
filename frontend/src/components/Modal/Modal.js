import React from 'react';
import ReactDOM from 'react-dom';

import Button from '../Button/Button';
import styles from './Modal.module.css';

// widely used modal with cancel and accept buttons
const modal = props =>
  ReactDOM.createPortal(
    <div className={styles.modal}>
      <header className={styles.modal__header}>
        <h1>{props.title}</h1>
      </header>
      <div className={styles.modal__content}>{props.children}</div>
      <div className={styles.modal__actions}>
        <Button design="danger" mode="flat" onClick={props.onCancelModal}>
          Cancel
        </Button>
        <Button
          mode="raised"
          onClick={props.onAcceptModal}
          disabled={!props.acceptEnabled}
          loading={props.isLoading}
        >
          Accept
        </Button>
      </div>
    </div>,
    document.getElementById('modal-root')
  );

export default modal;
