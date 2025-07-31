import { type ActionFunctionArgs, json } from "@remix-run/node";

import { getWalletAddress } from "~/utils/auth";
import {
    isContractOwner,
    getCertificatesWithMetadata,
    getSingleCertificateWithMetadata,
} from "~/utils/contract";

export async function loader() {
    return json({ error: "Method Not Allowed" }, { status: 405 });
}


// TODO: Implement rate limiting!
export async function action(request: ActionFunctionArgs) {
    const walletRes = await getWalletAddress(request);
    const { walletAddress } = await walletRes.json();

    if (!walletAddress) {
        return json(
            { success: false, error: "Forbidden: You are not authenticated" },
            { status: 403 },
        );
    }

    const isAdmin = await isContractOwner(walletAddress);
    if (!isAdmin) {
        return json(
            { success: false, error: "Forbidden: You are not the contract owner" },
            { status: 403 },
        );
    }

    try {
        const { searchOption, searchTarget } = await request.request.json();

        if (!searchOption || !searchTarget) {
            return json({ success: false, error: "Missing search parameters" }, { status: 400 });
        }

        if (searchOption === "tokenId") {
            const cert = await getSingleCertificateWithMetadata(searchTarget);
            if (!cert) {
                return json({ success: false, error: "Certificate not found" }, { status: 404 });
            }

            return json({ success: true, certs: [cert] });
        }

        if (searchOption === "walletAddress") {
            const certs = await getCertificatesWithMetadata(searchTarget);
            return json({ success: true, certs });
        }
    } catch (error: any) {
        return json({ success: false, error: error.message || "Search failed" }, { status: 500 });
    }
}
