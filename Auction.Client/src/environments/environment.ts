import { UserType } from "../app/models/user";


export const environment = {
    server_url: "https://localhost:7287/",
    app_title: 'Auction',
    account_icon_tooltip_text: "Account",
    toolbar_menu_button_tooltip_text: "Menu",
    login_card_fieldError: "This field is required!",
    login_card_example_email: "name@example.com",
    email_pattern: `^[a-zA-Z0-9_\\-\\.]+@[a-zA-Z0-9_\\-\\.]+\\.[a-zA-Z]{2,5}$`,
    email_errorMessage_Invalid: "Your mail is not valid.",
    email_errorMessage_Taken: "This email adress is already taken. Try different one.",
    email_errorMessage_Existence: "This email is not registered.",
    password_errorMessage: "Password field is required. Enter it please.",
    password_hint: "Your password is too short. Try longer password.",
    password_rep_errorMessage: "Repeated password doesn't match password above.",
    password_wrong_error: "Wrong password, try again.",
    gender_list: ["Male", "Female"],
    account_icon_basic_URL: "/assets/Icons/account_icon.png",
    registrationError_snackBar: {
        text: "Something is missing. Check your input again.",
        button_text: "OK",
        horisontal_position: "end",
        vertical_position: 'bottom',
        duration: 10000,
    },
    // registrationError_FormIssue: "Something is missing. Check your input again.",
    dialog_UploadPhoto_Settings: {
        openAnimationDuration: "500ms",
        width: "40%",
        height: "40%",
        errorMessage_fileType: "Wrong file type. Try something else.",
        errorMessage_numberOfFiles: "You can upload just 1 file.",
    },
    dragAndDropSettings: {
        onDropClassName: "highlight",
        eventList_preventDefaults: ['dragenter', 'dragover', 'dragleave', 'drop'],
        eventList_highlight: ['dragenter', 'dragover'],
        eventList_unhighlight: ['dragleave', 'drop'],
    },
    dialog_AddMoney_Settings: {
        openAnimationDuration: "500ms",
        width: "20%",
        height: "50%"
    },
    sidenavItems: [
        {
            title: "Login",
            route: "login",
            permissions: [UserType.Guest, UserType.Admin]
        },
        {
            title: "Register",
            route: "register",
            permissions: [UserType.Guest, UserType.Admin]
        },
        {
            title: "Home Page",
            route: "",
            permissions: [UserType.RegisteredUser, UserType.Admin]
        },
        {
            title: "My Profile",
            route: "profile/",
            permissions: [UserType.RegisteredUser, UserType.Admin]
        },
    ],
    addMoneyOptions: ["$100", "$200", "$500", "$1000", "$2000", "..."]
};