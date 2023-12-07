import { Command } from 'cmdk'
import React from 'react'

type ISearchLocation = {
    open: boolean;
    setOpen: (e: boolean) => void;
}

export const SearchLocation: React.FC<ISearchLocation> = ({
    open,
    setOpen
}) => {
    if (open) {
        return (
            <div className="fixed inset-12 bg-white/50">
                Henlo
            </div>
        );
    }

    return <></>;
};