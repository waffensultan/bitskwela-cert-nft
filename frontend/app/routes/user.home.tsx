import { json, Link, useLoaderData, redirect } from "@remix-run/react";

import { ChevronRightIcon } from "lucide-react";

import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";

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

    return json({ isAdmin });
}

export default function HomeRoute() {
    const { isAdmin } = useLoaderData<typeof loader>();

    const routes = {
        "Issue a Certificate": {
            route: "/user/issue-certificate",
            description: "Restricted to contract owner. Issue NFT certificates to learners.",
        },
        "View Certificates": {
            route: "/user/view-certificate",
            description: "Search and view publicly available NFT certificates.",
        },
        "Generate NFT Metadata": {
            route: "/generate-metadata",
            description: "Create ERC-721 compliant NFT metadata.",
        },
    };

    return (
        <main className="min-h-screen flex flex-col justify-center items-center bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-yellow-100 via-orange-200 to-amber-500">
            <div className="grid grid-cols-1 gap-4">
                <Card className="bg-stone-100 border-yellow-500 backdrop-blur-sm flex flex-col justify-center items-center">
                    <CardHeader>
                        <CardTitle className="text-white gap-2 font-unbounded bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                            <h1>Bitskwela Certificate Dashboard</h1>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-3 w-full">
                        {Object.entries(routes).map(([label, value]) => {
                            const isIssueACertificate = label === "Issue a Certificate";
                            const isDisabled = isIssueACertificate && !isAdmin;
                            const link = isDisabled ? "" : value.route;

                            return (
                                <Link key={label} to={link}>
                                    <Button
                                        disabled={isDisabled}
                                        className="group h-15 flex justify-between w-full bg-slate-700 border border-slate-600 hover:bg-blue-500 hover:border-blue-400 transition-all rounded-xl py-4 text-left text-white shadow-md hover:shadow-lg"
                                    >
                                        <div className="flex flex-col gap-1">
                                            <h2 className="text-base font-semibold">{label}</h2>
                                            <span className="text-xs text-slate-300 max-w-xs break-words whitespace-normal group-hover:text-white">
                                                {value.description}
                                            </span>
                                        </div>
                                        <ChevronRightIcon className="scale-150 text-slate-400 group-hover:text-white" />
                                    </Button>
                                </Link>
                            );
                        })}
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}
