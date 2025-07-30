import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";

export function SearchBar() {
    return (
        <form className="flex w-full max-w-sm items-center gap-2">
            <Input type="text" placeholder="Search certificates..." name="search" />
            <Button type="submit" variant="outline">
                Search
            </Button>
        </form>
    );
}
