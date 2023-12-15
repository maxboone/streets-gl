import { atomWithStorage } from 'jotai/utils'

type Marker = {
    latitude: string;
    longitude: string;
    name?: string;
    id?: string;
}

type Markers = {
    [id: string]: Marker;
}

export const markersAtom = atomWithStorage<Markers>('sgl-markers', {})
