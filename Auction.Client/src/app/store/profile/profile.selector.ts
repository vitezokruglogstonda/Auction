import { createSelector } from "@ngrx/store";
import { AppState } from "../app.state";

export const selectProfileInfo = createSelector(
    (state: AppState) => state.profileInfo,
    (profileInfo) => profileInfo
);