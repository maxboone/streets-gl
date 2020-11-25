import Renderer from "../../renderer/Renderer";
import PerspectiveCamera from "../../core/PerspectiveCamera";
import Object3D from "../../core/Object3D";
import GroundMaterial from "./materials/GroundMaterial";
import Mat4 from "../../math/Mat4";
import {App} from "../App";
import GBuffer from "../../renderer/GBuffer";
import GLConstants from "../../renderer/GLConstants";
import Vec2 from "../../math/Vec2";
import BuildingMaterial from "./materials/BuildingMaterial";
import FullScreenQuad from "../objects/FullScreenQuad";
import HDRComposeMaterial from "./materials/HDRComposeMaterial";
import SkyboxMaterial from "./materials/SkyboxMaterial";
import Skybox from "../objects/Skybox";
import LDRComposeMaterial from "./materials/LDRComposeMaterial";
import CSM from "./CSM";
import Config from "../Config";
import GroundDepthMaterial from "./materials/GroundDepthMaterial";
import BuildingDepthMaterial from "./materials/BuildingDepthMaterial";
import TAAPass from "./passes/TAAPass";

export default class RenderSystem {
	public renderer: Renderer;
	public camera: PerspectiveCamera;
	public scene: Object3D;
	public wrapper: Object3D;
	private gBuffer: GBuffer;
	private skybox: Skybox;
	private csm: CSM;
	private taaPass: TAAPass;
	private frameCount: number = 0;

	private groundMaterial: GroundMaterial;
	private groundDepthMaterial: GroundDepthMaterial;
	private buildingMaterial: BuildingMaterial;
	private buildingDepthMaterial: BuildingDepthMaterial;
	private skyboxMaterial: SkyboxMaterial;
	private quad: FullScreenQuad;
	private hdrComposeMaterial: HDRComposeMaterial;
	private ldrComposeMaterial: LDRComposeMaterial;

	constructor(private app: App) {
		this.init();
	}

	private init() {
		this.renderer = new Renderer(<HTMLCanvasElement>document.getElementById('canvas'));
		this.renderer.setSize(this.resolution.x, this.resolution.y);
		this.renderer.culling = true;

		this.gBuffer = new GBuffer(this.renderer, this.resolution.x, this.resolution.y, [
			{
				name: 'color',
				internalFormat: GLConstants.RGBA8,
				format: GLConstants.RGBA,
				type: GLConstants.UNSIGNED_BYTE,
				mipmaps: false
			}, {
				name: 'normal',
				internalFormat: GLConstants.RGB8,
				format: GLConstants.RGB,
				type: GLConstants.UNSIGNED_BYTE,
				mipmaps: false
			}, {
				name: 'position',
				internalFormat: GLConstants.RGBA32F,
				format: GLConstants.RGBA,
				type: GLConstants.FLOAT,
				mipmaps: false
			}, {
				name: 'metallicRoughness',
				internalFormat: GLConstants.RGBA8,
				format: GLConstants.RGBA,
				type: GLConstants.UNSIGNED_BYTE,
				mipmaps: false
			}, {
				name: 'emission',
				internalFormat: GLConstants.RGB8,
				format: GLConstants.RGB,
				type: GLConstants.UNSIGNED_BYTE,
				mipmaps: false
			}, {
				name: 'motion',
				internalFormat: GLConstants.RGBA32F,
				format: GLConstants.RGBA,
				type: GLConstants.FLOAT,
				mipmaps: false
			}
		]);
		this.hdrComposeMaterial = new HDRComposeMaterial(this.renderer, this.gBuffer);
		this.ldrComposeMaterial = new LDRComposeMaterial(this.renderer, this.gBuffer);

		this.taaPass = new TAAPass(this.renderer, this.resolution.x, this.resolution.y);

		this.camera = new PerspectiveCamera({
			fov: 40,
			near: 10,
			far: 25000,
			aspect: window.innerWidth / window.innerHeight
		});

		this.quad = new FullScreenQuad(this.renderer);

		this.initScene();

		console.log(`Vendor: ${this.renderer.rendererInfo[0]}\nRenderer: ${this.renderer.rendererInfo[1]}`);

		window.addEventListener('resize', () => this.resize());
	}

	private initScene() {
		this.scene = new Object3D();
		this.wrapper = new Object3D();
		this.scene.add(this.wrapper);

		this.wrapper.add(this.camera);

		this.skybox = new Skybox(this.renderer);
		this.wrapper.add(this.skybox);

		this.csm = new CSM(this.renderer, {
			camera: this.camera,
			parent: this.wrapper,
			near: this.camera.near,
			far: 4000,
			resolution: 2048,
			cascades: Config.ShadowCascades,
			shadowBias: -0.003,
			shadowNormalBias: 0.002,
		});

		this.groundMaterial = new GroundMaterial(this.renderer);
		this.groundDepthMaterial = new GroundDepthMaterial(this.renderer);
		this.buildingMaterial = new BuildingMaterial(this.renderer);
		this.buildingDepthMaterial = new BuildingDepthMaterial(this.renderer);
		this.skyboxMaterial = new SkyboxMaterial(this.renderer);
	}

	private resize() {
		this.camera.aspect = window.innerWidth / window.innerHeight;
		this.camera.updateProjectionMatrix();

		this.renderer.setSize(this.resolution.x, this.resolution.y);
		this.gBuffer.setSize(this.resolution.x, this.resolution.y);
		this.taaPass.setSize(this.resolution.x, this.resolution.y);
		this.csm.updateFrustums();
	}

	public update(deltaTime: number) {
		const pivotDelta = new Vec2(
			this.wrapper.position.x + this.camera.position.x,
			this.wrapper.position.z + this.camera.position.z
		);

		this.wrapper.position.x = -this.camera.position.x;
		this.wrapper.position.z = -this.camera.position.z;

		this.updateTiles();

		this.scene.updateMatrixRecursively();
		this.scene.updateMatrixWorldRecursively();

		this.camera.updateMatrixWorld();
		this.camera.updateMatrixWorldInverse();

		this.camera.updateFrustum();

		this.taaPass.jitterProjectionMatrix(this.camera.projectionMatrix, this.frameCount);
		this.taaPass.matrixWorldInverse = this.camera.matrixWorldInverse;

		if (this.taaPass.matrixWorldInversePrev) {
			this.taaPass.matrixWorldInversePrev = Mat4.translate(
				this.taaPass.matrixWorldInversePrev,
				pivotDelta.x,
				0,
				pivotDelta.y
			);
		}

		this.renderShadowMaps();
		this.renderTiles();

		++this.frameCount;
	}

	private updateTiles() {
		const tiles = this.app.tileManager.tiles;

		for (const tile of tiles.values()) {
			if (!tile.ground && tile.readyForRendering) {
				tile.createGround(this.renderer, this.app.tileManager.getTileNeighbors(tile.x, tile.y));
				tile.generateMeshes(this.renderer);
				this.wrapper.add(tile);
			}
		}
	}

	private renderTiles() {
		const tiles = this.app.tileManager.tiles;

		this.renderer.bindFramebuffer(this.gBuffer.framebuffer);

		this.renderer.clearFramebuffer({
			clearColor: [0.5, 0.5, 0.5, 1],
			depthValue: 1,
			color: true,
			depth: true
		});

		this.renderer.culling = false;
		this.renderer.depthWrite = false;

		this.skybox.position.set(this.camera.position.x, this.camera.position.y, this.camera.position.z);
		this.skybox.updateMatrix();
		this.skybox.updateMatrixWorld();

		this.skyboxMaterial.uniforms.projectionMatrix.value = this.camera.projectionMatrix;
		this.skyboxMaterial.uniforms.modelViewMatrix.value = Mat4.multiply(this.camera.matrixWorldInverse, this.skybox.matrixWorld);
		this.skyboxMaterial.uniforms.modelViewMatrixPrev.value = Mat4.multiply(
			this.taaPass.matrixWorldInversePrev || this.camera.matrixWorldInverse,
			this.skybox.matrixWorld
		);

		this.skyboxMaterial.uniforms.modelViewMatrixPrev.value.values[12] = this.skyboxMaterial.uniforms.modelViewMatrix.value.values[12];
		this.skyboxMaterial.uniforms.modelViewMatrixPrev.value.values[13] = this.skyboxMaterial.uniforms.modelViewMatrix.value.values[13];
		this.skyboxMaterial.uniforms.modelViewMatrixPrev.value.values[14] = this.skyboxMaterial.uniforms.modelViewMatrix.value.values[14];

		this.skyboxMaterial.use();
		this.skybox.draw();

		this.renderer.culling = true;
		this.renderer.depthWrite = true;

		this.groundMaterial.uniforms.projectionMatrix.value = this.camera.projectionMatrix;
		this.groundMaterial.use();

		for (const tile of tiles.values()) {
			if (tile.displayBufferNeedsUpdate) {
				tile.updateDisplayBuffer();
			}

			if (!tile.ground || !tile.ground.inCameraFrustum(this.camera)) {
				continue;
			}

			this.groundMaterial.uniforms.modelViewMatrix.value = Mat4.multiply(this.camera.matrixWorldInverse, tile.ground.matrixWorld);
			this.groundMaterial.uniforms.modelViewMatrixPrev.value = Mat4.multiply(
				this.taaPass.matrixWorldInversePrev || this.camera.matrixWorldInverse,
				tile.ground.matrixWorld
			);
			this.groundMaterial.uniforms.map.value = tile.colorMap;
			this.groundMaterial.updateUniform('modelViewMatrix');
			this.groundMaterial.updateUniform('modelViewMatrixPrev');
			this.groundMaterial.updateUniform('map');

			tile.ground.draw();
		}

		this.buildingMaterial.uniforms.projectionMatrix.value = this.camera.projectionMatrix;
		this.buildingMaterial.use();

		for (const tile of tiles.values()) {
			if (!tile.buildings || !tile.buildings.inCameraFrustum(this.camera)) {
				continue;
			}

			this.buildingMaterial.uniforms.modelViewMatrix.value = Mat4.multiply(this.camera.matrixWorldInverse, tile.buildings.matrixWorld);
			this.buildingMaterial.uniforms.modelViewMatrixPrev.value = Mat4.multiply(
				this.taaPass.matrixWorldInversePrev || this.camera.matrixWorldInverse,
				tile.buildings.matrixWorld
			);
			this.buildingMaterial.updateUniform('modelViewMatrix');
			this.buildingMaterial.updateUniform('modelViewMatrixPrev');

			tile.buildings.draw();
		}

		this.renderer.bindFramebuffer(this.gBuffer.framebufferHDR);

		this.hdrComposeMaterial.uniforms.viewMatrix.value = this.camera.matrixWorld;
		this.csm.applyUniformsToMaterial(this.hdrComposeMaterial);
		this.hdrComposeMaterial.use();
		this.quad.draw();

		this.renderer.bindFramebuffer(this.taaPass.framebufferOutput);
		this.taaPass.material.uniforms.tAccum.value = this.taaPass.framebufferAccum.textures[0];
		this.taaPass.material.uniforms.tNew.value = this.gBuffer.framebufferHDR.textures[0];
		this.taaPass.material.uniforms.tMotion.value = this.gBuffer.textures.motion;
		this.taaPass.material.uniforms.ignoreHistory.value = this.frameCount === 0 ? 1 : 0;
		this.taaPass.material.use();
		this.quad.draw();

		this.taaPass.copyOutputToAccum();
		this.taaPass.matrixWorldInversePrev = Mat4.copy(this.camera.matrixWorldInverse);

		this.renderer.bindFramebuffer(null);

		this.ldrComposeMaterial.use();
		//this.ldrComposeMaterial.uniforms.tHDR.value = this.gBuffer.framebufferHDR.textures[0];
		this.ldrComposeMaterial.uniforms.tHDR.value = this.taaPass.framebufferOutput.textures[0];
		this.quad.draw();
	}

	private renderShadowMaps() {
		this.csm.update();

		for (let i = 0; i < this.csm.lights.length; i++) {
			const directionalShadow = this.csm.lights[i];
			const camera = directionalShadow.camera;

			camera.updateFrustum();

			this.renderer.bindFramebuffer(directionalShadow.framebuffer);

			this.renderer.depthTest = true;
			this.renderer.depthWrite = true;

			this.renderer.clearFramebuffer({
				clearColor: [100000, 1, 1, 1],
				depthValue: 1,
				color: true,
				depth: true
			});

			this.groundDepthMaterial.uniforms.projectionMatrix.value = camera.projectionMatrix;
			this.groundDepthMaterial.use();

			const tiles = this.app.tileManager.tiles;

			for (const tile of tiles.values()) {
				if (!tile.ground || !tile.ground.inCameraFrustum(camera)) {
					continue;
				}

				this.groundDepthMaterial.uniforms.modelViewMatrix.value = Mat4.multiply(camera.matrixWorldInverse, tile.ground.matrixWorld);
				this.groundDepthMaterial.updateUniform('modelViewMatrix');

				tile.ground.draw();
			}

			this.buildingDepthMaterial.uniforms.projectionMatrix.value = camera.projectionMatrix;
			this.buildingDepthMaterial.use();

			for (const tile of tiles.values()) {
				if (!tile.buildings || !tile.buildings.inCameraFrustum(camera)) {
					continue;
				}

				this.buildingDepthMaterial.uniforms.modelViewMatrix.value = Mat4.multiply(camera.matrixWorldInverse, tile.buildings.matrixWorld);
				this.buildingDepthMaterial.updateUniform('modelViewMatrix');

				tile.buildings.draw();
			}
		}
	}

	public get resolution(): Vec2 {
		const pixelRatio = Config.IsMobileBrowser ? Math.min(window.devicePixelRatio, 1) : window.devicePixelRatio;
		return new Vec2(window.innerWidth * pixelRatio, window.innerHeight * pixelRatio);
	}
}
