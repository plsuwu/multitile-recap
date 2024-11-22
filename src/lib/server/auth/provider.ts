import { Twitch } from 'arctic';
import {
    TWITCH_CLIENT_ID,
    TWITCH_CLIENT_SECRET,
    TWITCH_CALLBACK_URI
} from '$env/static/private';


export const twitch = new Twitch(
    TWITCH_CLIENT_ID,
    TWITCH_CLIENT_SECRET,
    TWITCH_CALLBACK_URI
);
