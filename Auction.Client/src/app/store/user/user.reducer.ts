import { createReducer, on } from "@ngrx/store";
import { User, UserType } from "../../models/user";
import * as Actions from "./user.action";

export const initialState: User = {
    id: 0,
    email: "",
    firstName: "",
    lastName: "",
    birthDate: {
        year: 0,
        month: 0,
        day: 0
    },
    gender: "",
    userType: UserType.Guest,
    profilePicturePath: "",
    balance: 0,
    JWT: "",
};

export const userReducer = createReducer(
    initialState,
    on(Actions.logIn, (state, {loginDto}) => ({...state})),
    on(Actions.logInSuccess, (state, {user}) => ({
        ...user,
    })),
    on(Actions.register, (state, {registerDto}) => ({...state})),
    on(Actions.checkEmail, (state, {mail}) => ({...state})),
    on(Actions.signOut, (state)=>({
        ...state
    })),
    on(Actions.signOutSuccess, (state)=>({
        ...initialState
    })),
    on(Actions.changeProfilePhoto, (state, {photo})=>({
        ...state
    })),
    on(Actions.changeProfilePhotoSuccess, (state, {picturePath})=>({
        ...state,
        profilePicturePath: picturePath
    })),
    on(Actions.addMoneyToAccount, (state, {amount})=>({
        ...state
    })),
    on(Actions.addMoneyToAccountSuccess, (state, {balance})=>({
        ...state,
        balance: balance
    })),
);