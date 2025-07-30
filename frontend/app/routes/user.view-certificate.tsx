import { redirect } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";

import { getWalletAddress } from "~/utils/auth";
import { isContractOwner } from "~/utils/contract";

import type { LoaderFunctionArgs } from "@remix-run/node";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "~/components/ui/pagination";
import { CertificateCard } from "~/components/ui/certificate-card";
import { SearchBar } from "~/components/ui/search-bar";

export async function loader(request: LoaderFunctionArgs) {
    const res = await getWalletAddress(request);
    const { walletAddress } = await res.json();

    if (!walletAddress) {
        return redirect("/");
    }

    const isAdmin = await isContractOwner(walletAddress);

    return { isAdmin };
}

export default function ViewCertificateRoute() {
    const { isAdmin } = useLoaderData<typeof loader>();

    return isAdmin ? <RegularUserUI /> : <AdminUserUI />;
}

const mockCertificates = [
    {
        id: "123",
        title: "Basics of Web3 Development",
        description: "This NFT certifies that Ostline has completed the Web3 Fundamentals course.",
        courseName: "Web 3 Fundamentals",
        dateIssued: "10/29/2005",
        issuedTo: "Ostline Casao",
        imageUrl: "/assets/certificate.svg",
    },
];

function RegularUserUI() {
    return (
        <main className="h-screen w-screen flex flex-col justify-center items-center bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-yellow-100 via-orange-200 to-amber-500">
            <div className="h-3/4 w-11/12 bg-white rounded-xl flex flex-col items-center justify-between p-14 gap-10">
                <h1 className="font-unbounded text-xl font-semibold self-start">My Certificates</h1>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {mockCertificates.map((cert) => (
                        <CertificateCard
                            key={cert.id}
                            title={cert.title}
                            description={cert.description}
                            courseName={cert.courseName}
                            dateIssued={cert.dateIssued}
                            issuedTo={cert.issuedTo}
                            imageUrl={cert.imageUrl}
                            to={`/certificate/${cert.id}`}
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
                    {mockCertificates.map((cert) => (
                        <CertificateCard
                            key={cert.id}
                            title={cert.title}
                            description={cert.description}
                            courseName={cert.courseName}
                            dateIssued={cert.dateIssued}
                            issuedTo={cert.issuedTo}
                            imageUrl={cert.imageUrl}
                            to={`/certificate/${cert.id}`}
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
