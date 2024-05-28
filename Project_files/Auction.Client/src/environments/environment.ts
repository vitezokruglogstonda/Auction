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
    article_picture_upload: {
        fileSize: 4,
        numberOfFiles: 5,
        errorMessage_fileType: "Wrong file type. Try something else.",
        errorMessage_numberOfFiles: "You can upload maximum 5 photos.",
        errorMessage_fileSize: "Maximum file size is 4MB.",
    },
    article_data_upload: {
        errorMessage_inputField: "This field mandatory.",
        errorMessage_incompleteData: "You must provide all information before publishing this article.",
        errorMessage_publishArticleSuccess: "Article published successfully.",
        errorMessage_publishArticleFailed: "Article publishing failed.",
    },
    interceptor_sessionExpiredMessage: "Session expired, please login again.",
    view_articles_pageSizeOptions: [10,20,50,100],
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
        {
            title: "Add New Article",
            route: "create-article",
            permissions: [UserType.RegisteredUser, UserType.Admin]
        },
        {
            title: "Admin Dashboard",
            route: "admin-dashboard",
            permissions: [UserType.Admin]
        },
    ],
    sidenavIcons_Classes: [
        "fa-solid fa-right-to-bracket",
        "fa-solid fa-id-card",
        "fa-solid fa-house",
        "fa-solid fa-user",
        "fa-solid fa-gavel",
        "fa-solid fa-user-tie"
    ],
    addMoneyOptions: ["$100", "$200", "$500", "$1000", "$2000", "..."],
    defaultArticleImage: "https://cdn4.iconfinder.com/data/icons/ionicons/512/icon-image-512.png",
    defaultFee: 100,
};