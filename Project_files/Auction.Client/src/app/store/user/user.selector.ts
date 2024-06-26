import { createSelector } from "@ngrx/store";
import { AppState } from "../app.state";

export const selectUserInfo = createSelector(
    (state: AppState) => state.userInfo,
    (userInfo) => userInfo
);

export const selectUserId = createSelector(
    selectUserInfo,
    (userInfo) => userInfo.id
);

export const selectUserType = createSelector(
    selectUserInfo,
    (userInfo) => userInfo.userType
);

export const selectUserProfilePicturePath = createSelector(
    selectUserInfo,
    (userInfo) => userInfo.profilePicturePath
);

export const selectNotifications = createSelector(
    (state: AppState) => state.notificationList,
    (notificationList) => notificationList.ids.map(id => notificationList.entities[id])
);