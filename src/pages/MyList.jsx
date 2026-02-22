import { useParams, useNavigate } from "react-router";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db/db";
import Back from "../components/Back";
import Swal from "sweetalert2";

function MyList() {
  const { id } = useParams();
  const navigate = useNavigate();

  // 1. Traemos la lista y el perfil del usuario (para el presupuesto)
  const listData = useLiveQuery(() => db.lists.get(Number(id)), [id]);

  const productsInList = useLiveQuery(async () => {
    const items = await db.list_product
      .where("id_lists")
      .equals(Number(id))
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

  const toggleBought = async (itemId, currentStatus) => {
    await db.list_product.update(itemId, {
      bought: currentStatus === 1 ? 0 : 1
    });
  };

  const updatePrice = async (itemId, newPrice) => {
    await db.list_product.update(itemId, { priceAtTime: parseFloat(newPrice) || 0 });
  };

  // Cálculos de dinero
  const totalCompra = productsInList?.reduce((acc, curr) => acc + (curr.priceAtTime * curr.quantity), 0) || 0;
  const presupuesto = listData?.budget || 0;
  const excedido = totalCompra > presupuesto;

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

  if (!listData) return <div className="p-10 text-center">Cargando...</div>;

  return (
    <>
      <div className="min-h-screen bg-gray-50 pb-32">
        {/* Header */}
        <div className="p-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <Back />
            <div>
              <h1 className="text-xl font-bold text-gray-800">{listData.icon} {listData.name}</h1>
              {/* Botón interactivo para el presupuesto */}
              <button
                onClick={handleEditBudget}
                className="flex items-center gap-1 group"
              >
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest group-hover:text-amber-600 transition-colors">
                  Presupuesto: S/ {presupuesto.toFixed(2)}
                </p>
                <span className="text-[10px] text-amber-500 opacity-0 group-hover:opacity-100">✏️</span>
              </button>
            </div>
          </div>

          {/* BOTÓN AGREGAR MÁS PRODUCTOS */}
          <button
            onClick={() => navigate(`/edit-list/${id}`)} // Ajusta la ruta a tu pantalla de edición
            className="bg-amber-100 text-amber-700 p-2 px-4 rounded-xl font-bold text-sm flex items-center gap-2 active:scale-95 transition-transform"
          >
            <span>+</span> Agregar
          </button>
        </div>

        {/* Alerta de presupuesto excedido */}
        {excedido && (
          <div className="mx-4 mt-4 p-3 bg-red-100 border-l-4 border-red-500 rounded-r-xl">
            <p className="text-red-700 text-xs font-bold italic">⚠️ ¡Has superado tu presupuesto por S/ {(totalCompra - presupuesto).toFixed(2)}!</p>
          </div>
        )}

        <div className="p-4 flex flex-col gap-3">
          {productsInList?.map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-2xl flex justify-between items-center transition-all ${item.bought
                ? "bg-gray-200 opacity-60 grayscale scale-95"
                : "bg-white shadow-md border-l-4 border-amber-500"
                }`}
            >
              <div className="flex items-center gap-4">
                <input
                  type="checkbox"
                  checked={item.bought === 1}
                  onChange={() => toggleBought(item.id, item.bought)}
                  className="w-6 h-6 rounded-full border-2 border-amber-500 accent-amber-600"
                />

                <div className="flex items-center gap-3">
                  <span className="text-3xl">{item.icon}</span>
                  <div>
                    <p className={`font-bold text-lg ${item.bought ? "line-through text-gray-500" : "text-gray-800"}`}>
                      {item.name}
                    </p>
                    <p className="text-xs text-gray-400 font-medium">Cant: {item.quantity}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold text-amber-600">S/</span>
                  <input
                    type="number"
                    defaultValue={item.priceAtTime}
                    onBlur={(e) => updatePrice(item.id, e.target.value)}
                    disabled={item.bought === 1}
                    className={`w-16 p-1 text-right font-black focus:outline-none ${item.bought ? "bg-transparent text-gray-400" : "text-gray-800 border-b border-dashed border-amber-300"
                      }`}
                  />
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
    </>
  );
}

export default MyList;