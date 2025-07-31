import { Link } from "@remix-run/react";

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import ExpandableText from "~/components/shared/expendable-text";
import { Button } from "~/components/ui/button";

import { ExternalLinkIcon } from "lucide-react";

type CertificateCardProps = {
    title: string;
    description: string;
    courseName: string;
    dateIssued: string;
    issuedTo: string;
    imageUrl: string;
    tokenId: string;
    contractAddress: string;
};

const CertificateCard = ({
    title,
    description,
    courseName,
    dateIssued,
    issuedTo,
    imageUrl,
    tokenId,
    contractAddress,
}: CertificateCardProps) => {
    /* REPLACE THIS ONCE DEPLOYED ON ETHERSCAN! */
    const etherscanURL = `https://sepolia.etherscan.io/token/${contractAddress}?a=${tokenId}`;

    return (
        <Card className="flex flex-col h-full hover:shadow-lg transition-transform duration-300">
            <CardHeader className="p-4">
                <img
                    src={imageUrl}
                    alt={title}
                    className="rounded-md border w-full object-contain max-h-48"
                    loading="lazy"
                />
            </CardHeader>
            <CardContent className="flex flex-col justify-between px-4 pb-4 grow">
                <div>
                    <CardTitle className="mb-3 text-base font-semibold">{title}</CardTitle>
                    <hr className="mb-2" />
                    <p className="text-sm">
                        <strong>Course Name:</strong> {courseName}
                    </p>
                    <p className="text-sm">
                        <strong>Date Issued:</strong> {dateIssued}
                    </p>
                    <p className="text-sm">
                        <strong>Issued to:</strong> {issuedTo}
                    </p>
                    <ExpandableText text={description} />
                </div>

                <Button asChild className="flex items-center gap-2 w-full mt-5 hover:bg-blue-600">
                    <Link to={etherscanURL} target="_blank" rel="noopener noreferrer">
                        <ExternalLinkIcon />
                        <span>View on Etherscan</span>
                    </Link>
                </Button>
            </CardContent>
        </Card>
    );
};

export default CertificateCard;
