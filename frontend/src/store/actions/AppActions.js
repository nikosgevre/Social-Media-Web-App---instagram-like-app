import * as actionTypes from './actionTypes';

export const loginHandler = (token, userId) => {
    return {
        type: actionTypes.LOGIN_HANDLE,
        token: token,
        userId: userId
    }
};

export const logoutHandler = () => {
    return {
        type: actionTypes.LOGOUT_HANDLE
    }
};

export const signupHandler = () => {
    return {
        type: actionTypes.SIGNUP_HANDLE
    }
};

export const backdropHandler = () => {
    return {
        type: actionTypes.BACKDROP_SHOW
    }
};

export const mobileNavHandler = (isOpen) => {
    return {
        type: actionTypes.MOBILE_NAV,
        isOpen: isOpen
    }
};

export const errorHandler = () => {
    return {
        type: actionTypes.ERROR
    }
};