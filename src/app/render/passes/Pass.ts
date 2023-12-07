import type {
	ResourcePropMap,
} from "~/lib/render-graph";
import { Pass as RGPass } from "~/lib/render-graph"
import PassManager from '../PassManager';
import AbstractRenderer from '~/lib/renderer/abstract-renderer/AbstractRenderer';
import RenderGraphResourceFactory from '../render-graph/RenderGraphResourceFactory';

export default abstract class Pass<T extends ResourcePropMap = ResourcePropMap> extends RGPass<T> {
	protected readonly manager: PassManager;
	protected readonly renderer: AbstractRenderer;
	protected readonly resourceFactory: RenderGraphResourceFactory;

	protected constructor(name: string, manager: PassManager, initialResources: T) {
		super(name, initialResources);

		this.manager = manager;
		this.renderer = manager.renderer;
		this.resourceFactory = manager.resourceFactory;
	}

	public abstract setSize(width: number, height: number): void;
}