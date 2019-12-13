import React from 'react';
import ReactDOM from 'react-dom';

import Button from '../Button/Button';
import styles from './Modal.module.css';

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

// class Modal extends Component{
//   render () {
//     // return(
//       const random = ReactDOM.createPortal(
//         <div className="modal">
//           <header className="modal__header">
//             <h1>{this.props.title}</h1>
//           </header>
//           <div className="modal__content">{this.props.children}</div>
//           <div className="modal__actions">
//             <Button design="danger" mode="flat" onClick={this.props.onCancelModal}>
//               Cancel
//             </Button>
//             <Button
//               mode="raised"
//               onClick={this.props.onAcceptModal}
//               disabled={!this.props.acceptEnabled}
//               loading={this.props.isLoading}
//             >
//               Accept
//             </Button>
//           </div>
//         </div>,
//         document.getElementById('modal-root')
//       );
//     // )
//     return (random);
//   }
// };

export default modal;
