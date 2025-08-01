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

    return json({ isAdmin, walletAddress });
}

export default function HomeRoute() {
    const { isAdmin, walletAddress } = useLoaderData<typeof loader>();

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

    async function logout() {
        await fetch("/api/logout", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
        });

        window.location.href = "/";
    }

    return (
        <main className="gap-10 min-h-screen flex flex-col justify-center items-center bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-yellow-100 via-orange-200 to-amber-500">
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
                                <Link key={label} to={link} target="_blank">
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

                <Card className="bg-stone-100 border-yellow-500 backdrop-blur-sm w-full max-w-md">
                    <CardHeader>
                        <CardTitle className="text-white font-unbounded bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                            Profile
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <img
                                    src={`https://api.dicebear.com/7.x/identicon/svg?seed=${walletAddress}`}
                                    alt="Profile"
                                    className="w-10 h-10 rounded-full border border-stone-400 shadow-sm"
                                />
                                <span className="font-mono text-sm text-stone-700">
                                    {walletAddress.slice(0, 6) + "..." + walletAddress.slice(-4)}
                                </span>
                                {isAdmin && (
                                    <span className="font-semibold text-xs py-1 px-2 rounded-full bg-stone-200 text-neutral-500 tracking-wider">
                                        ADMIN
                                    </span>
                                )}
                            </div>

                            <Button
                                onClick={() => logout()}
                                type="button"
                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md shadow-sm"
                            >
                                Logout
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}
