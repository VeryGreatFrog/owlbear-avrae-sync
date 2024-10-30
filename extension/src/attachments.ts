import { CombatantData } from "./socket"
import { getPluginId, isPlainObject } from "./helper";
import { Shape, Image, isImage, buildImage, Item, buildText, BoundingBox } from "@owlbear-rodeo/sdk";
import OBR from "@owlbear-rodeo/sdk";

// Stores the state of the previous time it received an update, to reduce unnecessary updates somewhat.
let combatantCache: Record<string, CombatantData> = {}

export const updateCombatants2 = async (combatants: Record<string, CombatantData>) => {

    const sceneDpi = await OBR.scene.grid.getDpi()
    console.log("Requested to update")
    const currentAttachments = await OBR.scene.items.getItems<Shape>((item) => {
        const metadata = item.metadata[getPluginId("metadata")];
        return Boolean(isPlainObject(metadata));
    });

    const items = await OBR.scene.items.getItems(
        (item): item is Image => item.layer === "CHARACTER" && isImage(item)
    );

    const updateAC = async (item: Image, boundingBox: BoundingBox, combatant: CombatantData, dpiScale: number) => {
        console.log("Updating AC...")
        const currentAc = currentAttachments.filter((a) => {
            const metadata = a.metadata[getPluginId("metadata")]
            return Boolean(isPlainObject(metadata) && metadata.isAc && a.attachedTo === item.id);
        })

        if (combatant.ac !== undefined)
            toAdd.push(...await buildAcToken(item, boundingBox, combatant.ac, dpiScale))

        toDelete.push(...currentAc.map((a) => a.id))
    }

    const updateHealth = async (item: Image, boundingBox: BoundingBox, combatant: CombatantData, dpiScale: number) => {
        console.log("Updating health")
        const currentHealth = currentAttachments.filter((a) => {
            const metadata = a.metadata[getPluginId("metadata")]
            return Boolean(isPlainObject(metadata) && metadata.isHealth && a.attachedTo === item.id);
        })

        if (combatant.hp !== undefined || combatant.maxHp !== undefined) {
            toAdd.push(...await buildHealthToken(item, boundingBox, [combatant.hp || 0, combatant.maxHp || 0], dpiScale))
            toDelete.push(...currentHealth.map((a) => a.id))
        }

        if (combatantCache[combatant.name]?.hp && !combatant.hp || combatantCache[combatant.name]?.maxHp && !combatant.maxHp) {
            toDelete.push(...currentHealth.map((a) => a.id))
        }
    }

    const updateThp = async (item: Image, boundingBox: BoundingBox, combatant: CombatantData, dpiScale: number) => {
        console.log("Updating thp")
        console.log(combatant)
        const currentThp = currentAttachments.filter((a) => {
            const metadata = a.metadata[getPluginId("metadata")]
            return Boolean(isPlainObject(metadata) && metadata.isThp && a.attachedTo === item.id);
        })

        if (combatant.thp !== undefined) {
            toDelete.push(...currentThp.map((a) => a.id))
            toAdd.push(...await buildThpToken(item, boundingBox, combatant.thp, dpiScale))
        }

        if (combatantCache[combatant.name]?.thp && !combatant.thp) {
            toDelete.push(...currentThp.map((a) => a.id))
        }
    }

    const updateHealthStatus = async (item: Image, boundingBox: BoundingBox, combatant: CombatantData, dpiScale: number) => {
        console.log("Updating Health Status")
        const currentHealthStatuses = currentAttachments.filter((a) => {
            const metadata = a.metadata[getPluginId("metadata")]
            return Boolean(isPlainObject(metadata) && metadata.isHealthStatus && a.attachedTo === item.id);
        })

        if (combatant.hpStatus !== undefined) {
            toAdd.push(...await buildHealthStatusToken(item, boundingBox, combatant.hpStatus, dpiScale))
            toDelete.push(...currentHealthStatuses.map((a) => a.id))
        }

        if (combatantCache[combatant.name]?.hpStatus && !combatant.hpStatus) {
            toDelete.push(...currentHealthStatuses.map((a) => a.id))
        }
    }

    const updateConditions = async (item: Image, boundingBox: BoundingBox, combatant: CombatantData) => {
        console.log("Updating Conditions Status")
        const currentConditions = currentAttachments.filter((a) => {
            const metadata = a.metadata[getPluginId("metadata")]
            return Boolean(isPlainObject(metadata) && metadata.isCondition && a.attachedTo === item.id);
        })

        if (combatant.conditions !== undefined) {
            toAdd.push(...await buildConditionTokens(item, boundingBox, combatant.conditions || ""))
            toDelete.push(...currentConditions.map((a) => a.id))
        }

        if (combatantCache[combatant.name]?.conditions && !combatant.conditions) {
            toDelete.push(...currentConditions.map((a) => a.id))
        }
    }


    const toAdd: Item[] = []
    const toDelete: string[] = []

    for (const combatantName in combatants) {
        const combatant = combatants[combatantName]
        for (const item of items) {
            if (item.text.plainText.toLowerCase().replaceAll(" ", "") === combatantName.toLowerCase().replaceAll(" ", "")) {
                console.log(combatant)
                const dpiScale = sceneDpi / (item.grid.dpi);
                const boundingBox = await OBR.scene.items.getItemBounds([item.id])

                if (combatant.ac !== combatantCache[combatantName]?.ac) await updateAC(item, boundingBox, combatant, dpiScale)
                if (combatant.hp !== combatantCache[combatantName]?.hp || combatant.maxHp !== combatantCache[combatantName]?.maxHp) await updateHealth(item, boundingBox, combatant, dpiScale)
                if (combatant.thp !== combatantCache[combatantName]?.thp) await updateThp(item, boundingBox, combatant, dpiScale)
                if (combatant.hpStatus !== combatantCache[combatantName]?.hpStatus) await updateHealthStatus(item, boundingBox, combatant, dpiScale)
                if (combatant.conditions !== combatantCache[combatantName]?.conditions) await updateConditions(item, boundingBox, combatant)
            }
        }
    }

    if (toAdd.length > 0) {
        await OBR.scene.items.addItems(toAdd)
    }

    if (toDelete.length > 0) {
        await OBR.scene.items.deleteItems(toDelete)
    }

    combatantCache = combatants
}


const buildAcToken = async (item: Image, boundingBox: BoundingBox, ac: number, dpiScale: number) => {
    console.log(item.scale)
    const acImage = buildImage(
        { height: 64, width: 64, url: `${urlBase}/armorClass.png`, mime: "image/png" },
        { dpi: item.grid.dpi, offset: { x: 64, y: 0 } }
    )
        .attachedTo(item.id)
        .position({ x: boundingBox.max.x, y: boundingBox.min.y })
        .metadata({ [getPluginId("metadata")]: { isAc: true } })
        .locked(true)
        .visible(true)
        .scale({ x: item.scale.x * item.image.width / 256, y: item.scale.y * item.image.height / 266 })
        .layer("ATTACHMENT")
        .disableHit(true)
        .build()
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
                fontSize: acImage.image.height * acImage.scale.y * dpiScale / 4,
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
        .visible(true)
        .build()
    return [acImage, acText]
}

const buildHealthToken = async (item: Image, boundingBox: BoundingBox, hp: [number, number], dpiScale: number) => {
    const healthImage = buildImage(
        { height: 64, width: 128, url: `${urlBase}/health.png`, mime: "image/png" },
        { dpi: item.grid.dpi, offset: { x: 0, y: 0 } }
    )
        .attachedTo(item.id)
        .position({ x: boundingBox.min.x, y: boundingBox.min.y })
        .metadata({ [getPluginId("metadata")]: { isHealth: true } })
        .locked(true)
        .visible(true)
        .scale({ x: item.scale.x * item.image.width / 256, y: item.scale.y * item.image.height / 266 })
        .layer("ATTACHMENT")
        .disableHit(true)
        .build()
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
                fontSize: healthImage.image.height * healthImage.scale.y * dpiScale / 4,
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
        .visible(true)
        .build()
    return [healthImage, acText]
}

const buildHealthStatusToken = async (item: Image, boundingBox: BoundingBox, hpStatus: string, dpiScale: number) => {
    const healthStatusImage = buildImage(
        { height: 64, width: 128, url: `${urlBase}/${hpStatus}.png`, mime: "image/png" },
        { dpi: item.grid.dpi, offset: { x: 0, y: 0 } }
    )
        .attachedTo(item.id)
        .position({ x: boundingBox.min.x, y: boundingBox.min.y })
        .metadata({ [getPluginId("metadata")]: { isHealthStatus: true } })
        .locked(true)
        .visible(true)
        .scale({ x: item.scale.x * item.image.width / 256, y: item.scale.y * item.image.height / 266 })
        .layer("ATTACHMENT")
        .disableHit(true)
        .build()
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
                fontSize: healthStatusImage.image.height * healthStatusImage.scale.y * dpiScale / 4,
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
        .visible(true)
        .build()
    return [healthStatusImage, acText]
}

const buildThpToken = async (item: Image, boundingBox: BoundingBox, thp: number, dpiScale: number) => {
    const thpImage = buildImage(
        { height: 64, width: 64, url: `${urlBase}/temp.png`, mime: "image/png" },
        { dpi: item.grid.dpi, offset: { x: 128, y: 0 } }
    )
        .attachedTo(item.id)
        .position({ x: boundingBox.max.x, y: boundingBox.min.y })
        .metadata({ [getPluginId("metadata")]: { isThp: true } })
        .locked(true)
        .visible(true)
        .scale({ x: item.scale.x * item.image.width / 256, y: item.scale.y * item.image.height / 266 })
        .layer("ATTACHMENT")
        .disableHit(true)
        .build()
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
                fontSize: thpImage.image.height * thpImage.scale.y * dpiScale / 4,
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
        .visible(true)
        .build()
    return [thpImage, acText]
}

const conditionTokens = ['blessed', 'blinded', 'charmed', 'deafened', 'frightened', 'grappled', 'incapacitated', 'invisible', 'paralyzed', 'petrified', 'poisoned', 'prone', 'restrained', 'stunned', 'unconscious']

const buildConditionTokens = async (item: Image, boundingBox: BoundingBox, conditions: string) => {
    const images: Image[] = []

    for (let token of conditionTokens) {
        if (conditions.includes(token)) {
            const spacesUp = Math.floor(images.length / 4 )
            const spacesRight = images.length % 4
            console.log(spacesUp, spacesRight, images.length)

            images.push(buildImage(
                { height: 64, width: 64, url: `${urlBase}/conditions/${token}.svg`, mime: "image/svg" },
                { dpi: item.grid.dpi, offset: { x: 0 - 64 * spacesRight, y: 64 + 64 * spacesUp } }
            )
                .attachedTo(item.id)
                .position({ x: boundingBox.min.x, y: boundingBox.max.y })
                .metadata({ [getPluginId("metadata")]: { isCondition: true } })
                .locked(true)
                .visible(true)
                .scale({ x: item.scale.x * item.image.width / 256, y: item.scale.y * item.image.height / 266 })
                .layer("ATTACHMENT")
                .disableHit(true)
                .build()
            )
        }
    }
    return images
}

const urlBase = "https://owlbear-avrae-sync.com";
