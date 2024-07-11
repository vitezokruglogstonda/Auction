import { createReducer, on } from "@ngrx/store";
import { Notification, NotificationListState, NotificationStatus, User, UserType } from "../../models/user";
import * as Actions from "./user.action";
import { EntityAdapter, createEntityAdapter } from "@ngrx/entity";

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
};

export const userReducer = createReducer(
    initialState,
    on(Actions.logIn, (state, {loginDto}) => ({...state})),
    on(Actions.logInWithToken, (state) => ({...state})),
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
    on(Actions.changeProfilePhotoFailed, (state)=>({
        ...state
    })),    
    on(Actions.addMoneyToAccount, (state, {amount})=>({
        ...state
    })),
    on(Actions.addMoneyToAccountSuccess, (state, {balance})=>({
        ...state,
        balance: balance
    })),
    on(Actions.addMoneyToAccountFailed, (state)=>({
        ...state
    })), 
    on(Actions.publishArticle, (state, {articleDto})=>({
        ...state
    })), 
    on(Actions.substractMoneyFromAccount, (state, {amount})=>({
        ...state,
        balance: state.balance-amount
    })),
);

export const notificationListAdapter: EntityAdapter<Notification> = createEntityAdapter<Notification>();

export const initialNotificationListState: NotificationListState = notificationListAdapter.getInitialState({
});

export const notificationListReducer = createReducer(
    initialNotificationListState,
    on(Actions.addNotifications, (state, {notifications}) => {
        return notificationListAdapter.addMany(notifications, notificationListAdapter.removeAll({ ...state }));
    }),
    on(Actions.addNewNotification, (state, {notification}) => {
        return notificationListAdapter.addOne(notification, state);
    }),
    on(Actions.markAllNotificationsRead, (state)=>({
        ...state
    })),   
    on(Actions.markAllNotificationsReadSuccess, (state) => {
        return notificationListAdapter.map(notification => ({...notification, status: NotificationStatus.Read}), state)
    }),
    on(Actions.clearNotificationList, (state) => {
        return notificationListAdapter.removeAll({ ...state });
    }),
    on(Actions.resetToNotificationListInitialState, (state) => ({
        ...initialNotificationListState
    }))
);