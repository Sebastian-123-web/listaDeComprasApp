import { useState } from "react";
import EmojiPicker from 'emoji-picker-react';
import Swal from 'sweetalert2';
import { db } from "../db/db";

function AddProductModal({ isOpen, onClose, onProductCreated }) {
    const [newItem, setNewItem] = useState({ name: "", icon: "📦" });
    const [showEmoji, setShowEmoji] = useState(false);

    const handleSave = async () => {
        if (!newItem.name.trim()) {
            return Swal.fire("¡Oops!", "El nombre del producto es obligatorio", "warning");
        }

        // Formateamos el nombre: Primera letra Mayúscula, el resto minúscula
        const formattedName = newItem.name.trim().charAt(0).toUpperCase() + newItem.name.trim().slice(1).toLowerCase();

        try {
            // 1. Guardamos en la tabla de productos (el catálogo)
            const newId = await db.products.add({
                name: formattedName,
                icon: newItem.icon,
                isDisable: false, // Usamos isDisable para ser consistentes con tu esquema
            });

            // 2. IMPORTANTE: Notificamos al modal padre (ProductsModal) 
            // enviando el ID del nuevo producto para que lo marque automáticamente
            if (onProductCreated) {
                onProductCreated(newId);
            }

            // 3. Limpiamos y cerramos
            setNewItem({ name: "", icon: "📦" });
            onClose();

            // Feedback visual
            Swal.fire({
                title: "¡Creado!",
                text: `${formattedName} se añadió al catálogo`,
                icon: "success",
                timer: 1500,
                showConfirmButton: false,
                toast: true,
                position: 'top-end'
            });

        } catch (error) {
            console.error("Error al crear producto:", error);
            Swal.fire("Error", "No se pudo crear el producto", "error");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in zoom-in duration-200">
                <h2 className="text-xl font-bold mb-4 text-gray-800">Nuevo Producto</h2>

                <div className="flex flex-col gap-4">
                    <div className="flex gap-2">
                        <input
                            autoFocus
                            type="text"
                            placeholder="Nombre (ej: Clavos)"
                            className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-orange-500 font-medium"
                            value={newItem.name}
                            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                        />

                        {/* Selector de Icono */}
                        <div className="relative">
                            <button
                                onClick={() => setShowEmoji(!showEmoji)}
                                className="text-xl bg-gray-50 w-12 h-12 rounded-xl border-2 border-dashed border-orange-400 flex items-center justify-center hover:bg-orange-50 transition-colors"
                            >
                                {newItem.icon}
                            </button>

                            {showEmoji && (
                                <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
                                    <div className="fixed inset-0 bg-transparent" onClick={() => setShowEmoji(false)}></div>
                                    <div className="relative shadow-2xl animate-in fade-in zoom-in duration-150">
                                        <EmojiPicker
                                            onEmojiClick={(e) => {
                                                setNewItem({ ...newItem, icon: e.emoji });
                                                setShowEmoji(false);
                                            }}
                                            width="280px"
                                            height="350px"
                                            theme="light"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-3 mt-2">
                        <button
                            onClick={onClose}
                            className="flex-1 p-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSave}
                            className="flex-1 p-3 bg-orange-500 text-white rounded-xl font-bold shadow-lg shadow-orange-200 active:scale-95 transition-all"
                        >
                            Guardar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AddProductModal;