export class SceneManager {
    current;
    set(scene) { this.current?.exit?.(); this.current = scene; this.current.enter?.(); }
    update(dt) { this.current?.update(dt); }
    render() { this.current?.render(); }
}
