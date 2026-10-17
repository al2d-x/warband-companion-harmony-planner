export const skills = Object.freeze([
  { id: "ironflesh", name: "Ironflesh", type: "Personal", attribute: "Strength", partyRelevant: false },
  { id: "power-strike", name: "Power Strike", type: "Personal", attribute: "Strength", partyRelevant: false },
  { id: "power-throw", name: "Power Throw", type: "Personal", attribute: "Strength", partyRelevant: false },
  { id: "power-draw", name: "Power Draw", type: "Personal", attribute: "Strength", partyRelevant: false },
  { id: "weapon-master", name: "Weapon Master", type: "Personal", attribute: "Agility", partyRelevant: false },
  { id: "shield", name: "Shield", type: "Personal", attribute: "Agility", partyRelevant: false },
  { id: "athletics", name: "Athletics", type: "Personal", attribute: "Agility", partyRelevant: false },
  { id: "riding", name: "Riding", type: "Personal", attribute: "Agility", partyRelevant: false },
  { id: "horse-archery", name: "Horse Archery", type: "Personal", attribute: "Agility", partyRelevant: false },
  { id: "looting", name: "Looting", type: "Party", attribute: "Agility", partyRelevant: false },
  { id: "trainer", name: "Trainer", type: "Personal", attribute: "Intelligence", partyRelevant: true },
  { id: "tracking", name: "Tracking", type: "Party", attribute: "Intelligence", partyRelevant: true },
  { id: "tactics", name: "Tactics", type: "Party", attribute: "Intelligence", partyRelevant: true },
  { id: "pathfinding", name: "Path-finding", type: "Party", attribute: "Intelligence", partyRelevant: true },
  { id: "spotting", name: "Spotting", type: "Party", attribute: "Intelligence", partyRelevant: true },
  { id: "inventory-management", name: "Inventory Management", type: "Leader", attribute: "Intelligence", partyRelevant: false },
  { id: "wound-treatment", name: "Wound Treatment", type: "Party", attribute: "Intelligence", partyRelevant: true },
  { id: "surgery", name: "Surgery", type: "Party", attribute: "Intelligence", partyRelevant: true },
  { id: "first-aid", name: "First Aid", type: "Party", attribute: "Intelligence", partyRelevant: true },
  { id: "engineer", name: "Engineer", type: "Party", attribute: "Intelligence", partyRelevant: true },
  { id: "persuasion", name: "Persuasion", type: "Personal", attribute: "Intelligence", partyRelevant: false },
  { id: "prisoner-management", name: "Prisoner Management", type: "Leader", attribute: "Charisma", partyRelevant: false },
  { id: "leadership", name: "Leadership", type: "Leader", attribute: "Charisma", partyRelevant: false },
  { id: "trade", name: "Trade", type: "Party", attribute: "Charisma", partyRelevant: true },
]);

export const companions = Object.freeze([
  {
    id: "deshavi", name: "Deshavi", likes: ["klethi"], dislikes: ["borcha", "rolf"],
    noble: false, cost: 0, skills: ["pathfinding", "spotting", "tracking"],
    objections: "Hunger, heavy casualties, and Bunduk serving as emissary.",
  },
  {
    id: "firentis", name: "Firentis", likes: ["jeremus"], dislikes: ["nizar", "katrin"],
    noble: true, cost: 0, skills: ["athletics"],
    objections: "Robbing villages, failing quests, and Rolf serving as emissary.",
  },
  {
    id: "jeremus", name: "Jeremus", likes: ["firentis"], dislikes: ["artimenner", "matheld"],
    noble: false, cost: 0, skills: ["wound-treatment", "trade", "first-aid", "surgery"],
    objections: "Robbing villages, returning serfs, and Klethi serving as emissary.",
  },
  {
    id: "marnid", name: "Marnid", likes: ["borcha"], dislikes: ["alayen", "baheshtur"],
    noble: false, cost: 0, skills: ["trade"],
    objections: "Robbing villages or caravans, failing quests, returning serfs, and Matheld serving as emissary.",
  },
  {
    id: "ymira", name: "Ymira", likes: ["alayen"], dislikes: ["matheld", "lezalit"],
    noble: false, cost: 0, skills: ["riding", "first-aid", "trade"],
    objections: "Robbing villages, returning serfs, refusing mercy in the local merchant quest, and Deshavi serving as emissary.",
  },
  {
    id: "katrin", name: "Katrin", likes: ["bunduk"], dislikes: ["firentis", "baheshtur"],
    noble: false, cost: 100, skills: ["ironflesh", "trade"],
    objections: "Hunger, unpaid wages, heavy casualties, and Lezalit serving as emissary.",
  },
  {
    id: "bunduk", name: "Bunduk", likes: ["katrin"], dislikes: ["lezalit", "rolf"],
    noble: false, cost: 200, skills: ["ironflesh", "weapon-master", "power-strike"],
    objections: "Robbing villages, heavy casualties, and Nizar serving as emissary.",
  },
  {
    id: "klethi", name: "Klethi", likes: ["deshavi"], dislikes: ["borcha", "artimenner"],
    noble: false, cost: 200, skills: ["power-throw", "pathfinding", "spotting"],
    objections: "Retreating and Marnid serving as emissary.",
  },
  {
    id: "alayen", name: "Alayen", likes: ["ymira"], dislikes: ["marnid", "nizar"],
    noble: true, cost: 300, skills: ["power-strike", "weapon-master", "riding"],
    objections: "Failing quests, retreating, and Baheshtur serving as emissary.",
  },
  {
    id: "artimenner", name: "Artimenner", likes: ["lezalit"], dislikes: ["jeremus", "klethi"],
    noble: false, cost: 300, skills: ["engineer", "trade", "tactics"],
    objections: "Hunger, failing quests, heavy casualties, and Katrin serving as emissary.",
  },
  {
    id: "borcha", name: "Borcha", likes: ["marnid"], dislikes: ["deshavi", "klethi"],
    noble: false, cost: 300, skills: ["tracking", "pathfinding", "spotting"],
    objections: "Hunger, unpaid wages, heavy casualties, and Alayen serving as emissary.",
  },
  {
    id: "nizar", name: "Nizar", likes: ["matheld"], dislikes: ["firentis", "alayen"],
    noble: false, cost: 300, skills: ["ironflesh", "power-strike", "weapon-master", "athletics"],
    objections: "Retreating and Jeremus serving as emissary.",
  },
  {
    id: "rolf", name: "Rolf", likes: ["baheshtur"], dislikes: ["deshavi", "bunduk"],
    noble: true, cost: 300, skills: ["athletics", "tactics"],
    objections: "Retreating and Artimenner serving as emissary.",
  },
  {
    id: "baheshtur", name: "Baheshtur", likes: ["rolf"], dislikes: ["katrin", "marnid"],
    noble: true, cost: 400, skills: ["power-draw", "weapon-master", "horse-archery"],
    objections: "Hunger, unpaid wages, heavy casualties, and Ymira serving as emissary.",
  },
  {
    id: "lezalit", name: "Lezalit", likes: ["artimenner"], dislikes: ["ymira", "bunduk"],
    noble: true, cost: 400, skills: ["power-strike", "weapon-master", "trainer"],
    objections: "Retreating and Borcha serving as emissary.",
  },
  {
    id: "matheld", name: "Matheld", likes: ["nizar"], dislikes: ["ymira", "jeremus"],
    noble: true, cost: 500, skills: ["weapon-master", "athletics"],
    objections: "Retreating and Firentis serving as emissary.",
  },
]);

export const presets = Object.freeze([
  { id: "a", name: "Party A", members: ["artimenner", "borcha", "matheld", "lezalit", "rolf", "alayen", "baheshtur", "firentis"] },
  { id: "b", name: "Party B", members: ["artimenner", "borcha", "matheld", "lezalit", "rolf", "katrin", "marnid", "nizar"] },
  { id: "c", name: "Party C", members: ["bunduk", "deshavi", "klethi", "jeremus", "ymira", "alayen", "baheshtur", "firentis"] },
  { id: "d", name: "Party D", members: ["bunduk", "deshavi", "klethi", "jeremus", "ymira", "katrin", "marnid", "nizar"] },
]);
