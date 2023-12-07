import React, { useEffect, useState } from "react";
import { SearchLocation } from "./SearchLocation";
import { MiniMap } from "./MiniMap";
import KeyBindings from "./KeyBindings";

export const GameUIRoot: React.FC = () => {
    const [search, setSearch] = useState(false);

    useEffect(() => {
        const handleKeyDown: (e: KeyboardEvent) => void = (e) => {
            e.preventDefault();
            if (e.key == 'k' && e.ctrlKey)
                setSearch((s) => !s);
        }
        
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        }
    })

    return <>
        <SearchLocation open={search} setOpen={setSearch} />
        <KeyBindings />
        <MiniMap/>
    </>
}