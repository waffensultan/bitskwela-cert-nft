import { redirect } from "@remix-run/node";

import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";

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

export default function IssueCertificateRoute() {
    return (
        <main className="h-screen w-screen flex flex-col justify-center items-center bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-yellow-100 via-orange-200 to-amber-500">
            <div className=" w-1/3 h-3/4 grid grid-cols-1 gap-4">
                <Card className=" bg-stone-100 border-yellow-500 backdrop-blur-sm flex flex-col justify-center items-center">
                    <CardHeader>
                        <CardTitle className="flex flex-col items-center text-white gap-2 font-unbounded bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                            <img className="w-32 mb-2" src="/assets/logo.png" alt="Certificate" />
                            <div>
                                <h1 className="text-center text-2xl mb-2">Issue a Certificate</h1>
                                <p className="text-xs text-slate-600 text-center font-light">
                                    Restricted to contract owner. Issue NFT certificates to
                                    learners.
                                </p>
                            </div>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4 w-full px-6 pb-6 ">
                        <img
                            className="w-40 self-center my-5"
                            src="/assets/certificate.svg"
                            alt="Certificate"
                        />
                        <form className="flex flex-col gap-4 w-full">
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="walletAddress">Wallet Address</Label>
                                <input
                                    type="text"
                                    name="walletAddress"
                                    placeholder="Enter wallet address"
                                    className="px-4 py-2 rounded-2xl  bg-white text-black placeholder-slate-400 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <Label htmlFor="metadataLink">NFT Metadata Link</Label>
                                <input
                                    type="text"
                                    name="metadataLink"
                                    placeholder="Paste metadata link"
                                    className="px-4 py-2 rounded-2xl bg-white text-black placeholder-slate-400 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                />
                            </div>

                            <Button className="mt-4 w-full rounded-2xl py-3 bg-yellow-400 hover:bg-yellow-500 text-white font-semibold transition duration-200">
                                Mint Certificate
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}
