import { Link } from "@remix-run/react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

type CertificateCardProps = {
    title: string;
    description: string;
    courseName: string;
    dateIssued: string;
    issuedTo: string;
    imageUrl: string;
    to: string;
};

export function CertificateCard({
    title,
    description,
    courseName,
    dateIssued,
    issuedTo,
    imageUrl,
    to,
}: CertificateCardProps) {
    return (
        <Link to={to} className="block">
            <Card className="hover:shadow-lg hover:scale-[1.02] transition-transform duration-300 cursor-pointer">
                <CardHeader className="p-4">
                    <img
                        src={imageUrl}
                        alt={title}
                        className="rounded-md border w-full object-contain max-h-48"
                    />
                </CardHeader>
                <CardContent className="px-4 pb-4">
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
                    <p className="text-sm mt-2">{description}</p>
                </CardContent>
            </Card>
        </Link>
    );
}
