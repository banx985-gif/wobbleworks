import { deepClone, deepFreeze, fnv1a, stableStringify } from "./clone.js";
export function createBuildSnapshot(input) {
    const payload = {
        schemaVersion: 1,
        id: input.id,
        revision: input.revision,
        createdAtMs: input.createdAtMs ?? Date.now(),
        parts: deepClone(input.parts),
        connections: deepClone(input.connections)
    };
    const signature = fnv1a(stableStringify(payload));
    return deepFreeze({ ...payload, signature });
}
export function verifyBuildSnapshot(snapshot) {
    const { signature, ...payload } = snapshot;
    return fnv1a(stableStringify(payload)) === signature;
}
