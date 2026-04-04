import { useState, useEffect } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db/db";
import { MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/16/solid';

import AddProductModal from "../components/AddProductModal"

function ProductsModal({ isOpen, onClose, listId }) {
    const allProducts = useLiveQuery(() => db.products.toArray());
    const currentItems = useLiveQuery(() =>
        db.list_product.where("id_lists").equals(Number(listId)).toArray()
        , [listId]);

    const [selectedIds, setSelectedIds] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // NUEVO: Estado para el buscador
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        if (currentItems) {
            setSelectedIds(currentItems.map(item => item.id_products));
        }
    }, [currentItems, isOpen]);

    if (!isOpen) return null;

    // LÓGICA DE FILTRADO ACTUALIZADA
    const filteredAndSortedProducts = allProducts
        ?.filter(p => {
            // 1. Que no esté deshabilitado en el catálogo
            const isNotDisabled = p.isDisable !== true;
            // 2. Que coincida con la búsqueda
            const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
            // 3. QUE NO ESTÉ YA EN LA LISTA ACTUAL (isDisable en list_product indica que fue quitado)
            const isAlreadyInList = currentItems?.some(item =>
                item.id_products === p.id && item.isDisable !== true
            );

            return isNotDisabled && matchesSearch && !isAlreadyInList;
        })
        .sort((a, b) => a.name.localeCompare(b.name));

    // Función para agregar directamente al hacer clic
    const handleQuickAdd = async (productId) => {
        try {
            await db.list_product.add({
                id_lists: Number(listId),
                id_products: productId,
                priceAtTime: 0,
                quantity: 1,
                bought: 0,
                isDisable: false
            });
            // Opcional: Cerrar el modal o dejarlo abierto para agregar más
        } catch (error) {
            console.error("Error al agregar:", error);
        }
    };

    const handleOnProductCreated = (newProductId) => {
        setSelectedIds(prev => [...prev, newProductId]);
    };

    const handleSave = async () => {
        try {
            const existingIds = currentItems.map(item => item.id_products);
            const toAdd = selectedIds.filter(id => !existingIds.includes(id));
            const toRemove = existingIds.filter(id => !selectedIds.includes(id));

            if (toRemove.length > 0) {
                await db.list_product
                    .where("id_lists").equals(Number(listId))
                    .filter(item => toRemove.includes(item.id_products))
                    .delete();
            }

            if (toAdd.length > 0) {
                const newItems = toAdd.map(productId => ({
                    id_lists: Number(listId),
                    id_products: productId,
                    priceAtTime: 0,
                    quantity: 1,
                    bought: 0,
                    isDisable: false
                }));
                await db.list_product.bulkAdd(newItems);
            }
            onClose();
        } catch (error) {
            console.error("Error:", error);
        }
    };

    return (
        <div className='fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm'>
            <div className='bg-gray-50 w-full max-w-sm rounded-3xl p-6 shadow-2xl flex flex-col gap-4 max-h-[90vh] animate-in zoom-in duration-200'>

                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800">Agregar Productos</h2>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-amber-600 active:bg-amber-500 shadow-lg py-1 px-3 rounded-2xl text-amber-50 font-bold text-3xl"
                    >
                        +
                    </button>
                </div>

                {/* BUSCADOR */}
                <div className="relative">
                    <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar producto..."
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-2xl outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* LISTA DE PRODUCTOS */}
                <div className="flex-1 overflow-auto rounded-2xl pr-1 flex flex-col gap-3">
                    {filteredAndSortedProducts?.map((item) => (
                        <div
                            key={item.id}
                            onClick={() => handleQuickAdd(item.id)} // Agregar con un clic
                            className="p-4 rounded-2xl flex justify-between items-center bg-white border border-gray-100 hover:border-amber-500 hover:bg-amber-50 transition-all cursor-pointer shadow-sm group"
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">{item.icon}</span>
                                <p className="font-bold text-gray-700">{item.name}</p>
                            </div>
                            <PlusIcon className="w-5 h-5 text-gray-300 group-hover:text-amber-600" />
                        </div>
                    ))}
                </div>

                <div className="flex gap-4 pt-2">
                    <button onClick={onClose} className="flex-1 p-3 bg-gray-200 text-gray-600 rounded-2xl font-bold active:scale-95 transition-all">Cancelar</button>
                    <button onClick={handleSave} className="flex-1 p-3 bg-amber-600 text-white rounded-2xl font-bold shadow-lg shadow-amber-200 active:scale-95 transition-all">Listo</button>
                </div>
            </div>

            <AddProductModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onProductCreated={handleOnProductCreated}
            />
        </div>
    );
}

export default ProductsModal;