import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Search } from "lucide-react";

export function SearchBar() {
    return (
        <form className="flex w-full max-w-sm items-center gap-2">
            <Input
                type="text"
                placeholder="Search certificates..."
                name="search"
                className="flex-1"
            />
            <Button type="submit" variant="outline" className="flex items-center justify-center">
                <span className="hidden max-sm:inline">
                    <Search className="h-4 w-4" />
                </span>
                <span className="max-sm:hidden">Search</span>
            </Button>
        </form>
    );
}
