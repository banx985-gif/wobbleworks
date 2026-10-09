import { deepClone, deepFreeze, fnv1a, stableStringify } from "./clone.js";
export function createBuildSnapshot(input) {
    var _a;
    const payload = {
        schemaVersion: 1,
        id: input.id,
        revision: input.revision,
        createdAtMs: (_a = input.createdAtMs) !== null && _a !== void 0 ? _a : Date.now(),
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
