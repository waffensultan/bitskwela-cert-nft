export type OperationStatus = "success" | "loading" | "error" | undefined;

export type Certificate = {
    tokenId: string;
    tokenURI: string;
    metadata: any;
};
