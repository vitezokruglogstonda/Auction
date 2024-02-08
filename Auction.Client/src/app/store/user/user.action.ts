import { createAction, props } from "@ngrx/store";
import { LoginDto, RegisterDto, User } from "../../models/user";

export const logIn = createAction("Log In", props<{loginDto : LoginDto}>());
export const logInSuccess = createAction("Log In - Success", props<{user: User}>());
export const register = createAction("Register", props<{registerDto: RegisterDto}>());
export const checkEmail = createAction("Mail check", props<{mail: String}>());
export const signOut = createAction("Sign Out");
export const signOutSuccess = createAction("Sign Out - Success");
export const changeProfilePhoto = createAction("Change Profile Photo", props<{photo: File}>());
export const changeProfilePhotoSuccess = createAction("Change Profile Photo - Success", props<{picturePath: String}>());
export const addMoneyToAccount = createAction("Add Money To Account", props<{amount: number}>());
export const addMoneyToAccountSuccess = createAction("Add Money To Account - Success", props<{balance: number}>());