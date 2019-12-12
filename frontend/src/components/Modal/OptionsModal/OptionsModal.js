import React from 'react';

import './OptionsModal.css';

const OptionsModal = (props) => (
    <div 
        className="OptionsModal"
        style={{transform: props.show ? 'translateY(0)' : 'translateY(-100vh)',
                opacity: props.show ? '1' : '0'
            }}
    >
        {props.children}
    </div>
);

export default OptionsModal;