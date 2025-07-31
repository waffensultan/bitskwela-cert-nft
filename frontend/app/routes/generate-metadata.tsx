import { useState } from "react";
import { redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { toast } from "sonner";

import { getWalletAddress } from "~/utils/auth";

import type { OperationStatus } from "~/types/types";
import type { LoaderFunctionArgs } from "@remix-run/node";

import {
    SunIcon,
    ImageIcon,
    SettingsIcon,
    CopyIcon,
    CopyCheckIcon,
    Loader2Icon,
    DnaIcon,
} from "lucide-react";

export async function loader(request: LoaderFunctionArgs) {
    const res = await getWalletAddress(request);
    const { walletAddress } = await res.json();

    if (!walletAddress) {
        return redirect("/");
    }

    return {
        PINATA_API_KEY: process.env.PINATA_API_KEY,
        PINATA_API_SECRET: process.env.PINATA_API_SECRET,
        PINATA_JWT: process.env.PINATA_JWT,
    };
}

type CopyTarget = "metadata" | "ipfs";
export default function GenerateRoute() {
    const envData = useLoaderData<typeof loader>();

    const [ipfsPinStatus, setIpfsPinStatus] = useState<OperationStatus>(undefined);
    const [ipfsUrl, setIpfsUrl] = useState<undefined | string>(undefined);
    const [metadata, setMetadata] = useState({
        name: "",
        description: "",
        image: "",
        external_url: "",
    });
    const [attributes, setAttributes] = useState([
        { trait_type: "Recipient", value: "" },
        { trait_type: "Issuer", value: "Bitskwela" },
        { trait_type: "Course", value: "" },
        { trait_type: "Date Issued", value: "" },
    ]);
    const [copySuccessful, setCopySuccessful] = useState<Record<CopyTarget, OperationStatus>>({
        metadata: undefined,
        ipfs: undefined,
    });

    const handleInputChange = (field: string, value: string) => {
        setMetadata((prev) => ({ ...prev, [field]: value }));
    };

    const fieldsAreValid = (): boolean => {
        const { name, description, image, external_url } = metadata;

        if (!name.trim() || !description.trim() || !image.trim()) {
            return false;
        }

        try {
            if (external_url.trim()) {
                new URL(external_url);
            }

            new URL(image);

            return true;
        } catch {
            return false;
        }
    };

    const copyTextToClipboard = async (text: string, target: CopyTarget) => {
        try {
            await navigator.clipboard.writeText(text);

            setCopySuccessful((prev) => ({ ...prev, [target]: "success" }));
            toast.success(`Copied ${target} text!`);
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
        setIpfsPinStatus("loading");
        const toastId = toast.loading("Pinning metadata to IPFS...");

        try {
            if (!fieldsAreValid()) {
                throw new Error("Invalid metadata fields");
            }

            const data = JSON.stringify({
                pinataContent: {
                    ...metadata,
                    attributes: attributes.filter((attr) => attr.value.trim() !== ""),
                },
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
                setIpfsPinStatus("success");
                setIpfsUrl(url);
                toast.dismiss(toastId);
                toast.success("Pinned metadata to IPFS!");
            }, 1500);
        } catch (error) {
            console.warn("Failed to pin:", error);

            setIpfsPinStatus("error");
            toast.dismiss(toastId);
            toast.error(`Failed to pin: ${error}`);
            setTimeout(() => {
                setIpfsPinStatus(undefined);
            }, 1500);
        }
    };

    return (
        <main className="min-h-screen bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-yellow-100 via-orange-200 to-amber-500 py-10 flex items-center justify-center flex-col w-full">
            {/* HEADER SECTION */}
            <div className="flex justify-center items-center gap-5 pb-10 px-7">
                <SunIcon className="w-10 h-10 lg:h-8 lg:w-8 text-white" />
                <h1 className="text-lg lg:text-3xl text-center font-semibold text-white font-unbounded">
                    Bitskwela Certificate NFT Metadata Generator
                </h1>
                <SunIcon className="w-10 h-10 lg:h-8 lg:w-8 text-white" />
            </div>

            {/* FORM SECTION */}
            <div className="w-full grid gap-8 lg:grid-cols-2 lg:max-w-6xl lg:mx-auto flex-grow">
                <Card className="w-full max-w-full bg-slate-800 border-slate-700 backdrop-blur-sm h-full">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <ImageIcon />
                            <h2>Certificate NFT Details</h2>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 max-w-full overflow-hidden">
                        <div>
                            <Label htmlFor="name" className="text-slate-200">
                                Name
                            </Label>
                            <Input
                                id="name"
                                placeholder="Enter NFT name"
                                value={metadata.name}
                                onChange={(e) => handleInputChange("name", e.target.value)}
                                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 break-all w-full transition duration-100 focus-visible:ring-yellow-700"
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
                                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 min-h-[100px] w-full whitespace-pre-wrap transition duration-100 focus-visible:ring-yellow-700"
                            />
                        </div>

                        <div>
                            <Label htmlFor="image" className="text-slate-200">
                                Image URL
                            </Label>
                            <Input
                                id="image"
                                placeholder="https://example.com/image.png"
                                value={metadata.image}
                                onChange={(e) => handleInputChange("image", e.target.value)}
                                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 transition duration-100 focus-visible:ring-yellow-700"
                            />
                        </div>

                        <div>
                            <Label htmlFor="externalUrl" className="text-slate-200">
                                External URL
                            </Label>
                            <Input
                                id="externalUrl"
                                placeholder="Optional link to full cert"
                                value={metadata.external_url}
                                onChange={(e) => handleInputChange("external_url", e.target.value)}
                                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 break-all w-full transition duration-100 focus-visible:ring-yellow-700"
                            />
                        </div>

                        <div className="space-y-4">
                            <CardTitle className="text-white flex items-center gap-2">
                                <DnaIcon />
                                <h2>Attributes (Optional)</h2>
                            </CardTitle>

                            {attributes.map((attr, index) => (
                                <div key={index}>
                                    <Label
                                        htmlFor={`attribute-${index}`}
                                        className="text-slate-200"
                                    >
                                        {attr.trait_type}
                                    </Label>
                                    <Input
                                        id={`attribute-${index}`}
                                        placeholder={`Enter ${attr.trait_type}`}
                                        value={
                                            attr.trait_type === "Issuer" ? "Bitskwela" : attr.value
                                        }
                                        disabled={attr.trait_type === "Issuer"}
                                        onChange={(e) => {
                                            if (attr.trait_type === "Issuer") return; // prevent editing
                                            const updated = [...attributes];
                                            updated[index].value = e.target.value;
                                            setAttributes(updated);
                                        }}
                                        className={`bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 transition duration-100 focus-visible:ring-yellow-700 ${
                                            attr.trait_type === "Issuer" &&
                                            "opacity-50 cursor-not-allowed"
                                        }`}
                                    />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* METADATA PREVIEW SECTION */}
                <Card className="w-full max-w-full min-w-0 bg-slate-800 border-slate-700 backdrop-blur-sm h-full flex flex-col">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <SettingsIcon className="text-blue-500" />
                            <h2>Metadata Preview</h2>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 flex flex-col flex-grow">
                        <div className="flex flex-col flex-grow overflow-hidden bg-slate-900/50 border-slate-700 rounded-lg p-4 border">
                            <pre className="text-slate-400 text-sm whitespace-pre-wrap break-words flex-grow overflow-auto transition duration-500">
                                {JSON.stringify(
                                    {
                                        ...metadata,
                                        attributes: attributes.filter(
                                            (attr) => attr.value.trim() !== "",
                                        ),
                                    },
                                    null,
                                    2,
                                )}
                            </pre>
                            <button
                                onClick={() =>
                                    copyTextToClipboard(
                                        JSON.stringify({
                                            ...metadata,
                                            attributes: attributes.filter(
                                                (attr) => attr.value.trim() !== "",
                                            ),
                                        }),
                                        "metadata",
                                    )
                                }
                                className="text-slate-400 self-end mt-2"
                            >
                                {copySuccessful.metadata ? <CopyCheckIcon /> : <CopyIcon />}
                            </button>
                        </div>

                        <div className="flex flex-col gap-2">
                            <Button
                                onClick={() => pinToIpfs()}
                                disabled={
                                    !fieldsAreValid() ||
                                    ipfsPinStatus === "loading" ||
                                    ipfsPinStatus === "success"
                                }
                                className={`w-full text-white font-semibold py-3 text-lg rounded-md transition duration-200 ease-in-out flex items-center justify-center gap-2 ${
                                    ipfsPinStatus === "success"
                                        ? "bg-green-600"
                                        : "bg-yellow-600 hover:bg-yellow-700"
                                } ${!fieldsAreValid() || (ipfsPinStatus === "success" && "opacity-60 cursor-not-allowed")} ${ipfsPinStatus === "loading" && "cursor-progress"}`}
                            >
                                {ipfsPinStatus === "loading" && (
                                    <Loader2Icon className="w-5 h-5 animate-spin" />
                                )}
                                {ipfsPinStatus === "loading"
                                    ? "Pinning..."
                                    : ipfsPinStatus === "success"
                                      ? "Pinned!"
                                      : ipfsPinStatus === "error"
                                        ? "Failed. Retry?"
                                        : !fieldsAreValid()
                                          ? "Fill out all fields before pinning"
                                          : "Pin to IPFS"}
                            </Button>

                            <Button
                                onClick={() => ipfsUrl && copyTextToClipboard(ipfsUrl, "ipfs")}
                                disabled={!ipfsUrl || ipfsPinStatus === "loading"}
                                className={`w-full mt-2 bg-yellow-800 text-white font-semibold py-5 rounded-md transition duration-200 ease-in-out flex items-center justify-center text-lg ${
                                    ipfsUrl && ipfsPinStatus !== "loading"
                                        ? "hover:bg-yellow-900"
                                        : "opacity-60 cursor-not-allowed"
                                }`}
                            >
                                <span className="relative w-full h-full">
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

                            {ipfsPinStatus === "error" && (
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
