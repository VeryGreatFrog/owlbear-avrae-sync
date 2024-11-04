import type { BoundingBox, Image, Vector2 } from "@owlbear-rodeo/sdk";
import OBR, { buildImage, buildText } from "@owlbear-rodeo/sdk";

import { getPluginId } from "../helper";

const urlBase = import.meta.env.DEV ? "http://localhost:5173" : "https://owlbear-avrae-sync.com";

export const buildGenericTokenWithText = async (parentOptions: { item: Image; boundingBox: BoundingBox; dpiScale: number; gridSize: Vector2 }, tokenOptions: { imageName: string; tokenText: string; position: Vector2 }) => { console.log(parentOptions, tokenOptions); };

export const buildAcToken = async (item: Image, boundingBox: BoundingBox, ac: number, dpiScale: number) => {
	const acImage = buildImage(
		{ height: 256, width: 256, url: `${urlBase}/armorClass.svg`, mime: "image/svg" },
		{ dpi: item.grid.dpi, offset: { x: 0, y: 10 } }
	)
		.attachedTo(item.id)
		.position({ x: boundingBox.min.x, y: boundingBox.min.y })
		.metadata({ [getPluginId("metadata")]: { isAc: true } })
		.locked(true)
		.visible(item.visible)
		.scale({ x: item.scale.x * item.image.width / 256 * 0.1, y: item.scale.y / item.scale.y * 0.1 })
		.layer("ATTACHMENT")
		.disableHit(false)
		.build();
	const acText = buildText()
		.position({ x: boundingBox.min.x, y: boundingBox.min.y })
		.text({
			plainText: ac.toString(),
			type: "PLAIN",
			style: {
				fillColor: "white",
				fillOpacity: 1,
				strokeColor: "black",
				strokeOpacity: 1,
				strokeWidth: 1,
				textAlign: "CENTER",
				textAlignVertical: "MIDDLE",
				fontFamily: "roboto",
				fontSize: 7,
				fontWeight: 400,
				lineHeight: 1,
				padding: 0
			},
			richText: [],
			width: acImage.image.width * dpiScale * acImage.scale.x,
			height: acImage.image.height * dpiScale * acImage.scale.y
		})
		.attachedTo(acImage.id)
		.layer("TEXT")
		.locked(true)
		.visible(acImage.visible)
		.build();
	return [acImage, acText];
};

export const buildHealthToken = async (item: Image, boundingBox: BoundingBox, hp: [number, number, number], dpiScale: number) => {
	const healthBar = buildImage({
		height: 22,
		width: 243,
		url: `${urlBase}/health/bar.png`,
		mime: "image/png"
	}, {
		dpi: item.grid.dpi,
		offset: { x: 0, y: 0 }
	})
		.attachedTo(item.id)
		.metadata({ [getPluginId("metadata")]: { isHealth: true } })
		.visible(item.visible)
		.locked(true)
		.disableHit(false)
		.layer("ATTACHMENT")
		.scale({ x: (item.scale.x * item.image.width / 243) * (Math.max(0.02, Math.min(1, hp[0] / hp[1]))) * 0.8, y: item.grid.dpi / await OBR.scene.grid.getDpi() * 0.5 })
		.position({ x: boundingBox.min.x + (item.image.width * dpiScale * 0.1 * item.scale.x), y: boundingBox.min.y })
		.build();

	const healthBorder = buildImage({
		height: 22,
		width: 243,
		url: `${urlBase}/health/border.png`,
		mime: "image/png"
	}, {
		dpi: item.grid.dpi,
		offset: { x: 0, y: 0 }
	})
		.attachedTo(item.id)
		.metadata({ [getPluginId("metadata")]: { isHealth: true } })
		.visible(item.visible)
		.locked(true)
		.disableHit(false)
		.layer("ATTACHMENT")
		.scale({ x: (item.scale.x * item.image.width / 243) * 0.8, y: item.grid.dpi / await OBR.scene.grid.getDpi() * 0.5 })
		.position({ x: boundingBox.min.x + (item.image.width * dpiScale * 0.1 * item.scale.x), y: boundingBox.min.y })
		.zIndex(healthBar.zIndex + 1)
		.build();

	const healthText = buildText()
		.attachedTo(healthBar.id)
		.layer("TEXT")
		.locked(true)
		.visible(item.visible)
		.text({
			plainText: `${hp[0]}/${hp[1]}${hp[2] ? ` + ${hp[2]}` : ""}`,
			type: "PLAIN",
			style: {
				fillColor: "white",
				fillOpacity: 1,
				strokeColor: "black",
				strokeOpacity: 1,
				strokeWidth: 1,
				textAlign: "CENTER",
				textAlignVertical: "MIDDLE",
				fontFamily: "roboto",
				fontSize: 12,
				fontWeight: 400,
				lineHeight: 1,
				padding: 0
			},
			richText: [],
			width: healthBorder.image.width * dpiScale * healthBorder.scale.x,
			height: healthBorder.image.height * dpiScale * healthBorder.scale.y
		})
		.position({ x: boundingBox.min.x + (item.image.width * dpiScale * 0.1 * item.scale.x), y: boundingBox.min.y })
		.build();
	return [healthBar, healthBorder, healthText];
};

export const buildHealthStatusToken = async (item: Image, boundingBox: BoundingBox, hpStatus: string, dpiScale: number) => {
	const healthBar = buildImage({
		height: 22,
		width: 243,
		url: `${urlBase}/health/${hpStatus}.png`,
		mime: "image/png"
	}, {
		dpi: item.grid.dpi,
		offset: { x: 0, y: 0 }
	})
		.attachedTo(item.id)
		.metadata({ [getPluginId("metadata")]: { isHealthStatus: true } })
		.visible(item.visible)
		.locked(true)
		.disableHit(false)
		.layer("ATTACHMENT")
		.scale({ x: (item.scale.x * item.image.width / 243) * 0.8, y: item.grid.dpi / await OBR.scene.grid.getDpi() * 0.5 })
		.position({ x: boundingBox.min.x + (item.image.width * dpiScale * 0.1 * item.scale.x), y: boundingBox.min.y })
		.build();

	const healthBorder = buildImage({
		height: 22,
		width: 243,
		url: `${urlBase}/health/border.png`,
		mime: "image/png"
	}, {
		dpi: item.grid.dpi,
		offset: { x: 0, y: 0 }
	})
		.attachedTo(item.id)
		.metadata({ [getPluginId("metadata")]: { isHealthStatus: true } })
		.visible(item.visible)
		.locked(true)
		.disableHit(false)
		.layer("ATTACHMENT")
		.scale({ x: (item.scale.x * item.image.width / 243) * 0.8, y: item.grid.dpi / await OBR.scene.grid.getDpi() * 0.5 })
		.position({ x: boundingBox.min.x + (item.image.width * dpiScale * 0.1 * item.scale.x), y: boundingBox.min.y })
		.zIndex(healthBar.zIndex + 1)
		.build();

	const healthText = buildText()
		.attachedTo(healthBar.id)
		.layer("TEXT")
		.locked(true)
		.visible(item.visible)
		.text({
			plainText: hpStatus,
			type: "PLAIN",
			style: {
				fillColor: "white",
				fillOpacity: 1,
				strokeColor: "black",
				strokeOpacity: 1,
				strokeWidth: 1.3,
				textAlign: "CENTER",
				textAlignVertical: "MIDDLE",
				fontFamily: "roboto",
				fontSize: 10,
				fontWeight: 400,
				lineHeight: 1,
				padding: 1.5
			},
			richText: [],
			width: healthBorder.image.width * dpiScale * healthBorder.scale.x,
			height: healthBorder.image.height * dpiScale * healthBorder.scale.y
		})
		.position({ x: boundingBox.min.x + (item.image.width * dpiScale * 0.1 * item.scale.x), y: boundingBox.min.y })
		.build();
	return [healthBar, healthBorder, healthText];
};

const conditionTokens = ["blessed", "blinded", "charmed", "deafened", "frightened", "grappled", "incapacitated", "invisible", "paralyzed", "petrified", "poisoned", "prone", "restrained", "stunned", "unconscious"];

export const buildConditionTokens = async (item: Image, boundingBox: BoundingBox, conditions: string) => {
	const images: Image[] = [];

	for (const token of conditionTokens) {
		if (conditions.includes(token)) {
			const spacesUp = Math.floor(images.length / 4);
			const spacesRight = images.length % 4;
			console.log(spacesUp, spacesRight, images.length);

			images.push(buildImage(
				{ height: 64, width: 64, url: `${urlBase}/conditions/${token}.svg`, mime: "image/svg" },
				{ dpi: item.grid.dpi, offset: { x: 0 - 64 * spacesRight, y: 64 + 64 * spacesUp } }
			)
				.attachedTo(item.id)
				.position({ x: boundingBox.min.x, y: boundingBox.max.y })
				.metadata({ [getPluginId("metadata")]: { isCondition: true } })
				.locked(true)
				.visible(item.visible)
				.scale({ x: item.scale.x * item.image.width / 256, y: item.scale.y * item.image.height / 266 })
				.layer("ATTACHMENT")
				.disableHit(false)
				.build()
			);
		}
	}
	return images;
};
