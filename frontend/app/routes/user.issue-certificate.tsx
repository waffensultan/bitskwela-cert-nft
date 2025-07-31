import { redirect } from "@remix-run/node";
import { useState } from "react";

import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { toast } from "sonner";

import { Loader2Icon } from "lucide-react";

import { getWalletAddress } from "~/utils/auth";
import { isContractOwner } from "~/utils/contract";

import type { LoaderFunctionArgs } from "@remix-run/node";

import { OperationStatus } from "~/types/types";

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
    const [mintingStatus, setMintingStatus] = useState<OperationStatus>(undefined);
    const [recipientWalletAddress, setRecipientWalletAddress] = useState("");
    const [nftMetadataUrl, setNftMetadataUrl] = useState("");
    const [transactionHash, setTransactionHash] = useState<undefined | string>(undefined);

    async function mintCert() {
        setMintingStatus("loading");

        const toastId = toast.loading("Minting certificate....");

        try {
            const res = await fetch("/api/mint-cert", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    recipientWalletAddress: recipientWalletAddress,
                    nftMetadataUrl: nftMetadataUrl,
                }),
            });

            const data = await res.json();

            if (!data.success) {
                throw new Error(data.error);
            }

            setTimeout(() => {
                setMintingStatus("success");
                setTransactionHash(data.hash);
                toast.dismiss(toastId);
                toast.success("Successfully minted certificate. See the transaction hash below.");
            }, 1500);

            setTimeout(() => {
                setMintingStatus(undefined);
            }, 3000);
        } catch (error) {
            setTimeout(() => {
                toast.dismiss(toastId);
                setMintingStatus("error");
                toast.error(`Failed to pin: ${error}`);
            }, 1500);

            setTimeout(() => {
                setMintingStatus(undefined);
            }, 3000);
        }
    }

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
                                <Label htmlFor="recipientWalletAddress">Wallet Address</Label>
                                <Input
                                    type="text"
                                    name="recipientWalletAddress"
                                    placeholder="Enter wallet address of recipient"
                                    value={recipientWalletAddress}
                                    onChange={(e) => setRecipientWalletAddress(e.target.value)}
                                    className="px-4 py-2 rounded-2xl  bg-white text-black placeholder-slate-400 border border-slate-300 focus-visible:ring-yellow-400"
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <Label htmlFor="nftMetadataUrl">NFT Metadata Link</Label>
                                <Input
                                    type="text"
                                    name="nftMetadataUrl"
                                    placeholder="Paste metadata link"
                                    value={nftMetadataUrl}
                                    onChange={(e) => setNftMetadataUrl(e.target.value)}
                                    className="px-4 py-2 rounded-2xl bg-white text-black placeholder-slate-400 border border-slate-300 focus-visible:ring-yellow-400"
                                />
                            </div>

                            <Button
                                type="button"
                                onClick={() => mintCert()}
                                disabled={
                                    mintingStatus === "loading" || mintingStatus === "success"
                                }
                                className={`w-full text-white font-semibold py-3 text-lg rounded-2xl transition duration-200 ease-in-out flex items-center justify-center gap-2
                                    ${
                                        mintingStatus === "success"
                                            ? "bg-green-600 opacity-60 cursor-not-allowed"
                                            : mintingStatus === "error"
                                              ? "bg-red-500"
                                              : "bg-yellow-400 hover:bg-yellow-500"
                                    }
                                    ${mintingStatus === "loading" ? "cursor-progress" : ""}
                                `}
                            >
                                {mintingStatus === "loading" && (
                                    <Loader2Icon className="w-5 h-5 animate-spin" />
                                )}
                                {mintingStatus === "loading"
                                    ? "Minting..."
                                    : mintingStatus === "success"
                                      ? "Minted!"
                                      : mintingStatus === "error"
                                        ? "Failed. Retry?"
                                        : "Mint Certificate"}
                            </Button>
                        </form>
                        {transactionHash && (
                            <div className="mt-4 rounded-xl border border-yellow-400 bg-white/70 p-4 text-sm text-slate-700">
                                <p className="mb-1 font-medium">Recent Transaction:</p>
                                <a
                                    href={`https://sepolia.etherscan.io/tx/${transactionHash}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="break-words text-blue-600 hover:underline"
                                >
                                    {transactionHash}
                                </a>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}
