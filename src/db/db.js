import Dexie from "dexie"

export const db = new Dexie("ShoppingListDB")

db.version(1).stores({
  products: "++id, name, icon, isDisable",
  lists: "++id, name, description, icon, budget, isDisable",
  list_product: "++id, id_lists, id_products, id_user, priceAtTime, quantity, bought, isDisable",
  userProfile: "id, name, last_name, email, avatar, isDisable"
})

db.on('populate', () => {
  db.products.bulkAdd([
    { name: 'Arroz', icon: '🌾', isDisable: false },
    { name: 'Huevos', icon: '🥚', isDisable: false },
    { name: 'Leche', icon: '🥛', isDisable: false },
    { name: 'Aceite', icon: '🧴', isDisable: false },
    { name: 'Papa Amarilla', icon: '🥔', isDisable: false },
    { name: 'Pollo', icon: '🍗', isDisable: false },
    { name: 'Cebolla', icon: '🧅', isDisable: false },
    { name: 'Ajo molido', icon: '🧄', isDisable: false },
    { name: 'Ajo', icon: '🧄', isDisable: false },
    { name: 'Limón', icon: '🍋', isDisable: false },
    { name: 'Pan', icon: '🥖', isDisable: false },
    { name: 'Plátano', icon: '🍌', isDisable: false },
    { name: 'Granadilla', icon: '🟠', isDisable: false },
    { name: 'Papaya', icon: '🥭', isDisable: false },
    { name: 'Mango', icon: '🥭', isDisable: false },
    { name: 'Mandarina', icon: '🍊', isDisable: false },
    { name: 'Piña', icon: '🍍', isDisable: false },
    { name: 'Fresa', icon: '🍓', isDisable: false },
    { name: 'Uva', icon: '🍇', isDisable: false },
    { name: 'Palta', icon: '🥑', isDisable: false },
    { name: 'Sandía', icon: '🍉', isDisable: false },
    { name: 'Manzana', icon: '🍎', isDisable: false }
  ]);
});


