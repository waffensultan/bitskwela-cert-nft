import { useLoaderData } from "@remix-run/react";

import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";

import {
    SunIcon,
    ImageIcon,
    SettingsIcon,
    CopyIcon,
    CopyCheckIcon,
    Loader2Icon,
} from "lucide-react";

import { useState } from "react";

export function loader() {
    return {
        PINATA_API_KEY: process.env.PINATA_API_KEY,
        PINATA_API_SECRET: process.env.PINATA_API_SECRET,
        PINATA_JWT: process.env.PINATA_JWT,
    };
}

type OperationStatus = "success" | "loading" | "error" | undefined;
type CopyTarget = "metadata" | "ipfs";
export default function GenerateRoute() {
    const envData = useLoaderData<typeof loader>();

    const [metadata, setMetadata] = useState({
        name: "",
        description: "",
        image: "",
    });
    const [copySuccessful, setCopySuccessful] = useState<Record<CopyTarget, OperationStatus>>({
        metadata: undefined,
        ipfs: undefined,
    });
    const [ipfsPinSuccessful, setIpfsPinSuccessful] = useState<OperationStatus>(undefined);
    const [ipfsUrl, setIpfsUrl] = useState<undefined | string>(undefined);

    const handleInputChange = (field: string, value: string) => {
        setMetadata((prev) => ({ ...prev, [field]: value }));
    };

    const fieldsAreValid = (): boolean => {
        const { name, description, image } = metadata;

        // Basic non-empty checks
        if (!name.trim() || !description.trim() || !image.trim()) {
            return false;
        }

        // Validate image as a proper URL
        try {
            new URL(image);
        } catch {
            return false;
        }

        return true;
    };

    const copyTextToClipboard = async (text: string, target: CopyTarget) => {
        try {
            await navigator.clipboard.writeText(text);

            setCopySuccessful((prev) => ({ ...prev, [target]: "success" }));
            setTimeout(() => {
                setCopySuccessful((prev) => ({ ...prev, [target]: undefined }));
            }, 3500);
        } catch (error) {
            console.error("Failed to copy to clipboard:", error);

            setCopySuccessful((prev) => ({ ...prev, [target]: "error" }));
            setTimeout(() => {
                setCopySuccessful((prev) => ({ ...prev, [target]: undefined }));
            }, 3500);
        }
    };

    const pinToIpfs = async () => {
        try {
            if (!fieldsAreValid()) {
                throw new Error("Invalid metadata fields");
            }

            setIpfsPinSuccessful("loading");

            const data = JSON.stringify({
                pinataContent: { ...metadata },
            });

            const res = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${envData.PINATA_JWT}`,
                },
                body: data,
            });
            const resData = await res.json();
            const cid = resData.IpfsHash;
            const url = `https://gateway.pinata.cloud/ipfs/${cid}`;

            setTimeout(() => {
                setIpfsPinSuccessful("success");
                setIpfsUrl(url);
            }, 1500);
        } catch (error) {
            console.warn("Failed to pin:", error);

            setIpfsPinSuccessful("error");
            setTimeout(() => {
                setIpfsPinSuccessful(undefined);
            }, 1500);
        }
    };

    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 py-10 flex items-center justify-center flex-col w-full">
            {/* HEADER SECTION */}
            <div className="flex justify-center items-center gap-5 pb-10 px-7">
                <SunIcon className="w-10 h-10 lg:h-8 lg:w-8 text-yellow-400" />
                <h1 className="text-lg lg:text-3xl text-center font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                    Bitskwela Certificate NFT Metadata Generator
                </h1>
                <SunIcon className="w-10 h-10 lg:h-8 lg:w-8 text-yellow-400" />
            </div>

            {/* FORM SECTION */}
            <div className="w-full grid gap-8 lg:grid-cols-2 lg:max-w-6xl lg:mx-auto">
                <Card className="w-full max-w-full bg-slate-800/50 border-slate-700 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <ImageIcon />
                            <h2>Certificate NFT Details</h2>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 max-w-full overflow-hidden">
                        <div>
                            <Label htmlFor="name" className="text-slate-200">
                                Name
                            </Label>
                            <Input
                                id="name"
                                placeholder="Enter NFT name"
                                value={metadata.name}
                                onChange={(e) => handleInputChange("name", e.target.value)}
                                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 break-all w-full"
                            />
                        </div>

                        <div className="flex-wrap">
                            <Label htmlFor="description" className="text-slate-200">
                                Description
                            </Label>
                            <Textarea
                                id="description"
                                placeholder="Describe your NFT..."
                                value={metadata.description}
                                onChange={(e) => handleInputChange("description", e.target.value)}
                                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 min-h-[100px] w-full whitespace-pre-wrap"
                            />
                        </div>

                        <div>
                            <Label htmlFor="image" className="text-slate-200">
                                Image
                            </Label>
                            <Input
                                id="image"
                                placeholder="https://example.com/image.png"
                                value={metadata.image}
                                onChange={(e) => handleInputChange("image", e.target.value)}
                                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* METADATA PREVIEW SECTION */}
                <Card className="w-full max-w-full min-w-0 bg-slate-800/50 border-slate-700 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <SettingsIcon className="text-blue-500" />
                            <h2>Metadata Preview</h2>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 flex flex-col justify-evenly">
                        <div className="flex flex-col bg-slate-900/50 border-slate-700 rounded-lg p-4 border">
                            <pre className="text-slate-400 text-sm overflow-auto max-h-96 whitespace-pre-wrap w-full break-all">
                                {JSON.stringify(
                                    {
                                        ...metadata,
                                    },
                                    null,
                                    2,
                                )}
                            </pre>
                            <button
                                onClick={() =>
                                    copyTextToClipboard(JSON.stringify(metadata), "metadata")
                                }
                                className="text-slate-400 self-end"
                            >
                                {copySuccessful.metadata ? <CopyCheckIcon /> : <CopyIcon />}
                            </button>
                        </div>

                        <div className="flex flex-col gap-2">
                            {/* 🔵 Pin to IPFS Button */}
                            <Button
                                onClick={pinToIpfs}
                                disabled={
                                    !fieldsAreValid() ||
                                    ipfsPinSuccessful === "loading" ||
                                    ipfsPinSuccessful === "success"
                                }
                                className={`w-full text-white font-semibold py-3 text-lg rounded-md transition duration-200 ease-in-out flex items-center justify-center gap-2 ${
                                    ipfsPinSuccessful === "success"
                                        ? "bg-green-600"
                                        : "bg-blue-600 hover:bg-blue-700"
                                } ${
                                    !fieldsAreValid() ||
                                    ipfsPinSuccessful === "loading" ||
                                    ipfsPinSuccessful === "success"
                                        ? "opacity-60 cursor-not-allowed"
                                        : ""
                                }`}
                            >
                                {ipfsPinSuccessful === "loading" && (
                                    <Loader2Icon className="w-5 h-5 animate-spin" />
                                )}
                                {ipfsPinSuccessful === "loading"
                                    ? "Pinning..."
                                    : ipfsPinSuccessful === "success"
                                      ? "Pinned!"
                                      : ipfsPinSuccessful === "error"
                                        ? "Failed. Retry?"
                                        : !fieldsAreValid()
                                          ? "Fill out all fields"
                                          : "Pin to IPFS"}
                            </Button>

                            {/* 📋 Copy IPFS URL Button */}
                            <Button
                                onClick={() => ipfsUrl && copyTextToClipboard(ipfsUrl, "ipfs")}
                                disabled={!ipfsUrl || ipfsPinSuccessful === "loading"}
                                className={`w-full mt-2 bg-blue-800 text-white font-semibold py-5 rounded-md transition duration-200 ease-in-out flex items-center justify-center text-lg ${
                                    ipfsUrl && ipfsPinSuccessful !== "loading"
                                        ? "hover:bg-blue-900"
                                        : "opacity-60 cursor-not-allowed"
                                }`}
                            >
                                <span className="relative w-full h-full">
                                    {/* Smooth layered text */}
                                    <span
                                        className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
                                            copySuccessful.ipfs === "success"
                                                ? "opacity-100"
                                                : "opacity-0"
                                        }`}
                                    >
                                        Copied!
                                    </span>
                                    <span
                                        className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
                                            copySuccessful.ipfs === "error"
                                                ? "opacity-100"
                                                : "opacity-0"
                                        }`}
                                    >
                                        Failed to copy
                                    </span>
                                    <span
                                        className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
                                            !copySuccessful.ipfs ? "opacity-100" : "opacity-0"
                                        }`}
                                    >
                                        Copy IPFS URL
                                    </span>
                                </span>
                            </Button>

                            {/* 🔁 Retry Button (if error) */}
                            {ipfsPinSuccessful === "error" && (
                                <Button
                                    onClick={pinToIpfs}
                                    className="w-full mt-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 text-md rounded-md transition-colors duration-200 ease-in-out"
                                >
                                    Retry Pinning
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}
