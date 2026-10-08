/**
 * Robot Lab parts (M18). The arena is a top-down floor plan of 1 m cells, solved by the RobotSystem (src/robots/).
 * A robot's program is kept on the robot (parameters.program) and edited with the block editor.
 * The robot arm uses `robot.arm`, rails use `robot.rails`; the rest are code-drawn (docs/ART_NEEDED.md, Batch R).
 */
const part = (id, familyId, displayName, behaviours) => ({ id, familyId, displayName, category: "LOGIC", behaviours, ports: [] });
const arena = (id, familyId, displayName, thing) => part(id, familyId, displayName, [{ kind: "ARENA", thing }]);
export const ROBOT_PARTS = [
    part("robot.bot", "robotics.robot-chassis", "Robot", [{ kind: "ROBOT", speed: 1.5 }]),
    arena("robot.wall", "structure.block", "Arena Wall", "WALL"),
    arena("robot.tile", "logic.sensor", "Colour Tile", "TILE"),
    arena("robot.goal", "robotics.indicator-light", "Goal", "GOAL"),
    arena("robot.box", "silly.toaster", "Box", "BOX"),
    arena("robot.drop", "robotics.indicator-light", "Drop Zone", "DROP"),
    arena("robot.button", "power.button", "Floor Button", "BUTTON"),
    arena("robot.door", "structure.frame", "Door", "DOOR"),
    arena("robot.sweeper", "robotics.robot-chassis", "Sweeper Bot", "SWEEPER"),
    arena("robot.conveyor", "motion.conveyor", "Conveyor", "CONVEYOR"),
    arena("robot.machine", "robotics.motor-controller", "Packing Machine", "MACHINE"),
    arena("robot.lamp", "robotics.indicator-light", "Lamp", "LAMP"),
    arena("robot.pad", "musical.tone-block", "Dance Pad", "PAD")
];
