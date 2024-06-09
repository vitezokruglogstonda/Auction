import { createAction, props } from "@ngrx/store";
import { LoginStatus } from "../../models/app-info";

export const changeStatus = createAction("Change Account Status", props<{loginStatus: LoginStatus, imagePath: String}>());
export const loginFail = createAction("Log In Fail");
export const registerFail = createAction("Registration Failed");
export const updateEmailError = createAction("Update Email Error", props<{status: boolean}>());
export const logout = createAction("Log Out Success");
export const changeProfilePicture = createAction("Change Profile Picture", props<{picturePath: String}>());
export const publishArticleSuccess = createAction("Publish Article - Success");
export const publishArticleFailed = createAction("Publish Article - Failed");
export const resetPublishArticleError = createAction("Reset Publish Article Error");
export const addNumberOfNotifications = createAction("Add Number Of Notifications", props<{number: number}>());
export const resetNumberOfNotifications = createAction("Reset Number Of Notifications");