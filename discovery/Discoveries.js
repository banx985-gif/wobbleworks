import { collectMotionDiscoveries, MOTION_REAL_WORLD_CARDS } from "../motion/MotionYard.js";
import { collectGearDiscoveries, GEAR_REAL_WORLD_CARDS } from "../gears/GearGarage.js";
import { collectStructureDiscoveries, STRUCTURE_REAL_WORLD_CARDS } from "../structures/BuilderBay.js";
import { LAB_MODULES } from "../labs/Labs.js";
import { CHAIN_CONCEPT_EVIDENCE, collectChainDiscoveries } from "../chain/ChainWorkshop.js";
export const DISCOVERIES = [
    { id: "motion.gravity-down", kind: "CONCEPT", title: "Gravity pulls down", line: "Let go of something and it falls.", art: "motion.ball", truthContractId: "truth.motion.v1" },
    { id: "motion.slope-effect", kind: "CONCEPT", title: "Slopes change motion", line: "A ramp turns falling into rolling.", art: "motion.ramp", truthContractId: "truth.motion.v1" },
    { id: "motion.friction-grip", kind: "CONCEPT", title: "Grip slows sliding", line: "Rough surfaces rub and slow things down.", art: "motion.friction-high", truthContractId: "truth.motion.v1" },
    { id: "motion.bounce", kind: "CONCEPT", title: "Bouncy surfaces push back", line: "A bouncy pad sends things back up.", art: "motion.bounce-pad", truthContractId: "truth.motion.v1" },
    { id: "motion.mass-inertia", kind: "CONCEPT", title: "Same push, different mass", line: "The same push moves a light thing more than a heavy one.", art: "motion.cart", truthContractId: "truth.motion.v1" },
    { id: "motion.momentum", kind: "CONCEPT", title: "Moving things keep moving", line: "Things keep rolling until something slows them.", art: "motion.wheel", truthContractId: "truth.motion.v1" },
    { id: "motion.surface-comparison", kind: "CONCEPT", title: "Rough or smooth?", line: "Grippy and slippy surfaces change how far things go.", art: "motion.friction-low", truthContractId: "truth.motion.v1" },
    { id: "combo.spring-ramp", kind: "COMBINATION", title: "Launch + Slope", line: "A spring pushed it, then a ramp guided it.", art: "motion.spring", truthContractId: "truth.motion.v1" },
    { id: "combo.spring-bounce", kind: "COMBINATION", title: "Double Boing", line: "A spring launch, then a bounce: two pushes in a row.", art: "motion.bounce-pad", truthContractId: "truth.motion.v1" },
    { id: "combo.slope-grip", kind: "COMBINATION", title: "Speed up, slow down", line: "A ramp sped it up and grip slowed it down.", art: "motion.friction-high", truthContractId: "truth.motion.v1" },
    { id: "combo.wheel-cart", kind: "COMBINATION", title: "Wheels carry loads", line: "Wheels on a cart turn as it rolls along.", art: "motion.cart", truthContractId: "truth.motion.v1" },
    { id: "secret.duck-trampoline", kind: "SECRET", title: "Duck Trampoline", line: "A rubber duck can bounce too!", art: "motion.bounce-pad", truthContractId: "truth.motion.v1" },
    { id: "secret.bounce-hat-trick", kind: "SECRET", title: "Bounce Hat-Trick", line: "Three bounces in one test!", art: "motion.bounce-pad", truthContractId: "truth.motion.v1" },
    { id: "secret.spring-relay", kind: "SECRET", title: "Spring Relay", line: "Two different springs launched the same thing.", art: "motion.spring", truthContractId: "truth.motion.v1" },
    { id: "secret.bolt-boing", kind: "SECRET", title: "Bolt Goes Boing", line: "Bolt bounced! (He says he meant to.)", art: "motion.bounce-pad", truthContractId: "truth.motion.v1" },
    // Gear Garage (M12) — every one measured by the GearSystem (truth.gears.v1)
    { id: "gear.direction-flip", kind: "CONCEPT", title: "Touching gears swap direction", line: "When one gear turns clockwise, the gear it touches turns the other way.", art: "gear.medium", truthContractId: "truth.gears.v1" },
    { id: "gear.speed-up", kind: "CONCEPT", title: "Big turns small = fast", line: "A big gear turning a small gear makes the small one spin faster.", art: "gear.small", truthContractId: "truth.gears.v1" },
    { id: "gear.slow-strong", kind: "CONCEPT", title: "Slower can be stronger", line: "A small gear turning a big gear goes slower but pushes harder.", art: "gear.large", truthContractId: "truth.gears.v1" },
    { id: "gear.chain", kind: "CONCEPT", title: "Gear trains pass turning along", line: "Turning can travel through a whole line of gears.", art: "gear.medium", truthContractId: "truth.gears.v1" },
    { id: "gear.same-way", kind: "CONCEPT", title: "Two flips make the same way", line: "With a gear in the middle, the last gear turns the same way as the first.", art: "gear.small", truthContractId: "truth.gears.v1" },
    { id: "gear.belt-same-way", kind: "CONCEPT", title: "Belts keep the direction", line: "Pulleys joined by a belt turn the same way.", art: "gear.belt-pulley", truthContractId: "truth.gears.v1" },
    { id: "gear.power-limit", kind: "CONCEPT", title: "Motors can only push so hard", line: "If a load needs more turning force than the motor has, everything stops.", art: "gear.motor", truthContractId: "truth.gears.v1" },
    { id: "combo.gear-conveyor", kind: "COMBINATION", title: "Gears + conveyor", line: "Gears turned the old conveyor and it carried the cargo.", art: "motion.conveyor", truthContractId: "truth.gears.v1" },
    { id: "combo.gear-winch", kind: "COMBINATION", title: "Gears + rope = lift", line: "A gear-driven winch wound up a rope and lifted a load.", art: "gear.winch", truthContractId: "truth.gears.v1" },
    { id: "secret.gear-gridlock", kind: "SECRET", title: "Gear Gridlock", line: "Three gears in a ring can't turn at all — each one blocks the next!", art: "gear.medium", truthContractId: "truth.gears.v1" },
    { id: "secret.super-spin", kind: "SECRET", title: "Super Spin", line: "A gear spun five times faster than the crank!", art: "gear.small", truthContractId: "truth.gears.v1" },
    { id: "secret.sprocket-fling", kind: "SECRET", title: "Sprocket Spin-Out", line: "Too fast! Sprocket went flying (into a soft cushion).", art: "gear.carousel", truthContractId: "truth.gears.v1" },
    // Builder Bay (M13) — every one measured by the StructureSystem (truth.structures.v1)
    { id: "structure.bracing", kind: "CONCEPT", title: "Bracing makes it steady", line: "You added a brace and your structure stopped wobbling.", art: "builder.brace", truthContractId: "truth.structures.v1" },
    { id: "structure.triangle", kind: "CONCEPT", title: "Triangles hold their shape", line: "A triangle can't lean or squash unless a side breaks.", art: "builder.brace", truthContractId: "truth.structures.v1" },
    { id: "structure.tension-compression", kind: "CONCEPT", title: "Pulled and squashed", line: "Some parts get pulled (tension) while others get squashed (compression).", art: "builder.beam-wood", truthContractId: "truth.structures.v1" },
    { id: "structure.material", kind: "CONCEPT", title: "Materials matter", line: "Metal held a load that would have broken wood — but metal is heavier too.", art: "builder.beam-metal", truthContractId: "truth.structures.v1" },
    { id: "structure.span", kind: "CONCEPT", title: "Long beams bend more", line: "A heavy load in the middle of a long beam bent it until it snapped.", art: "builder.beam-wood", truthContractId: "truth.structures.v1" },
    { id: "structure.buckle", kind: "CONCEPT", title: "Long thin posts buckle", line: "Squash a long thin post and it bends out sideways.", art: "builder.column", truthContractId: "truth.structures.v1" },
    { id: "structure.load-path", kind: "CONCEPT", title: "Weight goes down to the ground", line: "Everything that crossed your bridge pressed down through it into the ground.", art: "builder.beam-metal", truthContractId: "truth.structures.v1" },
    { id: "structure.soft-landing", kind: "CONCEPT", title: "Soft catches are gentle", line: "A rope net stretched and caught the egg gently.", art: "builder.rope", truthContractId: "truth.structures.v1" },
    { id: "combo.crane", kind: "COMBINATION", title: "Gears + tower = crane", line: "Your tower held the winch while the gears lifted the load.", art: "gear.winch", truthContractId: "truth.structures.v1" },
    { id: "combo.ramp-bridge", kind: "COMBINATION", title: "Ramp + bridge", line: "Up a Motion ramp and across your bridge in one go.", art: "motion.ramp", truthContractId: "truth.structures.v1" },
    { id: "secret.mega-collapse", kind: "SECRET", title: "Spectacular Collapse", line: "Five parts broke in one test! (That's how engineers learn.)", art: "builder.beam-wood", truthContractId: "truth.structures.v1" },
    // Power Lab (M14) — every one measured by the CircuitSystem (truth.electricity.v1)
    { id: "power.complete-circuit", kind: "CONCEPT", title: "Circuits need a loop", line: "Electricity flows out of the battery, through the load, and back again.", art: "icon.lightning", truthContractId: "truth.electricity.v1" },
    { id: "power.switch-control", kind: "CONCEPT", title: "Switches open the loop", line: "A switch or button makes a gap in the loop — or closes it.", art: "power.button-lever", truthContractId: "truth.electricity.v1" },
    { id: "power.series", kind: "CONCEPT", title: "Sharing one loop", line: "Bulbs in one long loop share the battery's push, so each is dimmer.", art: "icon.lightning", truthContractId: "truth.electricity.v1" },
    { id: "power.parallel", kind: "CONCEPT", title: "A path each", line: "Give each bulb its own path and they're all bright — the battery works harder.", art: "icon.power-burst", truthContractId: "truth.electricity.v1" },
    { id: "power.motor", kind: "CONCEPT", title: "Electricity makes things turn", line: "An electric motor turns when current flows through it.", art: "icon.cat-power", truthContractId: "truth.electricity.v1" },
    { id: "power.more-batteries", kind: "CONCEPT", title: "Two batteries push harder", line: "Batteries end to end push more electricity round the loop.", art: "icon.battery", truthContractId: "truth.electricity.v1" },
    { id: "power.easy-path", kind: "CONCEPT", title: "Electricity takes the easy path", line: "A plain wire next to a bulb carries the current around it, so the bulb goes out.", art: "icon.lightning", truthContractId: "truth.electricity.v1" },
    { id: "power.battery-drain", kind: "CONCEPT", title: "Batteries run down", line: "Everything that's switched on uses up the battery's stored energy.", art: "icon.battery-charge", truthContractId: "truth.electricity.v1" },
    { id: "combo.power-gears", kind: "COMBINATION", title: "Motor + gears", line: "An electric motor turned your gears and they did the work.", art: "icon.cat-gears", truthContractId: "truth.electricity.v1" },
    { id: "combo.power-conveyor", kind: "COMBINATION", title: "Electric conveyor", line: "Electricity ran the old Motion Yard conveyor.", art: "icon.energy-orb", truthContractId: "truth.electricity.v1" },
    { id: "secret.power-overload", kind: "SECRET", title: "Overload!", line: "Too much at once — the power station switched itself off to stay safe.", art: "icon.power-burst", truthContractId: "truth.electricity.v1" },
    { id: "secret.power-light-show", kind: "SECRET", title: "Light Show", line: "Five bulbs glowing at once!", art: "icon.lightning", truthContractId: "truth.electricity.v1" },
    { id: "secret.power-duck-alarm", kind: "SECRET", title: "Quack Attack Alarm", line: "A duck set off your alarm. Security is tight.", art: "icon.button", truthContractId: "truth.electricity.v1" },
    // Magnet Factory (M15) — every one measured by the MagnetSystem (truth.magnetism.v1)
    { id: "magnet.unlike-attract", kind: "CONCEPT", title: "Opposites attract", line: "An N end and an S end pull together.", art: "icon.magnet-pull", truthContractId: "truth.magnetism.v1" },
    { id: "magnet.like-repel", kind: "CONCEPT", title: "Same ends push apart", line: "N and N push apart. So do S and S.", art: "icon.magnet-poles", truthContractId: "truth.magnetism.v1" },
    { id: "magnet.two-poles", kind: "CONCEPT", title: "Every magnet has two ends", line: "One magnet pulled with one end and pushed with the other.", art: "icon.magnet-poles", truthContractId: "truth.magnetism.v1" },
    { id: "magnet.materials", kind: "CONCEPT", title: "Magnets are picky", line: "Magnets pull iron and steel, but not wood or plastic.", art: "icon.magnet", truthContractId: "truth.magnetism.v1" },
    { id: "magnet.not-all-metal", kind: "CONCEPT", title: "Not every metal", line: "Aluminium and copper are metals, but magnets don't pull them.", art: "icon.magnet-coins", truthContractId: "truth.magnetism.v1" },
    { id: "magnet.electromagnet", kind: "CONCEPT", title: "Electricity makes a magnet", line: "An electromagnet is only a magnet while electricity flows.", art: "icon.magnet-zap", truthContractId: "truth.magnetism.v1" },
    { id: "magnet.no-contact", kind: "CONCEPT", title: "Pushing without touching", line: "Magnets moved something without anything touching it.", art: "icon.magnet-pull", truthContractId: "truth.magnetism.v1" },
    { id: "magnet.float", kind: "CONCEPT", title: "Floating on a push", line: "Same ends pushing apart held a ring magnet up on its rod.", art: "icon.magnet-poles", truthContractId: "truth.magnetism.v1" },
    { id: "combo.magnet-conveyor", kind: "COMBINATION", title: "Magnet + conveyor", line: "A magnet picked metal out of the conveyor's load.", art: "icon.magnet", truthContractId: "truth.magnetism.v1" },
    { id: "combo.magnet-circuit", kind: "COMBINATION", title: "Switchable magnet", line: "Electricity on: grab. Electricity off: drop.", art: "icon.magnet-zap", truthContractId: "truth.magnetism.v1" },
    { id: "secret.magnet-sandwich", kind: "SECRET", title: "Floating Sandwich", line: "Two magnets floating in a stack. Delicious. (Not edible.)", art: "icon.magnet-poles", truthContractId: "truth.magnetism.v1" },
    { id: "secret.magnet-rocket", kind: "SECRET", title: "Magnet Rocket", line: "WHOOSH! A magnet cart pushed faster than 5 m/s.", art: "icon.speed", truthContractId: "truth.magnetism.v1" },
    // Water Works (M16) — every one measured by the FluidSystem (truth.water.v1)
    { id: "water.path", kind: "CONCEPT", title: "Water follows the path", line: "Give water a path and it flows along it.", art: "icon.water-drop", truthContractId: "truth.water.v1" },
    { id: "water.downhill", kind: "CONCEPT", title: "Water runs downhill", line: "Water flowed down from a high tank to a lower one, all by itself.", art: "icon.water-drop-plain", truthContractId: "truth.water.v1" },
    { id: "water.climb", kind: "CONCEPT", title: "Water can't climb on its own", line: "Water won't go higher than where it starts.", art: "icon.wave", truthContractId: "truth.water.v1" },
    { id: "water.valve", kind: "CONCEPT", title: "Valves open and shut", line: "A valve lets water through, or stops it.", art: "water.valves", truthContractId: "truth.water.v1" },
    { id: "water.pump", kind: "CONCEPT", title: "Pumps push water up", line: "A pump adds a push so water can climb.", art: "water.tanks", truthContractId: "truth.water.v1" },
    { id: "water.narrow", kind: "CONCEPT", title: "Narrow pipes carry less", line: "A skinny pipe lets much less water through than a wide one.", art: "icon.water-drop", truthContractId: "truth.water.v1" },
    { id: "water.jet", kind: "CONCEPT", title: "Jets fly in arcs", line: "Water from a nozzle flies in a curve and lands on target.", art: "water.nozzle-launcher", truthContractId: "truth.water.v1" },
    { id: "water.overflow", kind: "CONCEPT", title: "Tanks fill up", line: "A tank holds only so much — then it overflows.", art: "water.tanks", truthContractId: "truth.water.v1" },
    { id: "water.wheel", kind: "CONCEPT", title: "Water can turn wheels", line: "Falling water pushed a water wheel round.", art: "icon.wave", truthContractId: "truth.water.v1" },
    { id: "combo.water-gears", kind: "COMBINATION", title: "Water + gears", line: "A water wheel's gears ran an old machine.", art: "icon.gear-yellow", truthContractId: "truth.water.v1" },
    { id: "combo.water-electric", kind: "COMBINATION", title: "Electric fountain", line: "An electric pump fed a jet that hit its target.", art: "icon.energy-flask", truthContractId: "truth.water.v1" },
    { id: "secret.water-duck-splash", kind: "SECRET", title: "Duck Water Park", line: "SPLASH! The duck rode the jets into the pool.", art: "duck.plain", truthContractId: "truth.water.v1" },
    { id: "secret.water-big-spill", kind: "SECRET", title: "Indoor Swimming Pool", line: "Ten litres on the floor! Bolt has fetched a mop.", art: "fx.splash", truthContractId: "truth.water.v1" },
    // Flight Hangar (M17) — every one measured by the FlightSystem (truth.flight.v1)
    { id: "flight.lift", kind: "CONCEPT", title: "Wings make lift", line: "Air rushing over a tilted wing pushes it up.", art: "icon.wings", truthContractId: "truth.flight.v1" },
    { id: "flight.stability", kind: "CONCEPT", title: "Tails keep it steady", line: "A tail at the back stops the nose bobbing about.", art: "icon.biplane", truthContractId: "truth.flight.v1" },
    { id: "flight.parachute", kind: "CONCEPT", title: "Parachutes catch air", line: "Lots of drag means a slow, soft landing.", art: "level.cargo-parachute", truthContractId: "truth.flight.v1" },
    { id: "flight.thrust-lift", kind: "CONCEPT", title: "Push and lift are different", line: "The propeller pushes forwards; the wings lift up.", art: "icon.drone", truthContractId: "truth.flight.v1" },
    { id: "flight.buoyancy", kind: "CONCEPT", title: "Balloons float up", line: "When the upward push beats the weight, up it goes.", art: "icon.balloon", truthContractId: "truth.flight.v1" },
    { id: "flight.wind", kind: "CONCEPT", title: "Moving air pushes", line: "A breeze pushed something along.", art: "icon.feather", truthContractId: "truth.flight.v1" },
    { id: "flight.stall", kind: "CONCEPT", title: "Too steep stalls", line: "Tilt a wing too much and it loses its lift.", art: "icon.wings", truthContractId: "truth.flight.v1" },
    { id: "combo.flight-spring", kind: "COMBINATION", title: "Spring launch", line: "An old Motion Yard spring flung a glider into the sky.", art: "motion.spring", truthContractId: "truth.flight.v1" },
    { id: "combo.flight-battery", kind: "COMBINATION", title: "Glide home", line: "The battery ran out and the wings glided it down.", art: "icon.battery", truthContractId: "truth.flight.v1" },
    { id: "secret.flight-loop", kind: "SECRET", title: "Loop-the-Loop", line: "Whoa — it flipped right over! (Tails help with that.)", art: "icon.rotate", truthContractId: "truth.flight.v1" },
    { id: "secret.flight-sprocket", kind: "SECRET", title: "Sky Puppy", line: "Sprocket floated through a hoop. Best day ever.", art: "icon.balloon-rainbow", truthContractId: "truth.flight.v1" },
    // Robot Lab (M18) — every one measured by the RobotSystem (truth.robotics.v1)
    { id: "robot.sequence", kind: "CONCEPT", title: "Programs run in order", line: "A robot does its blocks one after another, exactly as written.", art: "icon.robot", truthContractId: "truth.robotics.v1" },
    { id: "robot.sensor", kind: "CONCEPT", title: "Sensors tell the program things", line: "A sensor checked the world while the program ran.", art: "icon.robot-idea", truthContractId: "truth.robotics.v1" },
    { id: "robot.condition", kind: "CONCEPT", title: "IF / ELSE chooses", line: "An IF block did one thing when the sensor said yes, another when it said no.", art: "icon.chip", truthContractId: "truth.robotics.v1" },
    { id: "robot.loop", kind: "CONCEPT", title: "Loops repeat", line: "A loop ran the same blocks again and again.", art: "icon.rotate", truthContractId: "truth.robotics.v1" },
    { id: "robot.timing", kind: "CONCEPT", title: "Good timing", line: "Waiting for the right moment got the robot safely past.", art: "icon.speed", truthContractId: "truth.robotics.v1" },
    { id: "robot.actuator", kind: "CONCEPT", title: "Robots act with actuators", line: "A gripper or a pusher let the robot change the world.", art: "icon.robot-claw", truthContractId: "truth.robotics.v1" },
    { id: "robot.literal", kind: "CONCEPT", title: "Robots do exactly what you say", line: "BONK. The program said go, so it went — wall or no wall.", art: "icon.robot-tracks", truthContractId: "truth.robotics.v1" },
    { id: "combo.robot-conveyor", kind: "COMBINATION", title: "Robot + conveyor", line: "A robot switched on the old conveyor.", art: "robot.rails", truthContractId: "truth.robotics.v1" },
    { id: "combo.robot-factory", kind: "COMBINATION", title: "Production line", line: "Robots and machines packed a box together.", art: "robot.arm", truthContractId: "truth.robotics.v1" },
    { id: "secret.robot-dance", kind: "SECRET", title: "Robot Disco", line: "Six beats! The robots can really move.", art: "level.dance-pads", truthContractId: "truth.robotics.v1" },
    { id: "secret.robot-dizzy", kind: "SECRET", title: "Dizzy Robot", line: "Eight turns in one program. The robot needs a sit down.", art: "icon.rotate", truthContractId: "truth.robotics.v1" },
    // Space Centre (M19) — every one measured by the SpaceSystem (truth.space.v1)
    { id: "space.rover", kind: "CONCEPT", title: "Rovers", line: "Wheels front and back, a motor and power: it drove itself.", art: "icon.rocket-2", truthContractId: "truth.space.v1" },
    { id: "space.grip", kind: "CONCEPT", title: "Grip", line: "Grippy wheels pushed up a slope that smooth wheels just spun on.", art: "icon.speed", truthContractId: "truth.space.v1" },
    { id: "space.low-gravity", kind: "CONCEPT", title: "Low gravity", line: "Where gravity is weaker, things fall more slowly.", art: "sandbox.moon", truthContractId: "truth.space.v1" },
    { id: "space.mass-same", kind: "CONCEPT", title: "Weight changes, mass doesn't", line: "The same thing weighed less on the Moon — but its mass stayed exactly the same.", art: "icon.planet", truthContractId: "truth.space.v1" },
    { id: "space.thrust", kind: "CONCEPT", title: "Thrust beats weight", line: "The booster pushed up harder than the rocket's weight, so it lifted off.", art: "icon.launch", truthContractId: "truth.space.v1" },
    { id: "space.fins", kind: "CONCEPT", title: "Fins keep it straight", line: "Fins at the back kept the rocket pointing the right way in the gust.", art: "icon.rocket", truthContractId: "truth.space.v1" },
    { id: "space.trajectory", kind: "CONCEPT", title: "Trajectories", line: "Lean the launch and the rocket curves over and comes down far away.", art: "icon.rocket-3", truthContractId: "truth.space.v1" },
    { id: "space.no-air", kind: "CONCEPT", title: "No air, no parachute", line: "A parachute needs air to push on — and the Moon hasn't got any.", art: "sandbox.moon", truthContractId: "truth.space.v1" },
    { id: "space.landing", kind: "CONCEPT", title: "Soft landing", line: "Springy legs squashed and soaked up the speed.", art: "icon.rocket-2", truthContractId: "truth.space.v1" },
    { id: "space.solar", kind: "CONCEPT", title: "Solar power", line: "A panel facing the sun made electricity.", art: "card.tab.sun", truthContractId: "truth.space.v1" },
    { id: "space.planet-pull", kind: "CONCEPT", title: "A planet's pull", line: "The planet's pull bent the path into a curve.", art: "icon.planet", truthContractId: "truth.space.v1" },
    { id: "space.robot-arm", kind: "CONCEPT", title: "Space robots", line: "A programmed robot arm fitted the module.", art: "robot.arm", truthContractId: "truth.space.v1" },
    { id: "combo.space-stages", kind: "COMBINATION", title: "Stage by stage", line: "One stage finished and started the next one.", art: "icon.launch", truthContractId: "truth.space.v1" },
    { id: "combo.space-robot-power", kind: "COMBINATION", title: "Robot repair", line: "The robot's repair closed the circuit and the power came back.", art: "robot.arm", truthContractId: "truth.space.v1" },
    { id: "secret.space-duck", kind: "SECRET", title: "Orbiting Duck", line: "Three quarters of the way round a planet. Quack in space!", art: "sandbox.space-helmet", truthContractId: "truth.space.v1" },
    { id: "secret.space-sky-high", kind: "SECRET", title: "Sky High", line: "Over 12 metres up — right out of the room!", art: "icon.rocket-3", truthContractId: "truth.space.v1" },
    // Chain Reaction Workshop (M21) — every one measured by the chain counter (truth.chain.v1)
    { id: "chain.cause-effect", kind: "CONCEPT", title: "Cause and effect", line: "One push, and each step really set off the next.", art: "level.marble-run", truthContractId: "truth.chain.v1" },
    { id: "chain.energy-transfer", kind: "CONCEPT", title: "Passing energy on", line: "Rolling turned into electricity, electricity into turning…", art: "icon.power-burst", truthContractId: "truth.chain.v1" },
    { id: "chain.many-systems", kind: "COMBINATION", title: "Many machines, one chain", line: "Three different kinds of machine worked together.", art: "level.factory-line", truthContractId: "truth.chain.v1" },
    { id: "chain.long-chain", kind: "CONCEPT", title: "Long chain", line: "Fifteen real steps from one push!", art: "level.marble-run", truthContractId: "truth.chain.v1" },
    { id: "secret.chain-duck", kind: "SECRET", title: "Grand Finale Duck", line: "The duck flew through the confetti. Take a bow!", art: "level.duck-bath", truthContractId: "truth.chain.v1" },
    { id: "secret.chain-marathon", kind: "SECRET", title: "Chain Marathon", line: "Twenty seconds of one chain reaction. Phew!", art: "icon.speed", truthContractId: "truth.chain.v1" },
    // Experiment Lab (M22) — earned from measured trials (truth.experiment.v1)
    { id: "experiment.fair-test", kind: "CONCEPT", title: "A fair test", line: "Change only ONE thing, and you know what made the difference.", art: "ui.icon.checklist", truthContractId: "truth.experiment.v1" },
    { id: "experiment.prediction", kind: "CONCEPT", title: "Predict, then test", line: "You guessed first — and the test showed you were right!", art: "ui.icon.star-big", truthContractId: "truth.experiment.v1" },
    { id: "experiment.change-one", kind: "CONCEPT", title: "Change one thing", line: "One change, then test again: that's how scientists find out.", art: "ui.icon.redo", truthContractId: "truth.experiment.v1" },
    { id: "experiment.control", kind: "CONCEPT", title: "Same in, same out", line: "Set up A and B the same and they come out the same. A good check!", art: "ui.icon.link", truthContractId: "truth.experiment.v1" },
    { id: "secret.sky-tower", kind: "SECRET", title: "Sky Scraper", line: "A tower so tall it nearly touched the ceiling — and it stood firm!", art: "builder.beam-metal", truthContractId: "truth.structures.v1" }
];
export function discoveryById(id) { return DISCOVERIES.find(d => d.id === id); }
export function realWorldCard(id) { return [...MOTION_REAL_WORLD_CARDS, ...GEAR_REAL_WORLD_CARDS, ...STRUCTURE_REAL_WORLD_CARDS, ...LAB_MODULES.flatMap(m => m.realWorldCards)].find(c => c.discoveryId === id); }
// ------------------------------------------------------------------ evidence helpers (read-only)
/** Separate touches: events on the same object more than `gap` ticks apart count as new episodes. */
export function episodes(events, gap = 12) {
    let count = 0, last = -Infinity;
    for (const e of [...events].sort((a, b) => a.tick - b.tick)) {
        if (e.tick - last > gap)
            count += 1;
        last = e.tick;
    }
    return count;
}
function other(event, partId) { return event.sourceId === partId ? event.targetId : event.targetId === partId ? event.sourceId : undefined; }
function involves(event, partId) { return event.sourceId === partId || event.targetId === partId; }
function defOf(build, id) { var _a; return id ? (_a = build.getPart(id)) === null || _a === void 0 ? void 0 : _a.definitionId : undefined; }
function name(part) { var _a; return ((_a = part === null || part === void 0 ? void 0 : part.definitionId) !== null && _a !== void 0 ? _a : "thing").replace(/^[a-z]+\./, "").replaceAll("-", " "); }
function seconds(tick) { return (tick / 60).toFixed(1); }
/** Events of a kind that touch a moving part, grouped by that moving part. Contacts list [a, b]; spring launches list [spring, target]. */
function byMover(build, runtime, kind, surfaceDef) {
    var _a;
    const out = new Map();
    for (const e of runtime.causalEvents) {
        if (e.kind !== kind)
            continue;
        for (const [mover, surface] of [[e.sourceId, e.targetId], [e.targetId, e.sourceId]]) {
            if (!mover || !surface)
                continue;
            const sd = defOf(build, surface);
            if (surfaceDef && sd !== surfaceDef)
                continue;
            if (kind === "SPRING_LAUNCH" && mover !== e.targetId)
                continue;
            if (!isMover(runtime, mover))
                continue;
            const list = (_a = out.get(mover)) !== null && _a !== void 0 ? _a : [];
            list.push(e);
            out.set(mover, list);
        }
    }
    return out;
}
function isMover(runtime, id) {
    try {
        runtime.physics.state(id);
        return runtime.physics.mass(id) > 0 && Number.isFinite(runtime.physics.mass(id));
    }
    catch {
        return false;
    }
}
/** Combination and secret discoveries, each tied to one object that really experienced both effects. */
export function collectSpecialDiscoveries(build, runtime) {
    var _a, _b, _c, _d;
    const awards = [];
    const springs = byMover(build, runtime, "SPRING_LAUNCH");
    const ramps = byMover(build, runtime, "RAMP_CONTACT");
    const bounces = byMover(build, runtime, "BOUNCE_PAD_CONTACT", "motion.bounce-pad");
    const grips = byMover(build, runtime, "FRICTION_SLOWED", "motion.friction-high");
    const first = (list) => (list === null || list === void 0 ? void 0 : list.length) ? Math.min(...list.map(e => e.tick)) : undefined;
    const last = (list) => (list === null || list === void 0 ? void 0 : list.length) ? Math.max(...list.map(e => e.tick)) : undefined;
    for (const [mover, launches] of springs) {
        const thing = name(build.getPart(mover));
        const rampAfter = ((_a = ramps.get(mover)) !== null && _a !== void 0 ? _a : []).filter(e => { var _a; return e.tick > ((_a = first(launches)) !== null && _a !== void 0 ? _a : Infinity); });
        if (rampAfter.length)
            awards.push({ id: "combo.spring-ramp", evidence: `The ${thing} was launched by a spring at ${seconds(first(launches))}s, then rolled on a ramp at ${seconds(first(rampAfter))}s.` });
        const bounceAfter = ((_b = bounces.get(mover)) !== null && _b !== void 0 ? _b : []).filter(e => { var _a; return e.tick > ((_a = first(launches)) !== null && _a !== void 0 ? _a : Infinity); });
        if (bounceAfter.length)
            awards.push({ id: "combo.spring-bounce", evidence: `The ${thing} was launched by a spring, then bounced on a bounce pad at ${seconds(first(bounceAfter))}s.` });
        const springIds = new Set(launches.map(e => e.sourceId));
        if (springIds.size >= 2)
            awards.push({ id: "secret.spring-relay", evidence: `${springIds.size} different springs launched the same ${thing}.` });
    }
    for (const [mover, slowed] of grips) {
        const r = ramps.get(mover);
        if (!(r === null || r === void 0 ? void 0 : r.length))
            continue;
        // Order matters for the claim: the slope first (speeding up), then the grip (slowing down).
        if (((_c = first(r)) !== null && _c !== void 0 ? _c : Infinity) < ((_d = last(slowed)) !== null && _d !== void 0 ? _d : -Infinity) && slowed.length >= 3)
            awards.push({ id: "combo.slope-grip", evidence: `The ${name(build.getPart(mover))} rolled down a ramp, then a grip pad slowed it for ${slowed.length} ticks.` });
    }
    for (const [mover, list] of bounces) {
        const def = defOf(build, mover);
        const count = episodes(list, 20);
        if (def === "silly.duck")
            awards.push({ id: "secret.duck-trampoline", evidence: `The duck bounced on a bounce pad at ${seconds(first(list))}s.` });
        if (def === "silly.bolt")
            awards.push({ id: "secret.bolt-boing", evidence: `Bolt bounced on a bounce pad at ${seconds(first(list))}s.` });
        if (count >= 3)
            awards.push({ id: "secret.bounce-hat-trick", evidence: `The ${name(build.getPart(mover))} bounced ${count} separate times.` });
    }
    // Wheel + cart: a wheel hinged to a cart, the cart travelled, and the wheel really turned.
    for (const c of build.allConnections()) {
        if (c.config.kind !== "HINGE")
            continue;
        const pair = [build.getPart(c.fromPartId), build.getPart(c.toPartId)];
        const cart = pair.find(p => (p === null || p === void 0 ? void 0 : p.definitionId) === "motion.cart"), wheel = pair.find(p => (p === null || p === void 0 ? void 0 : p.definitionId) === "motion.wheel");
        if (!cart || !wheel)
            continue;
        try {
            const cs = runtime.physics.state(cart.id), ws = runtime.physics.state(wheel.id);
            const travelled = Math.hypot(cs.x - cart.position.x, cs.y - cart.position.y), turned = Math.abs(ws.angle - wheel.rotation);
            if (travelled > 1 && turned > Math.PI) {
                awards.push({ id: "combo.wheel-cart", evidence: `The cart travelled ${travelled.toFixed(1)} m while its wheel turned ${(turned / (2 * Math.PI)).toFixed(1)} times.` });
                break;
            }
        }
        catch { /* not simulated */ }
    }
    const seen = new Set();
    return awards.filter(a => !seen.has(a.id) && (seen.add(a.id), true));
}
const CONCEPT_EVIDENCE = {
    "motion.gravity-down": "Something fell downward during the test.",
    "motion.slope-effect": "Something touched a ramp and its motion changed.",
    "motion.friction-grip": "A rough surface rubbed against something and slowed it.",
    "motion.bounce": "Something hit a bouncy pad and changed direction.",
    "motion.mass-inertia": "The same push was applied to different masses.",
    "motion.momentum": "Something kept moving across the yard after being set going.",
    "motion.surface-comparison": "Both a grip pad and a slide pad were touched in one test.",
    "gear.direction-flip": "Two meshed gears turned opposite ways for half a second or more.",
    "gear.speed-up": "A driven gear turned at least 1.5 times faster than the driver.",
    "gear.slow-strong": "A driven gear turned slower than the driver, with more turning force.",
    "gear.chain": "Three or more axles turned together in one gear train.",
    "gear.same-way": "A gear two steps along the train turned the same way as the driver.",
    "gear.belt-same-way": "Two belted pulleys turned the same way.",
    "gear.power-limit": "The load needed more turning force than the driver could give, so the train stopped.",
    "combo.gear-conveyor": "A gear-driven conveyor carried cargo more than 1 m.",
    "combo.gear-winch": "A gear-driven winch lifted a load.",
    "secret.gear-gridlock": "Gears meshed in a ring jammed.",
    "secret.super-spin": "A gear turned five times faster than its driver.",
    "secret.sprocket-fling": "The carousel spun faster than Sprocket could hold on.",
    "structure.bracing": "After a brace was added, the measured wobble dropped by half or more compared with the last test.",
    "structure.triangle": "A closed triangle carried load and stayed steady for a second or more.",
    "structure.tension-compression": "One member was pulled and another squashed, both carrying real load.",
    "structure.material": "A metal member carried a force bigger than the same wooden one could take.",
    "structure.span": "A beam broke from bending under a load part-way along it.",
    "structure.buckle": "A long member failed by buckling when squashed.",
    "structure.load-path": "Something crossed a built structure and its weight was carried to the supports.",
    "structure.soft-landing": "The egg landed in a rope net.",
    "combo.crane": "A structure held a winch while gears lifted a load.",
    "combo.ramp-bridge": "A traveller climbed a ramp and crossed a built structure.",
    "secret.mega-collapse": "Five or more members broke in one test.",
    "secret.sky-tower": "A steady structure reached above 2 m from the top of the playfield."
};
/** Every discovery this TEST run has real evidence for (concept + combination + secret). */
export function evaluateRunDiscoveries(build, runtime, previous) {
    var _a, _b;
    const concepts = [...collectMotionDiscoveries(undefined, build, runtime), ...collectGearDiscoveries(build, runtime), ...collectStructureDiscoveries(build, runtime, previous)].map(id => { var _a; return ({ id, evidence: (_a = CONCEPT_EVIDENCE[id]) !== null && _a !== void 0 ? _a : "Seen in a test." }); });
    for (const m of LAB_MODULES)
        for (const id of m.collectDiscoveries(build, runtime))
            concepts.push({ id, evidence: (_a = m.conceptEvidence[id]) !== null && _a !== void 0 ? _a : "Seen in a test." });
    for (const id of collectChainDiscoveries(build, runtime))
        concepts.push({ id, evidence: (_b = CHAIN_CONCEPT_EVIDENCE[id]) !== null && _b !== void 0 ? _b : "Seen in a test." });
    return [...concepts, ...collectSpecialDiscoveries(build, runtime)].filter(a => discoveryById(a.id));
}
export function eventsFor(runtime, partId, kind) {
    return runtime.causalEvents.filter(e => involves(e, partId) && (!kind || e.kind === kind));
}
export { other as otherParty };
