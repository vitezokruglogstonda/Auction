import { createSelector } from "@ngrx/store";
import { AppState } from "../app.state";

export const selectAppInfo = createSelector(
    (state: AppState) => state.appInfo,
    (account_info) => account_info
);

export const selectLoginStatus = createSelector(
    selectAppInfo,
    (state) => state.loginStatus
);

export const selectLoginErrorStatus = createSelector(
    selectAppInfo,
    (state) => state.loginError
);

export const selectEmailTaken = createSelector(
    selectAppInfo,
    (state) => state.emailTaken
);

export const selectAccountImagePath = createSelector(
    selectAppInfo,
    (state) => state.accountImagePath
);