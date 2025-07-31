import { useState } from "react";

const ExpandableText = ({ text }: { text: string }) => {
    const [expanded, setExpanded] = useState(false);
    const lineClampThreshold = 100;

    const isExpandable = text.length > lineClampThreshold;

    return (
        <div className="text-sm mt-2">
            <p className={expanded || !isExpandable ? "" : "line-clamp-3"}>{text}</p>
            {isExpandable && (
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="mt-1 text-blue-600 text-xs underline"
                >
                    {expanded ? "Show less" : "Read more"}
                </button>
            )}
        </div>
    );
};

export default ExpandableText;
