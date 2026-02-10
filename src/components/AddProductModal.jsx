import { useState } from "react";
import EmojiPicker from 'emoji-picker-react';
import Swal from 'sweetalert2';
import { db } from "../db/db";

function AddProductModal({ isOpen, onClose }) {
    const [newItem, setNewItem] = useState({ name: "", price: "", icon: "📦" });
    const [showEmoji, setShowEmoji] = useState(false);

    const handleSave = async () => {
        if (!newItem.name || !newItem.price) return Swal.fire("Error", "Llena los campos", "warning");

        try {
            await db.products.add({
                name: newItem.name,
                icon: newItem.icon,
                disable: 0,
            });

            setNewItem({ name: "", icon: "📦" }); // Reset
            onClose(); // Cerrar modal
            Swal.fire("¡Listo!", "Producto creado", "success");
        } catch (error) {
            console.error(error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in zoom-in duration-200">
                <h2 className="text-xl font-bold mb-4">Nuevo Producto</h2>

                <div className="flex flex-col gap-4">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Nombre (ej: Clavos)"
                            className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-orange-500"
                            value={newItem.name}
                            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                        />

                        {/* Selector de Icono */}
                        <div className="flex justify-center relative">
                            <button
                                onClick={() => setShowEmoji(!showEmoji)}
                                className="text-xl bg-gray-50 w-12 h-12 rounded-xl border-2 border-dashed border-orange-400 flex items-center justify-center"
                            >
                                {newItem.icon}
                            </button>
                            {showEmoji && (
                                <div className="fixed inset-0 flex items-center justify-center p-4">
                                    <div
                                        className="fixed inset-0 z-[-1]"
                                        onClick={() => setShowEmoji(false)}
                                    ></div>
                                    <div className="absolute z-[70] top-24 shadow-2xl">
                                        <EmojiPicker
                                            onEmojiClick={(e) => {
                                                setNewItem({ ...newItem, icon: e.emoji });
                                                setShowEmoji(false);
                                            }}
                                            width="280px"
                                            height="350px"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* <input
                        type="number"
                        placeholder="Precio sugerido (S/)"
                        className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-orange-500"
                        value={newItem.price}
                        onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                    /> */}

                    <div className="flex gap-2">
                        <button onClick={onClose} className="flex-1 p-3 bg-gray-100 rounded-xl font-bold">Cancelar</button>
                        <button onClick={handleSave} className="flex-1 p-3 bg-orange-500 text-white rounded-xl font-bold">Guardar</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AddProductModal;