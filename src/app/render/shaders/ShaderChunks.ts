const mapFiles = (context: __WebpackModuleApi.RequireContext): Record<string, string> => {
	const keys: string[] = context.keys();
	const values: string[] = <string[]>keys.map(context);

	return keys.reduce((accumulator: Record<string, string>, key: string, index: number) => {
		key = key.slice(2).replace('.glsl', '');

		return {
			...accumulator,
			[key]: values[index],
		};
	}, {});
}

const context = import.meta.glob('../../../resources/shaders/chunks/*.glsl');
const ShaderChunks = Object.fromEntries(Object.entries(context).map(([key, value]) => [key.replace(/^.*[\\\/]/, '').replace(/\.\w+$/, ''), value.default]));

export default ShaderChunks;