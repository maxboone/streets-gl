import React, { useEffect, useState } from "react";
import { SearchLocation } from "./SearchLocation";
import { MiniMap } from "./MiniMap";
import KeyBindings from "./KeyBindings";
import { LocationInfo } from "./LocationInfo";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

export const queryClient = new QueryClient();

export const GameUIRoot: React.FC = () => {
    const [search, setSearch] = useState(false);
    const [info, setInfo] = useState(false);

    useEffect(() => {
        const handleKeyUp: (e: KeyboardEvent) => void = (e) => {
            e.preventDefault();
            console.log(e.key);
            if (e.key == 'p') {
                setSearch(true);
                setInfo(false);
            }
            if (e.key == 'k') {
                setSearch(false);
                setInfo(true);
            }
            if (e.key == 'Escape') {
                setSearch(false);
                setInfo(false);
            }
        }
        
        document.addEventListener('keyup', handleKeyUp);

        return () => {
            document.removeEventListener('keyup', handleKeyUp);
        }
    })

    return <QueryClientProvider client={queryClient}>
        <>
        { search && <SearchLocation open={search} setOpen={setSearch} /> }
        { info && <LocationInfo open={info} setOpen={setInfo} /> }
        <KeyBindings />
        <MiniMap/>
        </>
    </QueryClientProvider>
}