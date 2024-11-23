import {
	TWITCH_CALLBACK_URI,
	TWITCH_CLIENT_ID,
	TWITCH_CLIENT_SECRET,
} from '$env/static/private';
import { Twitch } from 'arctic';

export const twitch = new Twitch(
	TWITCH_CLIENT_ID,
	TWITCH_CLIENT_SECRET,
	TWITCH_CALLBACK_URI,
);
