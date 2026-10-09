export const MAIN_LABS = [
    { id: "motion-yard", title: "Motion Yard", concepts: "Gravity, slopes, friction and bounce", colour: "#74c0fc", icon: "\ud83d\udedd", missions: [
            { id: "motion.roll-with-it", title: "Roll With It", slot: "ORDINARY", ordinaryNumber: 1, objective: "Place/adjust a ramp so a ball rolls into the bucket; teaches gravity, slope and rolling.", requiredForProgression: true },
            { id: "motion.ramp-rescue", title: "Ramp Rescue", slot: "ORDINARY", ordinaryNumber: 2, objective: "Get Bolt down from a raised platform without a hard impact; introduces controlled speed and safe arrival.", requiredForProgression: true },
            { id: "motion.too-fast", title: "Too Fast!", slot: "ORDINARY", ordinaryNumber: 3, objective: "Slow a cart before it reaches the barrier using friction, slope or another permitted motion solution.", requiredForProgression: true },
            { id: "motion.spring-delivery", title: "Spring Delivery", slot: "ORDINARY", ordinaryNumber: 4, objective: "Launch a parcel onto a target platform with a spring; tune placement/strength rather than match a blueprint.", requiredForProgression: false },
            { id: "motion.slippery-business", title: "Slippery Business", slot: "ORDINARY", ordinaryNumber: 5, objective: "Cross mixed high/low-friction surfaces and observe how grip changes motion.", requiredForProgression: false },
            { id: "motion.bounce-around", title: "Bounce Around", slot: "ORDINARY", ordinaryNumber: 6, objective: "Use bounce to reach and activate a switch.", requiredForProgression: false },
            { id: "motion.heavy-or-light", title: "Heavy or Light?", slot: "ORDINARY", ordinaryNumber: 7, objective: "Move objects with different masses and compare how the same setup behaves.", requiredForProgression: false },
            { id: "motion.make-it-farther", title: "Make It Farther", slot: "ORDINARY", ordinaryNumber: 8, objective: "Improve a cart so it travels farther; supports iterative optimisation.", requiredForProgression: false },
            { id: "motion.which-ramp-wins", title: "Which Ramp Wins?", slot: "EXPERIMENT", objective: "Build A/B ramps with different angles and compare distance/time with one controlled variable.", requiredForProgression: false },
            { id: "motion.duck-cannon", title: "Duck Cannon", slot: "SILLY", objective: "Launch a rubber duck into the giant bath target with a ridiculous but safe contraption.", requiredForProgression: false },
            { id: "motion.giant-marble-delivery", title: "The Giant Marble Delivery Machine", slot: "MEGA", objective: "Create a multi-stage route that transports a marble across the yard through multiple mechanisms.", requiredForProgression: true },
            { id: "motion.runaway-test-cart", title: "Runaway Test Cart", slot: "EMERGENCY", objective: "Stop a runaway cart before the hazard without directly blocking it with a wall.", requiredForProgression: true },
        ] },
    { id: "gear-garage", title: "Gear Garage", concepts: "Gears, speed and turning force", colour: "#ffa94d", icon: "\u2699\ufe0f", missions: [
            { id: "gear.turn-the-door", title: "Turn the Door", slot: "ORDINARY", ordinaryNumber: 1, objective: "Connect a crank/gear/axle system that rotates the stuck workshop door mechanism.", requiredForProgression: true },
            { id: "gear.wrong-way-round", title: "Wrong Way Round", slot: "ORDINARY", ordinaryNumber: 2, objective: "Reverse output direction using an additional gear relationship.", requiredForProgression: true },
            { id: "gear.speed-it-up", title: "Speed It Up", slot: "ORDINARY", ordinaryNumber: 3, objective: "Use a gear ratio that makes a target fan/output rotate faster.", requiredForProgression: true },
            { id: "gear.slow-and-strong", title: "Slow and Strong", slot: "ORDINARY", ordinaryNumber: 4, objective: "Use a ratio favouring turning force to move a heavier load.", requiredForProgression: false },
            { id: "gear.lift-bolt", title: "Lift Bolt", slot: "ORDINARY", ordinaryNumber: 5, objective: "Combine gears, pulley/rope and a structure to raise Bolt to a platform.", requiredForProgression: false },
            { id: "gear.three-fans", title: "Three Fans", slot: "ORDINARY", ordinaryNumber: 6, objective: "Transfer one input through a network that drives three visible outputs.", requiredForProgression: false },
            { id: "gear.clockwork-trouble", title: "Clockwork Trouble", slot: "ORDINARY", ordinaryNumber: 7, objective: "Diagnose and repair an almost-working clockwork mechanism.", requiredForProgression: false },
            { id: "gear.conveyor-rescue", title: "Conveyor Rescue", slot: "ORDINARY", ordinaryNumber: 8, objective: "Drive an older Motion conveyor with a gear/motor system to move cargo.", requiredForProgression: false },
            { id: "gear.big-gear-vs-small-gear", title: "Big Gear vs Small Gear", slot: "EXPERIMENT", objective: "Compare direction, relative speed and turning effect using two controlled gear setups.", requiredForProgression: false },
            { id: "gear.spin-sprocket", title: "Spin Sprocket", slot: "SILLY", objective: "Build a safe spinning platform for Sprocket without flinging him out of the marked area.", requiredForProgression: false },
            { id: "gear.the-clockwork-carnival", title: "The Clockwork Carnival", slot: "MEGA", objective: "Restore a multi-output mechanical ride using a large stable gear network.", requiredForProgression: true },
            { id: "gear.jammed-factory-drive", title: "Jammed Factory Drive", slot: "EMERGENCY", objective: "Diagnose overload/direction issues and rebuild the drive so the factory line runs continuously.", requiredForProgression: true },
        ] },
    { id: "builder-bay", title: "Builder Bay", concepts: "Bridges, towers and strong shapes", colour: "#ffd43b", icon: "\ud83c\udfd7\ufe0f", missions: [
            { id: "builder.bridge-the-gap", title: "Bridge the Gap", slot: "ORDINARY", ordinaryNumber: 1, objective: "Build a structure that carries Bolt across a gap.", requiredForProgression: true },
            { id: "builder.stop-the-wobble", title: "Stop the Wobble", slot: "ORDINARY", ordinaryNumber: 2, objective: "Improve an unstable platform until stability remains inside the target threshold.", requiredForProgression: true },
            { id: "builder.triangle-power", title: "Triangle Power", slot: "ORDINARY", ordinaryNumber: 3, objective: "Add bracing and observe reduced movement/stress under load.", requiredForProgression: true },
            { id: "builder.heavy-delivery", title: "Heavy Delivery", slot: "ORDINARY", ordinaryNumber: 4, objective: "Support and move a heavy load across a structure.", requiredForProgression: false },
            { id: "builder.build-a-crane", title: "Build a Crane", slot: "ORDINARY", ordinaryNumber: 5, objective: "Reuse gears/pulleys/rope with a structure to lift a crate into a marked zone.", requiredForProgression: false },
            { id: "builder.roof-rescue", title: "Roof Rescue", slot: "ORDINARY", ordinaryNumber: 6, objective: "Brace a partial roof so Bolt can pass beneath safely.", requiredForProgression: false },
            { id: "builder.tallest-tower", title: "Tallest Tower", slot: "ORDINARY", ordinaryNumber: 7, objective: "Build above the target height while keeping stability within limits.", requiredForProgression: false },
            { id: "builder.keep-the-egg-safe", title: "Keep the Egg Safe", slot: "ORDINARY", ordinaryNumber: 8, objective: "Build a protective/support structure that keeps egg peak impact below the threshold.", requiredForProgression: false },
            { id: "builder.which-bridge-holds-more", title: "Which Bridge Holds More?", slot: "EXPERIMENT", objective: "Compare two bracing layouts and supported load.", requiredForProgression: false },
            { id: "builder.elephant-robot-parade", title: "Elephant Robot Parade", slot: "SILLY", objective: "Build a bridge that carries the comically heavy elephant-shaped robot.", requiredForProgression: false },
            { id: "builder.the-robot-parade-bridge", title: "The Robot Parade Bridge", slot: "MEGA", objective: "Construct the permanent campus canyon bridge with moving parade traffic.", requiredForProgression: true },
            { id: "builder.collapsing-workshop-roof", title: "Collapsing Workshop Roof", slot: "EMERGENCY", objective: "Stabilise damaged roof sections, then move equipment through before the scripted test load ends.", requiredForProgression: true },
        ] },
    { id: "power-lab", title: "Power Lab", concepts: "Circuits, switches and motors", colour: "#fcc419", icon: "\ud83d\udca1", missions: [
            { id: "power.light-it-up", title: "Light It Up", slot: "ORDINARY", ordinaryNumber: 1, objective: "Create a complete source-path-load circuit that lights the bulb.", requiredForProgression: true },
            { id: "power.broken-loop", title: "Broken Loop", slot: "ORDINARY", ordinaryNumber: 2, objective: "Find and repair a missing/disconnected part of an almost-complete circuit.", requiredForProgression: true },
            { id: "power.push-the-button", title: "Push the Button", slot: "ORDINARY", ordinaryNumber: 3, objective: "Use a button to control a powered output.", requiredForProgression: true },
            { id: "power.motor-power", title: "Motor Power", slot: "ORDINARY", ordinaryNumber: 4, objective: "Power an existing motor and mechanical output from earlier labs.", requiredForProgression: false },
            { id: "power.two-lights", title: "Two Lights", slot: "ORDINARY", ordinaryNumber: 5, objective: "Build a valid two-load circuit and compare behaviour.", requiredForProgression: false },
            { id: "power.which-path", title: "Which Path?", slot: "ORDINARY", ordinaryNumber: 6, objective: "Choose/construct branches and observe supported series/parallel behaviour.", requiredForProgression: false },
            { id: "power.power-the-lift", title: "Power the Lift", slot: "ORDINARY", ordinaryNumber: 7, objective: "Use battery, switch, motor and old gear/structure parts to lift Bolt/cargo.", requiredForProgression: false },
            { id: "power.save-the-battery", title: "Save the Battery", slot: "ORDINARY", ordinaryNumber: 8, objective: "Complete the job while keeping energyUsed below the level limit.", requiredForProgression: false },
            { id: "power.one-battery-or-two", title: "One Battery or Two?", slot: "EXPERIMENT", objective: "Compare two supported circuit configurations using the same load.", requiredForProgression: false },
            { id: "power.buzz-the-duck", title: "Buzz the Duck", slot: "SILLY", objective: "Build an over-the-top buzzer/light alarm that is triggered by a duck target.", requiredForProgression: false },
            { id: "power.restore-the-power-grid", title: "Restore the Power Grid", slot: "MEGA", objective: "Reconnect multiple lab branches and restore all marked critical outputs.", requiredForProgression: true },
            { id: "power.blackout", title: "Blackout", slot: "EMERGENCY", objective: "Restore priority workshop systems under a limited-power budget.", requiredForProgression: true },
        ] },
    { id: "magnet-factory", title: "Magnet Factory", concepts: "Pulling, pushing and sorting", colour: "#e599f7", icon: "\ud83e\uddf2", missions: [
            { id: "magnet.pull-it-in", title: "Pull It In", slot: "ORDINARY", ordinaryNumber: 1, objective: "Rotate/place a bar magnet so unlike poles attract the target into the zone.", requiredForProgression: true },
            { id: "magnet.push-it-away", title: "Push It Away", slot: "ORDINARY", ordinaryNumber: 2, objective: "Use like-pole repulsion to move an object without contact.", requiredForProgression: true },
            { id: "magnet.metal-only", title: "Metal Only", slot: "ORDINARY", ordinaryNumber: 3, objective: "Sort magnetic from non-magnetic tagged materials.", requiredForProgression: true },
            { id: "magnet.no-touching", title: "No Touching", slot: "ORDINARY", ordinaryNumber: 4, objective: "Move a target through a short course using magnetic force only.", requiredForProgression: false },
            { id: "magnet.scrap-sorter", title: "Scrap Sorter", slot: "ORDINARY", ordinaryNumber: 5, objective: "Combine magnets with a conveyor or moving mechanism from earlier labs.", requiredForProgression: false },
            { id: "magnet.magnet-transport", title: "Magnet Transport", slot: "ORDINARY", ordinaryNumber: 6, objective: "Carry/guide magnetic cargo between zones using a moving magnetic system.", requiredForProgression: false },
            { id: "magnet.floating-trick", title: "Floating Trick", slot: "ORDINARY", ordinaryNumber: 7, objective: "Create a stable authored repulsion demonstration inside allowed guides; never claim unrestricted levitation.", requiredForProgression: false },
            { id: "magnet.electromagnet-crane", title: "Electromagnet Crane", slot: "ORDINARY", ordinaryNumber: 8, objective: "Use electricity + electromagnet + structure to pick up and release scrap.", requiredForProgression: false },
            { id: "magnet.which-materials-move", title: "Which Materials Move?", slot: "EXPERIMENT", objective: "Compare curated material samples for magnetic response.", requiredForProgression: false },
            { id: "magnet.magnetic-sandwich", title: "Magnetic Sandwich", slot: "SILLY", objective: "Stack target objects using alternating attraction/repulsion interactions.", requiredForProgression: false },
            { id: "magnet.the-giant-scrap-sorter", title: "The Giant Scrap Sorter", slot: "MEGA", objective: "Restore the multi-stage conveyor/electromagnet recycling machine.", requiredForProgression: true },
            { id: "magnet.scrap-avalanche", title: "Scrap Avalanche", slot: "EMERGENCY", objective: "Clear blocked routes by selectively moving magnetic scrap without destabilising protected objects.", requiredForProgression: true },
        ] },
    { id: "water-works", title: "Water Works", concepts: "Pipes, valves, pumps and flow", colour: "#4dabf7", icon: "\ud83d\udca7", missions: [
            { id: "water.fill-the-tank", title: "Fill the Tank", slot: "ORDINARY", ordinaryNumber: 1, objective: "Connect a valid pipe route that fills the target tank to its goal level.", requiredForProgression: true },
            { id: "water.downhill-flow", title: "Downhill Flow", slot: "ORDINARY", ordinaryNumber: 2, objective: "Route water using gravity through a lower outlet.", requiredForProgression: true },
            { id: "water.turn-the-valve", title: "Turn the Valve", slot: "ORDINARY", ordinaryNumber: 3, objective: "Use a valve to start/stop or redirect a supported flow path.", requiredForProgression: true },
            { id: "water.stop-the-leak", title: "Stop the Leak", slot: "ORDINARY", ordinaryNumber: 4, objective: "Repair/reroute a leaking network before protected zones receive too much water.", requiredForProgression: false },
            { id: "water.water-the-garden", title: "Water the Garden", slot: "ORDINARY", ordinaryNumber: 5, objective: "Reuse older structures/mechanics to route and distribute water to multiple beds.", requiredForProgression: false },
            { id: "water.spin-the-wheel", title: "Spin the Wheel", slot: "ORDINARY", ordinaryNumber: 6, objective: "Drive a water wheel and transfer its rotation to an older mechanical output.", requiredForProgression: false },
            { id: "water.pump-it-up", title: "Pump It Up", slot: "ORDINARY", ordinaryNumber: 7, objective: "Use electrical power to pump water to a higher tank.", requiredForProgression: false },
            { id: "water.spray-the-target", title: "Spray the Target", slot: "ORDINARY", ordinaryNumber: 8, objective: "Tune pipe/nozzle routing to hit marked targets.", requiredForProgression: false },
            { id: "water.which-pipe-fills-faster", title: "Which Pipe Fills Faster?", slot: "EXPERIMENT", objective: "Compare two pipe routes/restrictions and fill time.", requiredForProgression: false },
            { id: "water.duck-water-park", title: "Duck Water Park", slot: "SILLY", objective: "Build a ridiculous multi-stage duck water ride.", requiredForProgression: false },
            { id: "water.the-grand-fountain", title: "The Grand Fountain", slot: "MEGA", objective: "Restore the campus fountain with tanks, pumps, valves, nozzles and mechanical display elements.", requiredForProgression: true },
            { id: "water.flooded-workshop", title: "Flooded Workshop", slot: "EMERGENCY", objective: "Redirect incoming water away from protected electrical equipment; no shock simulation is inferred.", requiredForProgression: true },
        ] },
    { id: "flight-hangar", title: "Flight Hangar", concepts: "Wind, wings, gliding and lift", colour: "#a5d8ff", icon: "\u2708\ufe0f", missions: [
            { id: "flight.blow-it-over", title: "Blow It Over", slot: "ORDINARY", ordinaryNumber: 1, objective: "Use fan thrust/wind to move a light target into a marked area.", requiredForProgression: true },
            { id: "flight.long-glide", title: "Long Glide", slot: "ORDINARY", ordinaryNumber: 2, objective: "Build/adjust a glider that travels past the minimum distance.", requiredForProgression: true },
            { id: "flight.safe-landing", title: "Safe Landing", slot: "ORDINARY", ordinaryNumber: 3, objective: "Use drag/parachute/stability so peak landing impact remains below threshold.", requiredForProgression: true },
            { id: "flight.balloon-lift", title: "Balloon Lift", slot: "ORDINARY", ordinaryNumber: 4, objective: "Lift a light payload to the target height with balloon force.", requiredForProgression: false },
            { id: "flight.through-the-hoops", title: "Through the Hoops", slot: "ORDINARY", ordinaryNumber: 5, objective: "Build a stable flying/gliding machine that passes through authored gates.", requiredForProgression: false },
            { id: "flight.balance-the-wings", title: "Balance the Wings", slot: "ORDINARY", ordinaryNumber: 6, objective: "Adjust wing/tail placement so rotation/stability variance stays within limits.", requiredForProgression: false },
            { id: "flight.propeller-push", title: "Propeller Push", slot: "ORDINARY", ordinaryNumber: 7, objective: "Power a propeller using the electrical/mechanical systems already learned.", requiredForProgression: false },
            { id: "flight.cross-the-canyon", title: "Cross the Canyon", slot: "ORDINARY", ordinaryNumber: 8, objective: "Build a machine that carries the target across the full gap.", requiredForProgression: false },
            { id: "flight.which-wing-flies-farther", title: "Which Wing Flies Farther?", slot: "EXPERIMENT", objective: "Compare supported wing shape/angle presets while controlling another variable.", requiredForProgression: false },
            { id: "flight.flying-sprocket", title: "Flying Sprocket", slot: "SILLY", objective: "Give Sprocket a safe airborne ride through a short course.", requiredForProgression: false },
            { id: "flight.the-canyon-flyer", title: "The Canyon Flyer", slot: "MEGA", objective: "Build a multi-system aircraft/glider that crosses the workshop canyon with payload.", requiredForProgression: true },
            { id: "flight.falling-cargo", title: "Falling Cargo", slot: "EMERGENCY", objective: "Catch, slow or redirect falling packages before peakImpact exceeds limits.", requiredForProgression: true },
        ] },
    { id: "robot-lab", title: "Robot Lab", concepts: "Programs, sensors and robots", colour: "#63e6be", icon: "\ud83e\udd16", missions: [
            { id: "robot.move-forward", title: "Move Forward", slot: "ORDINARY", ordinaryNumber: 1, objective: "Create the shortest valid sequence that moves the robot into the goal zone.", requiredForProgression: true },
            { id: "robot.turn-the-corner", title: "Turn the Corner", slot: "ORDINARY", ordinaryNumber: 2, objective: "Add turning instructions to navigate an L-shaped route.", requiredForProgression: true },
            { id: "robot.wait-for-it", title: "Wait for It", slot: "ORDINARY", ordinaryNumber: 3, objective: "Use WAIT/timer behaviour to synchronise with a moving obstacle.", requiredForProgression: true },
            { id: "robot.avoid-the-wall", title: "Avoid the Wall", slot: "ORDINARY", ordinaryNumber: 4, objective: "Use a sensor + IF rule to avoid repeated collisions.", requiredForProgression: false },
            { id: "robot.follow-the-colour", title: "Follow the Colour", slot: "ORDINARY", ordinaryNumber: 5, objective: "Use the colour sensor to choose a supported action.", requiredForProgression: false },
            { id: "robot.press-the-button", title: "Press the Button", slot: "ORDINARY", ordinaryNumber: 6, objective: "Program a robot to reach and activate a physical/electrical control.", requiredForProgression: false },
            { id: "robot.carry-the-box", title: "Carry the Box", slot: "ORDINARY", ordinaryNumber: 7, objective: "Control an actuator/robot route to deliver cargo.", requiredForProgression: false },
            { id: "robot.factory-robot", title: "Factory Robot", slot: "ORDINARY", ordinaryNumber: 8, objective: "Control older conveyors, motors and switches as one automated work cell.", requiredForProgression: false },
            { id: "robot.which-route-is-faster", title: "Which Route Is Faster?", slot: "EXPERIMENT", objective: "Compare two robot programs using elapsedTime/programBlockCount.", requiredForProgression: false },
            { id: "robot.robot-dance-party", title: "Robot Dance Party", slot: "SILLY", objective: "Program multiple robots into a timed routine using sequences/loops.", requiredForProgression: false },
            { id: "robot.automated-factory", title: "Automated Factory", slot: "MEGA", objective: "Build and program a functioning multi-station production line.", requiredForProgression: true },
            { id: "robot.robot-traffic-jam", title: "Robot Traffic Jam", slot: "EMERGENCY", objective: "Debug multiple robot programs/sensors causing a blockage.", requiredForProgression: true },
        ] },
    { id: "space-centre", title: "Space Centre", concepts: "Rockets, rovers and low gravity", colour: "#9775fa", icon: "\ud83d\ude80", missions: [
            { id: "space.build-the-rover", title: "Build the Rover", slot: "ORDINARY", ordinaryNumber: 1, objective: "Construct a stable rover that reaches a nearby marker in low gravity.", requiredForProgression: true },
            { id: "space.cross-the-crater", title: "Cross the Crater", slot: "ORDINARY", ordinaryNumber: 2, objective: "Use structure/wheels/control to cross uneven low-gravity terrain.", requiredForProgression: true },
            { id: "space.launch-straight", title: "Launch Straight", slot: "ORDINARY", ordinaryNumber: 3, objective: "Build a stable rocket arrangement that passes through the launch corridor.", requiredForProgression: true },
            { id: "space.reach-the-target", title: "Reach the Target", slot: "ORDINARY", ordinaryNumber: 4, objective: "Tune thrust/trajectory to enter the target zone.", requiredForProgression: false },
            { id: "space.safe-touchdown", title: "Safe Touchdown", slot: "ORDINARY", ordinaryNumber: 5, objective: "Use landing legs/drag/control so the payload survives landing.", requiredForProgression: false },
            { id: "space.satellite-power", title: "Satellite Power", slot: "ORDINARY", ordinaryNumber: 6, objective: "Build a supported solar/electrical circuit to power the satellite load.", requiredForProgression: false },
            { id: "space.robot-arm-repair", title: "Robot Arm Repair", slot: "ORDINARY", ordinaryNumber: 7, objective: "Program/control the robotic arm to place the repair component.", requiredForProgression: false },
            { id: "space.moon-base-delivery", title: "Moon Base Delivery", slot: "ORDINARY", ordinaryNumber: 8, objective: "Combine rover, structure, power and automation to move supplies to the base.", requiredForProgression: false },
            { id: "space.earth-gravity-vs-moon-gravity", title: "Earth Gravity vs Moon Gravity", slot: "EXPERIMENT", objective: "Run the same build in two gravity environments and compare weight/trajectory while mass remains unchanged.", requiredForProgression: false },
            { id: "space.space-duck", title: "Space Duck", slot: "SILLY", objective: "Launch a duck through a target orbit-style path without claiming full orbital simulation.", requiredForProgression: false },
            { id: "space.the-wobbleworks-explorer", title: "The WobbleWorks Explorer", slot: "MEGA", objective: "Build a launch, flight, landing and rover-delivery system as one staged mission.", requiredForProgression: true },
            { id: "space.broken-launch-tower", title: "Broken Launch Tower", slot: "EMERGENCY", objective: "Repair a multi-system launch tower using structures, electricity, gears and robotics.", requiredForProgression: true },
        ] },
];
/**
 * Creative modes (M21 onward): play sets outside the nine-lab campaign. Their challenges are all open from the start
 * (slot CHALLENGE) — they never gate the campaign and the campaign never needs them.
 */
export const CHAIN_WORKSHOP = { id: "chain-workshop", title: "Chain Reaction Workshop", concepts: "Cause and effect", colour: "#ffa94d", icon: "⛓️", missions: [
        { id: "chain.first-domino", title: "First Domino", slot: "CHALLENGE", objective: "Create a 5-edge causal chain ending at a bell.", requiredForProgression: false },
        { id: "chain.bell-ringer", title: "Bell Ringer", slot: "CHALLENGE", objective: "Ring 5 distinct bells from one starting action.", requiredForProgression: false },
        { id: "chain.up-down-around", title: "Up, Down, Around", slot: "CHALLENGE", objective: "Use at least one lift, roll and rotation event in a 8-edge chain.", requiredForProgression: false },
        { id: "chain.power-change", title: "Power Change", slot: "CHALLENGE", objective: "Use mechanical → electrical → mechanical transfer in one valid chain.", requiredForProgression: false },
        { id: "chain.wet-and-wild", title: "Wet and Wild", slot: "CHALLENGE", objective: "Include a water-controlled event and finish by launching a duck.", requiredForProgression: false },
        { id: "chain.magnetic-middle", title: "Magnetic Middle", slot: "CHALLENGE", objective: "Use a magnetic switch or magnetic movement as a causal step.", requiredForProgression: false },
        { id: "chain.robot-relay", title: "Robot Relay", slot: "CHALLENGE", objective: "A sensor-driven robot must trigger the next mechanism.", requiredForProgression: false },
        { id: "chain.air-mail", title: "Air Mail", slot: "CHALLENGE", objective: "Use a fan/balloon/flight event to carry the chain between two stations.", requiredForProgression: false },
        { id: "chain.three-domains", title: "Three Domains", slot: "CHALLENGE", objective: "Use at least three different system domains in a 12-edge chain.", requiredForProgression: false },
        { id: "chain.no-repeats", title: "No Repeats", slot: "CHALLENGE", objective: "Reach 10 causal edges without repeating a mechanism family.", requiredForProgression: false },
        { id: "chain.long-haul", title: "Long Haul", slot: "CHALLENGE", objective: "Keep one causal sequence alive for at least 20 seconds without loop farming.", requiredForProgression: false },
        { id: "chain.duck-finale", title: "Duck Finale", slot: "CHALLENGE", objective: "Reach 15 valid edges and make the final event launch a duck through confetti.", requiredForProgression: false }
    ] };
/** Experiment Lab (M22): the 11 locked experiment templates, opened by the lab each one belongs to. */
export const EXPERIMENT_LAB = { id: "experiment-lab", title: "Experiment Lab", concepts: "Fair tests", colour: "#74c0fc", icon: "🔬", missions: [
        { id: "exp.which-ramp-wins", title: "Which Ramp Wins?", slot: "CHALLENGE", objective: "ramp angle vs distance/time", requiredForProgression: false },
        { id: "exp.grip-test", title: "Grip Test", slot: "CHALLENGE", objective: "surface preset vs distance/stopping time", requiredForProgression: false },
        { id: "exp.big-gear-vs-small-gear", title: "Big Gear vs Small Gear", slot: "CHALLENGE", objective: "ratio vs relative speed/turning effect", requiredForProgression: false },
        { id: "exp.which-bridge-holds-more", title: "Which Bridge Holds More?", slot: "CHALLENGE", objective: "bracing design vs supportedLoad", requiredForProgression: false },
        { id: "exp.one-battery-or-two", title: "One Battery or Two?", slot: "CHALLENGE", objective: "supported source arrangement vs load behaviour/energyUsed", requiredForProgression: false },
        { id: "exp.which-materials-move", title: "Which Materials Move?", slot: "CHALLENGE", objective: "material tag vs magnetic response", requiredForProgression: false },
        { id: "exp.which-pipe-fills-faster", title: "Which Pipe Fills Faster?", slot: "CHALLENGE", objective: "route/restriction vs elapsedTime", requiredForProgression: false },
        { id: "exp.which-wing-flies-farther", title: "Which Wing Flies Farther?", slot: "CHALLENGE", objective: "wing preset/angle vs distanceTravelled", requiredForProgression: false },
        { id: "exp.which-route-is-faster", title: "Which Route Is Faster?", slot: "CHALLENGE", objective: "program sequence vs elapsedTime/programBlockCount", requiredForProgression: false },
        { id: "exp.bounce-grip-or-slide", title: "Bounce, Grip or Slide?", slot: "CHALLENGE", objective: "material preset vs restitution/friction outcome", requiredForProgression: false },
        { id: "exp.earth-gravity-vs-moon-gravity", title: "Earth Gravity vs Moon Gravity", slot: "CHALLENGE", objective: "gravity setting vs weight/trajectory", requiredForProgression: false }
    ] };
/** Free Build (M23): the 13 sandbox rooms (their furniture, prompts and modifiers are in src/sandbox/Sandboxes.ts). */
export const FREE_BUILD_ROOMS = { id: "free-build", title: "Free Build", concepts: "Build anything", colour: "#8ce99a", icon: "🧰", missions: [
        ["sandbox.empty-workshop", "Empty Workshop"], ["sandbox.test-track", "Test Track"], ["sandbox.tall-tower-room", "Tall Tower Room"], ["sandbox.water-room", "Water Room"], ["sandbox.flight-room", "Flight Room"],
        ["sandbox.robot-arena", "Robot Arena"], ["sandbox.construction-yard", "Construction Yard"], ["sandbox.toy-city", "Toy City"], ["sandbox.windy-mountain", "Windy Mountain"], ["sandbox.water-test-tank", "Water Test Tank"],
        ["sandbox.moon-lab", "Moon Lab"], ["sandbox.crazy-lab", "Crazy Lab"], ["sandbox.everything-lab", "Everything Lab"]
    ].map(([id, title]) => ({ id: id, title: title, slot: "CHALLENGE", objective: "Build anything.", requiredForProgression: false })) };
/** Challenge Lab (M26): the 12 locked metric-scored challenges (scoring rules in src/challenge/Challenges.ts). */
export const CHALLENGE_LAB = { id: "challenge-lab", title: "Challenge Lab", concepts: "Measure it, beat your best", colour: "#ffd43b", icon: "🏆", missions: [
        ["challenge.fastest-vehicle", "Fastest Vehicle", "Reach the finish with the lowest elapsedTime."], ["challenge.tallest-tower", "Tallest Tower", "Maximise maximumHeight while surviving the test window."],
        ["challenge.longest-jump", "Longest Jump", "Maximise horizontal distance before first stable landing."], ["challenge.longest-glide", "Longest Glide", "Maximise distanceTravelled while remaining airborne/gliding."],
        ["challenge.heavy-hauler", "Heavy Hauler", "Maximise supportedLoad while reaching the delivery zone."], ["challenge.low-power-lift", "Low Power Lift", "Complete a lift with minimum energyUsed."],
        ["challenge.fewest-parts", "Fewest Parts", "Complete the target using minimum partCount."], ["challenge.budget-builder", "Budget Builder", "Complete the target using minimum buildCost."],
        ["challenge.egg-drop", "Egg Drop", "Keep survivalState true while minimising peakImpact."], ["challenge.chain-master", "Chain Master", "Maximise valid chainLength under anti-loop rules."],
        ["challenge.robot-efficiency", "Robot Efficiency", "Reach the robot goal with minimum programBlockCount, tie-break elapsedTime."], ["challenge.stable-platform", "Stable Platform", "Minimise stabilityVariance while supporting the specified load."]
    ].map(([id, title, objective]) => ({ id: id, title: title, slot: "CHALLENGE", objective: objective, requiredForProgression: false })) };
/** Job Board (M27): the 24 Inventor Contracts brought by campus visitors (visitors and rules in src/contracts/Contracts.ts). */
export const CONTRACT_BOARD = { id: "contract-board", title: "Job Board", concepts: "Jobs for campus visitors", colour: "#74c0fc", icon: "📋", missions: [
        ["contract.apple-elevator", "Apple Elevator"], ["contract.kitchen-conveyor", "Kitchen Conveyor"], ["contract.roof-beam-lift", "Roof Beam Lift"], ["contract.site-bridge", "Site Bridge"],
        ["contract.hilltop-apples", "Hilltop Apples"], ["contract.water-the-rows", "Water the Rows"], ["contract.rescue-line", "Rescue Line"], ["contract.pump-to-the-roof", "Pump to the Roof"],
        ["contract.loading-dock", "Loading Dock"], ["contract.fragile-parcel", "Fragile Parcel"], ["contract.rover-cargo", "Rover Cargo"], ["contract.panel-deployment", "Panel Deployment"],
        ["contract.safe-animal-gate", "Safe Animal Gate"], ["contract.snack-launcher", "Snack Launcher"], ["contract.treasure-lift", "Treasure Lift"], ["contract.bell-and-cannon", "Bell and Cannon"],
        ["contract.stage-lift", "Stage Lift"], ["contract.beat-machine", "Beat Machine"], ["contract.fountain-fix", "Fountain Fix"], ["contract.ride-starter", "Ride Starter"],
        ["contract.wheel-wobble", "Wheel Wobble"], ["contract.generator-test", "Generator Test"], ["contract.controlled-drop", "Controlled Drop"], ["contract.sensor-rig", "Sensor Rig"]
    ].map(([id, title]) => ({ id: id, title: title, slot: "CHALLENGE", objective: "A job for a campus visitor.", requiredForProgression: false })) };
/** Science Fairs (M28): the 5 locked fairs (rules and awards in src/fairs/ScienceFairs.ts). */
export const SCIENCE_FAIR = { id: "science-fair", title: "Science Fair", concepts: "Show what you've built", colour: "#f783ac", icon: "🎪", missions: [
        ["fair.motion-makers", "Fair 1 — Motion Makers"], ["fair.strong-and-powered", "Fair 2 — Strong & Powered"], ["fair.water-and-air-show", "Fair 3 — Water & Air Show"],
        ["fair.smart-machines", "Fair 4 — Smart Machines"], ["fair.anything-goes", "Fair 5 — Anything Goes"]
    ].map(([id, title]) => ({ id: id, title: title, slot: "CHALLENGE", objective: "A Science Fair.", requiredForProgression: false })) };
export const CREATIVE_MODES = [CHAIN_WORKSHOP, EXPERIMENT_LAB, FREE_BUILD_ROOMS, CHALLENGE_LAB, CONTRACT_BOARD, SCIENCE_FAIR];
