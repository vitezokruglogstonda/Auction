import { AppInfo } from "../models/app-info";
import { User, UserProfile } from "../models/user";

export interface AppState{
    appInfo: AppInfo;
    userInfo: User;
    profileInfo: UserProfile;
}