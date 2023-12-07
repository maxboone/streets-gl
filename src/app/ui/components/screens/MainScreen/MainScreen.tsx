import React, { useContext, useState } from "react";
import { useRecoilValue } from "recoil";
import { ActionsContext, AtomsContext } from "~/app/ui/UI";
import DataTimestamp from "~/app/ui/components/DataTimestamp";
import DebugInfo from "~/app/ui/components/DebugInfo";
import LegalAttributionPanel from "~/app/ui/components/LegalAttributionPanel";
import RenderGraphViewer from "~/app/ui/components/RenderGraphViewer";
import TimePanel from "~/app/ui/components/TimePanel";
import styles from './MainScreen.scss';
import { PositionEditor } from "../../PositionEditor/PositionEditor";

const MainScreen: React.FC = () => {
	const atoms = useContext(AtomsContext);
	const actions = useContext(ActionsContext);

	const [isRenderGraphVisible, setIsRenderGraphVisible] = useState<boolean>(true);
	const loadingProgress = useRecoilValue(atoms.resourcesLoadingProgress);
	const [activeModalWindow, setActiveModalWindow] = useState<string>('');
	const [isUIVisible, setIsUIVisible] = useState<boolean>(true);

	let containerClassNames = styles.mainScreen;

	if (!isUIVisible || loadingProgress < 1.) {
		containerClassNames += ' ' + styles['mainScreen--hidden'];
	}

	return (
		<div className={containerClassNames}>
			<DataTimestamp/>
			<LegalAttributionPanel/>
			<PositionEditor/>
		</div>
	);
}

export default MainScreen;
