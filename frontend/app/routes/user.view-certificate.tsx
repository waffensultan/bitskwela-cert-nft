import { redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import type { LoaderFunctionArgs } from "@remix-run/node";

import { getWalletAddress } from "~/utils/auth";
import {
    isContractOwner,
    getCertificatesWithMetadata,
    getAllCertificatesWithMetadata,
} from "~/utils/contract";

import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "~/components/ui/pagination";
import { CertificateCard } from "~/components/shared/certificate-card";
import { SearchBar } from "~/components/ui/search-bar";

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

    return { isAdmin, certs };
}

export default function ViewCertificateRoute() {
    const { isAdmin } = useLoaderData<typeof loader>();

    return isAdmin ? <AdminUserUI /> : <RegularUserUI />;
}

function RegularUserUI() {
    const { certs } = useLoaderData<typeof loader>();

    return (
        <main className="h-screen w-screen flex flex-col justify-center items-center bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-yellow-100 via-orange-200 to-amber-500">
            <div className="h-3/4 w-11/12 bg-white rounded-xl flex flex-col items-center justify-between p-14 gap-10">
                <h1 className="font-unbounded text-xl font-semibold self-start">My Certificates</h1>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {certs.map((cert) => (
                        <CertificateCard
                            key={cert.tokenId}
                            title={cert.metadata.name}
                            imageUrl={cert.metadata.image}
                            to={`/certificate/${cert.tokenId}`}
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
                            <PaginationPrevious href="#" />
                        </PaginationItem>
                        <PaginationItem>
                            <PaginationLink href="#">1</PaginationLink>
                        </PaginationItem>
                        <PaginationItem>
                            <PaginationEllipsis />
                        </PaginationItem>
                        <PaginationItem>
                            <PaginationNext href="#" />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            </div>
        </main>
    );
}

function AdminUserUI() {
    const { certs } = useLoaderData<typeof loader>();

    return (
        <main className="h-screen w-screen flex flex-col justify-center items-center bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-yellow-100 via-orange-200 to-amber-500">
            <div className="h-3/4 w-11/12 bg-white rounded-xl flex flex-col items-center justify-between p-14 gap-10">
                <div className="w-full flex flex-row justify-between">
                    <h1 className="font-unbounded text-xl font-semibold self-center">
                        Most recent NFT Certificates
                    </h1>
                    <SearchBar />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {certs.map((cert) => (
                        <CertificateCard
                            key={cert.tokenId}
                            title={cert.metadata.name}
                            imageUrl={cert.metadata.image}
                            to={`/certificate/${cert.tokenId}`}
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
                            <PaginationPrevious href="#" />
                        </PaginationItem>
                        <PaginationItem>
                            <PaginationLink href="#">1</PaginationLink>
                        </PaginationItem>
                        <PaginationItem>
                            <PaginationEllipsis />
                        </PaginationItem>
                        <PaginationItem>
                            <PaginationNext href="#" />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            </div>
        </main>
    );
}
