import { activeProfile, updateProfile } from "../app/AppState.js";
import { clearedLabIds, ownsFullGame } from "../progression/Campus.js";
import { CONTRACT_BOARD } from "../progression/CampaignData.js";
import { restorationStage, stageIndex } from "../progression/Restoration.js";
export const VISITORS = [
    { id: "visitor.chef", archetype: "Chef", name: "Chef Pepper", icon: "🧑‍🍳", arrivesAt: "GEARS_TURNING", ask: "My kitchen is up on the top floor and my arms are tired! Could you build me some machines?", thanks: "Lunch is served — and you're invited!", sticker: "sticker.visitor-chef" },
    { id: "visitor.builder", archetype: "Builder", name: "Builder Brick", icon: "👷", arrivesAt: "STRUCTURES_SOUND", ask: "We're fixing the old roof and need a bridge to the site. Want to join the crew?", thanks: "Strong work! That'll stand for a hundred years.", sticker: "sticker.visitor-builder" },
    { id: "visitor.farmer", archetype: "Farmer", name: "Farmer Fern", icon: "🧑‍🌾", arrivesAt: "MOTION_RESTORED", ask: "My apples grow down here but the cart is up the hill — and the garden is thirsty!", thanks: "The best harvest in years. Have an apple!", sticker: "sticker.visitor-farmer" },
    { id: "visitor.firefighter", archetype: "Firefighter", name: "Captain Blaze", icon: "🧑‍🚒", arrivesAt: "MOTION_RESTORED", ask: "Training day! I need a rescue launcher and a pump that reaches the roof.", thanks: "Rescue ready! You'd make a great firefighter.", sticker: "sticker.visitor-firefighter" },
    { id: "visitor.delivery", archetype: "Delivery Driver", name: "Dash the Driver", icon: "🚚", arrivesAt: "MAGNETS_HUMMING", ask: "Parcels to load and one very wobbly egg to deliver. Can you help?", thanks: "Delivered on time and not a crack in sight!", sticker: "sticker.visitor-delivery" },
    { id: "visitor.astronaut", archetype: "Astronaut", name: "Astro Nova", icon: "🧑‍🚀", arrivesAt: "SPACE_READY", ask: "The Moon base needs supplies and power. Ready for a space mission?", thanks: "Mission accomplished, crew!", sticker: "sticker.visitor-astronaut" },
    { id: "visitor.zookeeper", archetype: "Zookeeper", name: "Keeper Kiwi", icon: "🦒", arrivesAt: "POWER_ON", ask: "I need a gate alarm for the giraffes and a snack delivery that nobody touches!", thanks: "The animals say thank you. Well — the duck does.", sticker: "sticker.visitor-zookeeper" },
    { id: "visitor.pirate", archetype: "Pirate", name: "Captain Barnacle", icon: "🏴‍☠️", arrivesAt: "MOTION_RESTORED", ask: "Arr! Me treasure needs lifting and me ship needs a proper celebration!", thanks: "Shiver me gears, that was brilliant!", sticker: "sticker.visitor-pirate" },
    { id: "visitor.musician", archetype: "Musician", name: "Maestro Tempo", icon: "🎻", arrivesAt: "MOTION_RESTORED", ask: "The big concert is tonight! I need a stage lift and a machine that plays the bells.", thanks: "Bravo! Encore! Encore!", sticker: "sticker.visitor-musician" },
    { id: "visitor.park", archetype: "Park Manager", name: "Ranger Rosa", icon: "🎡", arrivesAt: "GEARS_TURNING", ask: "The park opens tomorrow — the ride won't start and the fountain is dry!", thanks: "The park is open! Listen to everyone cheering!", sticker: "sticker.visitor-park" },
    { id: "visitor.mechanic", archetype: "Mechanic", name: "Wrench Wilma", icon: "🔧", arrivesAt: "POWER_ON", ask: "I've got a wobbly test vehicle and a generator to check. Fancy some repairs?", thanks: "Fixed and tested. You've got a mechanic's touch!", sticker: "sticker.visitor-mechanic" },
    { id: "visitor.scientist", archetype: "Scientist", name: "Professor Quark", icon: "🔬", arrivesAt: "ROBOTS_ACTIVE", ask: "I need a fair test and a machine that reacts to what it senses. Science!", thanks: "Excellent results! Let's write them up.", sticker: "sticker.visitor-scientist" }
];
export const CONTRACTS = [
    { id: "contract.apple-elevator", number: 1, visitorId: "visitor.chef", title: "Apple Elevator", goal: "Lift the box of six apples up to the kitchen with a winch you can use again and again.", baseLevelId: "gear.slow-and-strong", labId: "gear-garage" },
    { id: "contract.kitchen-conveyor", number: 2, visitorId: "visitor.chef", title: "Kitchen Conveyor", goal: "Power the conveyor so it carries the tray of five plates to the serving hatch without dropping it.", baseLevelId: "power.motor-power", labId: "power-lab" },
    { id: "contract.roof-beam-lift", number: 3, visitorId: "visitor.builder", title: "Roof Beam Lift", goal: "Build a crane that lifts the bundle of roof beams up to the roof.", baseLevelId: "builder.build-a-crane", labId: "builder-bay" },
    { id: "contract.site-bridge", number: 4, visitorId: "visitor.builder", title: "Site Bridge", goal: "Build a bridge that carries the whole crew across — two robots, a heavy cart and Bolt.", baseLevelId: "builder.the-robot-parade-bridge", labId: "builder-bay" },
    { id: "contract.hilltop-apples", number: 5, visitorId: "visitor.farmer", title: "Hilltop Apples", goal: "Get the apple crate up onto the high cart — with a machine, not by carrying it.", baseLevelId: "motion.spring-delivery", labId: "motion-yard" },
    { id: "contract.water-the-rows", number: 6, visitorId: "visitor.farmer", title: "Water the Rows", goal: "Get water onto all three rows of the vegetable garden.", baseLevelId: "water.water-the-garden", labId: "water-works" },
    { id: "contract.rescue-line", number: 7, visitorId: "visitor.firefighter", title: "Rescue Line", goal: "Launch the rescue float (our trusty duck!) into the marked rescue pool.", baseLevelId: "motion.duck-cannon", labId: "motion-yard" },
    { id: "contract.pump-to-the-roof", number: 8, visitorId: "visitor.firefighter", title: "Pump to the Roof", goal: "Pump water up into the tank on the roof.", baseLevelId: "water.pump-it-up", labId: "water-works" },
    { id: "contract.loading-dock", number: 9, visitorId: "visitor.delivery", title: "Loading Dock", goal: "Use the crane magnet to load all three metal crates onto the dock — the wooden one stays behind.", baseLevelId: "magnet.electromagnet-crane", labId: "magnet-factory" },
    { id: "contract.fragile-parcel", number: 10, visitorId: "visitor.delivery", title: "Fragile Parcel", goal: "Drop the fragile parcel so it lands gently on the delivery pad.", baseLevelId: "flight.safe-landing", labId: "flight-hangar" },
    { id: "contract.rover-cargo", number: 11, visitorId: "visitor.astronaut", title: "Rover Cargo", goal: "Get the rover to carry its cargo to the Moon base, in Moon gravity.", baseLevelId: "space.moon-base-delivery", labId: "space-centre" },
    { id: "contract.panel-deployment", number: 12, visitorId: "visitor.astronaut", title: "Panel Deployment", goal: "Turn the satellite's solar panel so it powers the radio.", baseLevelId: "space.satellite-power", labId: "space-centre" },
    { id: "contract.safe-animal-gate", number: 13, visitorId: "visitor.zookeeper", title: "Safe Animal Gate", goal: "Wire the gate pad so the warning light and buzzer come on when an animal steps on it — and go off when it steps away.", baseLevelId: "power.buzz-the-duck", labId: "power-lab" },
    { id: "contract.snack-launcher", number: 14, visitorId: "visitor.zookeeper", title: "Snack Launcher", goal: "Send the snack cart into the enclosure without anything touching it — magnets only!", baseLevelId: "magnet.no-touching", labId: "magnet-factory" },
    { id: "contract.treasure-lift", number: 15, visitorId: "visitor.pirate", title: "Treasure Lift", goal: "Lift the heavy treasure chest up to the ship's deck.", baseLevelId: "power.power-the-lift", labId: "power-lab" },
    { id: "contract.bell-and-cannon", number: 16, visitorId: "visitor.pirate", title: "Bell and Cannon", goal: "Build a chain reaction that ends with the duck cannon firing — a proper pirate celebration!", baseLevelId: "chain.duck-finale", labId: "motion-yard" },
    { id: "contract.stage-lift", number: 17, visitorId: "visitor.musician", title: "Stage Lift", goal: "Build a lift that raises the star of the show (Bolt!) up onto the stage.", baseLevelId: "gear.lift-bolt", labId: "gear-garage" },
    { id: "contract.beat-machine", number: 18, visitorId: "visitor.musician", title: "Beat Machine", goal: "One push should ring all five bells, one after another.", baseLevelId: "chain.bell-ringer", labId: "motion-yard" },
    { id: "contract.fountain-fix", number: 19, visitorId: "visitor.park", title: "Fountain Fix", goal: "Get water flowing through the fountain's nozzles into the basin — and its display turning.", baseLevelId: "water.the-grand-fountain", labId: "water-works" },
    { id: "contract.ride-starter", number: 20, visitorId: "visitor.park", title: "Ride Starter", goal: "Get the carousel turning at a safe, steady speed for the whole test.", baseLevelId: "gear.spin-sprocket", labId: "gear-garage" },
    { id: "contract.wheel-wobble", number: 21, visitorId: "visitor.mechanic", title: "Wheel Wobble", goal: "The test rover has one missing connection — find what's wrong and fix it so it drives to the flag.", baseLevelId: "contract.wheel-wobble", labId: "space-centre" },
    { id: "contract.generator-test", number: 22, visitorId: "visitor.mechanic", title: "Generator Test", goal: "Turn the generator with the crank — fast enough to make the test lamp shine brightly.", baseLevelId: "contract.generator-test", labId: "power-lab" },
    { id: "contract.controlled-drop", number: 23, visitorId: "visitor.scientist", title: "Controlled Drop", goal: "Drop the same thing on Earth and on the Moon — change only the gravity — and see which falls faster.", baseLevelId: "space.earth-gravity-vs-moon-gravity", labId: "space-centre" },
    { id: "contract.sensor-rig", number: 24, visitorId: "visitor.scientist", title: "Sensor Rig", goal: "Program the robot to sense the colour and deliver the box to the right bay.", baseLevelId: "robot.follow-the-colour", labId: "robot-lab" }
];
export function contractById(id) { return CONTRACTS.find(c => c.id === id); }
export function visitorById(id) { return VISITORS.find(v => v.id === id); }
export function contractsOf(visitorId) { return CONTRACTS.filter(c => c.visitorId === visitorId); }
export const CONTRACT_MISSIONS = CONTRACT_BOARD.missions;
/** Contract visitors come with the full game. */
export function contractsAvailable(save) { return Boolean(activeProfile(save)) && ownsFullGame(save.entitlement); }
/** A job is open once you've met its visitor and its lab is restored. */
export function contractOpen(save, id) {
    const c = contractById(id);
    const p = activeProfile(save);
    if (!c || !p || !contractsAvailable(save))
        return false;
    return p.visitorsMet.includes(c.visitorId) && clearedLabIds(save).includes(c.labId);
}
/** The Job Board appears once you've met any contract visitor. */
export function jobBoardOpen(save) { const p = activeProfile(save); return contractsAvailable(save) && Boolean(p === null || p === void 0 ? void 0 : p.visitorsMet.some(id => VISITORS.some(v => v.id === id))); }
export function contractDone(save, id) { var _a, _b; return ((_b = (_a = activeProfile(save)) === null || _a === void 0 ? void 0 : _a.levels[id]) === null || _b === void 0 ? void 0 : _b.completed) === true; }
/** Jobs waiting on the board (met, open, not finished yet). */
export function openJobs(save) { return CONTRACTS.filter(c => contractOpen(save, c.id) && !contractDone(save, c.id)); }
// ------------------------------------------------------------------ arrivals and acceptance
/** Contract visitors waiting at the Workshop door (in arrival order). */
export function dueContractVisitors(save) {
    const p = activeProfile(save);
    if (!p || !contractsAvailable(save))
        return [];
    const reached = stageIndex(restorationStage(save));
    const met = new Set(p.visitorsMet);
    return VISITORS.filter(v => stageIndex(v.arrivesAt) <= reached && !met.has(v.id)).sort((a, b) => stageIndex(a.arrivesAt) - stageIndex(b.arrivesAt));
}
/** Saying yes at the door: the visitor is met and their jobs go up on the Job Board. */
export function acceptVisitor(save, visitorId) {
    const p = activeProfile(save);
    if (!p || !visitorById(visitorId) || p.visitorsMet.includes(visitorId))
        return save;
    return updateProfile(save, p.id, q => ({ ...q, visitorsMet: [...q.visitorsMet, visitorId] }));
}
