import { redirect } from "@remix-run/node";

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

    if (!isAdmin) {
        return redirect("/user/home");
    }

    return null;
}

export default function ViewCertificateRoute() {
    return <div>WIP</div>;
}
