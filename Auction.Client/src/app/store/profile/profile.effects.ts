import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import * as ProfileActions from "./profile.action";
import { switchMap } from "rxjs";
import { UserProfile } from "../../models/user";
import { ProfileService } from "../../services/profile.service";

@Injectable()
export class ProfileEffects {
    constructor(private actions$: Actions, private profileService: ProfileService) { }

    getProfile = createEffect(() =>
        this.actions$.pipe(
            ofType(ProfileActions.getProfile),
            switchMap((action) =>
                this.profileService.getProfile(action.userId).pipe(
                    switchMap((profile: UserProfile|null) => {
                        if (profile) {
                            return [
                                ProfileActions.getProfileSuccess({ profile: profile }),
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