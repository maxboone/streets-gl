import React from "react";
import styles from './Panel.scss?inline';

const Panel: React.FC<{
	className: string;
	children: React.ReactNode;
}> = ({className, children}) => {
	return <div className={className + ' ' + styles.panel}>{children}</div>;
}

export default Panel;