import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "~/components/ui/tooltip";
import { CircleQuestionMarkIcon } from "lucide-react";

interface StyledToolTipProps {
    content: string;
}

const StyledTooltip = ({ content }: StyledToolTipProps) => (
    <TooltipProvider>
        <Tooltip>
            <TooltipTrigger>
                <div className="rounded-full flex justify-center items-center w-4 h-4">
                    <CircleQuestionMarkIcon className="w-3 h-3 text-yellow-500" />
                </div>
            </TooltipTrigger>
            <TooltipContent>{content}</TooltipContent>
        </Tooltip>
    </TooltipProvider>
);

export default StyledTooltip;
