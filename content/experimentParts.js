/**
 * Experiment Lab parts (M22): lane signs ("A" / "B"), a finish flag, and a test floor whose grip is set by the
 * experiment (its friction parameter). Code-drawn behind these ids (docs/ART_NEEDED.md, Batch E).
 */
const part = (id, displayName, behaviours, category = "LOGIC") => ({ id, familyId: id, displayName, category, behaviours, ports: [] });
export const EXPERIMENT_PARTS = [
    part("experiment.lane-sign", "Lane Sign", []),
    part("experiment.finish", "Finish Flag", []),
    part("experiment.test-surface", "Test Floor", [{ kind: "RIGID_BODY", bodyType: "STATIC", shape: "BOX", width: 5.6, height: 0.2, density: 1, friction: 0.35, restitution: 0.02 }], "MOTION")
];
