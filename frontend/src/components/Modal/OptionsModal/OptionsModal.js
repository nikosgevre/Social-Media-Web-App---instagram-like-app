import React, {Fragment} from 'react';

import Button from '../../Button/Button';
import OptionsBackdrop from '../../Backdrop/OptionsBackdrop/OptionsBackdrop';

import styles from './OptionsModal.module.css';

const OptionsModal = (props) => (
    <Fragment>
        <OptionsBackdrop show={props.show} clicked={props.optionsModalClosed} />
        <div 
            className={styles.OptionsModal}
            style={{transform: props.show ? 'translateY(0)' : 'translateY(-100vh)',
                    opacity: props.show ? '1' : '0'
            }}>
            {props.children}
            <Button mode="flat" design="danger" onClick={props.optionsModalClosed}>
                Cancel
            </Button>
        </div>
    </Fragment>
);

export default OptionsModal;