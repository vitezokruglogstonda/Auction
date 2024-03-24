import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import * as ProfileActions from "./profile.action";
import { switchMap } from "rxjs";
import { ProfileResult, UserProfile } from "../../models/user";
import { ProfileService } from "../../services/profile.service";
import { Article } from "../../models/article";

@Injectable()
export class ProfileEffects {
    constructor(private actions$: Actions, private profileService: ProfileService) { }

    getProfile = createEffect(() =>
        this.actions$.pipe(
            ofType(ProfileActions.getProfile),
            switchMap((action) =>
                this.profileService.getProfile(action.userId).pipe(
                    switchMap((result: ProfileResult|null) => {
                        if (result) {
                            return [
                                ProfileActions.getProfileSuccess({ profile: result.profile! }),
                                ProfileActions.loadProfileArticlesSuccess({items: result.articles !== null ? result.articles : []}),
                            ];
                        } else {
                            return [];
                        }
                    })
                )
            )
        )
    );

    getProfileArticles = createEffect(() =>
    this.actions$.pipe(
        ofType(ProfileActions.loadProfileArticles),
        switchMap((action) =>
            this.profileService.getProfileArticles(action.userId).pipe(
                switchMap((result: Article[] |null) => {
                    if (result) {
                        return [
                            ProfileActions.loadProfileArticlesSuccess({items: result}),
                        ];
                    } else {
                        return [];
                    }
                })
            )
        )
    )
);

}