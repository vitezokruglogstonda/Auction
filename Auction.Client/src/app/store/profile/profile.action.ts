import { createAction, props } from "@ngrx/store";
import { UserProfile } from "../../models/user";


export const getProfile = createAction("Ger User Profile", props<{userId : number}>());
export const getProfileSuccess = createAction("Ger User Profile - Success", props<{profile : UserProfile}>());
export const profilePictureChanged = createAction("Profile picture changed", props<{picturePath: String}>());