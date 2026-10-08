import { REWARDS } from "../progression/Rewards.js";
export const LOOK_CATEGORIES = [
    { id: "skin", label: "Skin", icon: "🙂", required: true },
    { id: "hair", label: "Hair", icon: "💇", required: false },
    { id: "glasses", label: "Glasses", icon: "👓", required: false },
    { id: "hat", label: "Hats", icon: "🧢", required: false },
    { id: "outfit", label: "Outfit", icon: "👕", required: true },
    { id: "gloves", label: "Gloves", icon: "🧤", required: false },
    { id: "shoes", label: "Shoes", icon: "👟", required: true },
    { id: "backpack", label: "Backpack", icon: "🎒", required: false }
];
/** Hair colour buttons. `swatch` is the painted button picture; colours without one use `css`. */
export const HAIR_COLOURS = [
    { id: "brown", label: "Brown", swatch: "ui.swatch.hair-brown", css: "#7a4a24" },
    { id: "blonde", label: "Blonde", swatch: "ui.swatch.hair-blonde", css: "#f2c94c" },
    { id: "orange", label: "Ginger", swatch: "ui.swatch.hair-red", css: "#e8590c" },
    { id: "white", label: "White", css: "#f1f3f5" },
    { id: "black", label: "Black", swatch: "ui.swatch.hair-black", css: "#212529" },
    { id: "gold", label: "Gold", swatch: "ui.swatch.hair-gold", css: "#e0a100" }
];
const p = (category, id, label, art = [id], extra = {}) => ({ id, category, label, art, ...extra });
const hair = (style, colour, label) => p("hair", `inv.hair.${style}-${colour}`, label, undefined, { colour });
const BASE_PIECES = [
    p("skin", "inv.head.skin-1", "Skin 1"), p("skin", "inv.head.skin-2", "Skin 2"), p("skin", "inv.head.skin-3", "Skin 3"), p("skin", "inv.head.skin-4", "Skin 4"),
    hair("messy", "brown", "Messy"), hair("spiky", "brown", "Spiky"), hair("ponytail", "blonde", "Ponytail"), hair("swoop", "blonde", "Swoop"), hair("curly", "orange", "Curly"), hair("wild", "white", "Wild"),
    p("glasses", "inv.glasses.blue", "Cool Blue"), p("glasses", "inv.glasses.pink", "Pink"), p("glasses", "inv.glasses.star", "Stars"), p("glasses", "inv.glasses.heart", "Hearts"), p("glasses", "inv.glasses.flower", "Flowers"), p("glasses", "inv.glasses.bolt", "Lightning"),
    p("hat", "inv.hat.aviator", "Aviator"), p("hat", "inv.hat.propeller", "Propeller"), p("hat", "inv.hat.propeller-rainbow", "Rainbow Propeller"), p("hat", "inv.hat.flatcap", "Flat Cap"), p("hat", "inv.hat.wizard", "Wizard"), p("hat", "inv.hat.crown", "Crown"),
    p("outfit", "inv.outfit.overalls-blue", "Blue Overalls"), p("outfit", "inv.outfit.overalls-green", "Green Overalls"), p("outfit", "inv.outfit.dungarees-orange", "Orange Dungarees"), p("outfit", "inv.outfit.dungarees-green", "Green Dungarees"),
    p("outfit", "inv.outfit.dungarees-purple", "Purple Dungarees"), p("outfit", "inv.outfit.dungarees-paint", "Paint Dungarees"), p("outfit", "inv.outfit.labcoat-blue", "Lab Coat"), p("outfit", "inv.outfit.labcoat-purple", "Purple Lab Coat"),
    p("outfit", "inv.outfit.labcoat-atom", "Atom Lab Coat"), p("outfit", "inv.outfit.hoodie-gear", "Gear Hoodie"), p("outfit", "inv.outfit.denim-jacket", "Denim Jacket"), p("outfit", "inv.outfit.flannel", "Flannel"),
    p("outfit", "inv.outfit.tshirt-star", "Star T-shirt"), p("outfit", "inv.outfit.tshirt-gear", "Gear T-shirt"), p("outfit", "inv.outfit.tshirt-swirl", "Swirl T-shirt"),
    p("gloves", "inv.gloves.white", "White", ["inv.gloves.white-l", "inv.gloves.white-r"]), p("gloves", "inv.gloves.bolt", "Lightning"), p("gloves", "inv.gloves.gear", "Gears"), p("gloves", "inv.gloves.star", "Stars"), p("gloves", "inv.gloves.heart", "Hearts"),
    p("shoes", "inv.shoes.sneakers", "Sneakers", ["inv.shoes.sneaker-l", "inv.shoes.sneaker-r"]), p("shoes", "inv.shoes.boots-brown", "Work Boots", ["inv.boots.brown-l", "inv.boots.brown-r"]),
    p("shoes", "inv.shoes.boots-lime", "Lime Boots"), p("shoes", "inv.shoes.boots-orange", "Orange Boots"), p("shoes", "inv.shoes.boots-pink", "Pink Boots"), p("shoes", "inv.shoes.boots-purple", "Purple Boots"),
    p("backpack", "inv.backpack.explorer", "Explorer"), p("backpack", "inv.backpack.blue-gear", "Blue Gear"), p("backpack", "inv.backpack.red-bolt", "Red Bolt"), p("backpack", "inv.backpack.purple-star", "Purple Star")
];
/** Reward pieces come from the reward catalogue — the one shared list with the locker. */
const REWARD_PIECES = REWARDS.filter(r => r.piece).map(r => {
    const category = r.piece.split(".")[1];
    return p(category, r.piece, r.title, [r.piece], { reward: r.id });
});
export const LOOK_PIECES = [...BASE_PIECES, ...REWARD_PIECES];
export function piecesFor(category) { return LOOK_PIECES.filter(x => x.category === category); }
export function pieceById(id) { return id ? LOOK_PIECES.find(x => x.id === id) : undefined; }
export const DEFAULT_LOOK = Object.freeze({ skin: "inv.head.skin-1", hair: "inv.hair.messy-brown", outfit: "inv.outfit.overalls-blue", shoes: "inv.shoes.sneakers" });
/** Every piece the inventor may use: everything except reward pieces they haven't earned. */
export function isPieceUnlocked(piece, ownedRewards) { return !piece.reward || ownedRewards.includes(piece.reward); }
/** Which save field each category is, and the id shape it accepts (shape only, so older builds never reject a newer piece). */
const ID_SHAPE = {
    skin: /^inv\.head\.[a-z0-9-]{1,40}$/, hair: /^inv\.hair\.[a-z0-9-]{1,40}$/, glasses: /^inv\.glasses\.[a-z0-9-]{1,40}$/, hat: /^inv\.hat\.[a-z0-9-]{1,40}$/,
    outfit: /^inv\.outfit\.[a-z0-9-]{1,40}$/, gloves: /^inv\.gloves\.[a-z0-9-]{1,40}$/, shoes: /^inv\.shoes\.[a-z0-9-]{1,40}$/, backpack: /^inv\.backpack\.[a-z0-9-]{1,40}$/
};
export function validateLook(look) {
    if (!look || typeof look !== "object" || Array.isArray(look))
        return false;
    const l = look;
    for (const key of Object.keys(l))
        if (!(key in ID_SHAPE))
            return false;
    for (const c of LOOK_CATEGORIES) {
        const v = l[c.id];
        if (v === undefined) {
            if (c.required)
                return false;
            continue;
        }
        if (typeof v !== "string" || !ID_SHAPE[c.id].test(v))
            return false;
    }
    return true;
}
/** Sets or clears one category, keeping required categories filled. Reward pieces must be owned. */
export function withPiece(look, category, pieceId, ownedRewards) {
    const meta = LOOK_CATEGORIES.find(c => c.id === category);
    if (pieceId === undefined) {
        if (meta.required)
            return look;
        const { [category]: _drop, ...rest } = look;
        return rest;
    }
    const piece = pieceById(pieceId);
    if (!piece || piece.category !== category || !isPieceUnlocked(piece, ownedRewards))
        return look;
    return { ...look, [category]: pieceId };
}
