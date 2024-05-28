import { UserType } from "./user";

export interface SidenavListItem{
    title: String;
    route: String;
    permissions: UserType[];
}