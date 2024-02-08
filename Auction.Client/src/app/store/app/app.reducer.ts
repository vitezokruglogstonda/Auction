import { createReducer, on } from "@ngrx/store";
import { AppInfo, LoginStatus } from "../../models/app-info";
import * as Actions from "./app.action";
import { environment } from "../../../environments/environment";

export const initialState: AppInfo = {
    loginStatus: LoginStatus.Offline,
    loginError: false,
    registerError: false,
    emailTaken: false,
    accountImagePath: environment.account_icon_basic_URL,
};

export const appReducer = createReducer(
    initialState,
    on(Actions.changeStatus, (state, {loginStatus, imagePath}) => ({
        ...state,
        loginStatus: loginStatus,
        accountImagePath: imagePath,
        loginError: false,
        registerError: false,
    })),
    on(Actions.loginFail, (state) => ({
        ...state,
        loginError: true
    })),
    on(Actions.registerFail, (state)=>({
        ...state,
        registerError: true
    })),
    on(Actions.updateEmailError, (state, {status})=>({
        ...state,
        emailTaken: status
    })),
    on(Actions.logout, (state)=>({
        ...initialState
    })),
    on(Actions.changeProfilePicture, (state, {picturePath})=>({
        ...state,
        accountImagePath: picturePath
    })),
);