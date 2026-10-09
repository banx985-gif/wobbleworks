import { AppShellController } from "./app/AppShellController.js";
import { activeProfile, completedLevelIds, createDefaultAppSave, currentAssistance, currentLastBuild, currentOpening, currentSettings, mostRecentProfile, titleVisibility, validateAppSave, withActiveProfile, withAssistance, withBuild, withCreatedProfile, withDeletedProfile, withEntitlement, withFirstTest, withLocation, withOpeningMetrics, withOpeningProgress, withEditedProfile, withSettings, DEFAULT_SETTINGS, DEFAULT_ASSISTANCE, withoutActiveProfile, MAX_PROFILES, PAINTED_AVATARS } from "./app/AppState.js";
import { ParentGate } from "./app/ParentGate.js";
import { boltArt, boltPoseUrl, renderCampusMap, renderHub, renderLocker, renderProfileSelect, renderShelf, renderTrophies, sprocketArt } from "./hub/HubScreens.js";
import { renderInventions, showInventionDetail, showInventionList } from "./hub/InventionScreens.js";
import { contentChecksum, contentOf, deleteInvention, duplicateInvention, inventionById, latestVersion, liveThumbKeys, renameInvention, resolveVersion, restoreAsNewVersion, saveNewInvention, saveVersion, shelfItemFor, showOnShelf, suggestedName, takeOffShelf, thumbKey, tidySuggestion, tidyVersions } from "./inventions/Inventions.js";
import { RunMeter } from "./inventions/RunMeter.js";
import { CO_PATTERNS, CoBuildSession, TogetherLaunch, partnerChoices, sessionOwner, togetherName } from "./coop/CoBuild.js";
import { followPoint, followTargets, ReplayPlayer, ReplayRecorder } from "./replay/ReplaySystem.js";
import { drawPhotoBackground, PhotoMode, photoStickers, thumbnailFrom } from "./photo/PhotoMode.js";
import { renderParentDashboard, renderParentGate } from "./parent/ParentArea.js";
import { OWNERSHIP_CHILD_COPY, regionById, routeToRegion } from "./progression/Campus.js";
import { addToShelf, equipCosmetic, markRestorationSeen, markRewardsSeen, meetVisitor, recordMissionSuccess } from "./progression/ProgressionManager.js";
import { pendingRestorationMoments } from "./progression/Restoration.js";
import { markStorySeen, pendingEntryScene, pendingStoryScenes } from "./story/CampusStory.js";
import { rewardById } from "./progression/Rewards.js";
import { backupFileName, exportBackup, importBackup, IMPORT_MESSAGES } from "./save/BackupPackage.js";
import { migrateAppSave } from "./save/Migrations.js";
import { storageReport } from "./save/StorageMonitor.js";
import { detectDeviceSupport, storageWarningNeeded } from "./app/DeviceSupport.js";
import { LifecycleCoordinator } from "./app/LifecycleCoordinator.js";
import { BuildSystem } from "./build/BuildSystem.js";
import { FixedClock } from "./core/FixedClock.js";
import { AudioManager } from "./core/AudioManager.js";
import { PerformanceMonitor } from "./core/PerformanceMonitor.js";
import { Telemetry } from "./core/Telemetry.js";
import { TestSystem } from "./core/TestSystem.js";
import { createDefaultRegistry, DEFAULT_PARTS } from "./content/defaultParts.js";
import { loadOpeningLevels } from "./opening/OpeningContent.js";
import { OpeningDirector, evaluateOpeningSuccess } from "./opening/OpeningDirector.js";
import { loadMotionYardLevels } from "./motion/MotionContent.js";
import { MOTION_PERFORMANCE_BUDGET } from "./motion/MotionPerformanceBudget.js";
import { evaluateMotionMission, MOTION_REAL_WORLD_CARDS } from "./motion/MotionYard.js";
import { CHAIN_WORKSHOP, CHALLENGE_LAB, CONTRACT_BOARD, CREATURE_MUSIC, EXPERIMENT_LAB, FREE_BUILD_ROOMS, MAIN_LABS, SCIENCE_FAIR } from "./progression/CampaignData.js";
import { CREATURE_MUSIC_LABS, RING_SECONDS, creatureMusicChallengeOpen, creatureMusicOpen } from "./creatures/CreatureMusic.js";
import { SCALE_HZ, familyOf } from "./music/MusicSystem.js";
import { FairRun, crowdCheers, fairById, fairHistory, fairOpen, judgeEntry, scienceFairOpen, withFairEntry } from "./fairs/ScienceFairs.js";
import { acceptVisitor, contractById, contractOpen, contractsOf, jobBoardOpen, visitorById } from "./contracts/Contracts.js";
import { ChallengeRun, challengeBest, challengeById, challengeLabOpen, challengeOpen, earnedRatings, formatScore, personalityLabel, playerParts, withChallengeResult } from "./challenge/Challenges.js";
import { activeModifiers, sandboxTrayParts, capStatus, CAMPAIGN_PART_CAP, MODIFIER_LABELS, placeTemplate, sandboxById, sandboxOpen, SANDBOX_PART_CAP, SPAWN_CATALOGUE, templateById, withModifier } from "./sandbox/Sandboxes.js";
import { buildExperimentRig, experimentTemplate, verdict, verdictLine } from "./experiment/ExperimentTemplates.js";
import { changedOne, experimentDiscoveries, experimentLabOpen, experimentUnlocked, savedExperiments, withSavedExperiment, EXPERIMENT_CONCEPT_EVIDENCE } from "./experiment/ExperimentLab.js";
import { METRIC_WORDS, MetricRecorder } from "./experiment/MetricRegistry.js";
import { chainStats, chainWorkshopOpen, collectChainDiscoveries, withChainRecords, withChainShelfMeta, CHAIN_REAL_WORLD_CARDS } from "./chain/ChainWorkshop.js";
import { evaluateLevelOutcome } from "./core/OutcomeEvaluator.js";
import { labMissionUnlocked, nextRequiredLabMission } from "./progression/LabProgression.js";
import { evaluateGearMission, GEAR_REAL_WORLD_CARDS, loadGearGarageLevels } from "./gears/GearGarage.js";
import { analyzeGears, gearNodeFrom, gearSnapPosition } from "./gears/GearSystem.js";
import { evaluateBuilderMission, loadBuilderBayLevels, runSummary, STRUCTURE_REAL_WORLD_CARDS } from "./structures/BuilderBay.js";
import { analyzeStructure, beamEndpoints as structureBeamEndpoints, beamEndSnap } from "./structures/StructureSystem.js";
import { analyzeCircuit, circuitBehaviour, wireEnds, wireEndSnap } from "./power/CircuitSystem.js";
import { magnetBehaviour } from "./magnets/MagnetSystem.js";
import { analyzeFluid, fluidBehaviour, pipeEnds, pipeEndSnap } from "./water/FluidSystem.js";
import { aeroBehaviour, craftSnap, fanBehaviour, isCraft } from "./flight/FlightSystem.js";
import { LAB_MODULES, evaluateLabMission, labModule } from "./labs/Labs.js";
import { loadLabLevels } from "./labs/LabModule.js";
import { hasLabBackdrop } from "./render/LabBackdrops.js";
import { renderBlockEditor } from "./robots/BlockEditor.js";
import { parseProgram } from "./robots/RobotProgram.js";
import { isRobot } from "./robots/RobotSystem.js";
import { attachKind, spaceSnap, vesselBehaviour } from "./space/SpaceSystem.js";
import { InputManager } from "./input/InputManager.js";
import { CanvasRenderer } from "./render/CanvasRenderer.js";
import { CameraController } from "./render/CameraController.js";
import { AutosaveScheduler, IndexedDbStore, SaveManager, ThumbnailCache } from "./save/SaveManager.js";
import { EditorOverlay } from "./tooling/EditorOverlay.js";
import { AssetManager } from "./core/AssetManager.js";
import { discoveryById, evaluateRunDiscoveries } from "./discovery/Discoveries.js";
import { observePartUses, partTitle, useLabel } from "./discovery/PartMastery.js";
import { ghostSnap, hintView, HintTracker, LEVEL_HINTS } from "./discovery/Hints.js";
import { diagnoseRun, WHY_CHOICES } from "./discovery/WhyCards.js";
import { AdaptiveObserver } from "./discovery/AdaptiveAssistance.js";
import { guidanceHistory, recordRunEvidence, withSolveHistory } from "./discovery/DiscoveryBook.js";
import { renderDiscoveryBook } from "./discovery/DiscoveryBookView.js";
import { DEFAULT_LOOK, HAIR_COLOURS, LOOK_CATEGORIES, isPieceUnlocked, piecesFor, withPiece } from "./inventor/InventorLook.js";
import { pictureUrl, renderLook } from "./inventor/LookView.js";
import { AVATAR_PORTRAITS } from "./hub/HubScreens.js";
import { rewardById as rewardInfo } from "./progression/Rewards.js";
const canvas = document.querySelector("#game");
if (!canvas)
    throw new Error("Missing #game canvas");
const registry = createDefaultRegistry();
const build = new BuildSystem();
const renderer = new CanvasRenderer(canvas);
const input = new InputManager(canvas);
const camera = new CameraController();
const clock = new FixedClock(60);
const tests = new TestSystem(registry);
const audio = new AudioManager();
const perf = new PerformanceMonitor();
const telemetry = new Telemetry();
const editor = new EditorOverlay();
const shell = new AppShellController();
/** One local database: the save (through SaveManager) and the My Inventions picture cache share it. */
const appStore = new IndexedDbStore("wobbleworks-app", 1);
const thumbs = new ThumbnailCache(appStore);
const saveManager = new SaveManager(appStore, validateAppSave, {
    migrate: raw => { const r = migrateAppSave(raw); return r.ok ? { payload: r.save, migrated: r.migrated } : r.reason === "FUTURE_VERSION" ? { futureVersion: true } : undefined; }
});
/** True when the stored save came from a newer build: we never overwrite it. */
let savingBlocked = false;
const autosave = new AutosaveScheduler(async (payload) => { if (!savingBlocked)
    await saveManager.save(payload); }, 600);
const parentGate = new ParentGate();
const assets = new AssetManager();
let artManifest = {};
renderer.setArt(id => assets.getImage(id));
/** Loads the painted art listed in assets/manifest.json. Anything missing keeps its code-drawn stand-in. */
async function loadArt() {
    try {
        const response = await fetch("./assets/manifest.json");
        if (response.ok)
            artManifest = await response.json();
    }
    catch {
        return;
    }
    const wanted = Object.keys(artManifest).filter(id => /^(motion|structure|air|level|fx|ui\.hint|duck|toy|char\.bolt|gear|power|water|robot|icon|magnet|flight|space)\./.test(id));
    await Promise.allSettled(wanted.map(id => assets.loadImage(id, artManifest[id])));
}
let appSave = createDefaultAppSave();
let selectedId;
let dragStart;
let panStart;
let dragPreview;
let testMode = false;
let pausedByShell = false;
let lifecyclePaused = false;
let settingsReturn = "TITLE";
let infoReturn = "SETTINGS";
let parentReturn = "TITLE";
let preRotateScreen = "TITLE";
let bootNotices = [];
let openingLevels = new Map();
let openingDirector = new OpeningDirector(1);
let openingActive = false;
let openingSuccessShown = false;
let selectedAvatar = "BLUE";
/** Inventor maker: the look being built (null = one of the three ready-made painted inventors). */
let makerLook = { ...DEFAULT_LOOK };
let makerCategory = "skin";
let makerHairColour;
let profileSelectedId;
let editingProfileId;
let currentNarration = "";
/** Authored levels for every installed lab, by lab id. */
const labLevels = new Map();
/** The lab whose menu/missions are showing (Motion Yard, Gear Garage, …). */
let currentLabId = "motion-yard";
/** What the last TEST of each challenge measured (this session only) — evidence that bracing improved a structure. */
const lastRuns = new Map();
/** Dragging one end of a beam (stretch/turn it) instead of the whole beam. */
let beamEndDrag;
/** Labs a grown-up opened with the test tool this session (progress gate skipped, nothing saved). */
const testingLabs = new Set();
let labActive = false;
let activeLevel;
let forceScanner = false;
let resultShown = false;
let freeBuildActive = false;
let creatingExtraProfile = false;
let lockerTab = "avatar";
let parentNotice = "";
let lastStorage;
let hubQueue = [];
/** Visitors who will pop by the Workshop to say thank you for a finished job (M27). */
let visitorReactions = [];
let lastMissionLevelId;
let resultReturnsToHub = false;
// ---- M11 guidance state (per attempt; nothing here is read by the simulation)
let hintTracker;
let currentHint = { tier: 0, line: "", glowParts: [], ghosts: [] };
const observer = new AdaptiveObserver(0);
let lastWhy;
let bookTab = "DISCOVERIES";
let bookReturn = "HUB";
let discoveryFrame = 0;
const popQueue = [];
let popBusy = false;
const appElement = document.querySelector("#app");
const shellElement = document.querySelector("#shell");
const transitionShield = document.querySelector("#transition-shield");
const loadingError = document.querySelector("#loading-error");
const unsupportedDetail = document.querySelector("#unsupported-detail");
const profileList = document.querySelector("#profile-list");
const titleStatus = document.querySelector("#title-status");
const openingHud = document.querySelector("#opening-hud");
const openingTitle = document.querySelector("#opening-title");
const openingPrompt = document.querySelector("#opening-prompt");
const openingSubtitle = document.querySelector("#opening-subtitle");
const openingSuccess = document.querySelector("#opening-success");
const boltAvatar = document.querySelector("#bolt-avatar");
const inventorName = document.querySelector("#inventor-name");
const motionHud = document.querySelector("#motion-hud");
const motionTitle = document.querySelector("#motion-title");
const motionObjective = document.querySelector("#motion-objective");
const motionResult = document.querySelector("#motion-result");
const motionResultTitle = document.querySelector("#motion-result-title");
const motionResultBody = document.querySelector("#motion-result-body");
const motionMissionGrid = document.querySelector("#motion-mission-grid");
const motionProgressLabel = document.querySelector("#motion-progress");
const forceScannerButton = document.querySelector("#btn-force-scanner");
const goMotionYardButton = document.querySelector("#btn-go-motion-yard");
const hubRoot = document.querySelector("#hub-root");
const mapRoot = document.querySelector("#map-root");
const mapNote = document.querySelector("#map-note");
const lockerRoot = document.querySelector("#locker-root");
const trophyRoot = document.querySelector("#trophy-root");
const shelfRoot = document.querySelector("#shelf-root");
const gateRoot = document.querySelector("#gate-root");
const parentRoot = document.querySelector("#parent-root");
const hubMoment = document.querySelector("#hub-moment");
const resultStars = document.querySelector("#motion-result-stars");
const resultRewards = document.querySelector("#motion-result-rewards");
const shelfButton = document.querySelector("#btn-motion-shelf");
const motionBackButton = document.querySelector("#btn-motion-back");
const hintButton = document.querySelector("#btn-hint");
const boltTip = document.querySelector("#bolt-tip");
const discoveryPop = document.querySelector("#discovery-pop");
const whyCard = document.querySelector("#why-card");
const whyButton = document.querySelector("#btn-why");
const keepBuildingButton = document.querySelector("#btn-keep-building");
const bookRoot = document.querySelector("#book-root");
const ui = {
    test: document.querySelector("#btn-test"), stop: document.querySelector("#btn-stop"),
    pause: document.querySelector("#btn-pause"), menu: document.querySelector("#btn-menu"),
    undo: document.querySelector("#btn-undo"), redo: document.querySelector("#btn-redo"),
    del: document.querySelector("#btn-delete"), rotate: document.querySelector("#btn-rotate"),
    resetCamera: document.querySelector("#btn-camera"), tools: document.querySelector("#btn-tools"),
    debug: document.querySelector("#debug"), mode: document.querySelector("#mode-label")
};
/** Parts you stretch by their ends: Builder Bay beams and Power Lab wires. */
function beamEndpoints(part, def) { return structureBeamEndpoints(part, def) ?? wireEnds(part, def) ?? pipeEnds(part, def); }
function isWirePart(id) { const p = build.getPart(id); return p !== undefined && registry.get(p.definitionId).behaviours.some(b => b.kind === "WIRE"); }
function isPipePart(id) { const p = build.getPart(id); return p !== undefined && registry.get(p.definitionId).behaviours.some(b => b.kind === "PIPE"); }
function delay(ms) { return new Promise(resolve => window.setTimeout(resolve, ms)); }
function now() { return performance.now(); }
function gameplayAllowed() { return shell.canUseGameplay(now()); }
function isPortraitBuildLayout() { return window.matchMedia?.("(orientation: portrait) and (max-width: 900px)").matches ?? false; }
function openingStepFromSave() {
    const step = currentOpening(appSave).step;
    return (step >= 1 && step <= 6 ? step : 1);
}
/** Every change to the save goes through here: debounced autosave, or an immediate save for milestones. */
function commit(next, immediate = false) {
    appSave = next;
    autosave.request(appSave);
    return immediate ? autosave.flush() : Promise.resolve();
}
function buzz(ms = 25) { if ((currentSettings(appSave).vibration ?? true) && "vibrate" in navigator)
    try {
        navigator.vibrate(ms);
    }
    catch { /* unsupported */ } }
function sfx(frequency, duration) { if (currentSettings(appSave).soundEffects)
    audio.beep(frequency, duration); }
function applySettings(settings = currentSettings(appSave)) {
    document.documentElement.style.setProperty("--text-scale", String(settings.textScale));
    document.documentElement.classList.toggle("reduced-motion", settings.reducedMotion);
    document.documentElement.classList.toggle("high-contrast", settings.highContrast);
    document.documentElement.classList.toggle("no-subtitles", !settings.subtitles);
}
function syncSettingsForm() {
    const s = currentSettings(appSave);
    const a = currentAssistance(appSave);
    const p = activeProfile(appSave);
    document.querySelector("#setting-text-scale").value = String(s.textScale);
    document.querySelector("#setting-reduced-motion").checked = s.reducedMotion;
    document.querySelector("#setting-high-contrast").checked = s.highContrast;
    document.querySelector("#setting-narration").checked = s.narration;
    document.querySelector("#setting-subtitles").checked = s.subtitles;
    document.querySelector("#setting-sfx").checked = s.soundEffects;
    document.querySelector("#setting-music").checked = s.music ?? true;
    document.querySelector("#setting-vibration").checked = s.vibration ?? true;
    document.querySelector("#setting-hints").checked = a.boltTips;
    document.querySelector("#setting-hints").closest("label").classList.toggle("hidden", !p);
    document.querySelector("#setting-snap").checked = a.snapAssist;
    document.querySelector("#setting-snap-row").classList.toggle("hidden", !p);
    document.querySelector("#settings-owner").textContent = p ? `Settings for ${p.name}` : "Settings for this device";
}
function readSettingsForm() {
    const num = Number(document.querySelector("#setting-text-scale").value);
    const chk = (id) => document.querySelector(id).checked;
    return { textScale: Number.isFinite(num) ? Math.max(0.9, Math.min(1.4, num)) : 1, reducedMotion: chk("#setting-reduced-motion"), highContrast: chk("#setting-high-contrast"), narration: chk("#setting-narration"), subtitles: chk("#setting-subtitles"), soundEffects: chk("#setting-sfx"), music: chk("#setting-music"), vibration: chk("#setting-vibration") };
}
/** The nine campaign labs plus the creative modes that use the same mission menu (the Chain Reaction Workshop). */
const PLAY_SETS = [...MAIN_LABS, CHAIN_WORKSHOP, EXPERIMENT_LAB, FREE_BUILD_ROOMS, CHALLENGE_LAB, CONTRACT_BOARD, SCIENCE_FAIR, CREATURE_MUSIC];
function labDef(id = currentLabId) { return PLAY_SETS.find(l => l.id === id); }
function labOfLevel(levelId) { return PLAY_SETS.find(l => l.missions.some(m => m.id === levelId))?.id ?? "motion-yard"; }
function completedSet() { return new Set(completedLevelIds(appSave)); }
function missionMeta(levelId) { return PLAY_SETS.flatMap(l => l.missions).find(m => m.id === levelId); }
/** The lab's own evaluator: same success rules as the level file, plus that lab's evidence-backed discoveries. */
function evaluateLevel(level, runtime) {
    const lab = labOfLevel(level.id);
    if (lab === "builder-bay") {
        const prev = lastRuns.get(level.id);
        return evaluateBuilderMission(level, build, runtime, prev);
    }
    if (lab === EXPERIMENT_LAB.id)
        return { levelId: level.id, success: false, discoveries: [] };
    // Challenge Lab: finishing is decided by the challenge's own scoring (finishChallenge), on an exact tick.
    if (lab === CHALLENGE_LAB.id)
        return { levelId: level.id, success: false, discoveries: [] };
    // Science Fair: entries are judged by the fair itself (finishFair), never by a level rule.
    if (lab === SCIENCE_FAIR.id)
        return { levelId: level.id, success: false, discoveries: [] };
    // Job Board: each job uses its lab room's own rules, checked the same way as every other level.
    if (lab === CREATURE_MUSIC.id)
        return { levelId: level.id, success: runtime ? evaluateLevelOutcome(level, build, runtime).complete : false, discoveries: [] };
    if (lab === CONTRACT_BOARD.id)
        return { levelId: level.id, success: runtime ? evaluateLevelOutcome(level, build, runtime).complete : false, discoveries: [] };
    if (lab === CHAIN_WORKSHOP.id)
        return { levelId: level.id, success: runtime ? evaluateLevelOutcome(level, build, runtime).complete : false, discoveries: runtime ? collectChainDiscoveries(build, runtime) : [] };
    const module = labModule(lab);
    if (module)
        return evaluateLabMission(module, level, build, runtime);
    return lab === "gear-garage" ? evaluateGearMission(level, build, runtime) : evaluateMotionMission(level, build, runtime);
}
/** Remember this run so the next TEST can show whether a change (like a brace) really helped. */
function rememberRun() { const runtime = tests.active(); if (runtime && activeLevel)
    lastRuns.set(activeLevel.id, runSummary(build, runtime)); }
function labIsOpen(labId) { if (labId === CREATURE_MUSIC.id)
    return labLevels.has(labId) && (creatureMusicOpen(appSave) || testingLabs.has(labId)); if (labId === SCIENCE_FAIR.id)
    return labLevels.has(labId) && (scienceFairOpen(appSave) || testingLabs.has(labId)); if (labId === CONTRACT_BOARD.id)
    return labLevels.has(labId) && (jobBoardOpen(appSave) || testingLabs.has(labId)); if (labId === CHALLENGE_LAB.id)
    return labLevels.has(labId) && (challengeLabOpen(appSave) || testingLabs.has(labId)); if (labId === FREE_BUILD_ROOMS.id)
    return labLevels.has(labId) && Boolean(activeProfile(appSave)?.freeBuildUnlocked); if (labId === EXPERIMENT_LAB.id)
    return labLevels.has(labId) && (experimentLabOpen(appSave) || testingLabs.has(labId)); if (labId === CHAIN_WORKSHOP.id)
    return labLevels.has(labId) && (chainWorkshopOpen(appSave) || testingLabs.has(labId)); return labLevels.has(labId) && (routeToRegion(appSave, labId).kind === "ENTER" || testingLabs.has(labId)); }
function updateOpeningTray(level) {
    const allowed = level ? new Set(level.availablePartIds) : undefined;
    document.querySelectorAll("[data-part]").forEach(button => {
        const hidden = Boolean((openingActive || labActive || freeBuildActive) && allowed && !allowed.has(button.dataset.part));
        button.classList.toggle("hidden", hidden);
        button.disabled = hidden;
    });
}
function speakCurrentLine(force = false) {
    if (!currentNarration || !("speechSynthesis" in window))
        return;
    if (!force && !currentSettings(appSave).narration)
        return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(currentNarration);
    utterance.rate = 1.02;
    utterance.pitch = 1.08;
    window.speechSynthesis.speak(utterance);
}
/** Put a painted Bolt pose (wearing the equipped costume) into a slot on screen. */
function showBolt(slot, pose) {
    const el = document.querySelector(slot);
    if (el)
        el.replaceChildren(boltArt(activeProfile(appSave)?.equipped.bolt, pose));
}
function presentBolt(line, reaction = false, pose = reaction ? "cheer" : "point") {
    showBolt("#bolt-avatar", pose);
    currentNarration = line;
    openingSubtitle.textContent = line;
    if (reaction) {
        boltAvatar.classList.remove("react");
        requestAnimationFrame(() => boltAvatar.classList.add("react"));
    }
    sfx(reaction ? 920 : 620, reaction ? 0.08 : 0.045);
    speakCurrentLine();
}
function renderOpeningHud() {
    openingHud.classList.toggle("hidden", !openingActive);
    if (!openingActive)
        return;
    const meta = openingDirector.current();
    goMotionYardButton.classList.toggle("hidden", meta.step !== 6);
    openingTitle.textContent = meta.title;
    openingPrompt.textContent = meta.prompt;
}
function renderLabMenu() {
    motionMissionGrid.replaceChildren();
    const lab = labDef();
    const completed = completedSet();
    const requiredNext = nextRequiredLabMission(lab, completed);
    document.querySelector("#lab-badge").textContent = MAIN_LABS.includes(lab) ? `LAB ${MAIN_LABS.indexOf(lab) + 1}` : "WORKSHOP MODE";
    document.querySelector("#lab-badge").style.background = lab.colour;
    document.querySelector("#lab-title").textContent = lab.title;
    document.querySelector("#lab-lead").textContent = `${lab.concepts}. Build, TEST, watch what happens, then change it.`;
    motionProgressLabel.textContent = `${lab.missions.filter(m => completed.has(m.id)).length} / ${lab.missions.length} ${lab.title} experiences completed`;
    for (const meta of lab.missions) {
        const unlocked = labMissionUnlocked(lab, meta.id, completed) && (lab.id !== EXPERIMENT_LAB.id || experimentUnlocked(appSave, meta.id) || testingLabs.has(lab.id)) && (lab.id !== FREE_BUILD_ROOMS.id || sandboxOpen(appSave, meta.id) || testingLabs.has(lab.id)) && (lab.id !== CHALLENGE_LAB.id || challengeOpen(appSave, meta.id) || testingLabs.has(lab.id)) && (lab.id !== CONTRACT_BOARD.id || contractOpen(appSave, meta.id) || testingLabs.has(lab.id)) && (lab.id !== SCIENCE_FAIR.id || fairOpen(appSave, meta.id) || testingLabs.has(lab.id)) && (lab.id !== CREATURE_MUSIC.id || creatureMusicChallengeOpen(appSave, meta.id) || testingLabs.has(lab.id));
        const button = document.createElement("button");
        button.className = `motion-mission${completed.has(meta.id) ? " done" : ""}${!unlocked ? " locked" : ""}${requiredNext === meta.id ? " required" : ""}`;
        button.disabled = !unlocked;
        const slot = document.createElement("span");
        slot.className = "slot";
        slot.textContent = meta.slot === "ORDINARY" ? `MISSION ${meta.ordinaryNumber}` : meta.slot === "CHALLENGE" ? `CHALLENGE ${lab.missions.indexOf(meta) + 1}` : meta.slot;
        const title = document.createElement("strong");
        title.textContent = completed.has(meta.id) ? `✓ ${meta.title}` : meta.title;
        const objective = document.createElement("span");
        const tpl = lab.id === EXPERIMENT_LAB.id ? experimentTemplate(meta.id) : undefined;
        const room = lab.id === FREE_BUILD_ROOMS.id ? sandboxById(meta.id) : undefined;
        const ch = lab.id === CHALLENGE_LAB.id ? challengeById(meta.id) : undefined;
        const job = lab.id === CONTRACT_BOARD.id ? contractById(meta.id) : undefined;
        const who = job ? visitorById(job.visitorId) : undefined;
        const fd = lab.id === SCIENCE_FAIR.id ? fairById(meta.id) : undefined;
        const cmLab = lab.id === CREATURE_MUSIC.id ? CREATURE_MUSIC_LABS[meta.id] : undefined;
        if (cmLab && !unlocked)
            objective.textContent = `Opens with the ${regionById(cmLab)?.title ?? "lab"}`;
        else if (cmLab)
            objective.textContent = labLevels.get(CREATURE_MUSIC.id)?.get(meta.id)?.narrationCues?.[0] ?? meta.objective;
        else if (fd) {
            const hist = fairHistory(appSave, fd.id);
            slot.textContent = `${fd.icon} FAIR ${fd.number}`;
            objective.textContent = unlocked ? `${fd.prompt}${hist.length ? ` · Entered ${hist.length} time${hist.length === 1 ? "" : "s"}` : ""}` : fd.unlock === "ALL" ? "Opens when every lab is restored." : `Opens after the ${fd.unlock.map(l => regionById(l)?.title ?? l).join(" and ")}.`;
        }
        else if (job && who) {
            slot.textContent = `${who.icon} ${who.name.toUpperCase()}`;
            objective.textContent = unlocked ? job.goal : activeProfile(appSave)?.visitorsMet.includes(who.id) ? `Opens with the ${regionById(job.labId)?.title ?? "lab"}` : `Meet ${who.name} at the Workshop door`;
        }
        else if (ch) {
            const best = challengeBest(appSave, ch.id);
            objective.textContent = unlocked ? `${ch.icon} ${ch.goal}${best ? ` · Best: ${formatScore(ch, best.value)}` : ""}` : `Opens with the ${regionById(ch.labId)?.title ?? "lab"}`;
        }
        else if (room)
            objective.textContent = unlocked ? `${room.icon} ${room.prompts[0]}` : room.free ? "Finish the opening first." : room.needs === "ALL" ? "Opens when every lab is restored." : `Opens with the ${regionById(room.needs ?? "")?.title ?? "lab"}`;
        else
            objective.textContent = tpl ? (unlocked ? `${tpl.question} ${savedExperiments(appSave, meta.id).length ? `· ${savedExperiments(appSave, meta.id).length} saved` : ""}` : `Opens with the ${regionById(tpl.labId)?.title ?? "lab"}`) : meta.objective;
        button.append(slot, title, objective);
        button.addEventListener("click", () => loadMission(meta.id));
        motionMissionGrid.append(button);
    }
}
function showLab(labId = currentLabId) {
    if (!labIsOpen(labId))
        labId = "motion-yard";
    currentLabId = labId;
    stopToBuild();
    openingActive = false;
    labActive = false;
    freeBuildActive = false;
    activeLevel = undefined;
    forceScanner = false;
    if (activeProfile(appSave))
        void commit(withLocation(appSave, `LAB:${labId}`));
    openingHud.classList.add("hidden");
    openingSuccess.classList.add("hidden");
    motionHud.classList.add("hidden");
    motionResult.classList.add("hidden");
    updateOpeningTray();
    renderLabMenu();
    transition("MOTION_YARD", true);
    // First visit: Bolt shows you round (5–20 seconds, skippable, plays once per inventor).
    const entry = pendingEntryScene(appSave, labId);
    if (entry)
        playStory([entry]);
}
function loadMission(id) {
    const labId = labOfLevel(id);
    const lab = labDef(labId);
    if (labId === FREE_BUILD_ROOMS.id) {
        const level = labLevels.get(labId)?.get(id);
        if (level && (sandboxOpen(appSave, id) || testingLabs.has(labId)))
            startSandbox(level);
        return;
    }
    if (!labMissionUnlocked(lab, id, completedSet()))
        return;
    photo.exit();
    editingInvention = undefined;
    lastRun = undefined;
    runMeter = undefined;
    invSave.classList.add("hidden");
    endReplay();
    lastRecording = undefined;
    const level = labLevels.get(labId)?.get(id);
    if (!level) {
        loadingError.textContent = `${lab.title} content is missing: ${id}.`;
        transition("LOADING_FAILURE", true);
        return;
    }
    currentLabId = labId;
    stopToBuild();
    openingActive = false;
    freeBuildActive = false;
    openingHud.classList.add("hidden");
    openingSuccess.classList.add("hidden");
    build.replaceAll({ parts: [...(level.staticObjects ?? []), ...level.starterParts], connections: level.starterConnections });
    selectedId = undefined;
    dragStart = undefined;
    dragPreview = undefined;
    panStart = undefined;
    camera.reset();
    labActive = true;
    activeLevel = level;
    resultShown = false;
    forceScanner = false;
    motionResult.classList.add("hidden");
    const meta = missionMeta(id);
    motionTitle.textContent = meta?.title ?? level.title;
    motionObjective.textContent = meta?.objective ?? level.title;
    motionHud.classList.remove("hidden");
    forceScannerButton.classList.remove("hidden", "force-on");
    forceScannerButton.setAttribute("aria-pressed", "false");
    document.querySelector(".motion-hud .motion-badge").textContent = lab.title.toUpperCase();
    forceScannerButton.textContent = labModule(labId)?.scannerName ?? (labId === "gear-garage" ? "Spin Scanner" : labId === "builder-bay" ? "Stress Scanner" : "Force Scanner");
    updateOpeningTray(level);
    resetGuidance(level.id);
    enterWorkshop();
    startExperiment(labId === EXPERIMENT_LAB.id ? level : undefined);
    setupChallenge(labId === CHALLENGE_LAB.id ? challengeById(level.id) : undefined);
    contract = labId === CONTRACT_BOARD.id ? contractById(level.id) : undefined;
    setupFair(labId === SCIENCE_FAIR.id ? fairById(level.id) : undefined, level);
    if (labId === CREATURE_MUSIC.id)
        motionObjective.textContent = level.narrationCues?.[0] ?? motionObjective.textContent;
    if (contract) {
        const who = visitorById(contract.visitorId);
        motionObjective.textContent = contract.goal;
        document.querySelector(".motion-hud .motion-badge").textContent = `JOB FOR ${who.name.toUpperCase()}`;
    }
}
function showMotionResult(success, body, stars = [], newStars = [], rewards = []) {
    resultShown = true;
    motionResult.classList.remove("hidden");
    motionResult.classList.toggle("success", success);
    motionResultTitle.textContent = success ? "IT WORKED!" : "GOOD TEST!";
    motionResultBody.textContent = body;
    showBolt("#result-bolt", success ? "cheer" : "panic");
    resultStars.replaceChildren();
    resultRewards.replaceChildren();
    resultStars.classList.toggle("hidden", !success);
    resultRewards.classList.toggle("hidden", !rewards.length);
    shelfButton.classList.toggle("hidden", !success || !activeProfile(appSave));
    shelfButton.disabled = false;
    shelfButton.textContent = "Put on Shelf";
    if (coop && success)
        settlePrediction(true);
    motionBackButton.textContent = resultReturnsToHub ? "Workshop" : labDef().title;
    whyButton.classList.toggle("hidden", success || !lastWhy);
    keepBuildingButton.classList.toggle("hidden", success && !challenge);
    watchReplayButton.classList.toggle("hidden", !recorder || recorder.length < 30);
    watchReplayButton.textContent = !success && recorder?.markers.length ? "🎬 See where it went wrong" : "🎬 Watch replay";
    if (success) {
        const labels = { solve: "Solved", efficient: "Tiny machine", advanced: "Wild invention" };
        for (const id of ["solve", "efficient", "advanced"]) {
            const s = document.createElement("span");
            const has = stars.includes(id);
            s.className = `result-star${has ? " on" : ""}${newStars.includes(id) ? " new" : ""}`;
            s.textContent = `★ ${labels[id]}`;
            resultStars.append(s);
        }
    }
    for (const id of rewards) {
        const r = rewardById(id);
        if (!r)
            continue;
        const chip = document.createElement("span");
        chip.className = "reward-chip";
        chip.textContent = `${r.icon} ${r.title}`;
        chip.title = r.description;
        resultRewards.append(chip);
    }
}
function playerPartCount(level) {
    const seeded = new Set([...(level.staticObjects ?? []), ...level.starterParts].map(p => p.id));
    return build.allParts().filter(p => !seeded.has(p.id)).length;
}
function maybeCompleteMotionMission() {
    if (!labActive || !activeLevel || !testMode || resultShown)
        return;
    const runtime = tests.active();
    if (!runtime)
        return;
    const result = evaluateLevel(activeLevel, runtime);
    if (!result.success)
        return;
    if (!tests.isPaused())
        tests.togglePause();
    checkRunDiscoveries();
    const outcome = recordMissionSuccess(appSave, activeLevel.id, { playerPartCount: playerPartCount(activeLevel), discoveries: result.discoveries });
    lastMissionLevelId = activeLevel.id;
    resultReturnsToHub = outcome.labCleared !== undefined;
    // Help used only tunes how often help is offered later; stars and rewards above never see it.
    void commit(withSolveHistory(outcome.save, observer.hintsUsed(), observer.failedTests()), true).catch(() => undefined);
    setHint(undefined);
    hideBoltTip();
    hintButton.classList.remove("offer");
    const card = result.discoveries.map(id => [...MOTION_REAL_WORLD_CARDS, ...GEAR_REAL_WORLD_CARDS, ...STRUCTURE_REAL_WORLD_CARDS, ...LAB_MODULES.flatMap(m => m.realWorldCards), ...CHAIN_REAL_WORLD_CARDS].find(c => c.discoveryId === id)).find(Boolean);
    const chainNote = labOfLevel(activeLevel.id) === CHAIN_WORKSHOP.id ? noteChainRun() : "";
    const helped = contract ? visitorById(contract.visitorId) : undefined;
    const thanks = helped ? ` ${helped.name}: “${helped.thanks}”` : "";
    if (helped && outcome.firstCompletion)
        visitorReactions.push({ kind: "VISITOR", title: `${helped.icon} ${helped.name} pops by:`, body: `“${helped.thanks} Thanks for doing ${contract.title}!”` });
    rememberRun();
    const discovered = card ? ` ${card.title}: ${card.example}` : result.discoveries.length ? ` You discovered ${result.discoveries[0].replace("motion.", "").replaceAll("-", " ")}.` : "";
    const cleared = outcome.labCleared ? ` The ${regionById(outcome.labCleared)?.title ?? "lab"} is restored!` : "";
    showMotionResult(true, `${helped ? "Job done!" : "Nice invention."}${thanks}${chainNote}${discovered}${cleared}`, outcome.stars, outcome.newStars, outcome.newRewards);
    sfx(980, .09);
    buzz(60);
}
async function saveOpeningProgress(step, complete = false) {
    await commit(syncOpeningMetrics(withOpeningProgress(appSave, step, complete)), complete);
}
function loadOpeningStep(step) {
    stopToBuild();
    const meta = openingDirector.currentStep() === step ? openingDirector.current() : (() => { openingDirector.setStep(step); return openingDirector.current(); })();
    const level = openingLevels.get(meta.levelId);
    if (!level) {
        loadingError.textContent = `Opening content is missing: ${meta.levelId}. Your save has not been changed.`;
        transition("LOADING_FAILURE", true);
        return;
    }
    build.replaceAll({ parts: [...(level.staticObjects ?? []), ...level.starterParts], connections: level.starterConnections });
    selectedId = undefined;
    dragStart = undefined;
    dragPreview = undefined;
    panStart = undefined;
    camera.reset();
    openingActive = true;
    labActive = false;
    freeBuildActive = false;
    activeLevel = undefined;
    motionHud.classList.add("hidden");
    openingSuccessShown = false;
    openingSuccess.classList.add("hidden");
    renderOpeningHud();
    updateOpeningTray(level);
    presentBolt(meta.boltLine);
    if (step === 6)
        void saveOpeningProgress(6, true).catch(() => undefined);
    else
        void saveOpeningProgress(step, false).catch(() => undefined);
    enterWorkshop();
}
function startOpening(step = openingStepFromSave()) {
    openingDirector = new OpeningDirector(step);
    openingDirector.startSession(now());
    loadOpeningStep(step);
}
function autoSnapOpeningWheel(id) {
    const openingSnap = openingActive && [1, 4].includes(openingDirector.currentStep());
    const adaptiveSnap = (labActive || freeBuildActive) && currentGuidance().wheelSnap;
    if (!(openingSnap || adaptiveSnap) || !currentAssistance(appSave).snapAssist)
        return;
    const wheel = build.getPart(id);
    if (!wheel || wheel.definitionId !== "motion.wheel")
        return;
    const cart = build.allParts().find(p => p.definitionId === "motion.cart");
    if (!cart)
        return;
    if (Math.hypot(wheel.position.x - cart.position.x, wheel.position.y - cart.position.y) > 1.65)
        return;
    const connectedWheels = build.allConnections().filter(c => c.fromPartId === cart.id || c.toPartId === cart.id)
        .map(c => c.fromPartId === cart.id ? c.toPartId : c.fromPartId)
        .map(wheelId => build.getPart(wheelId)).filter(p => p?.definitionId === "motion.wheel");
    const side = connectedWheels.length > 0 ? 1 : -1;
    build.move(id, { x: cart.position.x + side * 0.42, y: Math.min(8.05, cart.position.y + 0.38) }); // placement help only: physics + win rules unchanged
    const alreadyConnected = build.allConnections().some(c => (c.fromPartId === cart.id && c.toPartId === id) || (c.toPartId === cart.id && c.fromPartId === id));
    if (!alreadyConnected)
        build.connect(cart.id, "axle", id, "axle", { kind: "HINGE" });
    sfx(760, 0.05);
}
async function advanceOpening() {
    if (!openingActive || !openingSuccessShown)
        return;
    const result = openingDirector.completeCurrent();
    stopToBuild();
    openingSuccess.classList.add("hidden");
    openingSuccessShown = false;
    if (!result.next)
        return;
    await saveOpeningProgress(result.next, false);
    if (result.requiresInventor && appSave.profiles.length === 0) {
        openingActive = false;
        updateOpeningTray();
        openingHud.classList.add("hidden");
        editingProfileId = undefined;
        creatingExtraProfile = false;
        resetMaker({ ...DEFAULT_LOOK }, "BLUE");
        document.querySelector("#btn-inventor-cancel").classList.add("hidden");
        document.querySelector("#inventor-form-title").textContent = "CREATE YOUR INVENTOR";
        document.querySelector("#btn-create-inventor").textContent = "✔ CREATE INVENTOR";
        document.querySelector("#inventor-form-lead").textContent = "Bolt wants to remember who helped.";
        transition("CREATE_INVENTOR", true);
        return;
    }
    loadOpeningStep(result.next);
}
function maybeCompleteOpeningChallenge() {
    if (!openingActive || !testMode || openingSuccessShown || openingDirector.currentStep() === 6)
        return;
    if (!evaluateOpeningSuccess(openingDirector.currentStep(), build, tests.active()))
        return;
    openingSuccessShown = true;
    openingSuccess.classList.remove("hidden");
    if (tests.active() && !tests.isPaused())
        tests.togglePause();
    const step = openingDirector.currentStep();
    presentBolt(step === 3 ? "WHEEEE! ...I meant to do that!" : step === 5 ? "That was YOUR solution!" : "It worked!", true, step === 3 ? "panic" : "cheer");
    showBolt("#opening-bolt", step === 3 ? "panic" : "cheer");
}
function chooseProfile(id) { void commit(withActiveProfile(appSave, id), true); applySettings(); resumeActiveProfile(); }
function openInventorForm(editId) {
    editingProfileId = editId;
    const p = editId ? appSave.profiles.find(x => x.id === editId) : undefined;
    creatingExtraProfile = !editId;
    inventorName.value = p?.name ?? "Inventor";
    resetMaker(p ? p.look ?? (PAINTED_AVATARS.includes(p.avatarStyle) ? null : { ...DEFAULT_LOOK }) : { ...DEFAULT_LOOK }, p && PAINTED_AVATARS.includes(p.avatarStyle) ? p.avatarStyle : "BLUE");
    document.querySelector("#inventor-form-title").textContent = p ? `EDIT ${p.name.toUpperCase()}` : "CREATE YOUR INVENTOR";
    document.querySelector("#btn-create-inventor").textContent = p ? "✔ SAVE CHANGES" : "✔ CREATE INVENTOR";
    document.querySelector("#inventor-form-lead").textContent = p ? "Change your nickname or your look." : "Bolt wants to remember who helped.";
    document.querySelector("#btn-inventor-cancel").classList.remove("hidden");
    transition("CREATE_INVENTOR");
}
function renderProfiles() {
    if (!appSave.profiles.some(p => p.id === profileSelectedId))
        profileSelectedId = mostRecentProfile(appSave)?.id;
    renderProfileSelect(profileList, appSave, profileSelectedId, {
        select: id => { profileSelectedId = id; sfx(700, .03); renderProfiles(); },
        play: id => chooseProfile(id),
        edit: id => openInventorForm(id),
        create: () => { if (appSave.profiles.length < MAX_PROFILES)
            openInventorForm(); }
    });
    document.querySelector("#profile-empty").classList.toggle("hidden", appSave.profiles.length > 0);
    document.querySelector("#btn-profile-continue").disabled = !profileSelectedId;
}
document.querySelector("#btn-profile-continue").addEventListener("click", () => { if (profileSelectedId && !shell.isInputLocked(now()))
    chooseProfile(profileSelectedId); });
document.querySelector("#btn-inventor-cancel").addEventListener("click", () => { editingProfileId = undefined; creatingExtraProfile = false; transition("PROFILE_SELECT", true); });
const INFO_TEXT = {
    privacy: { title: "Privacy", body: ["WobbleWorks keeps everything on this device: inventors, progress and inventions.", "There are no ads, no chat and no accounts for children. Nothing is uploaded.", "The full privacy policy is added before the game is released."] },
    terms: { title: "Terms of Use", body: ["The full terms of use are added before the game is released."] },
    help: { title: "Help", body: ["Drag parts from the tray, then press TEST to see what happens. STOP puts everything back.", "Stuck? Change one thing and TEST again: every test teaches something.", "Grown-ups: backups, storage and inventor removal are in Grown-ups."] }
};
function showInfo(key) {
    const info = INFO_TEXT[key] ?? INFO_TEXT.help;
    document.querySelector("#info-title").textContent = info.title;
    const body = document.querySelector("#info-body");
    body.replaceChildren(...info.body.map(t => { const p = document.createElement("p"); p.textContent = t; return p; }));
    transition("INFO");
}
function renderTitle() {
    titleStatus.textContent = navigator.onLine ? "" : "Offline — cached ownership rules are active.";
}
function renderExtras() {
    const v = titleVisibility(appSave);
    document.querySelector("#menu-freebuild").classList.toggle("hidden", !v.freeBuild);
    document.querySelector("#menu-inventions").classList.toggle("hidden", !v.myInventions);
    document.querySelector("#extras-note").textContent = v.freeBuild ? "" : "Free Build opens after the first few challenges.";
}
function renderShell() {
    const current = shell.current();
    const inWorkshop = current === "WORKSHOP";
    appElement.setAttribute("aria-hidden", String(!inWorkshop));
    shellElement.classList.toggle("workshop-hidden", inWorkshop);
    for (const card of shellElement.querySelectorAll("[data-screen]"))
        card.classList.toggle("hidden", card.dataset.screen !== current);
    if (current === "TITLE")
        renderTitle();
    if (current === "EXTRAS")
        renderExtras();
    if (current === "PROFILE_SELECT")
        renderProfiles();
    if (current === "MOTION_YARD")
        renderLabMenu();
    if (current === "HUB")
        renderHubScreen();
    if (current === "CAMPUS_MAP")
        renderMap();
    if (current === "LOCKER")
        renderLockerScreen();
    if (current === "TROPHIES") {
        renderTrophies(trophyRoot, appSave, { replayStory: s => playStory([s], () => undefined, false) });
        void commit(markRewardsSeen(appSave, (activeProfile(appSave)?.unseenRewards ?? []).filter(id => id.startsWith("badge.") || id.startsWith("sticker."))));
    }
    if (current === "SHELF")
        renderShelf(shelfRoot, appSave, { open: openShelfInvention, thumb: (id, n) => thumbs.get(thumbKey(id, n)) });
    if (current === "INVENTIONS")
        renderInventionScreen();
    if (current === "GROWN_UPS")
        renderGate("");
    if (current === "PARENT_DASHBOARD")
        renderParent();
    if (current === "SETTINGS")
        syncSettingsForm();
    if (current === "DISCOVERY_BOOK")
        renderBook();
    if (current === "CREATE_INVENTOR")
        renderMaker();
    const activeCard = shellElement.querySelector(`[data-screen="${current}"]`);
    if (activeCard && !inWorkshop) {
        const focusTarget = activeCard.querySelector("button,input") ?? activeCard;
        if (focusTarget === activeCard)
            activeCard.tabIndex = -1;
        window.setTimeout(() => focusTarget.focus(), 0);
    }
    transitionShield.classList.add("active");
    window.setTimeout(() => transitionShield.classList.remove("active"), 190);
}
function transition(next, force = false) {
    const moved = shell.transition(next, now(), force);
    if (moved)
        renderShell();
    return moved;
}
function enterWorkshop() {
    if (isPortraitBuildLayout()) {
        preRotateScreen = "WORKSHOP";
        transition("ROTATE_DEVICE", true);
        return;
    }
    transition("WORKSHOP", true);
}
function syncOpeningMetrics(save) {
    if (!openingActive)
        return save;
    const metrics = openingDirector.metrics();
    const firstInteractionDelayMs = metrics.firstInteractionAtMs === undefined ? undefined : Math.max(0, metrics.firstInteractionAtMs - metrics.sessionStartedAtMs);
    const firstTestDelayMs = metrics.firstTestAtMs === undefined ? undefined : Math.max(0, metrics.firstTestAtMs - metrics.sessionStartedAtMs);
    return withOpeningMetrics(save, {
        ...(firstInteractionDelayMs !== undefined ? { firstInteractionDelayMs } : {}),
        ...(firstTestDelayMs !== undefined ? { firstTestDelayMs } : {}),
        testPresses: metrics.testPresses, stopPresses: metrics.stopPresses, retries: metrics.retries, completedSteps: metrics.completedSteps
    });
}
async function persistCurrentBuild(markFirstTest = false, immediate = false) {
    // A sandbox build remembers which room it belongs to, so going back to that room continues it.
    const snapshot = build.snapshot(currentRoom && freeBuildActive ? `sandbox:${currentRoom.id}` : "build.workshop");
    const next = markFirstTest ? withFirstTest(appSave, snapshot) : withBuild(appSave, snapshot);
    await commit(syncOpeningMetrics(next), immediate);
}
function stopToBuild() {
    if (exp) {
        exp.recorder = undefined;
    }
    if (!testMode)
        return;
    if (runMeter) {
        const m = runMeter.result();
        if (m)
            lastRun = { checksum: runMeter.buildChecksum, metrics: m };
        runMeter = undefined;
    }
    if (coop)
        settlePrediction(false);
    if (recorder && recorder.length > 30)
        lastRecording = recorder;
    recorder = undefined;
    setSlow(false);
    setFollow(undefined);
    challengeRun = undefined;
    cargoBox.classList.remove("locked");
    if (fairRun) {
        fairRun = undefined;
        resetFairButton();
    }
    if (activeLevel && labOfLevel(activeLevel.id) === CHAIN_WORKSHOP.id && !resultShown)
        noteChainRun();
    tests.stop();
    testMode = false;
    pausedByShell = false;
    lifecyclePaused = false;
    ui.mode.textContent = "BUILD";
}
function openPause() {
    if (shell.current() !== "WORKSHOP")
        return;
    if (testMode && !tests.isPaused()) {
        tests.togglePause();
        pausedByShell = true;
    }
    transition("PAUSE", true);
}
function resumeFromPause() {
    transition("WORKSHOP", true);
    if (testMode && pausedByShell && tests.isPaused())
        tests.togglePause();
    pausedByShell = false;
    lifecyclePaused = false;
}
function advanceBootNotice() {
    const next = bootNotices.shift();
    if (next)
        transition(next, true);
    else
        transition("TITLE", true);
}
async function loadAppState() {
    transition("LOADING", true);
    try {
        const loaded = await saveManager.loadWithRecovery();
        openingLevels = await loadOpeningLevels(registry);
        labLevels.set("motion-yard", await loadMotionYardLevels(registry));
        labLevels.set("gear-garage", await loadGearGarageLevels(registry));
        labLevels.set("builder-bay", await loadBuilderBayLevels(registry));
        for (const m of LAB_MODULES)
            labLevels.set(m.labId, await loadLabLevels(registry, m.labId, m.folder));
        labLevels.set(CHAIN_WORKSHOP.id, await loadLabLevels(registry, CHAIN_WORKSHOP.id, "chain"));
        labLevels.set(EXPERIMENT_LAB.id, await loadLabLevels(registry, EXPERIMENT_LAB.id, "experiment"));
        labLevels.set(FREE_BUILD_ROOMS.id, await loadLabLevels(registry, FREE_BUILD_ROOMS.id, "sandbox"));
        labLevels.set(CHALLENGE_LAB.id, await loadLabLevels(registry, CHALLENGE_LAB.id, "challenge"));
        labLevels.set(CONTRACT_BOARD.id, await loadLabLevels(registry, CONTRACT_BOARD.id, "contract"));
        labLevels.set(SCIENCE_FAIR.id, await loadLabLevels(registry, SCIENCE_FAIR.id, "fair"));
        labLevels.set(CREATURE_MUSIC.id, await loadLabLevels(registry, CREATURE_MUSIC.id, "creature"));
        appSave = loaded.payload ?? createDefaultAppSave();
        savingBlocked = loaded.futureVersion;
        applySettings();
        const lastBuild = currentLastBuild(appSave);
        if (lastBuild)
            build.replaceAll({ parts: lastBuild.parts, connections: lastBuild.connections });
        else if (build.allParts().length === 0) {
            build.add("structure.block", { x: 8, y: 7.65 });
            build.add("motion.ball", { x: 8, y: 4.2 });
        }
        bootNotices = [];
        const recoveryTitle = document.querySelector("#recovery-title"), recoveryDetail = document.querySelector("#recovery-detail");
        if (loaded.futureVersion) {
            recoveryTitle.textContent = "This save is from a newer WobbleWorks";
            recoveryDetail.textContent = "Update the game to keep playing with it. It hasn't been changed. Anything you do now won't be saved.";
            bootNotices.push("RECOVERY_NOTICE");
        }
        else if (loaded.recovered) {
            recoveryTitle.textContent = "Your workshop was recovered";
            recoveryDetail.textContent = "Part of the newest save was damaged, so we restored the last good save.";
            bootNotices.push("RECOVERY_NOTICE");
        }
        else if (loaded.unreadable) {
            recoveryTitle.textContent = "We couldn't read the old save";
            recoveryDetail.textContent = "A fresh workshop has been started. The damaged save was kept aside, not deleted.";
            bootNotices.push("RECOVERY_NOTICE");
        }
        lastStorage = await storageReport(appSave);
        if (lastStorage.level === "NEARLY_FULL" || await storageWarningNeeded())
            bootNotices.push("STORAGE_WARNING");
        if (!navigator.onLine)
            bootNotices.push("OFFLINE_ENTITLEMENT");
        advanceBootNotice();
    }
    catch (error) {
        loadingError.textContent = error instanceof Error ? `Your save has not been changed. ${error.message}` : "Your save has not been changed.";
        transition("LOADING_FAILURE", true);
    }
}
// ------------------------------------------------------------------ M10: hub, map, profiles, parent area
function ensureRecentProfileActive() {
    if (activeProfile(appSave))
        return;
    const recent = mostRecentProfile(appSave);
    if (recent) {
        appSave = withActiveProfile(appSave, recent.id);
        applySettings();
    }
}
/** CONTINUE: the most recent inventor, at their last safe place (never mid-TEST). */
function continueGame() {
    ensureRecentProfileActive();
    resumeActiveProfile();
}
function resumeActiveProfile() {
    const p = activeProfile(appSave);
    if (!p) {
        startOpening(openingStepFromSave());
        return;
    }
    const lastBuild = p.lastBuild;
    if (lastBuild)
        build.replaceAll({ parts: lastBuild.parts, connections: lastBuild.connections });
    if (!p.openingComplete) {
        startOpening(openingStepFromSave());
        return;
    }
    if (p.location === "MAP") {
        transition("CAMPUS_MAP", true);
        return;
    }
    if (p.location.startsWith("LAB:")) {
        const id = p.location.slice(4);
        if (labIsOpen(id)) {
            showLab(id);
            return;
        }
    }
    showHub();
}
function leaveGameplay() {
    photo.exit();
    editingInvention = undefined;
    lastRun = undefined;
    runMeter = undefined;
    invSave.classList.add("hidden");
    endReplay();
    lastRecording = undefined;
    setupChallenge(undefined);
    contract = undefined;
    setupFair(undefined);
    endCoop(false);
    currentRoom = undefined;
    sandboxBar.classList.add("hidden");
    sandboxDrawer.classList.add("hidden");
    sandboxPrompt.classList.add("hidden");
    if (exp) {
        exp = undefined;
        expPanel.classList.add("hidden");
    }
    stopToBuild();
    openingActive = false;
    labActive = false;
    freeBuildActive = false;
    activeLevel = undefined;
    forceScanner = false;
    openingHud.classList.add("hidden");
    openingSuccess.classList.add("hidden");
    motionHud.classList.add("hidden");
    motionResult.classList.add("hidden");
    updateOpeningTray();
    resetGuidance(undefined);
}
function showHub() {
    leaveGameplay();
    if (!activeProfile(appSave)) {
        transition("TITLE", true);
        return;
    }
    void commit(withLocation(appSave, "HUB"));
    hubQueue = [];
    queueHubMoments();
    transition("HUB", true);
}
function queueHubMoments() {
    // Visitors whose job you just finished pop by first to say thank you.
    hubQueue.push(...visitorReactions);
    visitorReactions = [];
    // Story first (a recording, then the blueprint piece and Bolt's memory when a lab is restored), then the hub changes.
    for (const s of pendingStoryScenes(appSave))
        hubQueue.push({ kind: "STORY", title: s.title, body: s.lines.join(" "), scene: s });
    const moments = [...pendingRestorationMoments(appSave)];
    for (const m of moments)
        hubQueue.push({ kind: "BOLT", title: m.boltLine, body: m.change, onDone: () => { void commit(markRestorationSeen(appSave, [m])); } });
    const unseen = (activeProfile(appSave)?.unseenRewards ?? []).filter(id => { const k = rewardById(id)?.kind; return k === "PART" || k === "TOOL" || k === "KEY_PIECE" || k === "PROP"; });
    if (unseen.length)
        hubQueue.push({ kind: "REWARD", title: "New things for your workshop!", body: unseen.map(id => `${rewardById(id).icon} ${rewardById(id).title}`).join("   "), onDone: () => { void commit(markRewardsSeen(appSave, unseen)); } });
}
function showNextHubMoment() {
    const next = hubQueue[0];
    hubMoment.classList.toggle("hidden", !next || next.kind === "STORY");
    if (!next)
        return;
    if (next.kind === "STORY" && next.scene) {
        if (!storyPlaying)
            playStory([next.scene], () => { hubQueue.shift(); renderHubScreen(); });
        return;
    }
    document.querySelector("#hub-moment-title").textContent = next.title;
    document.querySelector("#hub-moment-body").textContent = next.body;
    document.querySelector("#btn-hub-moment").textContent = next.button ?? "OK!";
    document.querySelector("#btn-hub-moment-later").classList.toggle("hidden", !next.later);
    const face = document.querySelector("#hub-moment-bolt");
    face.replaceChildren(boltArt(activeProfile(appSave)?.equipped.bolt, next.kind === "REWARD" ? "cheer" : "sign"));
    if (next.kind === "BOLT") {
        currentNarration = next.title;
        speakCurrentLine();
    }
    sfx(next.kind === "REWARD" ? 1040 : 760, .08);
}
document.querySelector("#btn-hub-moment-later").addEventListener("click", () => { hubQueue.shift(); renderHubScreen(); });
document.querySelector("#btn-hub-moment").addEventListener("click", () => {
    const done = hubQueue.shift();
    done?.onDone?.();
    renderHubScreen();
});
// ---------------------------------------------------------------- Campus story moments (M20)
const storyEl = document.querySelector("#story-scene");
const storyCard = storyEl.querySelector(".story-card");
const storyKicker = document.querySelector("#story-kicker"), storyTitle = document.querySelector("#story-title"), storySpeaker = document.querySelector("#story-speaker");
const storyLine = document.querySelector("#story-line"), storyBar = document.querySelector("#story-bar"), storyArt = document.querySelector("#story-art");
let storyPlaying;
/** Play story scenes one after another. Each lasts its own 5–20 seconds, moves on by itself, and Skip ends them all. */
function playStory(scenes, done = () => undefined, markSeen = true) {
    if (!scenes.length) {
        done();
        return;
    }
    if (storyPlaying)
        finishStory(false);
    storyPlaying = { scenes, index: 0, line: 0, started: now(), timer: 0, done, markSeen };
    storyEl.classList.remove("hidden");
    showStoryScene();
}
function showStoryScene() {
    const st = storyPlaying;
    if (!st)
        return;
    const s = st.scenes[st.index];
    st.line = 0;
    st.started = now();
    storyCard.className = `story-card kind-${s.kind}`;
    storyKicker.textContent = s.kicker;
    storyTitle.textContent = s.title;
    storySpeaker.textContent = s.kind === "RECORDING" ? `🎙️ ${s.speaker}` : s.speaker === "Bolt" ? "Bolt says:" : s.speaker;
    storyArt.replaceChildren(s.kind === "ENTRY" || s.kind === "MEMORY" ? boltArt(activeProfile(appSave)?.equipped.bolt, s.kind === "MEMORY" ? "sign" : "wave") : (() => { const img = document.createElement("img"); img.alt = ""; const a = assets.getImage(s.art); if (a)
        img.src = a.src; return img; })());
    showStoryLine();
    window.clearInterval(st.timer);
    st.timer = window.setInterval(tickStory, 200);
    sfx(s.kind === "RECORDING" ? 420 : 760, .06);
}
function showStoryLine() { const st = storyPlaying; if (!st)
    return; const s = st.scenes[st.index]; storyLine.textContent = s.lines[st.line] ?? ""; currentNarration = storyLine.textContent; speakCurrentLine(); }
function tickStory() {
    const st = storyPlaying;
    if (!st)
        return;
    const s = st.scenes[st.index];
    const elapsed = (now() - st.started) / 1000;
    storyBar.style.width = `${Math.min(100, elapsed / s.seconds * 100)}%`;
    const perLine = s.seconds / s.lines.length;
    const line = Math.min(s.lines.length - 1, Math.floor(elapsed / perLine));
    if (line !== st.line) {
        st.line = line;
        showStoryLine();
    }
    if (elapsed >= s.seconds)
        nextStory();
}
function nextStory() {
    const st = storyPlaying;
    if (!st)
        return;
    const s = st.scenes[st.index];
    if (st.line < s.lines.length - 1) {
        st.line++;
        st.started = now() - st.line * (s.seconds / s.lines.length) * 1000;
        showStoryLine();
        return;
    }
    if (st.index < st.scenes.length - 1) {
        st.index++;
        showStoryScene();
        return;
    }
    finishStory(true);
}
function finishStory(runDone) {
    const st = storyPlaying;
    if (!st)
        return;
    window.clearInterval(st.timer);
    storyPlaying = undefined;
    storyEl.classList.add("hidden");
    window.speechSynthesis?.cancel?.();
    if (st.markSeen)
        void commit(markStorySeen(appSave, st.scenes));
    if (runDone)
        st.done();
}
document.querySelector("#btn-story-next").addEventListener("click", () => nextStory());
document.querySelector("#btn-story-skip").addEventListener("click", () => { const st = storyPlaying; finishStory(false); st?.done(); });
function renderHubScreen() {
    renderHub(hubRoot, appSave, {
        openMap: () => { mapNote.textContent = "Tap a building."; transition("CAMPUS_MAP"); void commit(withLocation(appSave, "MAP")); },
        openWorkbench: () => showLab(),
        openShelf: () => transition("SHELF"),
        openTrophies: () => transition("TROPHIES"),
        openLocker: () => transition("LOCKER"),
        openFreeBuild: () => showLab(FREE_BUILD_ROOMS.id),
        ...(experimentLabOpen(appSave) ? { openExperiments: () => showLab(EXPERIMENT_LAB.id) } : {}),
        ...(chainWorkshopOpen(appSave) ? { openChain: () => showLab(CHAIN_WORKSHOP.id) } : {}),
        ...(challengeLabOpen(appSave) ? { openChallenges: () => showLab(CHALLENGE_LAB.id) } : {}),
        ...(jobBoardOpen(appSave) ? { openJobBoard: () => showLab(CONTRACT_BOARD.id) } : {}),
        ...(scienceFairOpen(appSave) ? { openFair: () => showLab(SCIENCE_FAIR.id) } : {}),
        ...(creatureMusicOpen(appSave) ? { openCreatures: () => showLab(CREATURE_MUSIC.id) } : {}),
        pokeBolt: () => { const p = activeProfile(appSave); hubQueue.push({ kind: "BOLT", title: p?.openingComplete ? "Fully charged and ready to wobble!" : "Bzzt… still charging…", body: "Tap the Campus Map to pick where to go next." }); showNextHubMoment(); },
        pokeSprocket: () => { sfx(1300, .05); window.setTimeout(() => sfx(1500, .05), 90); hubRoot.querySelector(".station-sprocket")?.classList.add("wiggle"); window.setTimeout(() => hubRoot.querySelector(".station-sprocket")?.classList.remove("wiggle"), 600); },
        meetVisitor: id => {
            // Inventor Contract visitors (M27) ask for help: "Let's help!" accepts their jobs; "Maybe later" leaves them at the door.
            const cv = visitorById(id);
            if (cv) {
                const jobs = contractsOf(cv.id).map(c => c.title).join(" and ");
                hubQueue.push({ kind: "VISITOR", title: `${cv.icon} ${cv.name} says:`, body: `“${cv.ask}” Jobs: ${jobs}.`, button: "Let's help!", later: true, onDone: () => { void commit(acceptVisitor(appSave, cv.id), true); toast(`${cv.name}'s jobs are on the Job Board 📋`); } });
                renderHubScreen();
                return;
            }
            const out = meetVisitor(appSave, id);
            const v = out.gift ? rewardById(out.gift) : undefined;
            void commit(out.save, true);
            hubQueue.push({ kind: "VISITOR", title: "Postie Pip says:", body: `“Heard the test track running! Here — a thank-you from the campus post room.”${v ? `  You got: ${v.icon} ${v.title}` : ""}`, onDone: () => { if (out.gift)
                    void commit(markRewardsSeen(appSave, [out.gift])); } });
            renderHubScreen();
        },
        openProfiles: () => { settingsReturn = "HUB"; transition("PROFILE_SELECT"); }
    });
    showNextHubMoment();
}
function renderMap() {
    renderCampusMap(mapRoot, appSave, {
        back: () => showHub(),
        tapRegion: id => {
            const route = routeToRegion(appSave, id);
            if (route.kind === "ENTER") {
                if (id === "workshop-hub")
                    showHub();
                else if (labLevels.has(id))
                    showLab(id);
                return;
            }
            if (route.kind === "PARENT_GATE") {
                document.querySelector("#lab-locked-title").textContent = OWNERSHIP_CHILD_COPY.title;
                document.querySelector("#lab-locked-body").textContent = OWNERSHIP_CHILD_COPY.body;
                document.querySelector("#lab-locked-button").textContent = OWNERSHIP_CHILD_COPY.button;
                transition("LAB_LOCKED");
                return;
            }
            mapNote.textContent = route.message;
            sfx(300, .05);
        }
    });
}
function renderLockerScreen() {
    renderLocker(lockerRoot, appSave, lockerTab, {
        selectTab: t => { lockerTab = t; renderLockerScreen(); },
        equip: (slot, id) => {
            try {
                let next = equipCosmetic(appSave, slot, id);
                if (id)
                    next = markRewardsSeen(next, [id]);
                void commit(next);
                sfx(880, .04);
            }
            catch { /* not owned */ }
            renderLockerScreen();
        }
    });
}
function openShelfInvention(id) {
    const item = activeProfile(appSave)?.shelf.find(s => s.id === id);
    if (!item)
        return;
    // A shelf item from My Inventions opens that invention (in the room it was built in) ready to save its next version.
    if (item.inventionId && inventionById(appSave, item.inventionId)) {
        openInvention(item.inventionId, item.versionN ?? latestVersion(inventionById(appSave, item.inventionId)).n);
        return;
    }
    startFreeBuild(item.build);
}
/** Empty Workshop Free Build (free tier). Tray = the parts this inventor has unlocked. */
function startFreeBuild(from) {
    leaveGameplay();
    const level = openingLevels.get("opening.free-build");
    const p = activeProfile(appSave);
    const snapshot = from ?? p?.lastBuild;
    build.replaceAll(snapshot ? { parts: snapshot.parts, connections: snapshot.connections } : { parts: [], connections: [] });
    selectedId = undefined;
    dragStart = undefined;
    dragPreview = undefined;
    panStart = undefined;
    camera.reset();
    freeBuildActive = true;
    const allowed = p ? p.unlockedParts : level?.availablePartIds ?? [];
    updateOpeningTray({ ...level, availablePartIds: [...allowed] });
    motionHud.classList.remove("hidden");
    motionTitle.textContent = "Free Build";
    motionObjective.textContent = "Build anything. TEST it. Change it. TEST again.";
    document.querySelector(".motion-badge").textContent = "WORKSHOP";
    resetGuidance(undefined);
    const scanner = (p?.unlockedTools.includes("tool.force-scanner") || p?.unlockedTools.includes("tool.spin-scanner") || p?.unlockedTools.includes("tool.stress-scanner") || p?.unlockedTools.includes("tool.circuit-scanner") || p?.unlockedTools.includes("tool.magnet-scanner") || p?.unlockedTools.includes("tool.flow-scanner") || p?.unlockedTools.includes("tool.air-scanner") || p?.unlockedTools.includes("tool.program-debugger") || p?.unlockedTools.includes("tool.gravity-meter")) ?? false;
    forceScannerButton.textContent = "Scanner";
    forceScannerButton.classList.toggle("hidden", !scanner);
    forceScannerButton.classList.remove("force-on");
    enterWorkshop();
}
function returnToModeMenu() {
    if (labActive) {
        showLab();
        return;
    }
    if (freeBuildActive) {
        showHub();
        return;
    }
    stopToBuild();
    enterWorkshop();
}
// ---- grown-ups
function renderGate(message) {
    renderParentGate(gateRoot, parentGate, message, digit => {
        const result = parentGate.press(digit, now());
        if (result === "PASS") {
            parentNotice = "";
            transition("PARENT_DASHBOARD", true);
            void storageReport(appSave).then(r => { lastStorage = r; if (shell.current() === "PARENT_DASHBOARD")
                renderParent(); });
            return;
        }
        renderGate(result === "FAIL" ? "That wasn't it — here's a new number." : result === "LOCKED" ? "Too many tries. Wait a few seconds." : "");
    }, () => transition(parentReturn, true), () => { parentGate.backspace(); renderGate(""); });
}
function renderParent() {
    renderParentDashboard(parentRoot, appSave, lastStorage, parentNotice, {
        exportBackup: () => {
            try {
                const blob = new Blob([exportBackup(appSave)], { type: "application/json" });
                const a = document.createElement("a");
                a.href = URL.createObjectURL(blob);
                a.download = backupFileName();
                document.body.append(a);
                a.click();
                a.remove();
                window.setTimeout(() => URL.revokeObjectURL(a.href), 2000);
                parentNotice = `Backup saved as ${a.download}.`;
            }
            catch {
                parentNotice = "The backup couldn't be made. Your save is unchanged.";
            }
            renderParent();
        },
        importBackup: file => {
            void file.text().then(async (text) => {
                const result = importBackup(text);
                if (!result.ok) {
                    parentNotice = IMPORT_MESSAGES[result.reason];
                    renderParent();
                    return;
                }
                if (!window.confirm(`Replace everything on this device with this backup (${result.profileCount} inventor${result.profileCount === 1 ? "" : "s"})?`)) {
                    parentNotice = "Import cancelled. Nothing changed.";
                    renderParent();
                    return;
                }
                try {
                    await autosave.flush();
                    // Ownership belongs to this device's purchase record, never to a backup file.
                    const imported = withEntitlement(withoutActiveProfile(result.save), appSave.entitlement);
                    if (savingBlocked) {
                        // A newer-version save is on this device: keep it in its own slot, then use the backup.
                        await saveManager.save(imported, { replaceNewerVersion: true });
                        savingBlocked = false;
                    }
                    else {
                        await saveManager.save(appSave); // current progress becomes the previous-good safety copy
                        await saveManager.save(imported);
                    }
                    appSave = imported;
                    applySettings();
                    parentNotice = `Backup loaded: ${result.profileCount} inventor${result.profileCount === 1 ? "" : "s"}.`;
                }
                catch {
                    parentNotice = "The backup couldn't be saved on this device. Nothing changed.";
                }
                lastStorage = await storageReport(appSave);
                renderParent();
            }).catch(() => { parentNotice = IMPORT_MESSAGES.NOT_JSON; renderParent(); });
        },
        deleteProfile: id => { void commit(withDeletedProfile(appSave, id), true).then(async () => { applySettings(); parentNotice = "Inventor removed."; lastStorage = await storageReport(appSave); renderParent(); }); },
        setFullGameForTesting: owned => { void commit(withEntitlement(appSave, owned ? "OWNED" : "LOCKED"), true).then(() => renderParent()); },
        openLabForTesting: labId => { if (!activeProfile(appSave)) {
            parentNotice = "Choose an inventor first, then open the lab.";
            renderParent();
            return;
        } testingLabs.add(labId); showLab(labId); },
        close: () => transition(parentReturn === "HUB" && activeProfile(appSave) ? "HUB" : parentReturn === "PROFILE_SELECT" ? "PROFILE_SELECT" : "TITLE", true)
    });
}
// ------------------------------------------------------------------ M11: discoveries, clues, why-cards, adaptive help
function currentGuidance() { return observer.guidance(currentAssistance(appSave), guidanceHistory(appSave), now()); }
function resetGuidance(levelId) {
    lastWhy = undefined;
    hideBoltTip();
    whyCard.classList.add("hidden");
    // Retry of the same challenge keeps the clues already opened and what the observer has learned.
    if (levelId && hintTracker?.levelId === levelId) {
        setHint(currentHint);
        return;
    }
    hintTracker = levelId && LEVEL_HINTS[levelId] ? new HintTracker(levelId) : undefined;
    observer.reset(now());
    setHint(undefined);
    hintButton.classList.toggle("hidden", !hintTracker);
    hintButton.classList.remove("offer");
    hintButton.innerHTML = '<span aria-hidden="true">💡</span> Clue';
}
function setHint(view) {
    currentHint = view ?? { tier: 0, line: "", glowParts: [], ghosts: [] };
    applyTrayGlow();
}
function applyTrayGlow() {
    const glow = new Set(currentHint.glowParts);
    if (activeLevel && hintTracker && labActive && currentGuidance().highlightParts)
        for (const id of LEVEL_HINTS[activeLevel.id]?.usefulParts ?? [])
            glow.add(id);
    document.querySelectorAll("[data-part]").forEach(b => b.classList.toggle("hint-glow", glow.has(b.dataset.part)));
}
function showBoltTip(line, pose = "point") {
    showBolt("#bolt-tip-face", pose);
    document.querySelector("#bolt-tip-text").textContent = line;
    boltTip.classList.remove("hidden");
    currentNarration = line;
    speakCurrentLine();
    sfx(620, .045);
}
function hideBoltTip() { boltTip.classList.add("hidden"); }
/** After a failed TEST: maybe a gentle Bolt tip, a pulsing clue button, glowing parts. Never changes the challenge. */
function offerAdaptiveHelp() {
    const g = currentGuidance();
    hintButton.classList.toggle("offer", g.offerHint && Boolean(hintTracker) && (hintTracker?.tier() ?? 3) < 3);
    applyTrayGlow();
    if (g.boltTip) {
        showBoltTip(g.boltTip);
        observer.markTipShown(g.boltTip);
    }
    else if (g.replayInstruction && activeLevel)
        showBoltTip(`Remember the job: ${motionObjective.textContent ?? ""}`);
}
function askForHint() {
    if (!hintTracker || !activeLevel || testMode)
        return;
    const tier = hintTracker.next();
    observer.noteHint();
    const view = hintView(activeLevel.id, activeLevel, tier);
    setHint(view);
    hintButton.classList.remove("offer");
    hintButton.innerHTML = `<span aria-hidden="true">💡</span> Clue <span class="tier">${tier}/3</span>`;
    showBoltTip(view.line, "inspect");
}
function snapToGhost(id) {
    if (!currentHint.ghosts.length)
        return;
    const radius = currentGuidance().snapRadius;
    if (radius <= 0)
        return;
    const part = build.getPart(id);
    if (!part)
        return;
    const ghost = ghostSnap(part.definitionId, part.position, currentHint.ghosts, radius);
    if (!ghost)
        return;
    if (ghost.length !== undefined)
        build.reshape(id, { position: { x: ghost.x, y: ghost.y }, rotation: ghost.rotation, parameters: { length: ghost.length } }); // placement help only
    else {
        build.move(id, { x: ghost.x, y: ghost.y }); // placement help only: the same spot the child could drag to by hand
        if (Math.abs(ghost.rotation - part.rotation) > 1e-6)
            build.rotate(id, ghost.rotation - part.rotation);
    }
    sfx(760, .05);
}
/** Reads the running TEST and writes anything really observed into the Discovery Book. */
function checkRunDiscoveries() {
    const runtime = tests.active();
    if (!runtime)
        return;
    const result = recordRunEvidence(appSave, evaluateRunDiscoveries(build, runtime, activeLevel ? lastRuns.get(activeLevel.id) : undefined), observePartUses(build, runtime));
    if (!result.newDiscoveries.length && !result.newUses.length)
        return;
    void commit(result.save).catch(() => undefined);
    for (const award of result.newDiscoveries) {
        const d = discoveryById(award.id);
        popQueue.push({ kind: d.kind === "SECRET" ? "SECRET" : "NEW", title: d.title, line: d.line });
    }
    for (const use of result.newUses)
        popQueue.push({ kind: "USE", title: `${partTitle(use.partId)}: ${useLabel(use.partId, use.useId)}`, line: "New use on its Part Card!" });
    showNextPop();
}
function showNextPop() {
    if (popBusy)
        return;
    const next = popQueue.shift();
    if (!next) {
        discoveryPop.classList.add("hidden");
        return;
    }
    popBusy = true;
    discoveryPop.className = `discovery-pop${next.kind === "SECRET" ? " secret" : next.kind === "USE" ? " use" : ""}`;
    document.querySelector("#discovery-pop-fx").src = next.kind === "SECRET" ? "./assets/fx/fx.star-splash.webp" : "./assets/fx/fx.star-pop.webp";
    document.querySelector("#discovery-pop-kicker").textContent = next.kind === "SECRET" ? "SECRET EXPERIMENT! ⭐" : next.kind === "USE" ? "PART CARD" : "NEW DISCOVERY!";
    document.querySelector("#discovery-pop-title").textContent = next.title;
    document.querySelector("#discovery-pop-line").textContent = next.line;
    if (next.kind === "SECRET") {
        sfx(880, .08);
        window.setTimeout(() => sfx(1320, .12), 120);
        buzz(80);
    }
    else
        sfx(next.kind === "USE" ? 760 : 1040, .07);
    window.setTimeout(() => { popBusy = false; discoveryPop.classList.add("hidden"); window.setTimeout(showNextPop, 180); }, next.kind === "SECRET" ? 3400 : next.kind === "USE" ? 1800 : 2600);
}
function openWhyCard() {
    if (!lastWhy)
        return;
    const card = lastWhy;
    const choices = document.querySelector("#why-choices");
    const answer = document.querySelector("#why-answer");
    choices.replaceChildren();
    answer.classList.add("hidden");
    for (const reason of card.choices) {
        const b = document.createElement("button");
        const icon = document.createElement("span");
        icon.className = "icon";
        icon.textContent = WHY_CHOICES[reason].icon;
        b.append(icon, document.createTextNode(WHY_CHOICES[reason].label));
        b.addEventListener("click", () => {
            // Never graded or saved: every answer gets the real evidence straight away.
            choices.querySelectorAll("button").forEach(x => { x.classList.remove("picked"); x.disabled = true; });
            b.classList.add("picked");
            choices.querySelectorAll("button")[card.choices.indexOf(card.reason)]?.classList.add("measured");
            answer.textContent = `${reason === card.reason ? "You spotted it!" : "Good thinking!"} Bolt's scanner saw: ${card.evidence}`;
            answer.classList.remove("hidden");
            currentNarration = answer.textContent;
            speakCurrentLine();
            sfx(reason === card.reason ? 980 : 700, .06);
        });
        choices.append(b);
    }
    currentNarration = "Why did that happen?";
    speakCurrentLine();
    showBolt("#why-bolt", "inspect");
    whyCard.classList.remove("hidden");
}
function keepBuilding() { whyCard.classList.add("hidden"); motionResult.classList.add("hidden"); resultShown = false; stopToBuild(); }
function renderBook() {
    renderDiscoveryBook(bookRoot, appSave, id => artManifest[id], bookTab, tab => { bookTab = tab; renderBook(); });
}
hintButton.addEventListener("click", () => { if (gameplayAllowed())
    askForHint(); });
document.querySelector("#btn-bolt-tip-close").addEventListener("click", hideBoltTip);
whyButton.addEventListener("click", openWhyCard);
keepBuildingButton.addEventListener("click", keepBuilding);
document.querySelector("#btn-why-build").addEventListener("click", keepBuilding);
window.setInterval(() => { if (labActive && !testMode && shell.current() === "WORKSHOP" && hintTracker) {
    if (currentGuidance().offerHint && hintTracker.tier() < 3)
        hintButton.classList.add("offer");
    applyTrayGlow();
} }, 5000);
/**
 * Gears only turn when their rims touch exactly, which is too fiddly to do by finger. A dropped gear slides onto
 * the shaft or gear centre it was dropped on, or out to exactly touching the gear beside it. Placement only:
 * the same spots can be reached by hand, and nothing about how gears turn changes. Building Help widens the reach.
 */
function snapGear(id) {
    const part = build.getPart(id);
    if (!part || part.parameters.locked === true)
        return;
    const node = gearNodeFrom(part, registry.get(part.definitionId));
    if (!node)
        return;
    const others = build.allParts().filter(p => p.id !== id).map(p => gearNodeFrom(p, registry.get(p.definitionId))).filter((n) => Boolean(n));
    const target = gearSnapPosition(node, others, currentAssistance(appSave).snapAssist ? 0.45 : 0.2);
    if (!target)
        return;
    if (Math.abs(target.x - part.position.x) > 1e-9 || Math.abs(target.y - part.position.y) > 1e-9)
        build.move(id, { x: target.x, y: target.y });
    // Remember which gear it was snapped against (decides the layer when stacked gears could touch twice).
    for (const c of build.allConnections())
        if (c.config.kind === "ROTATIONAL" && c.config.relationship === "GEAR" && (c.fromPartId === id || c.toPartId === id))
            build.disconnect(c.id);
    if (target.kind === "MESH")
        build.connect(id, "axle", target.targetId, "axle", { kind: "ROTATIONAL", relationship: "GEAR", ratio: 1, invertDirection: true });
    sfx(target.kind === "AXLE" ? 640 : 820, .04);
}
// ------------------------------------------------------------------ Builder Bay beam editing
/** A beam reshaped so its ends sit at two points (middle, angle and length follow). */
function beamFromEnds(p, a, b) {
    const wire = registry.get(p.definitionId).behaviours.some(x => x.kind === "WIRE" || x.kind === "PIPE");
    const length = Math.max(wire ? 0.2 : 0.5, Math.min(wire ? 12 : 6, Math.hypot(b.x - a.x, b.y - a.y)));
    const ang = Math.atan2(b.y - a.y, b.x - a.x);
    return { ...p, position: { x: a.x + Math.cos(ang) * length / 2, y: a.y + Math.sin(ang) * length / 2 }, rotation: ang, parameters: { ...p.parameters, length } };
}
/** Let go of a beam end: it snaps onto a nearby joint, anchor, cliff top or the floor. Placement only. */
function finishBeamEnd(drag) {
    const others = build.allParts().filter(p => p.id !== drag.id);
    const reach = currentAssistance(appSave).snapAssist ? 0.35 : 0.2;
    const target = (isPipePart(drag.id) ? pipeEndSnap(drag.moving.x, drag.moving.y, analyzeFluid(others, id => registry.has(id) ? registry.get(id) : undefined), reach) : isWirePart(drag.id)
        ? wireEndSnap(drag.moving.x, drag.moving.y, analyzeCircuit(others, id => registry.has(id) ? registry.get(id) : undefined), undefined, reach)
        : beamEndSnap(drag.moving.x, drag.moving.y, analyzeStructure(others, id => registry.has(id) ? registry.get(id) : undefined), undefined, reach)) ?? drag.moving;
    const shaped = beamFromEnds(build.getPart(drag.id), drag.fixed, target);
    build.reshape(drag.id, { position: shaped.position, rotation: shaped.rotation, parameters: { length: Number(shaped.parameters.length) } });
    sfx(700, .04);
}
/** A wing, tail, propeller, balloon… dropped next to a flying machine clips onto its slot. Placement only. */
/** Space Centre: a dropped booster, fin, wheel, battery or panel clips onto the nearest rocket or rover slot. Placement only. */
function snapToVessel(id) {
    const part = build.getPart(id);
    if (!part)
        return;
    const def = registry.get(part.definitionId);
    const kind = attachKind(def);
    if (!kind || part.parameters.locked === true)
        return;
    const vessels = build.allParts().filter(p => vesselBehaviour(registry.get(p.definitionId))).sort((a, b) => Math.hypot(a.position.x - part.position.x, a.position.y - part.position.y) - Math.hypot(b.position.x - part.position.x, b.position.y - part.position.y));
    for (const v of vessels) {
        const type = vesselBehaviour(registry.get(v.definitionId)).vessel;
        const target = spaceSnap(part.position.x, part.position.y, kind, { x: v.position.x, y: v.position.y, angle: v.rotation, type });
        if (target) {
            build.move(id, target);
            sfx(780, .04);
            return;
        }
    }
}
function snapToCraft(id) {
    const part = build.getPart(id);
    if (!part)
        return;
    const aero = aeroBehaviour(registry.get(part.definitionId));
    if (!aero)
        return;
    const crafts = build.allParts().filter(p => isCraft(registry.get(p.definitionId))).sort((a, b) => Math.hypot(a.position.x - part.position.x, a.position.y - part.position.y) - Math.hypot(b.position.x - part.position.x, b.position.y - part.position.y));
    for (const c of crafts) {
        const target = craftSnap(part.position.x, part.position.y, aero.part, { x: c.position.x, y: c.position.y, angle: c.rotation });
        if (target) {
            build.move(id, target);
            sfx(780, .04);
            return;
        }
    }
}
/** A dropped beam slides so whichever end is closest to a joint/support lands exactly on it. */
function snapBeam(id) {
    const part = build.getPart(id);
    if (!part || part.parameters.locked === true)
        return;
    const ends = beamEndpoints(part, registry.get(part.definitionId));
    if (!ends)
        return;
    const reach = currentAssistance(appSave).snapAssist ? 0.35 : 0.2;
    const others = build.allParts().filter(p => p.id !== id);
    const lookup = (d) => registry.has(d) ? registry.get(d) : undefined;
    const snap = isPipePart(id) ? (() => { const layout = analyzeFluid(others, lookup); return (x, y) => pipeEndSnap(x, y, layout, reach); })() : isWirePart(id) ? (() => { const layout = analyzeCircuit(others, lookup); return (x, y) => wireEndSnap(x, y, layout, undefined, reach); })() : (() => { const layout = analyzeStructure(others, lookup); return (x, y) => beamEndSnap(x, y, layout, undefined, reach); })();
    const s1 = snap(ends.x1, ends.y1), s2 = snap(ends.x2, ends.y2);
    const d1 = s1 ? Math.hypot(s1.x - ends.x1, s1.y - ends.y1) : Infinity, d2 = s2 ? Math.hypot(s2.x - ends.x2, s2.y - ends.y2) : Infinity;
    if (s1 && s2) {
        const shaped = beamFromEnds(part, s1, s2);
        build.reshape(id, { position: shaped.position, rotation: shaped.rotation, parameters: { length: Number(shaped.parameters.length) } });
        return;
    }
    const shift = d1 <= d2 && s1 ? { x: s1.x - ends.x1, y: s1.y - ends.y1 } : s2 ? { x: s2.x - ends.x2, y: s2.y - ends.y2 } : undefined;
    if (shift)
        build.move(id, { x: part.position.x + shift.x, y: part.position.y + shift.y });
}
async function boot() {
    renderShell();
    const support = detectDeviceSupport();
    if (!support.supported) {
        unsupportedDetail.textContent = `WobbleWorks needs modern browser features: ${support.reasons.join(", ")}.`;
        transition("UNSUPPORTED_DEVICE", true);
        return;
    }
    void loadArt();
    await delay(220);
    await loadAppState();
}
const lifecycle = new LifecycleCoordinator(() => {
    if (testMode && !tests.isPaused()) {
        tests.togglePause();
        lifecyclePaused = true;
    }
}, async () => {
    if (shell.current() === "WORKSHOP" || shell.current() === "PAUSE")
        await persistCurrentBuild(false, true);
    else
        await autosave.flush();
}, () => {
    if (lifecyclePaused && shell.current() === "WORKSHOP") {
        pausedByShell = true;
        transition("PAUSE", true);
    }
});
document.addEventListener("visibilitychange", () => { if (document.hidden)
    void lifecycle.background();
else
    lifecycle.foreground(); });
window.addEventListener("wobbleworks:native-background", () => void lifecycle.background());
window.addEventListener("wobbleworks:native-foreground", () => lifecycle.foreground());
window.addEventListener("offline", () => { if (shell.current() === "TITLE")
    renderTitle(); });
window.addEventListener("online", () => { if (shell.current() === "TITLE")
    renderTitle(); });
const orientationQuery = window.matchMedia?.("(orientation: portrait) and (max-width: 900px)");
orientationQuery?.addEventListener("change", event => {
    if (event.matches && shell.current() === "WORKSHOP") {
        preRotateScreen = "WORKSHOP";
        transition("ROTATE_DEVICE", true);
    }
    else if (!event.matches && shell.current() === "ROTATE_DEVICE")
        transition(preRotateScreen, true);
});
document.querySelectorAll("[data-shell-action]").forEach(button => button.addEventListener("click", async () => {
    if (shell.isInputLocked(now()))
        return;
    const action = button.dataset.shellAction;
    if (action === "start") {
        startOpening(1);
        return;
    }
    if (action === "continue") {
        continueGame();
        return;
    }
    if (action === "play") {
        if (titleVisibility(appSave).startBuilding)
            startOpening(1);
        else
            continueGame();
        return;
    }
    if (action === "info") {
        infoReturn = shell.current() === "PAUSE" ? "PAUSE" : "SETTINGS";
        showInfo(button.dataset.info ?? "help");
        return;
    }
    if (action === "info-back") {
        transition(infoReturn, true);
        return;
    }
    if (action === "extras") {
        settingsReturn = "TITLE";
        transition("EXTRAS");
        return;
    }
    if (action === "free-build") {
        ensureRecentProfileActive();
        startFreeBuild();
        return;
    }
    if (action === "my-inventions") {
        ensureRecentProfileActive();
        inventionsReturn = "EXTRAS";
        showInventionList();
        transition("INVENTIONS");
        return;
    }
    if (action === "open-inventions") {
        inventionsReturn = "SHELF";
        showInventionList();
        transition("INVENTIONS");
        return;
    }
    if (action === "inventions-back") {
        transition(inventionsReturn, true);
        return;
    }
    if (action === "profiles") {
        settingsReturn = "TITLE";
        transition("PROFILE_SELECT");
        return;
    }
    if (action === "settings") {
        settingsReturn = "TITLE";
        transition("SETTINGS");
        return;
    }
    if (action === "settings-from-hub") {
        settingsReturn = "HUB";
        transition("SETTINGS");
        return;
    }
    if (action === "grown-ups") {
        parentReturn = shell.current() === "HUB" ? "HUB" : "TITLE";
        parentGate.reset();
        transition("GROWN_UPS");
        return;
    }
    if (action === "manage-profiles") {
        parentReturn = "PROFILE_SELECT";
        parentGate.reset();
        transition("GROWN_UPS");
        return;
    }
    if (action === "back-title") {
        if (shell.current() === "GROWN_UPS") {
            transition(parentReturn, true);
            return;
        }
        transition(settingsReturn, true);
        settingsReturn = "TITLE";
        return;
    }
    if (action === "open-hub") {
        showHub();
        return;
    }
    if (action === "discovery-book") {
        ensureRecentProfileActive();
        bookReturn = shell.current() === "MOTION_YARD" ? "MOTION_YARD" : "HUB";
        transition("DISCOVERY_BOOK");
        return;
    }
    if (action === "book-back") {
        transition(bookReturn, true);
        return;
    }
    if (action === "open-map") {
        mapNote.textContent = "Tap a building.";
        transition("CAMPUS_MAP", true);
        if (activeProfile(appSave))
            void commit(withLocation(appSave, "MAP"));
        return;
    }
    if (action === "save-quit-hub") {
        await autosave.flush();
        transition("TITLE", true);
        return;
    }
    if (action === "recovery-ok" || action === "warning-ok" || action === "offline-ok") {
        advanceBootNotice();
        return;
    }
    if (action === "retry-load") {
        await loadAppState();
        return;
    }
    if (action === "resume") {
        resumeFromPause();
        return;
    }
    if (action === "return-workshop") {
        returnToModeMenu();
        return;
    }
    if (action === "settings-from-pause") {
        settingsReturn = "PAUSE";
        transition("SETTINGS", true);
        return;
    }
    if (action === "save-quit") {
        stopToBuild();
        try {
            await persistCurrentBuild(false, true);
            if (autosave.lastError)
                throw autosave.lastError;
            transition("TITLE", true);
        }
        catch (error) {
            loadingError.textContent = error instanceof Error ? `Save failed: ${error.message}` : "Save failed.";
            transition("LOADING_FAILURE", true);
        }
    }
}));
// ------------------------------------------------------------------ inventor maker
/** Rewards the inventor being edited owns (a brand-new inventor owns none yet). */
function makerOwnedRewards() { return editingProfileId ? appSave.profiles.find(p => p.id === editingProfileId)?.rewards ?? [] : []; }
function resetMaker(look, style) {
    makerLook = look;
    selectedAvatar = style;
    makerCategory = look ? "skin" : "ready";
    makerHairColour = undefined;
    renderMaker();
}
function renderMaker() {
    const cats = document.querySelector("#maker-cats");
    const grid = document.querySelector("#maker-grid");
    const colours = document.querySelector("#maker-colours");
    const note = document.querySelector("#maker-note");
    const preview = document.querySelector("#maker-preview-card");
    const owned = makerOwnedRewards();
    cats.replaceChildren();
    for (const c of [...LOOK_CATEGORIES, { id: "ready", label: "Ready Looks", icon: "⭐", required: false }]) {
        const b = document.createElement("button");
        b.className = `maker-cat${makerCategory === c.id ? " on" : ""}`;
        b.setAttribute("aria-pressed", String(makerCategory === c.id));
        const ico = document.createElement("span");
        ico.className = "ico";
        ico.textContent = c.icon;
        ico.setAttribute("aria-hidden", "true");
        b.append(ico, document.createTextNode(c.label));
        b.addEventListener("click", () => { makerCategory = c.id; sfx(700, .03); renderMaker(); });
        cats.append(b);
    }
    preview.replaceChildren(makerLook ? renderLook(makerLook, artManifest) : Object.assign(document.createElement("img"), { src: AVATAR_PORTRAITS[selectedAvatar] ?? AVATAR_PORTRAITS.BLUE, alt: "" }));
    grid.replaceChildren();
    colours.replaceChildren();
    note.textContent = "";
    const title = document.querySelector("#maker-options-title");
    if (makerCategory === "ready") {
        title.textContent = "READY-MADE INVENTORS";
        for (const style of PAINTED_AVATARS) {
            const b = document.createElement("button");
            b.className = `maker-piece${!makerLook && selectedAvatar === style ? " on" : ""}`;
            b.setAttribute("aria-label", `${style.toLowerCase()} inventor`);
            const img = document.createElement("img");
            img.src = AVATAR_PORTRAITS[style];
            img.alt = "";
            b.append(img);
            b.addEventListener("click", () => { makerLook = null; selectedAvatar = style; sfx(820, .04); renderMaker(); });
            grid.append(b);
        }
        note.textContent = "Or build your own with the buttons on the left!";
        return;
    }
    const category = makerCategory;
    const meta = LOOK_CATEGORIES.find(c => c.id === category);
    title.textContent = category === "hair" ? "HAIR STYLE" : category === "skin" ? "SKIN TONE" : meta.label.toUpperCase();
    let pieces = piecesFor(category);
    if (category === "hair") {
        const used = HAIR_COLOURS.filter(c => pieces.some(p => p.colour === c.id));
        const all = document.createElement("button");
        all.className = `maker-colour all${makerHairColour ? "" : " on"}`;
        all.setAttribute("aria-label", "All hair colours");
        all.addEventListener("click", () => { makerHairColour = undefined; renderMaker(); });
        colours.append(all);
        for (const c of used) {
            const b = document.createElement("button");
            b.className = `maker-colour${makerHairColour === c.id ? " on" : ""}`;
            b.setAttribute("aria-label", `${c.label} hair`);
            const swatch = c.swatch ? pictureUrl(c.swatch, artManifest) ?? `./assets/ui/${c.swatch}.webp` : undefined;
            b.style.setProperty("--c", swatch ? `url("${swatch}")` : c.css);
            b.addEventListener("click", () => { makerHairColour = c.id; renderMaker(); });
            colours.append(b);
        }
        if (makerHairColour)
            pieces = pieces.filter(p => p.colour === makerHairColour);
    }
    const current = makerLook ? makerLook[category] : undefined;
    const choose = (id) => { makerLook = withPiece(makerLook ?? { ...DEFAULT_LOOK }, category, id, owned); sfx(820, .04); renderMaker(); };
    if (!meta.required) {
        const none = document.createElement("button");
        none.className = `maker-piece${makerLook && !current ? " on" : ""}`;
        none.setAttribute("aria-label", `No ${meta.label.toLowerCase()}`);
        const x = document.createElement("span");
        x.className = "none";
        x.textContent = "✕";
        none.append(x);
        none.addEventListener("click", () => choose(undefined));
        grid.append(none);
    }
    for (const piece of pieces) {
        const unlocked = isPieceUnlocked(piece, owned);
        const b = document.createElement("button");
        b.className = `maker-piece${current === piece.id ? " on" : ""}${unlocked ? "" : " locked"}`;
        b.setAttribute("aria-label", unlocked ? piece.label : `${piece.label} (locked)`);
        const holder = piece.art.length > 1 ? Object.assign(document.createElement("span"), { className: "pairimgs" }) : b;
        for (const a of piece.art) {
            const url = pictureUrl(a, artManifest);
            if (!url)
                continue;
            const img = document.createElement("img");
            img.src = url;
            img.alt = "";
            img.addEventListener("error", () => img.remove());
            holder.append(img);
        }
        if (holder !== b)
            b.append(holder);
        if (piece.reward) {
            const tag = document.createElement("span");
            tag.className = "tag";
            tag.textContent = piece.label;
            b.append(tag);
        }
        b.addEventListener("click", () => {
            if (!unlocked) {
                note.textContent = `🔒 ${piece.label}: earn it in the Motion Yard${rewardInfo(piece.reward) ? " — then it's in your locker and here too!" : "."}`;
                sfx(300, .05);
                return;
            }
            choose(piece.id);
        });
        grid.append(b);
    }
}
document.querySelector("#btn-create-inventor").addEventListener("click", async () => {
    if (shell.isInputLocked(now()))
        return;
    if (editingProfileId) {
        const id = editingProfileId;
        editingProfileId = undefined;
        await commit(withEditedProfile(appSave, id, inventorName.value, selectedAvatar, makerLook), true);
        profileSelectedId = id;
        transition("PROFILE_SELECT", true);
        return;
    }
    const extra = creatingExtraProfile;
    creatingExtraProfile = false;
    document.querySelector("#btn-inventor-cancel").classList.add("hidden");
    try {
        await commit(withCreatedProfile(appSave, inventorName.value, selectedAvatar, Date.now(), makerLook ?? undefined), true);
    }
    catch {
        transition("PROFILE_SELECT", true);
        return;
    }
    applySettings();
    if (extra) {
        startOpening(1);
        return;
    } // a new inventor plays their own opening
    openingDirector.setStep(4);
    loadOpeningStep(4);
});
document.querySelector("#btn-replay-line").addEventListener("click", () => speakCurrentLine(true));
document.querySelector("#btn-skip-line").addEventListener("click", () => {
    if ("speechSynthesis" in window)
        window.speechSynthesis.cancel();
    openingSubtitle.textContent = "";
});
document.querySelector("#btn-opening-next").addEventListener("click", () => void advanceOpening());
goMotionYardButton.addEventListener("click", () => { void saveOpeningProgress(6, true).then(() => showHub()); });
forceScannerButton.addEventListener("click", () => { forceScanner = !forceScanner; forceScannerButton.classList.toggle("force-on", forceScanner); forceScannerButton.setAttribute("aria-pressed", String(forceScanner)); });
document.querySelector("#btn-motion-retry").addEventListener("click", () => { if (activeLevel)
    loadMission(activeLevel.id); });
motionBackButton.addEventListener("click", () => { if (freeBuildActive || resultReturnsToHub) {
    resultReturnsToHub = false;
    showHub();
}
else
    showLab(); });
shelfButton.addEventListener("click", () => {
    const meta = lastMissionLevelId ? missionMeta(lastMissionLevelId) : undefined;
    // M24: a working mission build is also kept in My Inventions (Version 1), and the shelf shows that invention.
    const kept = saveNewInvention(appSave, { name: meta?.title ?? "My Invention", content: contentOf(build.snapshot()), environment: lastMissionLevelId ? `lab:${lastMissionLevelId}` : currentEnvironment(), ...(metricsForCurrent() ? { metrics: metricsForCurrent() } : {}) });
    let next;
    let itemId;
    if (kept.invention) {
        const shelved = showOnShelf(kept.save, kept.invention.id);
        if (shelved.full) {
            shelfButton.textContent = "Shelf is full";
            shelfButton.disabled = true;
            return;
        }
        next = shelved.save;
        itemId = shelfItemFor(next, kept.invention.id)?.id;
        void captureThumb(kept.invention.id, 1);
    }
    else {
        const out = addToShelf(appSave, meta?.title ?? "My Invention", build.snapshot("shelf"), lastMissionLevelId);
        if (out.full) {
            shelfButton.textContent = "Shelf is full";
            shelfButton.disabled = true;
            return;
        }
        next = out.save;
        itemId = out.item?.id;
    }
    // A chain keeps its chain numbers on the shelf too.
    const chainRun = tests.active();
    const saved = itemId && chainRun?.chain.active ? withChainShelfMeta(next, itemId, chainStats(chainRun)) : next;
    void commit(saved, true);
    shelfButton.textContent = "On the shelf ✓";
    shelfButton.disabled = true;
    sfx(840, .06);
});
for (const id of ["#setting-text-scale", "#setting-reduced-motion", "#setting-high-contrast", "#setting-narration", "#setting-subtitles", "#setting-sfx", "#setting-music", "#setting-vibration"]) {
    document.querySelector(id).addEventListener(id === "#setting-text-scale" ? "input" : "change", () => { const s = readSettingsForm(); applySettings(s); void commit(withSettings(appSave, s)); });
}
document.querySelector("#setting-hints").addEventListener("change", event => {
    void commit(withAssistance(appSave, { ...currentAssistance(appSave), boltTips: event.target.checked }));
});
document.querySelector("#btn-settings-reset").addEventListener("click", () => {
    let next = withSettings(appSave, { ...DEFAULT_SETTINGS });
    if (activeProfile(next))
        next = withAssistance(next, { ...DEFAULT_ASSISTANCE });
    void commit(next);
    applySettings();
    syncSettingsForm();
    sfx(660, .05);
});
document.querySelector("#setting-snap").addEventListener("change", event => {
    void commit(withAssistance(appSave, { ...currentAssistance(appSave), snapAssist: event.target.checked }));
});
document.querySelectorAll("[data-part]").forEach(button => button.addEventListener("click", () => {
    if (testMode || replayer || !gameplayAllowed())
        return;
    if (coop && !coop.canUseTray()) {
        toast(coop.pattern === "PICK" ? `It's ${coop.current.name}'s turn to place the part — then they pass back.` : `It's ${coop.current.name}'s turn.`);
        return;
    }
    if (!roomForMore(1))
        return;
    if (openingActive)
        openingDirector.noteInteraction(now());
    const id = button.dataset.part;
    const surfacePart = ["motion.friction-high", "motion.friction-low", "motion.bounce-pad"].includes(id);
    const placed = build.add(id, { x: 8 + Math.random() * 1.5 - 0.75, y: surfacePart ? 8.32 : 3 });
    // Part Picker: the pick is made — over to the other player to place it.
    if (coop?.pattern === "PICK") {
        coop.pick(id);
        window.setTimeout(() => passTurn(), 250);
    }
    if ((openingActive || labActive) && id === "motion.ramp")
        build.rotate(placed.id, -0.18);
    if (id === "builder.column")
        build.rotate(placed.id, -Math.PI / 2);
    selectedId = placed.id;
    sfx(520, 0.035);
}));
ui.test.addEventListener("click", () => {
    if (testMode || !gameplayAllowed())
        return;
    // Co-build, Builder & Predictor: the waiting player guesses what will happen before the TEST starts.
    if (coop?.needsPrediction()) {
        openPredict();
        return;
    }
    if (openingActive)
        openingDirector.noteTest(now());
    const testSnap = build.snapshot();
    // A new TEST is a new attempt: any old result card goes away.
    if (resultShown) {
        motionResult.classList.add("hidden");
        whyCard.classList.add("hidden");
        resultShown = false;
    }
    telemetry.inc("testPresses");
    tests.start(testSnap);
    testMode = true;
    selectedId = undefined;
    ui.mode.textContent = "TEST";
    sfx(700, 0.06);
    runMeter = new RunMeter(contentChecksum(contentOf(testSnap)));
    challengeRun = challenge && activeLevel ? new ChallengeRun(challenge, build, new Set([...(activeLevel.staticObjects ?? []), ...activeLevel.starterParts].map(p => p.id))) : undefined;
    cargoBox.classList.add("locked");
    // M25: record the run (the build + every tap) so it can be replayed exactly.
    recorder = openingActive || exp ? undefined : new ReplayRecorder(testSnap, contentChecksum(contentOf(testSnap)));
    lastRecording = undefined;
    if (exp)
        beginTrial();
    void persistCurrentBuild(true).catch(() => undefined);
});
ui.stop.addEventListener("click", () => {
    if (replayer) {
        endReplay();
        return;
    }
    if (!gameplayAllowed())
        return;
    if (openingActive)
        openingDirector.noteStop();
    if ((labActive || freeBuildActive) && testMode)
        checkRunDiscoveries();
    if (labActive && activeLevel && testMode && !resultShown) {
        const runtime = tests.active();
        const result = evaluateLevel(activeLevel, runtime);
        if (!result.success) {
            lastWhy = diagnoseRun(activeLevel, build, runtime);
            rememberRun();
            if (runtime)
                observer.noteFailure(runtime.snapshotSignature);
            showMotionResult(false, "Change one thing, then TEST again. Fast failure is useful evidence.");
            offerAdaptiveHelp();
        }
    }
    stopToBuild();
    sfx(360, 0.04);
});
ui.pause.addEventListener("click", () => { if (replayer) {
    replayer.paused = !replayer.paused;
    return;
} if (testMode && gameplayAllowed())
    tests.togglePause(); });
ui.menu.addEventListener("click", () => { if (gameplayAllowed())
    openPause(); });
ui.undo.addEventListener("click", () => { if (!testMode && gameplayAllowed())
    build.undo(); });
ui.redo.addEventListener("click", () => { if (!testMode && gameplayAllowed())
    build.redo(); });
ui.del.addEventListener("click", () => { if (!testMode && selectedId && gameplayAllowed()) {
    build.delete(selectedId);
    selectedId = undefined;
} });
ui.rotate.addEventListener("click", () => { if (!testMode && selectedId && gameplayAllowed())
    build.rotate(selectedId, Math.PI / 12); });
ui.resetCamera.addEventListener("click", () => { if (gameplayAllowed())
    camera.reset(); });
document.querySelector("#btn-zoom-in").addEventListener("click", () => { if (gameplayAllowed())
    camera.setZoom(camera.zoom * 1.2); });
document.querySelector("#btn-zoom-out").addEventListener("click", () => { if (gameplayAllowed())
    camera.setZoom(camera.zoom / 1.2); });
ui.tools.addEventListener("click", () => { if (gameplayAllowed())
    editor.toggle(); });
window.addEventListener("wobbleworks:preview-level", (event) => {
    if (!gameplayAllowed())
        return;
    const level = event.detail;
    tests.stop();
    testMode = false;
    build.replaceAll({ parts: [...(level.staticObjects ?? []), ...level.starterParts], connections: level.starterConnections });
    tests.start(build.snapshot(`preview.${level.id}`));
    testMode = true;
    selectedId = undefined;
    ui.mode.textContent = "TEST";
    telemetry.inc("testPresses");
});
window.addEventListener("keydown", event => {
    if (event.key === "F8") {
        event.preventDefault();
        shell.nextSmokeScreen(now());
        renderShell();
        return;
    }
    if (event.key === "Escape" && shell.current() === "WORKSHOP") {
        event.preventDefault();
        openPause();
        return;
    }
    if (event.key === "F2" && gameplayAllowed()) {
        event.preventDefault();
        editor.toggle();
    }
    if (event.key === "Delete" && selectedId && !testMode && gameplayAllowed()) {
        build.delete(selectedId);
        selectedId = undefined;
    }
});
canvas.addEventListener("wheel", event => { if (!gameplayAllowed())
    return; event.preventDefault(); camera.setZoom(camera.zoom * (event.deltaY > 0 ? 0.92 : 1.08)); }, { passive: false });
window.addEventListener("pointerdown", () => void audio.unlock(), { once: true });
function pointerWorld(sample) { const logical = renderer.viewport.screenToLogical(sample.x, sample.y); const worldLogical = camera.logicalToWorld(logical); return { x: worldLogical.x / 100, y: worldLogical.y / 100 }; }
/** Things you can tap while building: switches flip, magnets turn. Locked ones in a level can still be tapped (never moved). */
function tapAction(p) {
    const def = registry.get(p.definitionId);
    // Music Machines: tap an instrument to change its note, a timer switch to change its beat.
    if (def.id === "music.timer")
        return "EVERY";
    if (familyOf(def))
        return "NOTE";
    if (circuitBehaviour(def)?.role === "SWITCH")
        return "FLIP";
    // Space Centre settings: lean the launch pad, choose a booster's burn time, a launcher's power; turn a solar panel.
    if (def.id === "space.launch-pad")
        return "TILT";
    if (def.id === "space.booster")
        return "BURN";
    if (def.behaviours.some(b => b.kind === "LAUNCHER"))
        return "POWER";
    if (def.id === "space.solar-panel")
        return "EIGHTH";
    const fluid = fluidBehaviour(def);
    if (fluid?.role === "VALVE")
        return "VALVE";
    if (def.id === "plumb.nozzle")
        return "AIM";
    if (fanBehaviour(def))
        return "EIGHTH";
    const bar = magnetBehaviour(def);
    if (!bar || bar.electric)
        return undefined;
    return def.id === "magnetic.bar" ? "QUARTER" : "HALF";
}
function lockedSwitchAt(x, y) { return build.allParts().find(p => p.parameters.locked === true && tapAction(p) && Math.abs(p.position.x - x) <= 0.55 && Math.abs(p.position.y - y) <= 0.55)?.id; }
function hitPart(x, y, padding = (labActive || freeBuildActive) ? currentGuidance().touchPadding : 0.18) {
    const parts = [...build.allParts()].reverse();
    return parts.find(p => {
        if (p.parameters.locked === true)
            return false;
        const ends = beamEndpoints(p, registry.get(p.definitionId));
        if (ends) {
            const dx = ends.x2 - ends.x1, dy = ends.y2 - ends.y1, L2 = dx * dx + dy * dy || 1;
            const t = Math.max(0, Math.min(1, ((x - ends.x1) * dx + (y - ends.y1) * dy) / L2));
            return Math.hypot(ends.x1 + dx * t - x, ends.y1 + dy * t - y) <= 0.12 + padding;
        }
        const d = registry.get(p.definitionId);
        const rigid = d.behaviours.find(b => b.kind === "RIGID_BODY");
        const gear = d.behaviours.find(b => b.kind === "GEAR");
        const w = gear?.kind === "GEAR" ? gear.radius * 2 : rigid?.kind === "RIGID_BODY" ? rigid.width : 0.9;
        const h = gear?.kind === "GEAR" ? gear.radius * 2 : rigid?.kind === "RIGID_BODY" ? rigid.height : 0.7;
        return Math.abs(p.position.x - x) <= w / 2 + padding && Math.abs(p.position.y - y) <= h / 2 + padding;
    })?.id;
}
/** During a TEST: hold a button down with a finger, or tap a switch to flip it (the circuit reacts straight away). */
let fingerButton;
function testModeTouch(event, sample) {
    const runtime = tests.active();
    if (!runtime)
        return;
    if (event === "down") {
        const w = pointerWorld(sample);
        const hit = [...build.allParts()].reverse().find(p => { const b = circuitBehaviour(registry.get(p.definitionId)); return (b?.role === "BUTTON" || b?.role === "SWITCH" || fluidBehaviour(registry.get(p.definitionId))?.role === "VALVE") && Math.abs(p.position.x - w.x) <= 0.6 && Math.abs(p.position.y - w.y) <= 0.5; });
        if (!hit)
            return;
        const role = circuitBehaviour(registry.get(hit.definitionId))?.role ?? "SWITCH";
        if (role === "BUTTON") {
            fingerButton = hit.id;
            runtime.pressButton(hit.id, true);
            recorder?.noteInput(runtime.tick, "PRESS", hit.id);
        }
        else {
            runtime.flipSwitch(hit.id);
            recorder?.noteInput(runtime.tick, "FLIP", hit.id);
        }
        sfx(role === "BUTTON" ? 520 : 680, .04);
        buzz(15);
    }
    else if (event !== "move" && fingerButton) {
        runtime.pressButton(fingerButton, false);
        recorder?.noteInput(runtime.tick, "RELEASE", fingerButton);
        fingerButton = undefined;
    }
}
input.on((event, sample) => {
    if (replayer)
        return; // replays are watch-only
    if (coop && !coopAllows(event, sample.id))
        return;
    if (testMode && gameplayAllowed()) {
        testModeTouch(event, sample);
        return;
    }
    if (testMode || !gameplayAllowed())
        return;
    const w = pointerWorld(sample);
    if (event === "down") {
        if (openingActive)
            openingDirector.noteInteraction(now());
        const hit = hitPart(w.x, w.y) ?? lockedSwitchAt(w.x, w.y);
        selectedId = hit;
        const hitBeam = hit ? beamEndpoints(build.getPart(hit), registry.get(build.getPart(hit).definitionId)) : undefined;
        const nearEnd = hitBeam ? (Math.hypot(w.x - hitBeam.x1, w.y - hitBeam.y1) <= 0.35 ? 1 : Math.hypot(w.x - hitBeam.x2, w.y - hitBeam.y2) <= 0.35 ? 2 : 0) : 0;
        if (hit && hitBeam && nearEnd) {
            beamEndDrag = { id: hit, end: nearEnd, fixed: nearEnd === 1 ? { x: hitBeam.x2, y: hitBeam.y2 } : { x: hitBeam.x1, y: hitBeam.y1 }, moving: nearEnd === 1 ? { x: hitBeam.x1, y: hitBeam.y1 } : { x: hitBeam.x2, y: hitBeam.y2 } };
            telemetry.inc("dragAttempts");
        }
        else if (hit) {
            const p = build.getPart(hit);
            dragStart = { id: hit, startWorldX: w.x, startWorldY: w.y, originalX: p.position.x, originalY: p.position.y };
            dragPreview = { ...p.position };
            telemetry.inc("dragAttempts");
        }
        else {
            panStart = { x: sample.x, y: sample.y };
            if (hitPart(w.x, w.y, 0.6))
                observer.noteSelectMiss();
        }
    }
    else if (event === "move") {
        if (beamEndDrag)
            beamEndDrag.moving = { x: Math.max(0.2, Math.min(15.8, w.x)), y: Math.max(0.5, Math.min(8.4, w.y)) };
        else if (dragStart)
            dragPreview = { x: dragStart.originalX + (w.x - dragStart.startWorldX), y: dragStart.originalY + (w.y - dragStart.startWorldY) };
        else if (panStart) {
            camera.pan(sample.x - panStart.x, sample.y - panStart.y);
            panStart = { x: sample.x, y: sample.y };
        }
    }
    else {
        if (beamEndDrag) {
            finishBeamEnd(beamEndDrag);
            beamEndDrag = undefined;
        }
        else if (dragStart && dragPreview) {
            const droppedId = dragStart.id;
            const dropped = build.getPart(droppedId);
            const openingRamp = openingActive && dropped?.definitionId === "motion.ramp" && [2, 5].includes(openingDirector.currentStep());
            const surfacePart = dropped && ["motion.friction-high", "motion.friction-low", "motion.bounce-pad"].includes(dropped.definitionId);
            // A tap (no real drag) on a switch flips it on or off.
            const tap = dropped && Math.hypot(dragPreview.x - dragStart.originalX, dragPreview.y - dragStart.originalY) < 0.06 ? tapAction(dropped) : undefined;
            if (dropped && tap) {
                if (tap === "FLIP")
                    build.reshape(droppedId, { parameters: { closed: dropped.parameters.closed !== true } });
                else if (tap === "NOTE") {
                    const n = Math.round(Number(dropped.parameters.note ?? 1)) % 8 + 1;
                    build.reshape(droppedId, { parameters: { note: n } });
                    sfx(SCALE_HZ[n - 1], .2);
                    dragStart = undefined;
                    dragPreview = undefined;
                    panStart = undefined;
                    return;
                }
                else if (tap === "EVERY") {
                    const beats = [1, 0.5, 2];
                    const i = beats.indexOf(Number(dropped.parameters.every ?? 1));
                    build.reshape(droppedId, { parameters: { every: beats[(i + 1) % beats.length] } });
                }
                else if (tap === "TILT")
                    build.reshape(droppedId, { parameters: { tilt: (Number(dropped.parameters.tilt ?? 0) + 15) % 60 } });
                else if (tap === "BURN") {
                    const burns = [1.5, 1.0, 0.5];
                    const i = burns.indexOf(Number(dropped.parameters.burn ?? 1.5));
                    build.reshape(droppedId, { parameters: { burn: burns[(i + 1) % burns.length] } });
                }
                else if (tap === "POWER") {
                    const l = registry.get(dropped.definitionId).behaviours.find(b => b.kind === "LAUNCHER");
                    const n = l?.kind === "LAUNCHER" ? l.speeds.length : 4;
                    build.reshape(droppedId, { parameters: { power: (Math.round(Number(dropped.parameters.power ?? 0)) + 1) % n } });
                }
                else if (tap === "VALVE")
                    build.reshape(droppedId, { parameters: { open: dropped.parameters.open !== true } });
                else if (tap === "AIM")
                    build.reshape(droppedId, { rotation: dropped.rotation - Math.PI / 12 < -Math.PI / 2 - 1e-6 ? 0.25 : dropped.rotation - Math.PI / 12 });
                else
                    build.reshape(droppedId, { rotation: ((dropped.rotation + (tap === "EIGHTH" ? -Math.PI / 4 : tap === "QUARTER" ? Math.PI / 2 : Math.PI)) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) });
                sfx(tap === "FLIP" && dropped.parameters.closed === true ? 420 : 760, .05);
                dragStart = undefined;
                dragPreview = undefined;
                panStart = undefined;
                return;
            }
            if (dropped?.parameters.locked === true || dropped?.parameters.pinned === true) {
                dragStart = undefined;
                dragPreview = undefined;
                panStart = undefined;
                return;
            }
            if (dragPreview.x < 0.4 || dragPreview.x > 15.6 || dragPreview.y < 0.5 || dragPreview.y > 9)
                observer.noteDragError();
            build.move(droppedId, { x: Math.max(0.4, Math.min(15.6, dragPreview.x)), y: openingRamp ? 7.95 : surfacePart ? 8.32 : Math.max(0.5, Math.min(8.2, dragPreview.y)) });
            snapToGhost(droppedId);
            snapToCraft(droppedId);
            snapToVessel(droppedId);
            snapGear(droppedId);
            snapBeam(droppedId);
            autoSnapOpeningWheel(droppedId);
        }
        dragStart = undefined;
        dragPreview = undefined;
        panStart = undefined;
    }
});
/** Robot Lab (M18): the block editor for the selected robot. Edits go through the build (undo + save see them). */
const programPanel = document.querySelector("#program-panel");
const programState = { selected: undefined };
let programRobotId;
let programPanelKey = "";
function updateProgramPanel() {
    const isBot = (id) => { const p = id ? build.getPart(id) : undefined; return Boolean(p && registry.has(p.definitionId) && isRobot(registry.get(p.definitionId))); };
    if (selectedId && !testMode && isBot(selectedId) && selectedId !== programRobotId) {
        programRobotId = selectedId;
        programState.selected = undefined;
    }
    const part = programRobotId ? build.getPart(programRobotId) : undefined;
    if (!part || !isBot(part.id) || !gameplayAllowed()) {
        if (programRobotId && !part)
            programRobotId = undefined;
        if (!programPanel.classList.contains("hidden")) {
            programPanel.classList.add("hidden");
            programPanelKey = "";
        }
        return;
    }
    const running = testMode ? tests.active()?.robots.robot(part.id)?.current : undefined;
    const key = [part.id, String(part.parameters.program ?? ""), programState.selected ?? "", testMode, running?.join(".") ?? ""].join("|");
    if (key === programPanelKey)
        return;
    programPanelKey = key;
    programPanel.classList.remove("hidden");
    const robotName = part.definitionId === "space.robot-arm" ? "Robot Arm" : (part.tags ?? []).find(t => t !== "robot")?.replace(/^robot[-.]?/, "") || "Robot";
    renderBlockEditor(programPanel, parseProgram(part.parameters.program), programState, next => {
        if (testMode) {
            programPanelKey = "";
            return;
        }
        const text = JSON.stringify(next);
        if (text !== String(part.parameters.program ?? "")) {
            build.reshape(part.id, { parameters: { program: text } });
            sfx(600, .03);
        }
        programPanelKey = "";
    }, { ...(running ? { running } : {}), locked: testMode, robotName: robotName.charAt(0).toUpperCase() + robotName.slice(1), close: () => { programRobotId = undefined; selectedId = undefined; programPanelKey = ""; programPanel.classList.add("hidden"); } });
}
// ---------------------------------------------------------------- Experiment Lab (M22)
// Question → Prediction → Build A → Build B → Test → Compare → Change one thing → Retest → Save.
const expPanel = document.querySelector("#experiment-panel"), expChoiceA = document.querySelector("#exp-choice-a"), expChoiceB = document.querySelector("#exp-choice-b");
const expNote = document.querySelector("#exp-note"), expResult = document.querySelector("#exp-result"), expTrials = document.querySelector("#exp-trials"), expNumbers = document.querySelector("#exp-numbers"), expSave = document.querySelector("#exp-save");
let exp;
function startExperiment(level) {
    const t = level ? experimentTemplate(level.id) : undefined;
    exp = t && level ? { t, level, a: 0, b: Math.min(1, t.options.length - 1), trials: [], ticks: 0, numbers: Boolean(currentGuidance().showMeasurements), saved: false } : undefined;
    expPanel.classList.toggle("hidden", !exp);
    if (!exp)
        return;
    rebuildExperimentRig();
    renderExperimentPanel();
}
function rebuildExperimentRig() { if (!exp)
    return; stopToBuild(); build.replaceAll({ parts: buildExperimentRig(exp.level.staticObjects ?? [], exp.t, exp.a, exp.b), connections: [] }); }
function beginTrial() { if (!exp)
    return; const finish = {}; for (const k of ["a", "b"]) {
    const lane = exp.t.lanes[k];
    if (lane.finishX !== undefined)
        finish[lane.subject] = lane.finishX;
} exp.recorder = new MetricRecorder([exp.t.lanes.a.subject, exp.t.lanes.b.subject], finish); exp.ticks = 0; expResult.classList.add("hidden"); expNote.textContent = "Testing… watch A and B."; }
/** Every simulation tick of a trial: measure; finish when both have a result (or the time is up). */
function experimentTick() {
    const runtime = tests.active();
    if (!exp?.recorder || !runtime || !testMode)
        return;
    const t = exp.t;
    exp.recorder.sample(runtime);
    exp.ticks++;
    const va = exp.recorder.measure(t.metric, t.lanes.a.subject, runtime, build), vb = exp.recorder.measure(t.metric, t.lanes.b.subject, runtime, build);
    const early = exp.ticks > 30 && ((["distanceTravelled", "maximumHeight", "peakSpeed"].includes(t.metric) && exp.recorder.settled()) || (["elapsedTime", "supportedLoad"].includes(t.metric) && va !== undefined && vb !== undefined));
    if (early || exp.ticks >= t.seconds * 60)
        finishTrial(va, vb);
}
function finishTrial(va, vb) {
    if (!exp)
        return;
    exp.recorder = undefined;
    if (!tests.isPaused())
        tests.togglePause();
    if (va === undefined || vb === undefined) {
        expNote.textContent = "One of them didn't finish, so there's nothing fair to compare. Try again!";
        return;
    }
    const v = verdict(exp.t, va, vb);
    const trial = { a: exp.a, b: exp.b, valueA: va, valueB: vb, verdict: v };
    exp.trials = [...exp.trials, trial].slice(-12);
    exp.saved = false;
    sfx(v === "SAME" ? 700 : 980, .07);
    // The trial itself is real evidence: discoveries straight away (the save keeps the whole experiment).
    const awards = experimentDiscoveries(exp.trials, exp.prediction).map(id => ({ id, evidence: EXPERIMENT_CONCEPT_EVIDENCE[id] ?? "Measured in an experiment." }));
    const res = recordRunEvidence(appSave, awards, []);
    if (res.newDiscoveries.length) {
        void commit(res.save);
        for (const a of res.newDiscoveries) {
            const d = discoveryById(a.id);
            if (d)
                popQueue.push({ kind: "NEW", title: d.title, line: d.line });
        }
        showNextPop();
    }
    renderExperimentPanel(true);
}
function experimentWords(t) { return METRIC_WORDS[t.metric]; }
function renderExperimentPanel(showResult = false) {
    if (!exp)
        return;
    const t = exp.t;
    document.querySelector("#exp-question").textContent = t.question;
    document.querySelector("#exp-variable").textContent = `The one thing that changes: ${t.variable}.`;
    document.querySelectorAll("[data-predict]").forEach(b => { b.classList.toggle("on", b.dataset.predict === exp.prediction); b.disabled = exp.trials.length > 0 && exp.prediction !== undefined; });
    expChoiceA.textContent = `A: ${t.options[exp.a].label} ▸`;
    expChoiceB.textContent = `B: ${t.options[exp.b].label} ▸`;
    expChoiceA.disabled = expChoiceB.disabled = testMode && !tests.isPaused();
    const last = exp.trials[exp.trials.length - 1];
    if (!exp.prediction && !exp.trials.length)
        expNote.textContent = "First, guess: which will it be?";
    else if (last && (exp.a !== last.a || exp.b !== last.b)) {
        const now = { ...last, a: exp.a, b: exp.b };
        expNote.textContent = changedOne(last, now) ? "You changed one thing ✓ Press TEST to find out." : "You changed two things — a fair test changes just one.";
    }
    else if (!exp.trials.length)
        expNote.textContent = "Press TEST to try it.";
    if (showResult && last) {
        const words = experimentWords(t);
        expResult.classList.remove("hidden");
        document.querySelector("#exp-verdict").textContent = verdictLine(t, words, last.verdict);
        const max = Math.max(Math.abs(last.valueA), Math.abs(last.valueB), 1e-6);
        document.querySelector("#exp-bar-a").style.width = `${Math.abs(last.valueA) / max * 100}%`;
        document.querySelector("#exp-bar-b").style.width = `${Math.abs(last.valueB) / max * 100}%`;
        const fmt = (v) => exp.numbers && words ? `${v.toFixed(words.decimals)} ${words.unit}` : "";
        document.querySelector("#exp-num-a").textContent = fmt(last.valueA);
        document.querySelector("#exp-num-b").textContent = fmt(last.valueB);
        const first = exp.trials.find(x => x.a !== x.b);
        document.querySelector("#exp-guess").textContent = exp.prediction && first === last ? (last.verdict === exp.prediction ? "Your guess was right!" : "Not what you guessed — that's how we learn!") : last.a === last.b ? "A and B were set up the same: a good check." : "Now change one thing and test again.";
        expNote.textContent = "";
    }
    expNumbers.setAttribute("aria-pressed", String(exp.numbers));
    expSave.disabled = !exp.trials.length || exp.saved;
    expSave.textContent = exp.saved ? "Saved ✓" : "💾 Save";
    expTrials.replaceChildren();
    exp.trials.forEach((tr, i) => {
        const li = document.createElement("li");
        const b = document.createElement("button");
        const w = experimentWords(t);
        b.textContent = `Trial ${i + 1}: ${t.options[tr.a].label} vs ${t.options[tr.b].label} → ${tr.verdict === "SAME" ? "same" : `${tr.verdict} ${t.asks === "MORE" ? w?.more ?? "more" : w?.less ?? "less"}`}  ▶ watch again`;
        b.addEventListener("click", () => { if (!exp)
            return; exp.a = tr.a; exp.b = tr.b; rebuildExperimentRig(); renderExperimentPanel(); ui.test.click(); });
        li.append(b);
        expTrials.append(li);
    });
}
document.querySelectorAll("[data-predict]").forEach(b => b.addEventListener("click", () => { if (!exp)
    return; exp.prediction = b.dataset.predict; sfx(760, .04); renderExperimentPanel(); }));
for (const [btn, lane] of [[expChoiceA, "a"], [expChoiceB, "b"]])
    btn.addEventListener("click", () => { if (!exp)
        return; const n = exp.t.options.length; if (lane === "a")
        exp.a = (exp.a + 1) % n;
    else
        exp.b = (exp.b + 1) % n; rebuildExperimentRig(); renderExperimentPanel(); sfx(640, .04); });
expNumbers.addEventListener("click", () => { if (!exp)
    return; exp.numbers = !exp.numbers; renderExperimentPanel(Boolean(exp.trials.length) && !expResult.classList.contains("hidden")); });
expSave.addEventListener("click", () => {
    if (!exp || !exp.trials.length || exp.saved)
        return;
    const id = exp.t.id;
    let out = withSavedExperiment(appSave, id, exp.trials, exp.prediction).save;
    const discoveries = experimentDiscoveries(exp.trials, exp.prediction);
    // A saved experiment with a real A-vs-B comparison counts as done (stickers, stars).
    if (exp.trials.some(t => t.a !== t.b)) {
        const r = recordMissionSuccess(out, id, { playerPartCount: 0, discoveries });
        out = r.save;
        for (const rid of r.newRewards) {
            const rw = rewardById(rid);
            if (rw)
                popQueue.push({ kind: "NEW", title: `${rw.icon} ${rw.title}`, line: rw.description });
        }
        showNextPop();
    }
    void commit(out, true);
    exp.saved = true;
    sfx(900, .07);
    renderExperimentPanel(!expResult.classList.contains("hidden"));
});
// ---------------------------------------------------------------- Free Build sandboxes (M23)
const sandboxBar = document.querySelector("#sandbox-bar"), sandboxDrawer = document.querySelector("#sandbox-drawer"), sandboxPrompt = document.querySelector("#sandbox-prompt");
const sandboxCap = document.querySelector("#sandbox-cap"), toastEl = document.querySelector("#toast");
let currentRoom;
let promptIndex = 0;
let promptsHidden = false;
let toastTimer = 0;
function toast(text) { toastEl.textContent = text; toastEl.classList.remove("hidden"); window.clearTimeout(toastTimer); toastTimer = window.setTimeout(() => toastEl.classList.add("hidden"), 2600); }
/** Part caps keep big builds smooth: warn near the cap, and stop adding at it (room furniture doesn't count). */
function partCap() { return currentRoom?.partCap ?? (labActive ? CAMPAIGN_PART_CAP : SANDBOX_PART_CAP); }
function roomForMore(n) {
    const st = capStatus(build.allParts(), partCap());
    if (st.count + n > st.cap) {
        toast(`Your build is full (${st.cap} parts). That keeps it running smoothly — try removing something first.`);
        sfx(300, .08);
        return false;
    }
    if (st.count + n >= Math.floor(st.cap * 0.8) && st.count < Math.floor(st.cap * 0.8))
        toast(`Nearly full: ${st.count + n} of ${st.cap} parts.`);
    return true;
}
function updateSandboxCap() { if (!currentRoom)
    return; const st = capStatus(build.allParts(), partCap()); sandboxCap.textContent = `${st.count} / ${st.cap}`; sandboxCap.classList.toggle("warn", st.warn && !st.full); sandboxCap.classList.toggle("full", st.full); }
function drawRoomBackdrop(room) { if (room.theme === "motion")
    renderer.drawMotionYardBackdrop();
else if (room.theme === "builder")
    renderer.drawBuilderBayBackdrop();
else if (hasLabBackdrop(room.theme))
    renderer.drawLabBackdrop(room.theme, now() / 1000); }
function startSandbox(level) {
    const room = sandboxById(level.id);
    if (!room)
        return;
    leaveGameplay();
    currentRoom = room;
    promptIndex = 0;
    const p = activeProfile(appSave);
    const saved = p?.lastBuild?.id === `sandbox:${room.id}` ? p.lastBuild : undefined;
    let parts = saved ? [...saved.parts] : [...(level.staticObjects ?? [])];
    if (!saved)
        for (const m of room.defaultModifiers ?? [])
            parts = withModifier(parts, m, true);
    build.replaceAll({ parts, connections: saved ? saved.connections : [] });
    selectedId = undefined;
    dragStart = undefined;
    dragPreview = undefined;
    panStart = undefined;
    camera.reset();
    freeBuildActive = true;
    const allowed = room.robotFloor ? [] : p ? sandboxTrayParts(p.unlockedParts) : [];
    updateOpeningTray({ ...level, availablePartIds: [...allowed] });
    motionHud.classList.remove("hidden");
    motionTitle.textContent = room.title;
    motionObjective.textContent = "Build anything. TEST it. Change it. TEST again.";
    document.querySelector(".motion-badge").textContent = "FREE BUILD";
    resetGuidance(undefined);
    forceScannerButton.textContent = "Scanner";
    forceScannerButton.classList.remove("hidden", "force-on");
    sandboxBar.classList.remove("hidden");
    showPrompt();
    updateSandboxCap();
    enterWorkshop();
}
function showPrompt() { if (!currentRoom || promptsHidden) {
    sandboxPrompt.classList.add("hidden");
    return;
} document.querySelector("#sandbox-prompt-text").textContent = `💡 ${currentRoom.prompts[promptIndex % currentRoom.prompts.length]}`; sandboxPrompt.classList.remove("hidden"); }
document.querySelector("#btn-prompt-next").addEventListener("click", () => { promptIndex++; showPrompt(); });
document.querySelector("#btn-prompt-close").addEventListener("click", () => { promptsHidden = true; showPrompt(); });
function openDrawer(kind) {
    if (!currentRoom || testMode || replayer)
        return;
    if (!sandboxDrawer.classList.contains("hidden") && sandboxDrawer.dataset.kind === kind) {
        sandboxDrawer.classList.add("hidden");
        return;
    }
    sandboxDrawer.dataset.kind = kind;
    sandboxDrawer.replaceChildren();
    const room = currentRoom;
    const btn = (icon, label, on, active = false) => { const b = document.createElement("button"); if (active)
        b.classList.add("on"); const i = document.createElement("span"); i.className = "ico"; i.textContent = icon; const t = document.createElement("span"); t.textContent = label; b.append(i, t); b.addEventListener("click", on); sandboxDrawer.append(b); };
    const head = (text) => { const h = document.createElement("h3"); h.textContent = text; sandboxDrawer.append(h); };
    if (kind === "ideas") {
        promptsHidden = false;
        showPrompt();
        sandboxDrawer.classList.add("hidden");
        return;
    }
    if (kind === "spawn") {
        head("Drop something in");
        const list = room.robotFloor ? SPAWN_CATALOGUE.filter(s => s.definitionId === "robot.bot") : SPAWN_CATALOGUE.filter(s => s.definitionId !== "robot.bot");
        for (const s of list)
            btn(s.icon, s.type, () => { if (!roomForMore(1))
                return; const placed = build.add(s.definitionId, { x: 6 + Math.random() * 4, y: s.definitionId === "motion.goal-zone" ? 8 : 2 }); selectedId = placed.id; sfx(620, .04); updateSandboxCap(); });
    }
    if (kind === "starters") {
        head("Starter machines");
        for (const id of room.templates) {
            const t = templateById(id);
            if (!t)
                continue;
            btn("🧩", t.title, () => { if (!roomForMore(t.parts.length))
                return; for (const p of placeTemplate(t, 7, 5)) {
                const placed = build.add(p.definitionId, p.position, p.parameters);
                if (p.rotation)
                    build.rotate(placed.id, p.rotation);
            } sfx(700, .05); updateSandboxCap(); sandboxDrawer.classList.add("hidden"); });
        }
    }
    if (kind === "room") {
        head("Change the room");
        const on = new Set(activeModifiers(build.allParts()));
        for (const m of room.modifiers) {
            const l = MODIFIER_LABELS[m];
            btn(l.icon, l.label, () => { const parts = withModifier(build.allParts(), m, !on.has(m)); const connections = build.allConnections(); build.replaceAll({ parts, connections }); sfx(on.has(m) ? 420 : 760, .05); openDrawer("room"); openDrawer("room"); }, on.has(m));
        }
        if (!room.modifiers.length) {
            const p = document.createElement("p");
            p.textContent = "This room has no extra settings.";
            sandboxDrawer.append(p);
        }
    }
    sandboxDrawer.classList.remove("hidden");
}
document.querySelectorAll("[data-sb]").forEach(b => b.addEventListener("click", () => openDrawer(b.dataset.sb)));
// ---------------------------------------------------------------- Chain Reaction Workshop (M21)
const chainHud = document.querySelector("#chain-hud"), chainCount = document.querySelector("#chain-count"), chainLast = document.querySelector("#chain-last");
let chainShown = -1;
let capFrame = 0;
/** The live counter: the longest real cause → effect sequence so far, and the newest step. */
function updateChainHud(runtime) {
    const on = Boolean(runtime?.chain.active && testMode);
    chainHud.classList.toggle("hidden", !on);
    if (!on || !runtime) {
        chainShown = -1;
        return;
    }
    const n = runtime.chain.longest();
    if (n === chainShown)
        return;
    chainShown = n;
    chainCount.textContent = String(n);
    const e = runtime.chain.edges[runtime.chain.edges.length - 1];
    const name = (id) => registry.get(build.getPart(id)?.definitionId ?? "chain.counter").displayName;
    chainLast.textContent = e ? `${name(e.causeId)} → ${name(e.effectId)}` : "";
    chainHud.classList.remove("bump");
    void chainHud.offsetWidth;
    chainHud.classList.add("bump");
    if (n > 0)
        sfx(500 + Math.min(n, 20) * 40, .03);
}
/** After a chain run: update personal records (kept in the profile's records table) and say so. */
function noteChainRun() {
    const runtime = tests.active();
    if (!runtime?.chain.active || !activeProfile(appSave))
        return "";
    const stats = chainStats(runtime);
    const out = withChainRecords(appSave, stats);
    if (out.beaten.length)
        void commit(out.save);
    return ` Chain: ${stats.longest} step${stats.longest === 1 ? "" : "s"}${out.beaten.includes("longest") ? " — a new record!" : "."}`;
}
// ---------------------------------------------------------------- My Inventions & Photo Mode (M24)
const saveInventionButton = document.querySelector("#btn-save-invention"), photoButton = document.querySelector("#btn-photo");
const invSave = document.querySelector("#invention-save"), invSaveName = document.querySelector("#inv-save-name"), invSaveVersion = document.querySelector("#inv-save-version"), invSaveNote = document.querySelector("#inv-save-note");
const inventionsRoot = document.querySelector("#inventions-root");
/** The invention the build on screen came from (so 💾 Save makes its next version). */
let editingInvention;
let runMeter;
/** What the last finished TEST measured, and for exactly which build. */
let lastRun;
let inventionsReturn = "EXTRAS";
function currentEnvironment() { if (currentRoom && freeBuildActive)
    return `sandbox:${currentRoom.id}`; if (labActive && activeLevel)
    return `lab:${activeLevel.id}`; return "workshop"; }
/** Results for the build on screen — only if the TEST measured this exact build. */
function metricsForCurrent() {
    const sum = contentChecksum(contentOf(build.snapshot()));
    const live = runMeter?.buildChecksum === sum ? runMeter.result() : undefined;
    return live ?? (lastRun?.checksum === sum ? lastRun.metrics : undefined);
}
/** A clean picture of the build for My Inventions (no selection glow). */
async function captureThumb(id, n) {
    const keep = selectedId;
    selectedId = undefined;
    render();
    selectedId = keep;
    // Crop to the parts the player placed (room furniture left out), with a margin, so the machine fills the picture.
    const parts = build.allParts().filter(p => p.parameters.locked !== true);
    const k = canvas.width / Math.max(1, canvas.getBoundingClientRect().width);
    const px = (x, y) => { const l = camera.worldToLogical({ x: x * 100, y: y * 100 }); const s = renderer.viewport.logicalToScreen(l.x, l.y); return { x: s.x * k, y: s.y * k }; };
    let crop;
    if (parts.length) {
        const pts = parts.flatMap(p => [px(p.position.x - 1.2, p.position.y - 1.2), px(p.position.x + 1.2, p.position.y + 1.2)]);
        const xs = pts.map(p => p.x), ys = pts.map(p => p.y);
        crop = { x: Math.min(...xs), y: Math.min(...ys), w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys) };
    }
    const pic = thumbnailFrom(canvas, 320, 180, crop);
    if (pic)
        await thumbs.put(thumbKey(id, n), pic);
}
const SAVE_PROBLEMS = {
    NO_PROFILE: "Make an inventor first to save inventions.",
    FULL: "My Inventions is full (40). Delete one you don't need, then save again.",
    VERSIONS_FULL: "This invention already has 25 versions. Tidy up old ones (My Inventions → Storage) or save it as a new invention.",
    TOO_BIG: "Your invention space is full. Tidy up old versions in My Inventions → Storage, then save again.",
    DAMAGED: "The newest saved version couldn't be rebuilt exactly, so save this as a new invention instead.",
    MISSING: "That invention isn't there any more — save this as a new invention."
};
function openSaveDialog() {
    if (!activeProfile(appSave)) {
        toast(SAVE_PROBLEMS.NO_PROFILE);
        return;
    }
    const inv = editingInvention ? inventionById(appSave, editingInvention) : undefined;
    invSaveVersion.classList.toggle("hidden", !inv);
    if (inv) {
        invSaveVersion.textContent = `💾 Save as Version ${latestVersion(inv).n + 1} of "${inv.name}"`;
        invSaveName.value = `${inv.name.slice(0, 34)} (new)`;
    }
    else
        invSaveName.value = motionTitle.textContent && labActive ? motionTitle.textContent.slice(0, 40) : suggestedName(appSave);
    // Made together: it still belongs to this device's inventor (profile-local), and says who helped.
    if (coop) {
        const partner = coop.players.find(p => p.profileId !== activeProfile(appSave)?.id) ?? coop.players[1];
        invSaveName.value = togetherName(invSaveName.value.replace(/ \(with [^)]*\)$/, ""), partner);
    }
    const m = metricsForCurrent();
    invSaveNote.textContent = m ? "This TEST's results will be saved with it, so you can compare versions." : "Tip: TEST it first, and its results are saved too.";
    invSave.classList.remove("hidden");
    window.setTimeout(() => invSaveName.focus(), 0);
}
async function finishSave(r, label) {
    if (r.reason) {
        toast(SAVE_PROBLEMS[r.reason] ?? "Couldn't save that.");
        return;
    }
    if (r.unchanged && r.version) {
        toast(`Nothing has changed since Version ${r.version.n} — it's already saved.`);
        invSave.classList.add("hidden");
        return;
    }
    if (!r.invention || !r.version)
        return;
    editingInvention = r.invention.id;
    invSave.classList.add("hidden");
    await commit(r.save, true);
    await captureThumb(r.invention.id, r.version.n);
    toast(label(r.version.n, r.invention.name));
    sfx(840, .06);
}
saveInventionButton.addEventListener("click", () => { if (gameplayAllowed())
    openSaveDialog(); });
invSaveVersion.addEventListener("click", () => { if (!editingInvention)
    return; const m = metricsForCurrent(); void finishSave(saveVersion(appSave, editingInvention, contentOf(build.snapshot()), Date.now(), m ? { metrics: m } : {}), (n, name) => `Saved as Version ${n} of "${name}"!`); });
document.querySelector("#inv-save-new").addEventListener("click", () => { const m = metricsForCurrent(); void finishSave(saveNewInvention(appSave, { name: invSaveName.value, content: contentOf(build.snapshot()), environment: currentEnvironment(), ...(m ? { metrics: m } : {}) }), (_n, name) => `Saved "${name}" in My Inventions!`); });
document.querySelector("#inv-save-cancel").addEventListener("click", () => invSave.classList.add("hidden"));
function placeName(env) {
    if (env.startsWith("sandbox:"))
        return `Free Build — ${sandboxById(env.slice(8))?.title ?? "a room"}`;
    if (env.startsWith("lab:")) {
        const id = env.slice(4);
        const lab = PLAY_SETS.find(l => l.missions.some(m => m.id === id));
        return `${lab?.title ?? "a lab"} — ${missionMeta(id)?.title ?? id}`;
    }
    return "the Workshop (Free Build)";
}
/** Opens one version, in the room or mission it was built in when that is still open (otherwise in Free Build). */
function openInvention(id, n) {
    const inv = inventionById(appSave, id);
    const content = inv ? resolveVersion(inv, n) : undefined;
    if (!inv || !content) {
        toast("That version can't be rebuilt exactly, so it wasn't opened.");
        return;
    }
    const env = inv.environment;
    if (env.startsWith("sandbox:") && labLevels.get(FREE_BUILD_ROOMS.id)?.get(env.slice(8)) && (sandboxOpen(appSave, env.slice(8)) || testingLabs.has(FREE_BUILD_ROOMS.id)))
        startSandbox(labLevels.get(FREE_BUILD_ROOMS.id).get(env.slice(8)));
    else if (env.startsWith("lab:") && labLevels.get(labOfLevel(env.slice(4)))?.get(env.slice(4)) && labMissionUnlocked(labDef(labOfLevel(env.slice(4))), env.slice(4), completedSet()) && labIsOpen(labOfLevel(env.slice(4))))
        loadMission(env.slice(4));
    else
        startFreeBuild();
    build.replaceAll(content);
    selectedId = undefined;
    updateSandboxCap();
    editingInvention = id;
    lastRun = undefined;
    const newest = latestVersion(inv).n;
    toast(n === newest ? `"${inv.name}" Version ${n}. Change it, then 💾 Save to make Version ${n + 1}.` : `"${inv.name}" Version ${n}. Saving it makes a new Version ${newest + 1} — the old ones stay.`);
}
function afterLibraryChange(next, prune = false) { void commit(next, true).then(() => prune ? thumbs.prune(liveThumbKeys(appSave)) : 0); renderInventionScreen(); }
function renderInventionScreen() {
    renderInventions(inventionsRoot, appSave, {
        open: (id, n) => openInvention(id, n),
        duplicate: (id, n) => { const r = duplicateInvention(appSave, id, n); if (r.reason || !r.invention) {
            toast(SAVE_PROBLEMS[r.reason ?? "MISSING"]);
            return;
        } void thumbs.copy(thumbKey(id, n), thumbKey(r.invention.id, 1)); showInventionDetail(r.invention.id); afterLibraryChange(r.save); toast(`Made a copy: "${r.invention.name}".`); },
        restore: (id, n) => { const r = restoreAsNewVersion(appSave, id, n); if (r.reason) {
            toast(SAVE_PROBLEMS[r.reason]);
            return;
        } if (r.unchanged) {
            toast("The newest version is already exactly that build.");
            return;
        } void thumbs.copy(thumbKey(id, n), thumbKey(id, r.version.n)); afterLibraryChange(r.save); toast(`Version ${n} is back as Version ${r.version.n}. Version ${n} is still there too.`); },
        toggleShelf: (id, n) => { if (shelfItemFor(appSave, id)) {
            afterLibraryChange(takeOffShelf(appSave, id));
            return;
        } const r = showOnShelf(appSave, id, n); if (r.full) {
            toast("The Workshop shelf is full (24). Take something off it first.");
            return;
        } afterLibraryChange(r.save); toast("It's on the Workshop shelf now! ⭐"); },
        rename: (id, name) => afterLibraryChange(renameInvention(appSave, id, name)),
        remove: id => { if (editingInvention === id)
            editingInvention = undefined; afterLibraryChange(deleteInvention(appSave, id), true); },
        tidy: id => { const inv = inventionById(appSave, id); if (!inv)
            return; const r = tidyVersions(appSave, id, tidySuggestion(appSave, inv)); if (r.reason) {
            toast("That invention's history couldn't be checked, so nothing was removed.");
            return;
        } afterLibraryChange(r.save, true); toast(`Removed ${r.removed} old version${r.removed === 1 ? "" : "s"}.`); },
        cleanPictures: () => thumbs.prune(liveThumbKeys(appSave)),
        pictureBytes: () => thumbs.bytes(),
        thumb: key => thumbs.get(key),
        placeName,
        partName: defId => registry.has(defId) ? registry.get(defId).displayName : defId,
        rerender: renderInventionScreen
    });
}
const photo = new PhotoMode({
    stage: document.querySelector(".stage"), canvas: canvas, app: appElement,
    pan: (dx, dy) => camera.pan(dx, dy), zoom: f => camera.setZoom(camera.zoom * f),
    stickers: () => photoStickers(activeProfile(appSave)?.rewards ?? []),
    boltUrl: pose => boltPoseUrl(pose), sprocket: () => sprocketArt(activeProfile(appSave)?.equipped.sprocket),
    title: () => (editingInvention ? inventionById(appSave, editingInvention)?.name : undefined) ?? motionTitle.textContent ?? "invention",
    toast,
    // The photo can be the invention's picture only when the build on screen IS its newest version.
    useAsCover: () => { const inv = editingInvention ? inventionById(appSave, editingInvention) : undefined; if (!inv || contentChecksum(contentOf(build.snapshot())) !== latestVersion(inv).checksum)
        return undefined; const key = thumbKey(inv.id, latestVersion(inv).n); return d => thumbs.put(key, d); },
    onExit: () => undefined
});
photoButton.addEventListener("click", () => { if (!gameplayAllowed())
    return; selectedId = undefined; invSave.classList.add("hidden"); photo.enter(); });
// ---------------------------------------------------------------- Replay, slow motion & machine camera (M25)
const replayBar = document.querySelector("#replay-bar"), replayFill = document.querySelector("#replay-fill"), replayMarks = document.querySelector("#replay-marks"), replayTime = document.querySelector("#replay-time");
const replayPlay = document.querySelector("#replay-play"), replayProblem = document.querySelector("#replay-problem");
const replayButton = document.querySelector("#btn-replay"), slowButton = document.querySelector("#btn-slow"), followButton = document.querySelector("#btn-follow"), followMenu = document.querySelector("#follow-menu");
const watchReplayButton = document.querySelector("#btn-watch-replay");
/** The TEST being recorded right now, and the last finished one (kept while the build is unchanged). */
let recorder, lastRecording;
let replayer;
let replayNote = "";
let markerIndex = 0;
let slowMo = false;
let following;
let zoomBeforeFollow = 1;
const FOLLOW_ICONS = { BALL: "⚽", BOLT: "🤖", ROBOT: "🦾", VEHICLE: "🚗", PART: "🔩" };
/** Slow motion slows the clock; every physics step stays exactly the same size, so results never change. */
function setSlow(on) { slowMo = on; clock.setSpeed(on ? 0.25 : 1); slowButton.classList.toggle("on", on); slowButton.setAttribute("aria-pressed", String(on)); }
function setFollow(partId, announce = true) {
    if (!partId && !following)
        return;
    if (partId && !following)
        zoomBeforeFollow = camera.zoom;
    following = partId;
    followMenu.classList.add("hidden");
    followButton.classList.toggle("on", Boolean(partId));
    if (partId) {
        camera.setZoom(Math.max(camera.zoom, 1.6));
        if (announce)
            toast(`Following the ${registry.get(build.getPart(partId)?.definitionId ?? "motion.ball").displayName}.`);
    }
    else
        camera.setZoom(zoomBeforeFollow);
}
function updateFollowCamera() {
    if (!following)
        return;
    const rt = replayer ? replayer.runtime : tests.active();
    if (!rt)
        return;
    const p = followPoint(rt, following);
    if (p)
        camera.centerOn(p.x * 100, p.y * 100, 0.18);
}
function openFollowMenu() {
    const rt = replayer ? replayer.runtime : tests.active();
    if (!rt)
        return;
    if (!followMenu.classList.contains("hidden")) {
        followMenu.classList.add("hidden");
        return;
    }
    followMenu.replaceChildren();
    const head = document.createElement("strong");
    head.textContent = "🎥 Follow with the camera";
    followMenu.append(head);
    const list = followTargets(rt, build.allParts());
    if (!list.length) {
        const p = document.createElement("p");
        p.textContent = "Nothing is moving yet.";
        followMenu.append(p);
    }
    for (const t of list) {
        const b = document.createElement("button");
        b.textContent = `${FOLLOW_ICONS[t.kind]} ${registry.get(build.getPart(t.partId).definitionId).displayName}`;
        b.classList.toggle("on", following === t.partId);
        b.addEventListener("click", () => setFollow(t.partId));
        followMenu.append(b);
    }
    if (following) {
        const b = document.createElement("button");
        b.textContent = "✕ Stop following";
        b.addEventListener("click", () => setFollow(undefined));
        followMenu.append(b);
    }
    followMenu.classList.remove("hidden");
}
/** A recording can be replayed only while the build on screen is exactly the build that was tested. */
function replayAvailable() {
    if (!lastRecording || testMode || replayer || exp || openingActive || !(labActive || freeBuildActive))
        return undefined;
    return contentChecksum(contentOf(build.snapshot())) === lastRecording.buildChecksum ? lastRecording : undefined;
}
function startReplay(toProblem = false) {
    if (testMode)
        stopToBuild();
    const rec = replayAvailable();
    if (!rec) {
        toast("Change nothing and TEST again to make a new replay.");
        return;
    }
    motionResult.classList.add("hidden");
    whyCard.classList.add("hidden");
    resultShown = false;
    selectedId = undefined;
    replayer = new ReplayPlayer(registry, rec);
    markerIndex = 0;
    appElement.classList.add("replaying");
    sandboxDrawer.classList.add("hidden");
    ui.mode.textContent = "REPLAY";
    replayBar.classList.remove("hidden");
    replayNote = "";
    replayMarks.replaceChildren();
    for (const mk of rec.markers) {
        const d = document.createElement("span");
        d.className = "replay-mark";
        d.style.left = `${(mk.tick / Math.max(1, rec.length)) * 100}%`;
        d.title = mk.label;
        replayMarks.append(d);
    }
    replayProblem.classList.toggle("hidden", !rec.markers.length);
    if (toProblem && rec.markers.length)
        jumpToProblem();
}
function jumpToProblem() {
    const rp = replayer;
    if (!rp)
        return;
    const marks = rp.recording.markers;
    if (!marks.length)
        return;
    const mk = marks[markerIndex % marks.length];
    markerIndex++;
    rp.jumpTo(Math.max(0, mk.tick - 60));
    rp.paused = false;
    setSlow(true);
    replayNote = mk.label;
    if (marks.length > 1)
        replayProblem.textContent = `⚠️ Next problem (${(markerIndex % marks.length) + 1}/${marks.length})`;
    const part = build.getPart(mk.partId);
    if (part)
        setFollow(mk.partId, false);
}
function endReplay() {
    if (!replayer)
        return;
    replayer.destroy();
    replayer = undefined;
    replayBar.classList.add("hidden");
    appElement.classList.remove("replaying");
    ui.mode.textContent = "BUILD";
    setSlow(false);
    setFollow(undefined);
    camera.reset();
}
function updateReplayUi() {
    const live = testMode || Boolean(replayer);
    const can = (labActive || freeBuildActive) && !openingActive;
    slowButton.hidden = !(live && can);
    followButton.hidden = !(live && can);
    if (!live)
        followMenu.classList.add("hidden");
    const avail = !live && can && Boolean(replayAvailable());
    if (replayButton.hidden === avail)
        replayButton.hidden = !avail;
    const rp = replayer;
    if (!rp)
        return;
    const len = Math.max(1, rp.recording.length);
    replayFill.style.width = `${Math.min(100, (rp.tick / len) * 100)}%`;
    const fast = rp.fastForwarding;
    replayPlay.textContent = rp.done ? "⏮ Again" : rp.paused ? "▶ Play" : "⏸ Pause";
    replayTime.textContent = `${fast ? "⏩ " : ""}${(rp.tick / 60).toFixed(1)} s of ${(len / 60).toFixed(1)} s${rp.done ? " — the end" : ""}${replayNote && !rp.done ? " · " + replayNote : ""}${rp.recording.truncated ? " (first 60 s)" : ""}`;
    if (!fast && replayNote === "Fast-forwarding…")
        replayNote = "";
}
/** Red rings where the recorded problems happened, shown around the moment they happened. */
function drawReplayMarkers(rp) {
    const c = renderer.ctx;
    const t = rp.tick;
    for (const mk of rp.recording.markers) {
        if (t < mk.tick - 15 || t > mk.tick + 150)
            continue;
        const p = followPoint(rp.runtime, mk.partId) ?? build.getPart(mk.partId)?.position;
        if (!p)
            continue;
        const pulse = 1 + 0.12 * Math.sin(now() / 120);
        c.save();
        c.strokeStyle = "#e03131";
        c.lineWidth = 6;
        c.setLineDash([14, 10]);
        c.beginPath();
        c.arc(p.x * 100, p.y * 100, 70 * pulse, 0, Math.PI * 2);
        c.stroke();
        c.setLineDash([]);
        c.font = "900 24px system-ui";
        c.textAlign = "center";
        const w = c.measureText(mk.label).width + 24;
        c.fillStyle = "#fff5f5";
        c.beginPath();
        c.roundRect(p.x * 100 - w / 2, p.y * 100 - 128, w, 36, 10);
        c.fill();
        c.stroke();
        c.fillStyle = "#c92a2a";
        c.fillText(mk.label, p.x * 100, p.y * 100 - 102);
        c.restore();
    }
}
replayButton.addEventListener("click", () => { if (gameplayAllowed())
    startReplay(false); });
watchReplayButton.addEventListener("click", () => startReplay(true));
slowButton.addEventListener("click", () => setSlow(!slowMo));
followButton.addEventListener("click", openFollowMenu);
replayPlay.addEventListener("click", () => { const rp = replayer; if (!rp)
    return; if (rp.done) {
    rp.restart();
    rp.paused = false;
    replayNote = "";
    return;
} rp.paused = !rp.paused; });
document.querySelector("#replay-restart").addEventListener("click", () => { const rp = replayer; if (!rp)
    return; rp.restart(); rp.paused = false; replayNote = ""; markerIndex = 0; replayProblem.textContent = "⚠️ Jump to the problem"; });
replayProblem.addEventListener("click", jumpToProblem);
document.querySelector("#replay-close").addEventListener("click", endReplay);
// ---------------------------------------------------------------- Challenge Lab (M26)
const cargoBox = document.querySelector("#challenge-cargo"), cargoValue = document.querySelector("#cargo-value");
/** The challenge being played (if any), and the TEST being scored. */
let challenge;
let challengeRun;
/** The Inventor Contract being played (M27), if any. */
let contract;
function setupChallenge(def) {
    challenge = def;
    challengeRun = undefined;
    cargoBox.classList.toggle("hidden", def?.capture.kind !== "CARGO");
    cargoBox.classList.remove("locked");
    if (!def)
        return;
    const best = challengeBest(appSave, def.id);
    motionObjective.textContent = `${def.goal} ${best ? `Your best: ${formatScore(def, best.value)}.` : "Set your first record!"}`;
    document.querySelector(".motion-hud .motion-badge").textContent = `CHALLENGE ${def.number}`;
    showCargo();
}
function showCargo() { const c = challenge?.capture; if (c?.kind !== "CARGO")
    return; cargoValue.textContent = `Cargo: ${Number(build.getPart(c.subject)?.parameters.weight ?? c.choices[0])}`; }
function changeCargo(step) {
    const c = challenge?.capture;
    if (c?.kind !== "CARGO" || testMode || replayer)
        return;
    const cart = build.getPart(c.subject);
    if (!cart)
        return;
    const now = Number(cart.parameters.weight ?? c.choices[0]);
    const i = Math.max(0, Math.min(c.choices.length - 1, c.choices.indexOf(now) + step));
    build.reshape(c.subject, { parameters: { ...cart.parameters, weight: c.choices[i] } });
    showCargo();
    sfx(600 + i * 40, .04);
}
document.querySelector("#cargo-down").addEventListener("click", () => changeCargo(-1));
document.querySelector("#cargo-up").addEventListener("click", () => changeCargo(1));
/** The TEST reached the challenge's scoring moment: save the score (if it's a record) and celebrate honestly. */
function finishChallenge() {
    const def = challenge, run = challengeRun, level = activeLevel, rt = tests.active();
    if (!def || !run?.result || !level || !rt)
        return;
    if (!tests.isPaused())
        tests.togglePause();
    const r = run.result;
    const seeded = new Set([...(level.staticObjects ?? []), ...level.starterParts].map(p => p.id));
    const added = playerParts(build, seeded).length;
    if (!r.success || r.value === undefined) {
        void commit(withChallengeResult(appSave, def, r).save);
        showMotionResult(false, `Not this time. ${def.goal}`);
        sfx(330, .08);
        return;
    }
    checkRunDiscoveries();
    const outcome = recordMissionSuccess(appSave, level.id, { playerPartCount: added, discoveries: [] });
    const scored = withChallengeResult(outcome.save, def, r);
    void commit(scored.save, true).catch(() => undefined);
    lastMissionLevelId = level.id;
    resultReturnsToHub = false;
    const score = formatScore(def, r.value);
    const prev = scored.previous ? formatScore(def, scored.previous.value) : undefined;
    const verdict = scored.verdict === "FIRST" ? " Your first record!" : scored.verdict === "NEW_RECORD" ? `${prev && scored.previous.value === r.value ? ` Same ${def.measureName.toLowerCase()} as before, but ${def.tieBreak.name} — a new record!` : ` NEW PERSONAL BEST! (was ${prev})`}` : scored.verdict === "MATCHED" ? ` You matched your best exactly (${prev}).` : ` Your best is ${prev}. Change one thing and try to beat it!`;
    const ratings = earnedRatings(def, r, added).map(x => ` 🏅 ${x.label} — ${x.because}.`).join("");
    const fun = ` Just for fun: ${personalityLabel(build, rt)}!`;
    showMotionResult(true, `${def.measureName}: ${score}.${verdict}${ratings}${fun}`, outcome.stars, outcome.newStars, outcome.newRewards);
    if (scored.verdict === "NEW_RECORD" || scored.verdict === "FIRST")
        motionResultTitle.textContent = scored.verdict === "FIRST" ? "RECORD SET!" : "NEW RECORD!";
    motionObjective.textContent = `${def.goal} Your best: ${formatScore(def, challengeBest(scored.save, def.id)?.value ?? r.value)}.`;
    sfx(980, .09);
    buzz(60);
}
// ---------------------------------------------------------------- Science Fairs (M28)
const fairEnter = document.querySelector("#btn-fair-enter");
const FAIR_LOOK = { "fair.motion-makers": "motion-yard", "fair.strong-and-powered": "builder-bay", "fair.water-and-air-show": "water-works", "fair.smart-machines": "robot-lab", "fair.anything-goes": "everything-lab" };
/** The fair being built for (if any), and the fair TEST being judged. */
let fair;
let fairRun;
function resetFairButton() { fairEnter.textContent = "🎪 Enter the fair!"; delete fairEnter.dataset.left; fairEnter.disabled = false; }
function setupFair(def, level) {
    fair = def;
    fairRun = undefined;
    fairEnter.classList.toggle("hidden", !def);
    resetFairButton();
    if (!def || !level)
        return;
    // The tray shows the fair's parts that this inventor has unlocked.
    const owned = new Set(sandboxTrayParts(activeProfile(appSave)?.unlockedParts ?? []));
    updateOpeningTray({ ...level, availablePartIds: level.availablePartIds.filter(id => owned.has(id)) });
    motionObjective.textContent = `${def.prompt} Entry rule: ${def.rule}`;
    document.querySelector(".motion-hud .motion-badge").textContent = `${def.icon} FAIR ${def.number}`;
}
/** "Enter the fair!": one fair TEST of the build as it is now, then the honest results. */
fairEnter.addEventListener("click", () => {
    if (!fair || !activeLevel || !gameplayAllowed() || fairRun)
        return;
    if (testMode)
        stopToBuild();
    ui.test.click();
    if (!testMode)
        return;
    fairRun = new FairRun(fair, build, new Set([...(activeLevel.staticObjects ?? []), ...activeLevel.starterParts].map(p => p.id)));
    fairEnter.disabled = true;
    sfx(880, .08);
});
function finishFair() {
    const def = fair, run = fairRun, rt = tests.active(), level = activeLevel;
    if (!def || !run || !rt || !level)
        return;
    if (!tests.isPaused())
        tests.togglePause();
    fairRun = undefined;
    resetFairButton();
    const ev = run.evidence(rt);
    const result = judgeEntry(def, ev, build, rt);
    if (!result.accepted) {
        showMotionResult(false, `Almost! For this fair: ${result.missing ?? def.rule} Change it and enter again!`);
        motionResultTitle.textContent = "ALMOST!";
        sfx(420, .08);
        return;
    }
    let save = recordMissionSuccess(appSave, level.id, { playerPartCount: ev.partsAdded, discoveries: [] }).save;
    const entryNo = fairHistory(save, def.id).length + 1;
    const title = `${def.title} entry ${entryNo}`;
    const kept = saveNewInvention(save, { name: title, content: contentOf(build.snapshot()), environment: `lab:${def.id}` });
    if (kept.invention) {
        save = kept.save;
        editingInvention = kept.invention.id;
        void captureThumb(kept.invention.id, 1);
    }
    save = withFairEntry(save, def, result, title, Date.now(), kept.invention?.id);
    void commit(save, true).catch(() => undefined);
    const awards = result.awards.length ? result.awards.map(a => ` 🏅 ${a.label} — ${a.because}.`).join("") : " (No measured awards this time — try going faster, steadier or with fewer parts!)";
    const cheers = crowdCheers(appSave).map(c => ` ${c}`).join("");
    showMotionResult(true, `Entry accepted — you get the ${def.title} ribbon! There's no winner at the WobbleWorks fair, just great ideas.${awards} Just for fun: ${result.fun}!${cheers}`);
    motionResultTitle.textContent = "🎪 FAIR ENTRY!";
    sfx(1040, .1);
    buzz(60);
}
// ---------------------------------------------------------------- Music Machines: every note the machine plays makes its sound (M29)
let notesHeard = 0;
let notesRuntime;
function playNotes(runtime) {
    if (!runtime || !runtime.music.active) {
        notesRuntime = runtime;
        notesHeard = 0;
        return;
    }
    if (notesRuntime !== runtime) {
        notesRuntime = runtime;
        notesHeard = 0;
    }
    const notes = runtime.music.notes;
    for (; notesHeard < notes.length; notesHeard++) {
        const n = notes[notesHeard];
        sfx(SCALE_HZ[n.pitch - 1] * (n.family === "DRUM" ? 0.5 : n.family === "HORN" ? 1 : n.family === "CHIME" ? 2 : 1), RING_SECONDS[n.family] ?? 0.1);
    }
}
// ---------------------------------------------------------------- Build together (M30): taking turns on one device
const togetherButton = document.querySelector("#btn-together"), coopSetup = document.querySelector("#coop-setup"), coopBar = document.querySelector("#coop-bar");
const coopPredict = document.querySelector("#coop-predict"), coopLaunch = document.querySelector("#coop-launch");
let coop;
let coopPartner;
let coopPattern = "TURNS";
/** The finger that is building right now; another finger touching at the same time is ignored. */
let coopFinger;
let coopNudgeAt = 0;
function coopAllows(event, finger) {
    if (event === "down") {
        if (coopFinger !== undefined && coopFinger !== finger) {
            if (now() - coopNudgeAt > 2500) {
                coopNudgeAt = now();
                toast(`One builder at a time — it's ${coop.current.name}'s turn!`);
            }
            return false;
        }
        if (!testMode && !coop.canEdit()) {
            toast(`${coop.current.name} is picking a part from the tray.`);
            return false;
        }
        coopFinger = finger;
        return true;
    }
    if (finger !== coopFinger)
        return false;
    if (event === "up" || event === "cancel")
        coopFinger = undefined;
    return true;
}
function renderCoopSetup() {
    const partners = document.querySelector("#coop-partners"), patterns = document.querySelector("#coop-patterns");
    partners.replaceChildren();
    patterns.replaceChildren();
    for (const p of partnerChoices(appSave)) {
        const b = document.createElement("button");
        b.textContent = p.name;
        b.style.setProperty("--who", p.colour);
        b.classList.toggle("on", coopPartner?.id === p.id);
        b.addEventListener("click", () => { coopPartner = p; renderCoopSetup(); });
        partners.append(b);
    }
    for (const p of CO_PATTERNS) {
        const b = document.createElement("button");
        b.innerHTML = "";
        const t = document.createElement("strong");
        t.textContent = `${p.icon} ${p.title}`;
        const l = document.createElement("span");
        l.textContent = p.line;
        b.append(t, l);
        b.classList.toggle("on", coopPattern === p.id);
        b.addEventListener("click", () => { coopPattern = p.id; renderCoopSetup(); });
        patterns.append(b);
    }
    document.querySelector("#coop-start").disabled = !coopPartner;
}
togetherButton.addEventListener("click", () => { if (!gameplayAllowed() || coop)
    return; coopPartner = undefined; coopPattern = "TURNS"; renderCoopSetup(); coopSetup.classList.remove("hidden"); });
document.querySelector("#coop-cancel").addEventListener("click", () => coopSetup.classList.add("hidden"));
document.querySelector("#coop-start").addEventListener("click", () => {
    const me = sessionOwner(appSave);
    if (!me || !coopPartner)
        return;
    coop = new CoBuildSession([me, coopPartner], coopPattern);
    coopFinger = undefined;
    coopSetup.classList.add("hidden");
    selectedId = undefined;
    build.sealHistory();
    renderCoopBar();
    toast(coopPattern === "PICK" ? `${me.name} picks a part first — ${coopPartner.name} places it.` : `${me.name} builds first. Pass when it's ${coopPartner.name}'s turn!`);
    sfx(880, .08);
});
function renderCoopBar() {
    coopBar.classList.toggle("hidden", !coop);
    appElement.classList.toggle("coop-tray-locked", Boolean(coop && !coop.canUseTray()));
    if (!coop)
        return;
    const who = coop.current;
    coopBar.style.setProperty("--who", who.colour);
    const doing = coop.pattern === "PICK" ? (coop.phase === "PICK" ? "pick a part from the tray" : "place the part, then pass back") : coop.pattern === "PREDICT" ? `build — ${coop.waiting.name} predicts before each TEST` : "build";
    document.querySelector("#coop-who").textContent = `${who.name}'s turn`;
    document.querySelector("#coop-doing").textContent = `Turn ${coop.turn} · ${doing}`;
    document.querySelector("#coop-pass").textContent = `Pass to ${coop.waiting.name} ➡`;
}
/** Hand over: the outgoing player's view is kept, the incoming player gets theirs back; selection is cleared and this turn's undo is sealed. */
function passTurn() {
    if (!coop)
        return;
    if (testMode)
        stopToBuild();
    const next = coop.pass({ x: camera.x, y: camera.y, zoom: camera.zoom });
    if (next) {
        camera.setZoom(next.zoom);
        camera.centerOn(next.x, next.y);
    }
    else
        camera.reset();
    selectedId = undefined;
    dragStart = undefined;
    dragPreview = undefined;
    panStart = undefined;
    coopFinger = undefined;
    build.sealHistory();
    renderCoopBar();
    toast(`${coop.current.name}'s turn!`);
    sfx(660, .06);
}
document.querySelector("#coop-pass").addEventListener("click", passTurn);
function endCoop(say = true) {
    if (!coop)
        return;
    const s = coop.score();
    const partner = coop.waiting.name;
    coop = undefined;
    coopFinger = undefined;
    renderCoopBar();
    coopPredict.classList.add("hidden");
    if (say)
        toast(s.total ? `Great building together! Predictions right: ${s.right} of ${s.total}.` : `Great building together, ${partner}!`);
}
document.querySelector("#coop-end").addEventListener("click", () => endCoop(true));
function openPredict() {
    if (!coop)
        return;
    document.querySelector("#coop-predict-who").textContent = `${coop.waiting.name}, what do you think will happen?`;
    document.querySelector("#coop-predict-q").textContent = labActive && activeLevel ? "Will it work?" : "Will something move?";
    coopPredict.classList.remove("hidden");
}
document.querySelectorAll("[data-guess]").forEach(b => b.addEventListener("click", () => { if (!coop)
    return; coop.predict(b.dataset.guess); coopPredict.classList.add("hidden"); ui.test.click(); }));
/** The TEST ended: did the prediction come true? (A mission: did it work? Free Build: did something move?) */
function settlePrediction(success) {
    if (!coop)
        return;
    const mission = labActive && Boolean(activeLevel);
    const happened = mission ? success : success || (runMeter?.result()?.distance ?? lastRun?.metrics.distance ?? 0) >= 0.5;
    const line = coop.resolve(happened, mission ? ["it worked", "it didn't work this time"] : ["something moved", "nothing moved"]);
    if (line)
        toast(line);
}
// Together Launch: the one mini game designed for two hands at once.
let launch;
document.querySelector("#coop-launch-open").addEventListener("click", () => {
    coopSetup.classList.add("hidden");
    launch = new TogetherLaunch();
    coopLaunch.classList.remove("hidden", "launched");
    document.querySelector("#coop-launch-msg").textContent = "Both hold your button — together!";
    const step = () => {
        if (!launch)
            return;
        const done = launch.tick();
        document.querySelector("#coop-launch-fill").style.width = `${Math.round(launch.progress * 100)}%`;
        if (done) {
            coopLaunch.classList.add("launched");
            document.querySelector("#coop-launch-msg").textContent = "🚀 You launched it together!";
            sfx(990, .2);
            launch = undefined;
            return;
        }
        requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
});
document.querySelectorAll("[data-hold]").forEach(b => {
    const side = Number(b.dataset.hold);
    b.addEventListener("pointerdown", e => { e.preventDefault(); try {
        b.setPointerCapture(e.pointerId);
    }
    catch { /* not a real pointer */ } b.classList.add("held"); launch?.press(side, true); });
    for (const ev of ["pointerup", "pointercancel", "lostpointercapture"])
        b.addEventListener(ev, () => { b.classList.remove("held"); launch?.press(side, false); });
});
document.querySelector("#coop-launch-close").addEventListener("click", () => { launch = undefined; coopLaunch.classList.add("hidden"); });
function render() {
    maybeCompleteOpeningChallenge();
    maybeCompleteMotionMission();
    updateProgramPanel();
    updateFollowCamera();
    renderer.begin(camera);
    const photoBackground = photo.isOpen() && photo.background !== "room";
    if (photoBackground)
        drawPhotoBackground(renderer.ctx, photo.background, now() / 1000);
    if (freeBuildActive && currentRoom && !photoBackground)
        drawRoomBackdrop(currentRoom);
    const themed = challenge ?? contract;
    const lookLab = fair ? FAIR_LOOK[fair.id] ?? "motion-yard" : themed ? (themed.baseLevelId.startsWith("chain.") ? CHAIN_WORKSHOP.id : themed.labId) : currentLabId;
    const sceneryId = themed ? themed.baseLevelId : activeLevel?.id;
    if (labActive && photoBackground)
        renderer.drawScenery(sceneryId);
    else if (labActive) {
        if (lookLab === "gear-garage")
            renderer.drawGearGarageBackdrop(now() / 1000);
        else if (lookLab === "builder-bay")
            renderer.drawBuilderBayBackdrop();
        else if (hasLabBackdrop(lookLab))
            renderer.drawLabBackdrop(lookLab, now() / 1000);
        else
            renderer.drawMotionYardBackdrop();
        renderer.drawScenery(sceneryId);
    }
    const runtime = replayer ? replayer.runtime : tests.active();
    const states = runtime?.physics.states();
    const parts = build.allParts().map(p => p.id === dragStart?.id && dragPreview ? { ...p, position: dragPreview } : p);
    const shown = beamEndDrag ? parts.map(p => p.id === beamEndDrag.id ? beamFromEnds(p, beamEndDrag.fixed, beamEndDrag.moving) : p) : parts;
    renderer.drawParts(shown, registry, states, selectedId, runtime?.gears, now() / 1000, runtime?.structures, forceScanner, runtime);
    if (!runtime && shown.some(p => circuitBehaviour(registry.get(p.definitionId))))
        renderer.drawCircuitTerminals(analyzeCircuit(shown, id => registry.has(id) ? registry.get(id) : undefined));
    if (runtime && forceScanner && runtime.circuits.layout.elements.length)
        renderer.drawCircuitScanner(shown, registry, runtime.circuits);
    if (runtime && forceScanner && runtime.magnets.hasMagnets())
        renderer.drawMagnetForces(runtime);
    if (runtime && runtime.water.layout.ports.length)
        renderer.drawWaterEffects(runtime, now() / 1000);
    if (runtime && forceScanner && runtime.flight.hasFlight())
        renderer.drawFlightForces(runtime);
    if (runtime?.chain.active)
        renderer.drawChainEdges(runtime, shown);
    updateChainHud(runtime);
    playNotes(runtime);
    if (currentRoom && !testMode && ++capFrame % 20 === 0)
        updateSandboxCap();
    if (runtime && runtime.space.zones.length && (forceScanner || runtime.space.zones.length >= 2))
        renderer.drawGravityReadouts(runtime);
    if (!runtime && shown.some(p => fluidBehaviour(registry.get(p.definitionId)) || registry.get(p.definitionId).behaviours.some(b => b.kind === "PIPE")))
        renderer.drawWaterPorts(analyzeFluid(shown, id => registry.has(id) ? registry.get(id) : undefined));
    if (!runtime && shown.some(p => registry.get(p.definitionId).behaviours.some(b => b.kind === "BEAM")))
        renderer.drawJoints(analyzeStructure(shown, id => registry.has(id) ? registry.get(id) : undefined));
    if (runtime) {
        renderer.drawGearLinks(runtime.gears.analysis, false);
        renderer.drawRotationView(runtime.gears, forceScanner);
    }
    else if (parts.some(p => registry.get(p.definitionId).behaviours.some(b => b.kind === "GEAR")))
        renderer.drawGearLinks(analyzeGears(parts, id => registry.has(id) ? registry.get(id) : undefined, build.allConnections()), true);
    if (!testMode && currentHint.ghosts.length)
        renderer.drawGhostParts(currentHint.ghosts, registry, now() / 1000);
    if ((labActive || freeBuildActive) && forceScanner && runtime && states)
        renderer.drawForceVectors(runtime.physics.forceVectors(), states, currentGuidance().showMeasurements);
    if (testMode && (labActive || freeBuildActive) && ++discoveryFrame % 15 === 0)
        checkRunDiscoveries();
    if (replayer)
        drawReplayMarkers(replayer);
    renderer.end();
    updateReplayUi();
    const enabled = gameplayAllowed();
    const canKeep = (labActive || freeBuildActive) && !exp && Boolean(activeProfile(appSave));
    if (saveInventionButton.hidden === canKeep) {
        saveInventionButton.hidden = !canKeep;
        photoButton.hidden = !canKeep;
    }
    const canTogether = canKeep && !openingActive && !coop;
    if (togetherButton.classList.contains("hidden") === canTogether)
        togetherButton.classList.toggle("hidden", !canTogether);
    ui.undo.disabled = !enabled || testMode || Boolean(replayer) || !build.canUndo();
    ui.redo.disabled = !enabled || testMode || Boolean(replayer) || !build.canRedo();
    ui.test.disabled = !enabled || testMode || Boolean(replayer);
    ui.stop.disabled = !enabled || !(testMode || replayer);
    const t = telemetry.snapshot();
    const budgetFlag = labActive && perf.simulationMs > MOTION_PERFORMANCE_BUDGET.targetSimulationMs ? " | ⚠ SIM BUDGET" : "";
    ui.debug.textContent = `FPS ${perf.fps} | frame ${perf.frameMs.toFixed(1)}ms | sim ${perf.simulationMs.toFixed(2)}ms | 60 Hz | parts ${build.allParts().length} | TEST ${t.testPresses} | drags ${t.dragAttempts}${runtime ? ` | tick ${runtime.tick}` : ""}${budgetFlag}`;
}
function frame(frameNow) {
    perf.frame(frameNow);
    perf.measureSimulation(() => clock.consume(frameNow, dt => { tests.step(dt); experimentTick(); if (testMode) {
        const rt = tests.active();
        if (rt) {
            runMeter?.sample(rt);
            recorder?.record(rt);
            if (challengeRun && !challengeRun.done && activeLevel && !tests.isPaused())
                challengeRun.tick(rt, evaluateLevelOutcome(activeLevel, build, rt).complete);
            if (fairRun && !tests.isPaused())
                fairRun.sample(rt);
        }
    } replayer?.step(); }));
    if (replayer?.frame())
        replayNote = "Fast-forwarding…";
    if (challengeRun?.done && testMode && !resultShown)
        finishChallenge();
    if (fairRun && testMode) {
        if (fairRun.done)
            finishFair();
        else {
            const left = Math.ceil(fairRun.secondsLeft);
            if (fairEnter.dataset.left !== String(left)) {
                fairEnter.dataset.left = String(left);
                fairEnter.textContent = `🎪 Judging… ${left} s`;
            }
        }
    }
    render();
    requestAnimationFrame(frame);
}
const resizeObserver = new ResizeObserver(() => renderer.resize());
resizeObserver.observe(canvas);
clock.reset(performance.now());
requestAnimationFrame(frame);
if ("serviceWorker" in navigator)
    navigator.serviceWorker.register("./sw.js").catch(() => undefined);
console.info(`WobbleWorks loaded (labs: ${[...labLevels.keys()].join(", ") || "loading"}): ${DEFAULT_PARTS.length} technical part definitions`);
void boot();
