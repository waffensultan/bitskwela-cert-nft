import { redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import { getWalletAddress } from "~/utils/auth";
import { isContractOwner } from "~/utils/contract";

import type { LoaderFunctionArgs } from "@remix-run/node";

export async function loader(request: LoaderFunctionArgs) {
    const res = await getWalletAddress(request);
    const { walletAddress } = await res.json();

    if (!walletAddress) {
        return redirect("/");
    }

    const isAdmin = await isContractOwner(walletAddress);

    return { isAdmin };
}

export default function ViewCertificateRoute() {
    const { isAdmin } = useLoaderData<typeof loader>();

    return isAdmin ? AdminUserUI : RegularUserUI;
}

function RegularUserUI() {
    return <div>This is for regular users</div>;
}

function AdminUserUI() {
    return <div>This is for admin users</div>;
}
