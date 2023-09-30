import type { RequestHandler } from "@sveltejs/kit";
import { unpack, pack } from "msgpackr";

import { drive, auth } from "@googleapis/drive";
import { CLIENT_ID, CLIENT_SECRET } from "$env/static/private";

const authValidator = new auth.OAuth2(CLIENT_ID, CLIENT_SECRET);

export const POST: RequestHandler = async ({ request }) => { };
