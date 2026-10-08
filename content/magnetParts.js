/**
 * Magnet Factory parts (M15). Magnets are solved by the MagnetSystem (src/magnets/). Every bar magnet has N at its
 * local +x end and S at its −x end; tap one while building to turn it a quarter turn.
 * Code-drawn behind these ids until their art arrives (docs/ART_NEEDED.md, Batch M).
 */
const elec = (id) => ({ id, family: "ELECTRICAL", capabilities: ["POWER"], direction: "BIDIRECTIONAL", offset: { x: 0, y: 0 }, angle: 0, snapRadius: 0.35, multiplicity: "MANY" });
const box = (bodyType, width, height, density = 1, friction = 0.4, restitution = 0.1, shape = "BOX") => ({ kind: "RIGID_BODY", bodyType, shape, width, height, density, friction, restitution });
const part = (id, familyId, displayName, category, behaviours, ports = []) => ({ id, familyId, displayName, category, behaviours, ports });
const scrap = (id, name, material, w, h, density = 1.2, shape = "BOX") => part(id, "magnetism.magnetic-material-target", name, "MAGNET", [box("DYNAMIC", w, h, density, 0.5, 0.15, shape), { kind: "MATERIAL", material }]);
export const MAGNET_PARTS = [
    part("magnetic.bar", "magnetism.rotatable-bar-magnet-preset", "Bar Magnet", "MAGNET", [box("STATIC", 1.0, 0.35), { kind: "MAGNET_BAR", strength: 1, length: 0.9 }]),
    part("magnetic.cart", "magnetism.rotatable-bar-magnet-preset", "Magnet Cart", "MAGNET", [box("DYNAMIC", 1.0, 0.45, 1, 0.2, 0.05), { kind: "MAGNET_BAR", strength: 1, length: 0.9 }]),
    part("magnetic.puck", "magnetism.rotatable-bar-magnet-preset", "Magnet Puck", "MAGNET", [box("DYNAMIC", 0.6, 0.3, 1.2, 0.6, 0.05), { kind: "MAGNET_BAR", strength: 1.1, length: 0.5 }]),
    part("magnetic.floater", "magnetism.rotatable-bar-magnet-preset", "Ring Magnet", "MAGNET", [box("DYNAMIC", 0.8, 0.3, 1, 0.3, 0.05), { kind: "MAGNET_BAR", strength: 1, length: 0.3, poleAngle: -Math.PI / 2 }]),
    part("magnetic.electromagnet", "magnetism.electromagnet", "Electromagnet", "MAGNET", [{ kind: "CIRCUIT", role: "LOAD", load: "ELECTROMAGNET", ohms: 4, terminals: [{ x: -0.35, y: -0.3 }, { x: 0.35, y: -0.3 }] }, { kind: "MAGNET_BAR", strength: 1.6, length: 0.6, electric: true }], [elec("a"), elec("b")]),
    part("magnetic.guide", "magnetism.magnetic-rail", "Guide Rod", "MAGNET", []),
    scrap("scrap.iron-block", "Iron Block", "IRON", 0.45, 0.45, 1.6),
    scrap("scrap.iron-crate", "Iron Crate", "IRON", 0.8, 0.6, 3),
    scrap("scrap.steel-ball", "Steel Ball", "STEEL", 0.36, 0.36, 2.2, "CIRCLE"),
    scrap("scrap.nickel-coin", "Nickel Coin", "NICKEL", 0.3, 0.12, 2),
    scrap("scrap.aluminium-can", "Aluminium Can", "ALUMINIUM", 0.35, 0.5, 0.6),
    scrap("scrap.copper-coin", "Copper Coin", "COPPER", 0.3, 0.12, 2),
    scrap("scrap.wood-block", "Wooden Block", "WOOD", 0.45, 0.45, 0.6),
    scrap("scrap.plastic-cup", "Plastic Cup", "PLASTIC", 0.35, 0.45, 0.4),
    scrap("scrap.rubber-duck", "Rubber Duck", "RUBBER", 0.5, 0.4, 0.4),
    part("scrap.glass-vase", "silly.glass-vase", "Glass Vase", "SILLY", [box("DYNAMIC", 0.4, 0.7, 0.8, 0.6, 0.05), { kind: "MATERIAL", material: "GLASS" }])
];
