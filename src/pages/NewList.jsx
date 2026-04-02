import { useState } from "react"
import { useNavigate } from "react-router"
import { useLiveQuery } from "dexie-react-hooks"
import EmojiPicker from 'emoji-picker-react'
import Swal from 'sweetalert2';

import { db } from "../db/db"
import Back from "../components/Back"
import ProductAdd from "../components/ProductAdd"
import AddProductModal from "../components/AddProductModal"

function NewList() {
  // PARA OBTENER EL NOMBRE DEL USUARIO
  const userProfile = useLiveQuery(() => db.userProfile.get(1));

  const [listName, setListName] = useState("");
  const [description, setDescription] = useState("");

  // AQUI GUARDAMOS LOS PRODUCTOS ELEGIDOS: { idProducto: cantidad }
  const [selectedProducts, setSelectedProducts] = useState({});

  // ICONO PARA LA LISTA DE PRODUCTOS
  const [listIcon, setListIcon] = useState("📝");
  const [showPicker, setShowPicker] = useState(false);

  // PARA AGREGAR UN PRODUCTO A LA BD A TRAVEZ DEL MODAL
  const [isModalOpen, setIsModalOpen] = useState(false);

  // PARA BUSCAR UN PRODUCTO EN ESPECIFICO
  const [productSearch, setProductSearch] = useState("")
  const [searchQuery, setSearchQuery] = useState("");

  //||****************************************************************************||

  // FUNCION QUE SE EJECUTA AL HACER CLIC EN UN EMOJI DEL SELECTOR
  const onEmojiClick = (emojiData) => {
    setListIcon(emojiData.emoji);
    setShowPicker(false); // CERRAMOS EL SELECTOR
  };

  const navigate = useNavigate();
  const products = useLiveQuery(() => db.products.toArray())

  const handleProductChange = (productId, data) => {
    setSelectedProducts(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        ...data
      }
    }));
  };

  // FUNCION PARA CREAR LISTA Y AGREGAR PRODUCTOS
  const addShoppingList = async () => {
    if (!listName.trim()) {
      return Swal.fire("¡Oops!", "Ponle un nombre a tu lista", "warning");
    }

    // Mapeamos los productos seleccionados que tengan cantidad > 0
    const productsToSave = Object.entries(selectedProducts)
      .filter(([_, data]) => data.quantity > 0)
      .map(([productId, data]) => ({
        id_lists: null, // Se llenará abajo
        id_products: Number(productId),
        priceAtTime: data.priceAtTime || 0, // El precio editado en la tabla
        quantity: data.quantity,
        bought: false,
        isDisable: false
      }));

    if (productsToSave.length === 0) {
      return Swal.fire("Lista vacía", "Selecciona al menos un producto", "info");
    }

    try {
      const listId = await db.lists.add({
        name: listName,
        description: description,
        icon: listIcon,
        budget: 0,
        isDisable: false
      });

      // Agregamos el id_lists a cada registro
      const finalItems = productsToSave.map(item => ({
        ...item,
        id_lists: listId
      }));

      // IMPORTANTE: Según tu DB, la tabla se llama 'list_product'
      await db.list_product.bulkAdd(finalItems);

      Swal.fire({
        title: '¡Éxito!',
        text: `Lista "${listName}" creada`,
        icon: 'success',
        confirmButtonColor: '#d97706'
      });

      navigate("/mylists");
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "No se pudo guardar", "error");
    }
  };

  // ACTUALIZAR EL PRECIO DEL PRODUCTO
  const updateProductPrice = async (productId, newPrice) => {
    try {
      await db.products.update(productId, { price: newPrice });
      console.log("Precio actualizado en la DB");
    } catch (error) {
      console.error("Error al actualizar precio:", error);
    }
  };

  // FILTRO DE PRODUCTOS
  const filteredProducts = products?.filter(p => p.isDisable !== true && p.name.toLowerCase().includes(productSearch.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name)) || [];

  if (!products) {
    return (
      <div className="flex justify-center p-10">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    )
  }


  return (
    <>
      <div className="bg-gray-100 h-screen flex flex-col gap-4 p-4">
        <Back />
        <div>
          <h1 className='text-xl font-bold text-amber-900'>¡Hola {userProfile?.name}!</h1>
          <p className="text-sm text-gray-600">Preparado para crear una Lista?</p>
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex gap-2 w-full">
            <div className="flex flex-col relative w-full">
              <input
                type="text"
                id="name-list"
                className="peer shadow-md font-bold block w-full rounded-lg bg-white px-3 pt-4 pb-2 text-gray-900 focus:outline-none transition-colors"
                placeholder=" "
                value={listName}
                onChange={(e) => setListName(e.target.value)}
              />
              <label
                htmlFor="name-list"
                className="absolute left-3 top-4 z-10 -translate-y-4 scale-75 transform  px-2 text-gray-500 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:text-orange-500">
                Nombre de la Lista
              </label>
            </div>
            <div className="flex flex-col items-center gap-4 relative">

              {/* Botón que abre el selector */}
              <button
                onClick={() => setShowPicker(!showPicker)}
                className="text-xl bg-white w-12 h-12 shadow-md rounded-lg flex items-center justify-center active:scale-95 transition-all"
              >
                {listIcon}
              </button>

              {/* SELECTOR DE EMOJIS */}
              {showPicker && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                  {/* FONTO PARA CERRAR EL MODAL DE EMOJIS */}
                  <div
                    className="fixed inset-0 z-[-1]"
                    onClick={() => setShowPicker(false)}
                  ></div>
                  <div className="relative z-10 animate-in zoom-in duration-200">
                    <EmojiPicker
                      language="es"
                      onEmojiClick={onEmojiClick}
                      autoFocusSearch={false}
                      theme="light"
                      width="300px"
                      height="400px"
                      searchPlaceholder="Buscar icono..."
                    />
                  </div>
                </div>
              )}
            </div>

          </div>

          <div className="flex flex-col relative">
            <input
              type="text"
              id="description-list"
              className="peer shadow-md font-bold block w-full rounded-lg bg-white px-3 pt-4 pb-2 text-gray-900 focus:border-orange-500 focus:outline-none transition-colors"
              placeholder=" "
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <label
              htmlFor="description-list"
              className="absolute left-3 top-4 z-10 -translate-y-4 scale-75 transform px-2 text-gray-500 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:text-orange-500">
              Descripcion de la Lista
            </label>
          </div>


          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-xl">Productos</h3>
              <p className="text-sm text-gray-600">Añade los productos a tu lista</p>
            </div>

            {/* AGREGAR UN PRODUCTO NUEVO DESDE CREAR LISTA */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-amber-600 active:bg-amber-500 shadow-lg py-1 px-3 rounded-2xl text-amber-50 font-bold text-3xl"
              >+
            </button>
          </div>

          {/* ENLISTA LOS PRODUCTOS PARA SER AGREGADOS A LA LISTA DE COMPRAS NUEVA */}
          <div className="flex flex-col relative w-full">
            <input
              type="text"
              id="name-search"
              className="peer shadow-md font-bold block w-full rounded-lg bg-white px-3 pt-4 pb-2 text-gray-900 focus:outline-none transition-colors"
              placeholder=" "
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
            />
            <label
              htmlFor="name-search"
              className="absolute left-3 top-4 z-10 -translate-y-4 scale-75 transform  px-2 text-gray-500 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:text-orange-500">
              Buscar producto
            </label>
            {productSearch && (
              <button
                onClick={() => setProductSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>

          <div className='flex flex-col gap-4 h-[calc(100vh-470px)] overflow-auto rounded-2xl pb-4text-blue-600'>
            {
              filteredProducts.length === 0 ? (
                <div className="text-center py-10 bg-gray-50 rounded-xl shadow-inner">
                  <p className="text-gray-500">
                    {productSearch
                      ? `No encontramos "${productSearch}"`
                      : "No hay productos guardados aún."}
                  </p>
                  {productSearch && (
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="text-amber-600 font-bold mt-2 underline"
                    >
                      Crear este producto
                    </button>
                  )}
                </div>
              ) : (
                filteredProducts.map((p) => (
                  <ProductAdd
                    key={p.id}
                    id={p.id}
                    name={p.name}
                    price={p.price} // Este es el precio base del catálogo
                    icon={p.icon}
                    onPriceChange={(newPrice) => handleProductChange(p.id, { priceAtTime: newPrice })}
                    onCountChange={(count) => handleProductChange(p.id, { quantity: count })}
                  />
                ))
              )
            }
          </div>
        </div>
        <div className='fixed bottom-4 right-0 w-full text-center px-4'>
          <button
            onClick={addShoppingList}
            className='w-full bg-amber-600 p-4 rounded-2xl active:bg-amber-500 shadow-lg text-white font-bold text-xl'>
            GUARDAR LISTA
          </button>
        </div>
      </div>

      {/* MODAL PARA AGREGAR PRODUCTO */}
      <AddProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  )
}

export default NewList