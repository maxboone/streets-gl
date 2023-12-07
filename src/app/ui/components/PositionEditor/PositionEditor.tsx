import React, { useContext } from "react"
import { ActionsContext, AtomsContext } from "../../UI"
import { useRecoilValue } from "recoil";

export const PositionEditor: React.FC = () => {
    const atoms = useContext(AtomsContext)
    const actions = useContext(ActionsContext)
	const data = useRecoilValue(atoms.settingsSchema);

    return <div style={{
        position: "fixed",
        bottom: 0,
        zIndex: 100,
    }}>
    </div>
}