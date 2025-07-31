import { type ActionFunctionArgs, json } from "@remix-run/node";
import { walletCookie } from "~/routes/api.set-wallet";

export async function loader() {
    return json({ error: "Method Not Allowed" }, { status: 405 });
}

export async function action({ request }: ActionFunctionArgs) {
    return json(
        { success: true },
        {
            headers: {
                "Set-Cookie": await walletCookie.serialize("", { maxAge: 0 }),
            },
        },
    );
}
