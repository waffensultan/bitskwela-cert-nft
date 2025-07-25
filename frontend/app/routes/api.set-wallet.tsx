import { type ActionFunctionArgs, type LoaderFunctionArgs, json } from "@remix-run/node";
import { createCookie } from "@remix-run/node";

export const walletCookie = createCookie("wallet", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production" ? true : false,
    sameSite: "strict",
    path: "/",
});

function walletAddressIsValid(walletAddress: any) {
    if (typeof walletAddress !== "string" || !/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
        return false;
    }
}

export async function loader() {
    return json({ error: "Method Not Allowed" }, { status: 405 });
}

export async function action({ request }: ActionFunctionArgs) {
    const formData = await request.formData();
    const walletAddress = formData.get("walletAddress");

    if (walletAddressIsValid(walletAddress)) {
        return json({ error: "Invalid wallet address" }, { status: 400 });
    }

    return json(
        { success: true },
        { headers: { "Set-Cookie": await walletCookie.serialize(walletAddress) } },
    );
}
