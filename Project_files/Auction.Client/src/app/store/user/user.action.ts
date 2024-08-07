import { createAction, props } from "@ngrx/store";
import { LoginDto, RegisterDto, User, Notification } from "../../models/user";
import { ArticleDto } from "../../models/article";

export const logIn = createAction("Log In", props<{loginDto : LoginDto}>());
export const logInWithToken = createAction("Log In With Token");
export const logInSuccess = createAction("Log In - Success", props<{user: User}>());
export const register = createAction("Register", props<{registerDto: RegisterDto}>());
export const checkEmail = createAction("Mail check", props<{mail: String}>());
export const signOut = createAction("Sign Out");
export const signOutSuccess = createAction("Sign Out - Success");
export const changeProfilePhoto = createAction("Change Profile Photo", props<{photo: File}>());
export const changeProfilePhotoSuccess = createAction("Change Profile Photo - Success", props<{picturePath: String}>());
export const changeProfilePhotoFailed = createAction("Change Profile Photo - Failed");
export const addMoneyToAccount = createAction("Add Money To Account", props<{amount: number}>());
export const addMoneyToAccountSuccess = createAction("Add Money To Account - Success", props<{balance: number}>());
export const addMoneyToAccountFailed = createAction("Add Money To Account - Failed");
export const publishArticle = createAction("Publish Article", props<{articleDto : ArticleDto}>());
export const substractMoneyFromAccount = createAction("Substract Money From Account", props<{amount: number}>());
export const addNotifications = createAction("Add Notifications", props<{notifications: Notification[]}>());
export const addNewNotification = createAction("Add New Notifications", props<{notification: Notification}>());
export const clearNotificationList = createAction("Clear Notification List");
export const markAllNotificationsRead = createAction("Mark All Notifications Read");
export const markAllNotificationsReadSuccess = createAction("Mark All Notifications Read - Success");

export const resetToNotificationListInitialState = createAction("User - Reset To Notification List Initial State");