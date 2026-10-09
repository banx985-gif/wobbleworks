/**
 * Clues for the Inventor Contracts (M27). Each job built on a lab level uses that level's verified answer (tests
 * check it still completes the job). Wheel Wobble and Generator Test have their own rooms and verified answers.
 * Built from the lab hint table passed in, so there is no import loop with the hint module.
 */
const BASE = {
    "contract.apple-elevator": "gear.slow-and-strong", "contract.kitchen-conveyor": "power.motor-power", "contract.roof-beam-lift": "builder.build-a-crane",
    "contract.site-bridge": "builder.the-robot-parade-bridge", "contract.hilltop-apples": "motion.spring-delivery", "contract.water-the-rows": "water.water-the-garden",
    "contract.rescue-line": "motion.duck-cannon", "contract.pump-to-the-roof": "water.pump-it-up", "contract.loading-dock": "magnet.electromagnet-crane",
    "contract.fragile-parcel": "flight.safe-landing", "contract.rover-cargo": "space.moon-base-delivery", "contract.panel-deployment": "space.satellite-power",
    "contract.safe-animal-gate": "power.buzz-the-duck", "contract.snack-launcher": "magnet.no-touching", "contract.treasure-lift": "power.power-the-lift",
    "contract.bell-and-cannon": "chain.duck-finale", "contract.stage-lift": "gear.lift-bolt", "contract.beat-machine": "chain.bell-ringer",
    "contract.fountain-fix": "water.the-grand-fountain", "contract.ride-starter": "gear.spin-sprocket", "contract.controlled-drop": "space.earth-gravity-vs-moon-gravity",
    "contract.sensor-rig": "robot.follow-the-colour"
};
const OWN = {
    "contract.wheel-wobble": { concept: "A rover needs a wheel at each end to roll along properly.", usefulParts: ["space.wheel"], solution: [{ definitionId: "space.wheel", x: 2, y: 8.17, rotation: 0 }], ghostCount: 1 },
    "contract.generator-test": { concept: "To spin the generator fast, a big gear on the crank should turn a small gear on the generator.", usefulParts: ["gear.large", "gear.small"], solution: [{ definitionId: "gear.large", x: 3.5, y: 5, rotation: 0 }, { definitionId: "gear.small", x: 4.6, y: 5, rotation: 0 }], ghostCount: 1 }
};
export function contractHints(base) {
    const out = { ...OWN };
    for (const [id, from] of Object.entries(BASE)) {
        const h = base[from];
        if (h)
            out[id] = h;
    }
    return out;
}
