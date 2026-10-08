/**
 * Chain Reaction Workshop parts (M21). Dominoes, bells, the trapdoor, the duck cannon and the confetti ring are toy
 * mechanisms run by the ChainSystem (no physics body: they react to what touches them); the seesaw also has a plank
 * to rest things on. The Chain Counter turns counting on in any build. Code-drawn behind these ids until the chain
 * art arrives (docs/ART_NEEDED.md, Batch C).
 */
const part = (id, displayName, behaviours, category = "MOTION") => ({ id, familyId: id, displayName, category, behaviours, ports: [] });
export const CHAIN_PARTS = [
    part("chain.domino", "Domino", [{ kind: "CHAIN", thing: "DOMINO" }]),
    part("chain.bell", "Bell", [{ kind: "CHAIN", thing: "BELL" }], "MUSICAL"),
    part("chain.seesaw", "Seesaw", [{ kind: "RIGID_BODY", bodyType: "STATIC", shape: "BOX", width: 2.0, height: 0.16, density: 1, friction: 0.6, restitution: 0.05 }, { kind: "CHAIN", thing: "SEESAW" }]),
    part("chain.trapdoor", "Trapdoor", [{ kind: "CHAIN", thing: "TRAPDOOR" }]),
    part("chain.cannon", "Duck Cannon", [{ kind: "CHAIN", thing: "CANNON" }], "SILLY"),
    part("chain.confetti", "Confetti Ring", [{ kind: "CHAIN", thing: "CONFETTI" }], "SILLY"),
    part("chain.counter", "Chain Counter", [{ kind: "CHAIN", thing: "COUNTER" }], "LOGIC")
];
