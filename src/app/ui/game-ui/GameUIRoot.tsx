import React, { useContext, useEffect, useState } from "react";
import { SearchLocation } from "./SearchLocation";
import { MiniMap } from "./MiniMap";
import KeyBindings from "./KeyBindings";
import { LocationInfo } from "./LocationInfo";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ActionsContext } from "../UI";
import { useAtom } from "jotai";
import { markersAtom } from "./markers";

export const queryClient = new QueryClient();

export const GameUIRoot: React.FC = () => {
    const [search, setSearch] = useState(false);
    const [info, setInfo] = useState(false);
    const actions = useContext(ActionsContext);
    const [_, setMarkers] = useAtom(markersAtom);

    const mark: () => void = () => {
        try {
            const hash = actions?.getControlsStateHash && actions.getControlsStateHash();
            if (hash) {
                const components = hash.split(',');
                const _lat = +components[0];
                const _lon = +components[1];
                setMarkers((e) => [...e, { lat: _lat, lon: _lon }])
            }
        } catch {
        }

    }

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
            if (e.key == 'm') {
                mark();
                setSearch(false);
                setInfo(false);
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