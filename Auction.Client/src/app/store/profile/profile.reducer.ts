import { createReducer, on } from "@ngrx/store";
import { UserProfile } from "../../models/user";
import * as Actions from "./profile.action";

export const initialState: UserProfile = {
    id: 0,
    email: "",
    firstName: "",
    lastName: "",
    birthDate: null,
    gender: "",
    profilePicturePath: ""
};

export const profileReducer = createReducer(
    initialState,
    on(Actions.getProfile, (state, {userId}) => ({...state})),
    on(Actions.getProfileSuccess, (state, {profile}) => ({
        ...profile
    })),
    on(Actions.profilePictureChanged, (state, {picturePath}) => ({
        ...state,
        profilePicturePath: picturePath
    })),
);