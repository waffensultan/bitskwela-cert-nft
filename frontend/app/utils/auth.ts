import { redirect, json } from "@remix-run/node";

import { walletCookie } from "~/routes/api.set-wallet";

import type { LoaderFunctionArgs } from "@remix-run/node";

export async function getWalletAddress({ request }: LoaderFunctionArgs) {
    const cookieHeader = request.headers.get("Cookie");
    const wallet = await walletCookie.parse(cookieHeader);

    return json({ walletAddress: wallet ?? null });
}

export async function requireNoWalletAddress({ request }: LoaderFunctionArgs) {
    const cookieHeader = request.headers.get("Cookie");
    const wallet = await walletCookie.parse(cookieHeader);

    if (wallet) {
        return redirect("/user/home");
    }

    return json({ walletAddress: null });
}
