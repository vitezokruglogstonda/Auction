export interface AppInfo{
    loginStatus: LoginStatus;
    loginError: boolean;
    accountImagePath: String;
    registerError: boolean;
    emailTaken: boolean;
}

export enum LoginStatus {
    Offline,
    Online
}