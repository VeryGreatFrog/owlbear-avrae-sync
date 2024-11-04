import type { BoundingBox, Image, Vector2 } from "@owlbear-rodeo/sdk";
import OBR, { buildImage, buildText } from "@owlbear-rodeo/sdk";

import { getPluginId } from "../helper";

const urlBase = "https://owlbear-avrae-sync.com";

export const buildGenericTokenWithText = async (parentOptions: { item: Image; boundingBox: BoundingBox; dpiScale: number; gridSize: Vector2 }, tokenOptions: { imageName: string; tokenText: string; position: Vector2 }) => {};

export const buildAcToken = async (item: Image, boundingBox: BoundingBox, ac: number, dpiScale: number) => {
	const acImage = buildImage(
		{ height: 64, width: 64, url: `${urlBase}/armorClass.png`, mime: "image/png" },
		{ dpi: item.grid.dpi, offset: { x: 64, y: 0 } }
	)
		.attachedTo(item.id)
		.position({ x: boundingBox.max.x, y: boundingBox.min.y })
		.metadata({ [getPluginId("metadata")]: { isAc: true } })
		.locked(true)
		.visible(item.visible)
		.scale({ x: item.scale.x * item.image.width / 256, y: item.scale.y * item.image.height / 266 })
		.layer("ATTACHMENT")
		.disableHit(true)
		.build();
	const acText = buildText()
		.position({ x: boundingBox.max.x - acImage.image.width * dpiScale * acImage.scale.x, y: boundingBox.min.y })
		.text({
			plainText: ac.toString(),
			type: "PLAIN",
			style: {
				fillColor: "black",
				fillOpacity: 1,
				strokeColor: "red",
				strokeOpacity: 0,
				strokeWidth: 0,
				textAlign: "CENTER",
				textAlignVertical: "MIDDLE",
				fontFamily: "roboto",
				fontSize: acImage.image.height * acImage.scale.y * dpiScale / 3,
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

export const buildHealthToken = async (item: Image, boundingBox: BoundingBox, hp: [number, number], dpiScale: number) => {
	const healthImage = buildImage(
		{ height: 64, width: 128, url: `${urlBase}/health.png`, mime: "image/png" },
		{ dpi: item.grid.dpi, offset: { x: 0, y: 0 } }
	)
		.attachedTo(item.id)
		.position({ x: boundingBox.min.x, y: boundingBox.min.y })
		.metadata({ [getPluginId("metadata")]: { isHealth: true } })
		.locked(true)
		.visible(item.visible)
		.scale({ x: item.scale.x * item.image.width / 256, y: item.scale.y * item.image.height / 266 })
		.layer("ATTACHMENT")
		.disableHit(true)
		.build();
	const acText = buildText()
		.position({ x: boundingBox.min.x, y: boundingBox.min.y })
		.text({
			plainText: `${hp[0]} / ${hp[1]}`,
			type: "PLAIN",
			style: {
				fillColor: "black",
				fillOpacity: 1,
				strokeColor: "red",
				strokeOpacity: 0,
				strokeWidth: 0,
				textAlign: "CENTER",
				textAlignVertical: "MIDDLE",
				fontFamily: "roboto",
				fontSize: healthImage.image.height * healthImage.scale.y * dpiScale / 3,
				fontWeight: 400,
				lineHeight: 1,
				padding: 0
			},
			richText: [],
			width: healthImage.image.width * dpiScale * healthImage.scale.x,
			height: healthImage.image.height * dpiScale * healthImage.scale.y
		})
		.attachedTo(healthImage.id)
		.layer("TEXT")
		.locked(true)
		.visible(item.visible)
		.build();
	return [healthImage, acText];
};

export const buildHealthStatusToken = async (item: Image, boundingBox: BoundingBox, hpStatus: string, dpiScale: number) => {
	const healthStatusImage = buildImage(
		{ height: 64, width: 128, url: `${urlBase}/${hpStatus}.png`, mime: "image/png" },
		{ dpi: item.grid.dpi, offset: { x: 0, y: 0 } }
	)
		.attachedTo(item.id)
		.position({ x: boundingBox.min.x, y: boundingBox.min.y })
		.metadata({ [getPluginId("metadata")]: { isHealthStatus: true } })
		.locked(true)
		.visible(item.visible)
		.scale({ x: item.scale.x * item.image.width / 256, y: item.scale.y * item.image.height / 266 })
		.layer("ATTACHMENT")
		.disableHit(true)
		.build();
	const acText = buildText()
		.position({ x: boundingBox.min.x, y: boundingBox.min.y })
		.text({
			plainText: hpStatus,
			type: "PLAIN",
			style: {
				fillColor: hpStatus === "Dead" ? "white" : "black",
				fillOpacity: 1,
				strokeColor: "red",
				strokeOpacity: 0,
				strokeWidth: 0,
				textAlign: "CENTER",
				textAlignVertical: "MIDDLE",
				fontFamily: "roboto",
				fontSize: healthStatusImage.image.height * healthStatusImage.scale.y * dpiScale / 3,
				fontWeight: 400,
				lineHeight: 1,
				padding: 0
			},
			richText: [],
			width: healthStatusImage.image.width * dpiScale * healthStatusImage.scale.x,
			height: healthStatusImage.image.height * dpiScale * healthStatusImage.scale.y
		})
		.attachedTo(healthStatusImage.id)
		.layer("TEXT")
		.locked(true)
		.visible(item.visible)
		.build();
	return [healthStatusImage, acText];
};

export const buildThpToken = async (item: Image, boundingBox: BoundingBox, thp: number, dpiScale: number) => {
	const thpImage = buildImage(
		{ height: 64, width: 64, url: `${urlBase}/temp.png`, mime: "image/png" },
		{ dpi: item.grid.dpi, offset: { x: 128, y: 0 } }
	)
		.attachedTo(item.id)
		.position({ x: boundingBox.max.x, y: boundingBox.min.y })
		.metadata({ [getPluginId("metadata")]: { isThp: true } })
		.locked(true)
		.visible(item.visible)
		.scale({ x: item.scale.x * item.image.width / 256, y: item.scale.y * item.image.height / 266 })
		.layer("ATTACHMENT")
		.disableHit(true)
		.build();
	const acText = buildText()
		.position({ x: boundingBox.max.x - (thpImage.image.width * 2 * dpiScale * thpImage.scale.x), y: boundingBox.min.y })
		.text({
			plainText: `+${thp.toString()}`,
			type: "PLAIN",
			style: {
				fillColor: "black",
				fillOpacity: 1,
				strokeColor: "red",
				strokeOpacity: 0,
				strokeWidth: 0,
				textAlign: "CENTER",
				textAlignVertical: "MIDDLE",
				fontFamily: "roboto",
				fontSize: thpImage.image.height * thpImage.scale.y * dpiScale / 3,
				fontWeight: 400,
				lineHeight: 1,
				padding: 0
			},
			richText: [],
			width: thpImage.image.width * dpiScale * thpImage.scale.x,
			height: thpImage.image.height * dpiScale * thpImage.scale.y
		})
		.attachedTo(thpImage.id)
		.layer("TEXT")
		.locked(true)
		.visible(item.visible)
		.build();
	return [thpImage, acText];
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
				.disableHit(true)
				.build()
			);
		}
	}
	return images;
};
