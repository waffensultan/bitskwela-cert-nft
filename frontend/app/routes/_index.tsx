import { useState, useEffect } from "react";
import CountUp from "react-countup";
import { useNavigate } from "@remix-run/react";
import { ethers } from "ethers";
import { toast } from "sonner";

import { requireNoWalletAddress } from "~/utils/auth";

import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import StyledTooltip from "~/components/shared/styled-tooltip";

import type { LoaderFunctionArgs } from "@remix-run/node";
import type { OperationStatus } from "~/types/types";

export async function loader(request: LoaderFunctionArgs) {
    return await requireNoWalletAddress(request);
}

export default function IndexRoute() {
    const navigate = useNavigate();

    const [walletAddress, setWalletAddress] = useState<undefined | string>(undefined);
    const [walletAddressStatus, setWalletAddressStatus] = useState<OperationStatus>(undefined);
    const [platformStatistics, setPlatformStatistics] = useState({
        "Total Certificates": 12847,
        "Active Holders": 3921,
    });

    async function connectWallet() {
        setWalletAddressStatus("loading");

        if (typeof window.ethereum === "undefined") {
            setTimeout(() => {
                setWalletAddressStatus("error");
                toast.error("MetaMask is not installed. Please install it to use this feature!");
            }, 1000);
            return;
        }

        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const address = await signer.getAddress();

            const formData = new FormData();
            formData.append("walletAddress", address);

            const result = await fetch("/api/set-wallet", {
                method: "POST",
                body: formData,
                credentials: "include",
            });

            if (!result.ok) {
                throw new Error("Failed authenticating!");
            }

            setTimeout(() => {
                setWalletAddress(address);
                setWalletAddressStatus("success");
                toast.success("Connected to MetaMask Wallet!");
            }, 1500);
        } catch (error) {
            setTimeout(() => {
                toast.error(`Failed to connect wallet! ${error}`);
            }, 1500);
        }
    }

    useEffect(() => {
        if (walletAddress) {
            setTimeout(() => {
                navigate("/user/home");
            }, 1500);
        }
    }, [walletAddress]);

    return (
        <main className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-tr from-black via-gray-900 to-gray-800">
            <div className="grid grid-cols-1 gap-4">
                <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm flex flex-col justify-center items-center">
                    <CardHeader>
                        <CardTitle className="text-white gap-2 font-unbounded bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                            <h1>Bitskwela Certificate Dashboard</h1>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Button
                            onClick={() => connectWallet()}
                            disabled={
                                walletAddress !== undefined || walletAddressStatus === "loading"
                            }
                            className={`flex flex-row items-center gap-2 py-5 bg-blue-600 hover:bg-blue-800`}
                        >
                            <img
                                src="/assets/metamask-icon.svg"
                                alt="metamask-icon"
                                className="w-4 h-4"
                            />
                            {walletAddressStatus === "loading" ? (
                                <span>Connecting...</span>
                            ) : walletAddressStatus === "error" ? (
                                <span>Try Again</span>
                            ) : walletAddress !== undefined ? (
                                <span>Connected</span>
                            ) : (
                                <span>Connect MetaMask Wallet</span>
                            )}
                        </Button>
                    </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-white flex justify-center items-center gap-2 font-unbounded bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                            <h1>Platform Statistics</h1>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center gap-8">
                        {Object.entries(platformStatistics).map(([label, value]) => (
                            <div
                                key={label}
                                className="flex flex-col justify-center items-center gap-2"
                            >
                                <h2
                                    className={`text-3xl font-bold bg-gradient-to-r ${label === "Active Holders" ? "from-green-400 to-emerald-600" : "from-purple-400 to-blue-400"} bg-clip-text text-transparent`}
                                >
                                    {typeof window === "undefined" ? (
                                        <div>0</div>
                                    ) : (
                                        <CountUp start={0} end={value} duration={3} delay={0.5} />
                                    )}
                                </h2>
                                <div className="flex items-center gap-1">
                                    <span className="font-semibold text-sm text-gray-400">
                                        {label}
                                    </span>
                                    {label === "Total Certificates" ? (
                                        <StyledTooltip content="The total number of course certificates issued by Bitskwela." />
                                    ) : (
                                        <StyledTooltip content="The amount of unique users currently holding course certificates." />
                                    )}
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}
