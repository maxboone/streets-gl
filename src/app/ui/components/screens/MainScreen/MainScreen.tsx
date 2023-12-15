import React, { useContext, useState } from "react";
import { useRecoilValue } from "recoil";
import { ActionsContext, AtomsContext } from "~/app/ui/UI";
import DataTimestamp from "~/app/ui/components/DataTimestamp";
import LegalAttributionPanel from "~/app/ui/components/LegalAttributionPanel";
import styles from './MainScreen.scss';
import { PositionEditor } from "../../PositionEditor/PositionEditor";
import { GameUIRoot } from "~/app/ui/game-ui/GameUIRoot";

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
			<GameUIRoot/>
			<DataTimestamp/>
			<LegalAttributionPanel/>
		</div>
	);
}

export default MainScreen;
