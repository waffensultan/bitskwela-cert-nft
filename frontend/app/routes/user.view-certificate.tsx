import { redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useState } from "react";

import { getWalletAddress } from "~/utils/auth";
import {
    isContractOwner,
    getCertificatesWithMetadata,
    getAllCertificatesWithMetadata,
    getContractAddress,
} from "~/utils/contract";

import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "~/components/ui/pagination";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "~/components/ui/select";
import CertificateCard from "~/components/shared/certificate-card";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { toast } from "sonner";

import { SearchIcon } from "lucide-react";
// import { SearchBar } from "~/components/ui/search-bar";

import type { LoaderFunctionArgs } from "@remix-run/node";
import type { Certificate } from "~/types/types";
import type { OperationStatus } from "~/types/types";

export async function loader(request: LoaderFunctionArgs) {
    const res = await getWalletAddress(request);
    const { walletAddress } = await res.json();

    if (!walletAddress) {
        return redirect("/");
    }

    const isAdmin = await isContractOwner(walletAddress);

    const certs = isAdmin
        ? await getAllCertificatesWithMetadata()
        : await getCertificatesWithMetadata(walletAddress);

    const contractAddress = getContractAddress();

    return { isAdmin, certs, contractAddress };
}

export default function ViewCertificateRoute() {
    const { isAdmin, certs, contractAddress } = useLoaderData<typeof loader>();

    /** Pagination logic */
    const [currentPage, setCurrentPage] = useState(1);

    const itemsPerPage = 8;
    const totalPages = Math.ceil(certs.length / itemsPerPage);

    const paginatedCerts = certs.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage,
    );

    const goToPage = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    return isAdmin ? (
        <AdminUserUI
            paginatedCerts={paginatedCerts}
            currentPage={currentPage}
            totalPages={totalPages}
            goToPage={goToPage}
            contractAddress={contractAddress}
        />
    ) : (
        <RegularUserUI
            paginatedCerts={certs}
            currentPage={currentPage}
            totalPages={totalPages}
            goToPage={goToPage}
            contractAddress={contractAddress}
        />
    );
}

type UIProps = {
    paginatedCerts: Certificate[];
    currentPage: number;
    totalPages: number;
    goToPage: (page: number) => void;
    contractAddress: string;
};

function RegularUserUI({
    paginatedCerts,
    currentPage,
    totalPages,
    goToPage,
    contractAddress,
}: UIProps) {
    return (
        <main className="flex min-h-screen w-full flex-col items-center bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-yellow-100 via-orange-200 to-amber-500">
            <div className="m-16 w-11/12 rounded-xl bg-white p-14 flex flex-col items-center gap-10">
                <h1 className="self-start font-unbounded text-xl font-semibold max-sm:self-center">
                    My Certificates
                </h1>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {paginatedCerts.map((cert) => (
                        <CertificateCard
                            key={cert.tokenId}
                            title={cert.metadata.name}
                            imageUrl={cert.metadata.image}
                            tokenId={cert.tokenId}
                            contractAddress={contractAddress}
                            description={cert.metadata.description ?? ""}
                            courseName={
                                cert.metadata.attributes.find(
                                    (attr: any) => attr.trait_type === "Course",
                                )?.value
                            }
                            dateIssued={
                                cert.metadata.attributes.find(
                                    (attr: any) => attr.trait_type === "Date Issued",
                                )?.value
                            }
                            issuedTo={
                                cert.metadata.attributes.find(
                                    (attr: any) => attr.trait_type === "Recipient",
                                )?.value
                            }
                        />
                    ))}
                </div>

                <Pagination>
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious
                                href="#"
                                onClick={() => goToPage(currentPage - 1)}
                            />
                        </PaginationItem>

                        {[...Array(totalPages)].map((_, i) => (
                            <PaginationItem key={i}>
                                <PaginationLink
                                    href="#"
                                    isActive={i + 1 === currentPage}
                                    onClick={() => goToPage(i + 1)}
                                >
                                    {i + 1}
                                </PaginationLink>
                            </PaginationItem>
                        ))}

                        <PaginationItem>
                            <PaginationNext href="#" onClick={() => goToPage(currentPage + 1)} />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            </div>
        </main>
    );
}

export type SearchOption = "tokenId" | "walletAddress";
function AdminUserUI({
    paginatedCerts,
    currentPage,
    totalPages,
    goToPage,
    contractAddress,
}: UIProps) {
    const [searchOption, setSearchOption] = useState<SearchOption>("tokenId");
    const [searchTarget, setSearchTarget] = useState<string>("");
    const [searchStatus, setSearchStatus] = useState<OperationStatus>(undefined);
    const [certificateSearchResult, setCertificateSearchResult] = useState<
        Certificate[] | undefined
    >(undefined);

    const [submittedSearchOption, setSubmittedSearchOption] = useState<SearchOption | null>(null);
    const [submittedSearchTarget, setSubmittedSearchTarget] = useState<string | null>(null);

    async function search() {
        setSearchStatus("loading");

        const toastId = toast.loading("Searching...");

        try {
            const res = await fetch("/api/search", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    searchOption: searchOption,
                    searchTarget: searchTarget,
                }),
            });

            const data = await res.json();
            const { certs } = data;

            if (!data.success) {
                throw new Error(data.error);
            }

            setTimeout(() => {
                setSearchStatus("success");

                setCertificateSearchResult(certs);

                setSubmittedSearchOption(searchOption);
                setSubmittedSearchTarget(searchTarget);

                toast.dismiss(toastId);
                toast.success("Found!");
            }, 1500);
        } catch (error) {
            setTimeout(() => {
                toast.dismiss(toastId);
                setSearchStatus("error");
                toast.error(`Failed to search: ${error}`);
            }, 1500);

            setTimeout(() => {
                setSearchStatus(undefined);
            }, 6000);
        }
    }

    return (
        <main className="flex min-h-screen w-full flex-col justify-center items-center bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-yellow-100 via-orange-200 to-amber-500">
            <div className="m-16 w-11/12 rounded-xl bg-white p-14 max-md:p-7 flex flex-col items-center gap-10 max-md:gap-5">
                <div className="flex w-full flex-row justify-between gap-5 max-lg:flex-col max-lg:items-center max-sm:gap-3">
                    <h1 className="font-unbounded text-xl font-semibold text-center">
                        {searchStatus === "loading"
                            ? "Searching..."
                            : searchStatus === "success" &&
                                certificateSearchResult &&
                                submittedSearchOption &&
                                submittedSearchTarget
                              ? submittedSearchOption === "tokenId"
                                  ? `Results for Token ID: ${submittedSearchTarget}`
                                  : `Certificates for Wallet: ${submittedSearchTarget.slice(0, 6) + "..." + submittedSearchTarget.slice(-4)}`
                              : searchStatus === "error"
                                ? "No results found or an error occurred"
                                : "Most Recent NFT Certificates"}
                    </h1>

                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            search();
                        }}
                        className="flex w-full max-w-sm items-center gap-2"
                    >
                        <div className="relative w-full">
                            <div className="absolute left-2 top-1/2 -translate-y-1/2 z-10">
                                <Select
                                    value={searchOption}
                                    onValueChange={(val: SearchOption) => setSearchOption(val)}
                                >
                                    <SelectTrigger className="w-[93px] h-8 text-xs">
                                        <SelectValue placeholder="Filter" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="tokenId">Token ID</SelectItem>
                                        <SelectItem value="walletAddress">Wallet</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <Input
                                type="text"
                                placeholder="Search certificates..."
                                name="search"
                                value={searchTarget}
                                onChange={(e) => setSearchTarget(e.target.value)}
                                className="pl-[105px] text-xs py-5"
                            />
                        </div>
                        <Button
                            type="submit"
                            variant="outline"
                            className="flex items-center justify-center"
                        >
                            <span className="hidden max-sm:inline">
                                <SearchIcon className="h-4 w-4" />
                            </span>
                            <span className="max-sm:hidden">Search</span>
                        </Button>
                    </form>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {searchStatus === "loading" && (
                        <div className="col-span-full text-center text-lg font-medium text-gray-500">
                            Loading search results...
                        </div>
                    )}

                    {searchStatus === "error" && (
                        <div className="col-span-full text-center text-lg font-medium text-red-500">
                            No certificates found or an error occurred.
                        </div>
                    )}

                    {searchStatus === "success" &&
                        certificateSearchResult &&
                        certificateSearchResult.length > 0 &&
                        certificateSearchResult.map((cert) => (
                            <CertificateCard
                                key={cert.tokenId}
                                title={cert.metadata.name}
                                imageUrl={cert.metadata.image}
                                tokenId={cert.tokenId}
                                contractAddress={contractAddress}
                                description={cert.metadata.description ?? ""}
                                courseName={
                                    cert.metadata.attributes.find(
                                        (attr: any) => attr.trait_type === "Course",
                                    )?.value
                                }
                                dateIssued={
                                    cert.metadata.attributes.find(
                                        (attr: any) => attr.trait_type === "Date Issued",
                                    )?.value
                                }
                                issuedTo={
                                    cert.metadata.attributes.find(
                                        (attr: any) => attr.trait_type === "Recipient",
                                    )?.value
                                }
                            />
                        ))}

                    {(!searchStatus || (searchStatus === "success" && !certificateSearchResult)) &&
                        paginatedCerts.map((cert) => (
                            <CertificateCard
                                key={cert.tokenId}
                                title={cert.metadata.name}
                                imageUrl={cert.metadata.image}
                                description={cert.metadata.description ?? ""}
                                tokenId={cert.tokenId}
                                contractAddress={contractAddress}
                                courseName={
                                    cert.metadata.attributes.find(
                                        (attr: any) => attr.trait_type === "Course",
                                    )?.value
                                }
                                dateIssued={
                                    cert.metadata.attributes.find(
                                        (attr: any) => attr.trait_type === "Date Issued",
                                    )?.value
                                }
                                issuedTo={
                                    cert.metadata.attributes.find(
                                        (attr: any) => attr.trait_type === "Recipient",
                                    )?.value
                                }
                            />
                        ))}
                </div>

                {(!searchStatus || (searchStatus === "success" && !certificateSearchResult)) && (
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    href="#"
                                    onClick={() => goToPage(currentPage - 1)}
                                />
                            </PaginationItem>

                            {[...Array(totalPages)].map((_, i) => (
                                <PaginationItem key={i}>
                                    <PaginationLink
                                        href="#"
                                        isActive={i + 1 === currentPage}
                                        onClick={() => goToPage(i + 1)}
                                    >
                                        {i + 1}
                                    </PaginationLink>
                                </PaginationItem>
                            ))}

                            <PaginationItem>
                                <PaginationNext
                                    href="#"
                                    onClick={() => goToPage(currentPage + 1)}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                )}
                <span className="text-xs -mb-11 -mt-5 font-semibold text-neutral-400 tracking-wider">
                    ADMIN VIEW
                </span>
            </div>
        </main>
    );
}
