import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db/db";
import Swal from "sweetalert2";
import { TrashIcon, XMarkIcon } from "@heroicons/react/16/solid"; // Añadimos XMarkIcon

import Back from "../components/Back";
import ProductsModal from "../components/ProductsModal";

function MyList() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // NUEVOS ESTADOS PARA SELECCIÓN MÚLTIPLE
  const [selectedForDelete, setSelectedForDelete] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);

  const { id } = useParams();
  const navigate = useNavigate();

  const listData = useLiveQuery(() => db.lists.get(Number(id)), [id]);

  // FILTRAMOS PARA NO MOSTRAR LOS PRODUCTOS "DESHABILITADOS"
  const productsInList = useLiveQuery(async () => {
    const items = await db.list_product
      .where("id_lists")
      .equals(Number(id))
      .filter(item => item.isDisable !== true) // Filtro de borrado lógico
      .toArray();

    const detailedProducts = await Promise.all(
      items.map(async (item) => {
        const productInfo = await db.products.get(item.id_products);
        return {
          ...item,
          name: productInfo?.name || "Producto desconocido",
          icon: productInfo?.icon || "📦"
        };
      })
    );

    return detailedProducts.sort((a, b) => a.bought - b.bought);
  }, [id]);

  // FUNCIÓN PARA "ELIMINAR" (DESHABILITAR) SELECCIONADOS
  const deleteSelectedItems = async () => {
    if (selectedForDelete.length === 0) return;

    const result = await Swal.fire({
      title: '¿Quitar productos?',
      text: `Se quitarán ${selectedForDelete.length} productos de la lista.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, quitar',
      confirmButtonColor: '#e11d48',
    });

    if (result.isConfirmed) {
      try {
        // Actualizamos isDisable a true para todos los IDs seleccionados
        await Promise.all(
          selectedForDelete.map(itemId =>
            db.list_product.update(itemId, { isDisable: true })
          )
        );

        setSelectedForDelete([]);
        setIsEditMode(false);

        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'Productos quitados',
          showConfirmButton: false,
          timer: 1500
        });
      } catch (error) {
        console.error(error);
      }
    }
  };

  const toggleSelection = (itemId) => {
    setSelectedForDelete(prev =>
      prev.includes(itemId) ? prev.filter(i => i !== itemId) : [...prev, itemId]
    );
  };

  const toggleBought = async (itemId, currentStatus) => {
    if (isEditMode) return; // Evitar marcar como comprado si estamos editando
    await db.list_product.update(itemId, {
      bought: currentStatus === 1 ? 0 : 1
    });
  };

  // Cambiar el valor del presupuesto
  const handleEditBudget = async () => {
    const { value: newBudget } = await Swal.fire({
      title: 'Editar Presupuesto',
      input: 'number',
      inputLabel: '¿Cuánto planeas gastar hoy?',
      inputValue: presupuesto,
      showCancelButton: true,
      confirmButtonColor: '#d97706',
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Guardar',
      inputValidator: (value) => {
        if (!value || value < 0) {
          return '¡Por favor ingresa un monto válido!'
        }
      }
    });

    if (newBudget) {
      const list = await db.lists.get(Number(id));
      if (list) {
        await db.lists.update(list.id, { budget: parseFloat(newBudget) });
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'Presupuesto actualizado',
          showConfirmButton: false,
          timer: 1500
        });
      }
    }
  };

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    await db.list_product.update(itemId, { quantity: newQuantity });
  };

  const updatePrice = async (itemId, currentPrice) => {
    const { value: newPrice } = await Swal.fire({
      title: 'Actualizar Precio',
      input: 'number',
      inputLabel: 'Nuevo precio unitario',
      inputValue: currentPrice,
      showCancelButton: true,
      inputAttributes: { step: '0.10' }
    });

    if (newPrice !== undefined) {
      await db.list_product.update(itemId, { priceAtTime: parseFloat(newPrice) || 0 });
    }
  };

  const totalCompra = productsInList?.reduce((acc, curr) => acc + (curr.priceAtTime * curr.quantity), 0) || 0;
  const presupuesto = listData?.budget || 0;
  const excedido = totalCompra > presupuesto;

  if (!listData) return <div className="p-10 text-center">Cargando...</div>;

  return (
    <>
      <div className="min-h-screen bg-gray-100 pb-32">
        <div className="p-4 flex items-center justify-between bg-white sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <Back />
            <div>
              <h1 className="text-xl font-bold text-gray-800">{listData.icon} {listData.name}</h1>
              <button onClick={handleEditBudget} className="flex items-center gap-1 group">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                  Presupuesto: S/ {presupuesto.toFixed(2)}
                </p>
              </button>
            </div>
          </div>

          {/* BOTÓN DINÁMICO: Solo se muestra si NO estamos editando */}
          {!isEditMode && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-amber-600 active:bg-amber-500 shadow-lg py-1 px-3 rounded-2xl text-amber-50 font-bold text-3xl">+</button>
          )}
          {isEditMode && (
            <div className="flex gap-2 animate-in slide-in-from-right duration-200">
              <button
                onClick={() => { setIsEditMode(false); setSelectedForDelete([]); }}
                className="bg-gray-200 p-2 rounded-2xl text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
              <button
                onClick={deleteSelectedItems}
                disabled={selectedForDelete.length === 0}
                className={`p-2 px-4 rounded-2xl font-bold transition-all ${selectedForDelete.length > 0 ? "bg-red-500 text-white shadow-lg" : "bg-gray-100 text-gray-300"
                  }`}
              >
                <TrashIcon className="h-6 w-6" />
              </button>
            </div>
          )}
        </div>

        <div className="p-4 flex flex-col gap-3">
          {productsInList?.map((item) => (
            <div
              key={item.id}
              onContextMenu={(e) => { e.preventDefault(); setIsEditMode(true); }}
              className={`p-4 rounded-3xl flex flex-col gap-3 transition-all ${selectedForDelete.includes(item.id)
                ? "bg-red-50 border-2 border-red-500"
                : item.bought
                  ? "bg-gray-200 opacity-60"
                  : "bg-white shadow-sm border border-gray-100"
                }`}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  {/* Checkbox de Selección Múltiple o Comprado */}
                  {isEditMode ? (
                    <div
                      onClick={() => toggleSelection(item.id)}
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${selectedForDelete.includes(item.id) ? "bg-red-500 border-red-500" : "border-gray-300 bg-white"
                        }`}
                    >
                      {selectedForDelete.includes(item.id) && <div className="w-2 h-2 bg-white rounded-full"></div>}
                    </div>
                  ) : (
                    <input
                      type="checkbox"
                      checked={item.bought === 1}
                      onChange={() => toggleBought(item.id, item.bought)}
                      className="w-6 h-6 rounded-full border-2 border-amber-500 accent-amber-600"
                    />
                  )}
                  <div className="flex flex-col gap-1 items-start">
                    <div className="flex items-center">
                      <span className="text-xl">{item.icon}</span>
                      <p className={`font-bold text-gray-800 ${item.bought && !isEditMode ? "line-through opacity-50" : ""}`}>
                        {item.name}
                      </p>
                    </div>
                    {/* Precio Unitario Editable */}
                    <button
                      onClick={() => updatePrice(item.id, item.priceAtTime)}
                      className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-lg text-sm font-bold border border-emerald-100"
                    >
                      S/ {item.priceAtTime.toFixed(2)}
                    </button>
                  </div>
                </div>

                {/* Fila de controles de cantidad y subtotal */}
                <div className="flex justify-between items-center rounded-2xl">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center bg-white rounded-xl text-xl font-bold text-gray-400 active:text-orange-500"
                    >
                      -
                    </button>
                    <div className="shadow-sm w-8 h-8 flex justify-center items-center rounded-xl">
                      <span className="font-black text-gray-700 w-4 text-center">{item.quantity}</span>
                    </div>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center bg-white rounded-xl text-xl font-bold text-gray-400 active:text-orange-500"
                    >
                      +
                    </button>
                  </div>

                  {/* <div className="text-right">
                      <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">Subtotal</p>
                      <p className="font-black text-gray-800">S/ {(item.priceAtTime * item.quantity).toFixed(2)}</p>
                    </div> */}

                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Barra de Total mejorada con Presupuesto */}
        <div className={`fixed bottom-0 left-0 w-full p-5 shadow-[0_-4px_15px_rgba(0,0,0,0.2)] rounded-t-3xl flex justify-between items-center transition-colors ${excedido ? 'bg-red-600' : 'bg-amber-600'}`}>
          <div className="text-white">
            <p className="text-[10px] opacity-80 uppercase tracking-widest font-bold">Total a pagar</p>
            <p className="text-3xl font-black">
              S/ {totalCompra.toFixed(2)}
            </p>
          </div>

          <div className="flex flex-col items-end text-white">
            <div className="bg-white/20 px-3 py-1 rounded-lg text-center mb-1">
              <p className="text-[10px] font-bold">Items: {productsInList?.filter(p => p.bought).length}/{productsInList?.length}</p>
            </div>
            <p className="text-[10px] font-medium opacity-90">
              {excedido ? "Faltan: S/ 0.00" : `Restan: S/ ${(presupuesto - totalCompra).toFixed(2)}`}
            </p>
          </div>
        </div>
      </div>

      {/* MODAL DE PRODUCTOS PARA AGREGARLOS / QUITARLOS */}
      <ProductsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        listId={id} // Le pasamos el ID que obtenemos de useParams()
      />
    </>
  );
}

export default MyList;
